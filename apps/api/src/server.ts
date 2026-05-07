import "./env.js";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";
import { canAccessModule, canManageModule, substituteMessageVariables } from "@ecclesiaos/shared";
import type { AppModuleKey, AttendanceInput, AuthErrorResponse, AuthSession, ChangePasswordRequest, ChildCheckIn, ChildCheckInInput, ChildCheckOutRequest, ChurchEvent, ChurchEventInput, ChurchProfileUpdate, ChurchResourceInput, CurrentUser, EmailStatus, EventCheckInInput, EventRegistration, EventRegistrationCheckInRequest, EventRegistrationConfirmInput, EventRegistrationConfirmResponse, EventRegistrationInput, EventRegistrationResendConfirmationResponse, EventRegistrationSelfCheckInRequest, EventRegistrationStatusUpdate, FinancialTransactionInput, GroupInput, GroupProfile, HealthResponse, LabelLayout, LabelTemplateInput, LoginRequest, MessageTemplateInput, PasswordResetGenericResponse, PeopleMessageDelivery, PeopleMessageInput, PeopleMessageResponse, PersonBlockOutInput, PersonInput, RegisterRequest, RequestPasswordResetInput, ResetPasswordInput, ResetPasswordResponse, RoomReservationInput, ServingAssignmentStatusResponse, ServingAssignmentStatusUpdate, ServingPlan, ServingPlanInput, SongInput, SubstituteSuggestion, UserInput, VisitorRegistrationInput, VisitorRegistrationResponse, WorshipSetInput } from "@ecclesiaos/shared";
import { auditRepository } from "./data/auditRepository.js";
import { attendanceRepository } from "./data/attendanceRepository.js";
import { churchRepository } from "./data/churchRepository.js";
import { financialTransactionRepository } from "./data/financialTransactionRepository.js";
import { eventRepository } from "./data/eventRepository.js";
import { eventRegistrationRepository, reservedQuantityFor } from "./data/eventRegistrationRepository.js";
import { checkInRepository } from "./data/checkInRepository.js";
import { groupRepository } from "./data/groupRepository.js";
import { labelTemplateRepository } from "./data/labelTemplateRepository.js";
import { messageTemplateRepository } from "./data/messageTemplateRepository.js";
import { musicRepository } from "./data/musicRepository.js";
import { peopleMessageRepository } from "./data/peopleMessageRepository.js";
import { blockOutRepository, isPersonBlockedOnDate } from "./data/blockOutRepository.js";
import { passwordResetTokenRepository } from "./data/passwordResetTokenRepository.js";
import { personRepository } from "./data/personRepository.js";
import { resourceRepository } from "./data/resourceRepository.js";
import { servingPlanRepository } from "./data/servingPlanRepository.js";
import { userRepository } from "./data/userRepository.js";
import { isValidCronExpression } from "./cron.js";
import { fetchYouTubeFeed } from "./youtube.js";
import { isEmailConfigured, sendEmail } from "./email.js";
import { verifyPassword } from "./passwords.js";
import { randomBytes } from "node:crypto";

const generateTemporaryPassword = (): string => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz";
  const bytes = randomBytes(12);
  let result = "";
  for (let i = 0; i < bytes.length; i += 1) {
    result += alphabet[bytes[i] % alphabet.length];
  }
  return result;
};

const port = Number(process.env.PORT || 4000);
const tokenSecret = process.env.AUTH_TOKEN_SECRET || "ecclesiaos-development-secret";
const webBaseUrl = (process.env.WEB_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
const reminderDaysBefore = Math.max(0, Number(process.env.REMINDER_DAYS_BEFORE) || 2);
const passwordResetGenericMessage = "Se o email estiver cadastrado, voce recebera um link para redefinir a senha.";
const passwordResetGenericError = "Link invalido ou expirado. Solicite um novo email.";

const sendJson = (res: ServerResponse, statusCode: number, body: unknown) => {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  });
  res.end(payload);
};

const sendError = (res: ServerResponse, statusCode: number, error: AuthErrorResponse["error"], message: string) => {
  sendJson(res, statusCode, { error, message } satisfies AuthErrorResponse);
};

const prismaErrorCode = (error: unknown): string => (
  typeof error === "object" && error !== null && "code" in error ? String((error as { code?: unknown }).code || "") : ""
);

const sendSaveError = (res: ServerResponse, error: unknown, fallbackMessage: string) => {
  if (prismaErrorCode(error) === "P2002") {
    sendError(res, 409, "conflict", "Ja existe outro registro usando este slug publico. Ajuste o campo Slug publico e tente novamente.");
    return;
  }

  sendError(res, 400, "invalid_json", fallbackMessage);
};

const notFound = (req: IncomingMessage, res: ServerResponse) => {
  sendError(res, 404, "not_found", `Route ${req.method || "GET"} ${req.url || "/"} was not found.`);
};

const handleHealth = (res: ServerResponse) => {
  const response: HealthResponse = {
    status: "ok",
    app: "EcclesiaOS",
    version: "0.1.0",
    timestamp: new Date().toISOString()
  };

  sendJson(res, 200, response);
};

const toPublicUser = (user: CurrentUser): CurrentUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  personId: user.personId
});

const encodeBase64Url = (value: string) => Buffer.from(value).toString("base64url");

const sign = (payload: string) => createHmac("sha256", tokenSecret).update(payload).digest("base64url");

const createToken = (user: CurrentUser) => {
  const payload = encodeBase64Url(JSON.stringify({ sub: user.id, role: user.role, iat: Date.now() }));
  return `${payload}.${sign(payload)}`;
};

const findUserByToken = async (token: string | undefined) => {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: string };
    if (!decoded.sub) return null;
    return userRepository.findById(decoded.sub);
  } catch {
    return null;
  }
};

const readJson = async <T>(req: IncomingMessage): Promise<T | null> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  if (chunks.length === 0) return null;

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as T;
  } catch {
    return null;
  }
};

const handleLogin = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await readJson<LoginRequest>(req);
  if (!body?.email || !body?.password) {
    sendError(res, 400, "invalid_json", "Informe email e senha.");
    return;
  }

  const user = await userRepository.findByCredentials(body.email, body.password);
  if (!user) {
    sendError(res, 401, "invalid_credentials", "Email ou senha invalidos.");
    return;
  }

  const publicUser = toPublicUser(user);
  const response: AuthSession = {
    token: createToken(publicUser),
    user: publicUser
  };

  sendJson(res, 200, response);
};

const handleChangeOwnPassword = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJson<ChangePasswordRequest>(req);
  const currentPassword = String(body?.currentPassword || "").trim();
  const newPassword = String(body?.newPassword || "").trim();

  if (!currentPassword || !newPassword) {
    sendError(res, 400, "invalid_json", "Informe a senha atual e a nova senha.");
    return;
  }
  if (newPassword.length < 6) {
    sendError(res, 400, "invalid_json", "A nova senha precisa ter pelo menos 6 caracteres.");
    return;
  }
  if (newPassword === currentPassword) {
    sendError(res, 400, "invalid_json", "A nova senha precisa ser diferente da atual.");
    return;
  }

  if (!verifyPassword(currentPassword, user.password)) {
    sendError(res, 401, "invalid_credentials", "Senha atual incorreta.");
    return;
  }

  const updated = await userRepository.updatePassword(user.id, newPassword);
  if (!updated) {
    sendError(res, 404, "not_found", "Usuario nao encontrado.");
    return;
  }

  await recordAudit(user, "update", "user", user.id, "Senha alterada pelo proprio usuario.");
  sendJson(res, 200, { ok: true });
};

const handleAdminResetPassword = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const actor = await requireAdmin(req, res);
  if (!actor) return;

  const target = await userRepository.findById(id);
  if (!target) {
    sendError(res, 404, "not_found", "Usuario nao encontrado.");
    return;
  }

  const temporaryPassword = generateTemporaryPassword();
  const updated = await userRepository.updatePassword(id, temporaryPassword);
  if (!updated) {
    sendError(res, 404, "not_found", "Usuario nao encontrado.");
    return;
  }

  await recordAudit(actor, "update", "user", id, `Senha redefinida pelo admin para ${target.email}.`);
  const response: ResetPasswordResponse = {
    userId: id,
    email: target.email,
    temporaryPassword
  };
  sendJson(res, 200, response);
};

const handleRequestPasswordReset = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await readJson<RequestPasswordResetInput>(req);
  const email = String(body?.email || "").trim().toLowerCase();
  const generic: PasswordResetGenericResponse = { ok: true, message: passwordResetGenericMessage };

  if (!email) {
    sendJson(res, 200, generic);
    return;
  }

  const users = await userRepository.listUsers();
  const user = users.find((item) => item.email.toLowerCase() === email);
  if (!user) {
    sendJson(res, 200, generic);
    return;
  }

  const { token } = await passwordResetTokenRepository.create(user.id);

  if (isEmailConfigured()) {
    const link = `${webBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const subject = "Recuperar acesso ao EcclesiaOS";
    const text = `Ola, ${user.name}.\n\nVoce solicitou redefinir sua senha no EcclesiaOS. Clique no link abaixo (valido por 15 minutos):\n\n${link}\n\nSe voce nao solicitou, pode ignorar este email.`;
    const html = `<p>Ola, <strong>${user.name}</strong>.</p>
<p>Voce solicitou redefinir sua senha no EcclesiaOS.</p>
<p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#216869;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Redefinir senha</a></p>
<p style="color:#5c6b78;font-size:13px;">Link valido por 15 minutos. Se voce nao solicitou, ignore este email.</p>
<p style="color:#8a96a3;font-size:12px;">Ou copie e cole no navegador: ${link}</p>`;

    await sendEmail({ to: user.email, subject, text, html });
  }

  sendJson(res, 200, generic);
};

const handleResetPasswordWithToken = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await readJson<ResetPasswordInput>(req);
  const token = String(body?.token || "").trim();
  const newPassword = String(body?.newPassword || "").trim();

  if (!token || !newPassword) {
    sendError(res, 400, "invalid_json", passwordResetGenericError);
    return;
  }
  if (newPassword.length < 6) {
    sendError(res, 400, "invalid_json", "A nova senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  const record = await passwordResetTokenRepository.findActive(token);
  if (!record) {
    sendError(res, 400, "invalid_json", passwordResetGenericError);
    return;
  }

  const updated = await userRepository.updatePassword(record.userId, newPassword);
  if (!updated) {
    sendError(res, 400, "invalid_json", passwordResetGenericError);
    return;
  }

  const fullUser = await userRepository.findById(record.userId);
  await passwordResetTokenRepository.markUsed(record.id);
  if (fullUser) {
    await auditRepository.create({
      action: "update",
      entityType: "user",
      entityId: record.userId,
      actor: fullUser,
      summary: "Senha redefinida via link de email."
    });
  }

  sendJson(res, 200, { ok: true } satisfies { ok: true });
};

const handleMe = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await getRequestUser(req);

  if (!user) {
    sendError(res, 401, "unauthorized", "Sessao invalida ou expirada.");
    return;
  }

  sendJson(res, 200, toPublicUser(user));
};

const getRequestUser = async (req: IncomingMessage) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;
  return findUserByToken(token);
};

const requireUser = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await getRequestUser(req);
  if (!user) sendError(res, 401, "unauthorized", "Sessao invalida ou expirada.");
  return user;
};

const requireAdmin = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    sendError(res, 403, "forbidden", "Apenas administradores podem executar esta acao.");
    return null;
  }
  return user;
};

const requireModuleAccess = async (req: IncomingMessage, res: ServerResponse, module: AppModuleKey) => {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (!canAccessModule(user.role, module)) {
    sendError(res, 403, "forbidden", "Seu perfil nao pode acessar este modulo.");
    return null;
  }
  return user;
};

const requireModuleManage = async (req: IncomingMessage, res: ServerResponse, module: AppModuleKey) => {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (!canManageModule(user.role, module)) {
    sendError(res, 403, "forbidden", "Seu perfil nao pode gerenciar este modulo.");
    return null;
  }
  return user;
};

const recordAudit = async (actor: Awaited<ReturnType<typeof requireUser>>, action: "create" | "update" | "delete", entityType: string, entityId: string, summary: string) => {
  if (!actor) return;
  await auditRepository.create({ action, entityType, entityId, actor, summary });
};

const sanitizeUserInput = (body: UserInput): UserInput => ({
  name: String(body.name || "").trim(),
  email: String(body.email || "").trim().toLowerCase(),
  password: String(body.password || "").trim(),
  role: body.role === "leader" || body.role === "member" ? body.role : "admin",
  personId: String(body.personId || "").trim()
});

const sanitizeRegisterInput = (body: RegisterRequest): RegisterRequest => ({
  firstName: String(body.firstName || "").trim(),
  lastName: String(body.lastName || "").trim(),
  email: String(body.email || "").trim().toLowerCase(),
  phone: String(body.phone || "").trim(),
  password: String(body.password || "").trim(),
  status: body.status === "visitor" ? "visitor" : "member"
});

const createPersonForUser = async (input: UserInput | RegisterRequest) => {
  const registerLike = input as RegisterRequest;
  const firstName = "firstName" in input ? registerLike.firstName : String(input.name || "").trim().split(" ")[0] || input.name;
  const lastName = "lastName" in input
    ? registerLike.lastName
    : String(input.name || "").trim().split(" ").slice(1).join(" ");

  return personRepository.create({
    firstName,
    lastName,
    email: input.email,
    phone: "phone" in input ? registerLike.phone : "",
    birthDate: "",
    membershipDate: "",
    address: "",
    baptized: false,
    gender: "unspecified",
    status: "status" in input ? registerLike.status : "member",
    guardianPersonIds: [],
    notes: "Pessoa criada automaticamente para vinculo de usuario."
  });
};

const handleListUsers = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleAccess(req, res, "users");
  if (!user) return;

  sendJson(res, 200, await userRepository.listPublicUsers());
};

const handleListAuditLogs = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleAccess(req, res, "users");
  if (!user) return;

  sendJson(res, 200, await auditRepository.list());
};

const handleCreateUser = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleAccess(req, res, "users");
  if (!user) return;

  const body = await readJson<UserInput>(req);
  if (!body?.name || !body?.email || !body?.password) {
    sendError(res, 400, "invalid_json", "Informe nome, email e senha.");
    return;
  }

  const input = sanitizeUserInput(body);
  if (!input.personId) {
    const person = await createPersonForUser(input);
    input.personId = person.id;
  }

  const created = await userRepository.create(input);
  if (!created) {
    sendError(res, 409, "conflict", "Ja existe um usuario com este email.");
    return;
  }
  if (created === "duplicate_person") {
    sendError(res, 409, "conflict", "Esta pessoa ja esta vinculada a outro usuario.");
    return;
  }
  if (created === "missing_person") {
    sendError(res, 400, "invalid_json", "Todo usuario precisa estar vinculado a uma pessoa.");
    return;
  }

  await recordAudit(user, "create", "user", created.id, `Usuario criado: ${created.email}`);
  sendJson(res, 201, created);
};

const handleRegister = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await readJson<RegisterRequest>(req);
  if (!body?.firstName || !body?.email || !body?.password) {
    sendError(res, 400, "invalid_json", "Informe nome, email e senha.");
    return;
  }

  const input = sanitizeRegisterInput(body);
  const existingUsers = await userRepository.listPublicUsers();
  if (existingUsers.some((user) => user.email.toLowerCase() === input.email)) {
    sendError(res, 409, "conflict", "Ja existe um usuario com este email.");
    return;
  }

  const person = await createPersonForUser(input);
  const created = await userRepository.create({
    name: `${input.firstName} ${input.lastName}`.trim(),
    email: input.email,
    password: input.password,
    role: "member",
    personId: person.id
  });

  if (!created) {
    sendError(res, 409, "conflict", "Ja existe um usuario com este email.");
    return;
  }
  if (created === "duplicate_person" || created === "missing_person") {
    sendError(res, 409, "conflict", "Nao foi possivel vincular a pessoa ao usuario.");
    return;
  }

  sendJson(res, 201, { token: createToken(created), user: created } satisfies AuthSession);
};

const visitorRegistrationGenericMessage = "Recebemos seu cadastro. A equipe da igreja vai entrar em contato em breve.";

const sanitizeVisitorRegistrationInput = (body: VisitorRegistrationInput): VisitorRegistrationInput => ({
  firstName: String(body.firstName || "").trim(),
  lastName: String(body.lastName || "").trim(),
  email: String(body.email || "").trim(),
  phone: String(body.phone || "").trim(),
  notes: String(body.notes || "").trim()
});

const handleCreateVisitor = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await readJson<VisitorRegistrationInput>(req);
  const generic: VisitorRegistrationResponse = { ok: true, message: visitorRegistrationGenericMessage };

  const input = sanitizeVisitorRegistrationInput(body || ({} as VisitorRegistrationInput));
  if (!input.firstName) {
    sendError(res, 400, "invalid_json", "Informe ao menos o primeiro nome.");
    return;
  }

  const person = await personRepository.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    birthDate: "",
    membershipDate: "",
    address: "",
    baptized: false,
    gender: "unspecified",
    status: "visitor",
    guardianPersonIds: [],
    notes: input.notes ? `Visitante via QR. ${input.notes}` : "Visitante via QR."
  });

  const users = await userRepository.listUsers();
  const adminActor = users.find((user) => user.role === "admin");
  if (adminActor) {
    await auditRepository.create({
      action: "create",
      entityType: "person",
      entityId: person.id,
      actor: adminActor,
      summary: `Visitante via QR: ${person.firstName} ${person.lastName}`.trim()
    });
  }

  if (isEmailConfigured() && input.email) {
    try {
      const profile = await churchRepository.getProfile();
      const churchName = profile.name || "nossa igreja";
      const homeLink = webBaseUrl;
      const subject = `Bem-vindo a ${churchName}`;
      const text = `Ola, ${person.firstName}.\n\nObrigado por deixar seu contato em ${churchName}. Em breve nossa equipe entrara em contato.\n\nAcesse: ${homeLink}`;
      const html = `<p>Ola, <strong>${person.firstName}</strong>.</p>
<p>Obrigado por deixar seu contato em <strong>${churchName}</strong>. Em breve nossa equipe vai entrar em contato.</p>
<p><a href="${homeLink}" style="display:inline-block;padding:10px 16px;background:#216869;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Conhecer a igreja</a></p>`;
      await sendEmail({ to: input.email, subject, text, html });
    } catch {
      // best-effort
    }
  }

  sendJson(res, 200, generic);
};

const handleUpdateUser = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleAccess(req, res, "users");
  if (!user) return;

  const body = await readJson<UserInput>(req);
  if (!body?.name || !body?.email) {
    sendError(res, 400, "invalid_json", "Informe nome e email.");
    return;
  }

  const input = sanitizeUserInput(body);
  if (!input.personId) {
    const person = await createPersonForUser(input);
    input.personId = person.id;
  }

  const updated = await userRepository.update(id, input);
  if (!updated) {
    sendError(res, 404, "not_found", "Usuario nao encontrado.");
    return;
  }
  if (updated === "duplicate") {
    sendError(res, 409, "conflict", "Ja existe um usuario com este email.");
    return;
  }
  if (updated === "duplicate_person") {
    sendError(res, 409, "conflict", "Esta pessoa ja esta vinculada a outro usuario.");
    return;
  }
  if (updated === "missing_person") {
    sendError(res, 400, "invalid_json", "Todo usuario precisa estar vinculado a uma pessoa.");
    return;
  }

  await recordAudit(user, "update", "user", updated.id, `Usuario atualizado: ${updated.email}`);
  sendJson(res, 200, updated);
};

const handleDeleteUser = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleAccess(req, res, "users");
  if (!user) return;
  if (user.id === id) {
    sendError(res, 403, "forbidden", "Voce nao pode remover o proprio usuario.");
    return;
  }

  const removed = await userRepository.remove(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Usuario nao encontrado.");
    return;
  }

  await recordAudit(user, "delete", "user", id, `Usuario removido: ${id}`);
  sendJson(res, 200, { ok: true });
};

const handleGetChurchProfile = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const profile = await churchRepository.getProfile();
  sendJson(res, 200, profile);
};

const sanitizeChurchUpdate = (body: ChurchProfileUpdate): ChurchProfileUpdate => ({
  name: String(body.name || "").trim(),
  email: String(body.email || "").trim(),
  phone: String(body.phone || "").trim(),
  website: String(body.website || "").trim(),
  youtubeChannelUrl: String(body.youtubeChannelUrl || "").trim(),
  addressLine1: String(body.addressLine1 || "").trim(),
  addressLine2: String(body.addressLine2 || "").trim(),
  city: String(body.city || "").trim(),
  state: String(body.state || "").trim(),
  postalCode: String(body.postalCode || "").trim(),
  country: String(body.country || "").trim()
});

const handleUpdateChurchProfile = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<ChurchProfileUpdate>(req);
  if (!body?.name) {
    sendError(res, 400, "invalid_json", "Informe ao menos o nome da igreja.");
    return;
  }

  const profile = await churchRepository.updateProfile(sanitizeChurchUpdate(body));
  sendJson(res, 200, profile);
};

const sanitizePersonInput = (body: PersonInput): PersonInput => ({
  firstName: String(body.firstName || "").trim(),
  lastName: String(body.lastName || "").trim(),
  email: String(body.email || "").trim(),
  phone: String(body.phone || "").trim(),
  birthDate: String(body.birthDate || "").trim(),
  membershipDate: String(body.membershipDate || "").trim(),
  address: String(body.address || "").trim(),
  baptized: Boolean(body.baptized),
  gender: body.gender === "female" || body.gender === "male" ? body.gender : "unspecified",
  status: body.status === "visitor" ? "visitor" : "member",
  guardianPersonIds: Array.isArray(body.guardianPersonIds) ? body.guardianPersonIds.map(String).filter(Boolean) : [],
  notes: String(body.notes || "").trim()
});

const handleListPeople = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  sendJson(res, 200, await personRepository.list());
};

const handleCreatePerson = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<PersonInput>(req);
  if (!body?.firstName && !body?.lastName) {
    sendError(res, 400, "invalid_json", "Informe o nome da pessoa.");
    return;
  }

  const person = await personRepository.create(sanitizePersonInput(body));
  await recordAudit(user, "create", "person", person.id, `Pessoa criada: ${person.firstName} ${person.lastName}`.trim());
  sendJson(res, 201, person);
};

const handleUpdatePerson = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<PersonInput>(req);
  if (!body?.firstName && !body?.lastName) {
    sendError(res, 400, "invalid_json", "Informe o nome da pessoa.");
    return;
  }

  const person = await personRepository.update(id, sanitizePersonInput(body));
  if (!person) {
    sendError(res, 404, "not_found", "Pessoa nao encontrada.");
    return;
  }

  await recordAudit(user, "update", "person", person.id, `Pessoa atualizada: ${person.firstName} ${person.lastName}`.trim());
  sendJson(res, 200, person);
};

const handleDeletePerson = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const removed = await personRepository.remove(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Pessoa nao encontrada.");
    return;
  }

  await recordAudit(user, "delete", "person", id, `Pessoa removida: ${id}`);
  sendJson(res, 200, { ok: true });
};

const sanitizeGroupInput = (body: GroupInput): GroupInput => ({
  name: String(body.name || "").trim(),
  type: ["small_group", "ministry", "class", "team"].includes(body.type) ? body.type : "small_group",
  description: String(body.description || "").trim(),
  leaderPersonId: String(body.leaderPersonId || "").trim(),
  memberPersonIds: Array.isArray(body.memberPersonIds) ? body.memberPersonIds.map(String) : [],
  servicePositions: Array.isArray(body.servicePositions)
    ? body.servicePositions.map((position) => String(position || "").trim()).filter(Boolean)
    : [],
  memberServicePositions: Object.fromEntries(
    Object.entries(body.memberServicePositions || {}).map(([personId, positions]) => [
      String(personId),
      Array.isArray(positions) ? positions.map((position) => String(position || "").trim()).filter(Boolean) : []
    ])
  )
});

const handleListGroups = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  sendJson(res, 200, await groupRepository.list());
};

const handleCreateGroup = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<GroupInput>(req);
  if (!body?.name) {
    sendError(res, 400, "invalid_json", "Informe o nome do grupo.");
    return;
  }

  const group = await groupRepository.create(sanitizeGroupInput(body));
  sendJson(res, 201, group);
};

const handleUpdateGroup = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<GroupInput>(req);
  if (!body?.name) {
    sendError(res, 400, "invalid_json", "Informe o nome do grupo.");
    return;
  }

  const group = await groupRepository.update(id, sanitizeGroupInput(body));
  if (!group) {
    sendError(res, 404, "not_found", "Grupo nao encontrado.");
    return;
  }

  sendJson(res, 200, group);
};

const handleDeleteGroup = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const removed = await groupRepository.remove(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Grupo nao encontrado.");
    return;
  }

  sendJson(res, 200, { ok: true });
};

const requireMusicManager = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin" && user.role !== "leader") {
    sendError(res, 403, "forbidden", "Apenas administradores e lideres podem gerenciar musicas.");
    return null;
  }
  return user;
};

const sanitizeSongInput = (body: SongInput): SongInput => ({
  title: String(body.title || "").trim(),
  artist: String(body.artist || "").trim(),
  defaultKey: String(body.defaultKey || "").trim(),
  bpm: Math.max(0, Math.round(Number(body.bpm) || 0)),
  theme: String(body.theme || "").trim(),
  lyrics: String(body.lyrics || "").trim(),
  chords: String(body.chords || "").trim(),
  notes: String(body.notes || "").trim()
});

const sanitizeWorshipSetInput = (body: WorshipSetInput): WorshipSetInput => ({
  eventId: String(body.eventId || "").trim(),
  title: String(body.title || "").trim(),
  date: String(body.date || "").trim(),
  notes: String(body.notes || "").trim(),
  items: (Array.isArray(body.items) ? body.items : []).map((item, index) => ({
    songId: String(item.songId || "").trim(),
    key: String(item.key || "").trim(),
    notes: String(item.notes || "").trim(),
    order: Math.max(1, Number(item.order) || index + 1)
  })).filter((item) => item.songId)
});

const handleListSongs = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;
  sendJson(res, 200, await musicRepository.listSongs());
};

const handleCreateSong = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireMusicManager(req, res);
  if (!user) return;

  const body = await readJson<SongInput>(req);
  if (!body?.title) {
    sendError(res, 400, "invalid_json", "Informe o titulo da musica.");
    return;
  }

  sendJson(res, 201, await musicRepository.createSong(sanitizeSongInput(body)));
};

const handleUpdateSong = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireMusicManager(req, res);
  if (!user) return;

  const body = await readJson<SongInput>(req);
  if (!body?.title) {
    sendError(res, 400, "invalid_json", "Informe o titulo da musica.");
    return;
  }

  const song = await musicRepository.updateSong(id, sanitizeSongInput(body));
  if (!song) {
    sendError(res, 404, "not_found", "Musica nao encontrada.");
    return;
  }
  sendJson(res, 200, song);
};

const handleDeleteSong = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireMusicManager(req, res);
  if (!user) return;

  const removed = await musicRepository.removeSong(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Musica nao encontrada.");
    return;
  }
  sendJson(res, 200, { ok: true });
};

const handleListWorshipSets = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;
  sendJson(res, 200, await musicRepository.listSets());
};

const handleCreateWorshipSet = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireMusicManager(req, res);
  if (!user) return;

  const body = await readJson<WorshipSetInput>(req);
  if (!body?.title) {
    sendError(res, 400, "invalid_json", "Informe o titulo do repertorio.");
    return;
  }

  sendJson(res, 201, await musicRepository.createSet(sanitizeWorshipSetInput(body)));
};

const handleUpdateWorshipSet = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireMusicManager(req, res);
  if (!user) return;

  const body = await readJson<WorshipSetInput>(req);
  if (!body?.title) {
    sendError(res, 400, "invalid_json", "Informe o titulo do repertorio.");
    return;
  }

  const set = await musicRepository.updateSet(id, sanitizeWorshipSetInput(body));
  if (!set) {
    sendError(res, 404, "not_found", "Repertorio nao encontrado.");
    return;
  }
  sendJson(res, 200, set);
};

const handleDeleteWorshipSet = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireMusicManager(req, res);
  if (!user) return;

  const removed = await musicRepository.removeSet(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Repertorio nao encontrado.");
    return;
  }
  sendJson(res, 200, { ok: true });
};

const sanitizeAttendanceInput = (body: AttendanceInput): AttendanceInput => ({
  date: String(body.date || "").trim(),
  type: body.type === "group" ? "group" : "service",
  eventId: String(body.eventId || "").trim(),
  groupId: body.type === "group" ? String(body.groupId || "").trim() : "",
  presentPersonIds: Array.isArray(body.presentPersonIds) ? body.presentPersonIds.map(String) : [],
  notes: String(body.notes || "").trim()
});

const sanitizeEventInput = (body: ChurchEventInput): ChurchEventInput => ({
  title: String(body.title || "").trim(),
  type: ["service", "meeting", "class", "outreach", "other"].includes(body.type) ? body.type : "other",
  date: String(body.date || "").trim(),
  startTime: String(body.startTime || "").trim(),
  endTime: String(body.endTime || "").trim(),
  location: String(body.location || "").trim(),
  groupId: String(body.groupId || "").trim(),
  recurrence: body.recurrence === "weekly" || body.recurrence === "monthly" || body.recurrence === "cron" ? body.recurrence : "none",
  recurrenceUntil: body.recurrence === "weekly" || body.recurrence === "monthly" || body.recurrence === "cron" ? String(body.recurrenceUntil || "").trim() : "",
  recurrenceRule: body.recurrence === "cron" ? String(body.recurrenceRule || "").trim() : "",
  parentEventId: String(body.parentEventId || "").trim(),
  requestedTeamIds: Array.isArray(body.requestedTeamIds) ? body.requestedTeamIds.map((value) => String(value || "").trim()).filter(Boolean) : [],
  registrationEnabled: Boolean(body.registrationEnabled),
  registrationCapacity: Math.max(0, Number(body.registrationCapacity) || 0),
  registrationPrice: Math.max(0, Number(body.registrationPrice) || 0),
  registrationCurrency: String(body.registrationCurrency || "BRL").trim().toUpperCase() || "BRL",
  registrationSlug: String(body.registrationSlug || "").trim(),
  registrationRequiresEmailConfirmation: Boolean(body.registrationRequiresEmailConfirmation),
  description: String(body.description || "").trim()
});

const validateEventInput = (body: ChurchEventInput | null): string | null => {
  if (!body) return "Informe os dados do evento.";
  if (!String(body?.title || "").trim()) return "Informe o titulo do evento.";
  if (!String(body?.date || "").trim()) return "Informe a data do evento.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.date || "").trim())) return "Informe a data do evento em um formato valido.";
  if (body.startTime && !/^\d{2}:\d{2}$/.test(String(body.startTime).trim())) return "Informe o horario de inicio em um formato valido.";
  if (body.endTime && !/^\d{2}:\d{2}$/.test(String(body.endTime).trim())) return "Informe o horario de fim em um formato valido.";
  if (body.recurrence === "cron" && !String(body.recurrenceRule || "").trim()) return "Informe a expressao cron da recorrencia.";
  if (body.recurrence === "cron" && !isValidCronExpression(String(body.recurrenceRule || ""))) return "A expressao cron informada nao e valida.";
  if ((body.recurrence === "weekly" || body.recurrence === "monthly" || body.recurrence === "cron") && body.recurrenceUntil) {
    const eventDate = String(body.date || "").trim();
    const recurrenceUntil = String(body.recurrenceUntil || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(recurrenceUntil)) return "Informe a data final da recorrencia em um formato valido.";
    if (recurrenceUntil < eventDate) return "A data final da recorrencia deve ser igual ou posterior a data do evento.";
  }
  return null;
};

const sanitizeEventRegistrationInput = (body: EventRegistrationInput): EventRegistrationInput => ({
  name: String(body.name || "").trim(),
  email: String(body.email || "").trim().toLowerCase(),
  phone: String(body.phone || "").trim(),
  quantity: Math.max(1, Number(body.quantity) || 1),
  notes: String(body.notes || "").trim()
});

const sanitizeEventRegistrationStatusUpdate = (body: EventRegistrationStatusUpdate): EventRegistrationStatusUpdate => ({
  status: (
    body.status === "cancelled"
    || body.status === "pending_payment"
    || body.status === "pending_email_confirmation"
      ? body.status
      : "confirmed"
  )
});

const sanitizeEventRegistrationCheckInRequest = (body: EventRegistrationCheckInRequest): EventRegistrationCheckInRequest => ({
  ticketCode: String(body.ticketCode || "").trim()
});

const sanitizeEventRegistrationSelfCheckInRequest = (body: Partial<EventRegistrationSelfCheckInRequest> | null): EventRegistrationSelfCheckInRequest => ({
  ticketPayload: String(body?.ticketPayload || "").trim(),
  eventSlug: String(body?.eventSlug || "").trim()
});

const parseTicketPayload = (value: string): { id: string; ticketCode: string } | null => {
  const parts = value.trim().split(":");
  if (parts.length !== 3 || parts[0] !== "ecclesiaos-event-ticket") return null;
  return { id: parts[1], ticketCode: parts[2] };
};

const normalizePublicSlug = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const sendEventRegistrationConfirmationEmail = async (event: ChurchEvent, registration: EventRegistration, confirmationToken: string) => {
  const link = `${webBaseUrl}/register/${encodeURIComponent(event.registrationSlug || event.id)}/confirm?token=${encodeURIComponent(confirmationToken)}`;
  const subject = `Confirme sua inscricao em ${event.title}`;
  const text = `Ola, ${registration.name}.\n\nPara confirmar sua inscricao em "${event.title}" (${event.date}), clique no link abaixo (valido por 24 horas):\n\n${link}\n\nSe voce nao se inscreveu, ignore este email.`;
  const html = `<p>Ola, <strong>${registration.name}</strong>.</p>
<p>Para confirmar sua inscricao em <strong>${event.title}</strong> (${event.date}), clique no botao abaixo:</p>
<p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#216869;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Confirmar inscricao</a></p>
<p style="color:#5c6b78;font-size:13px;">Link valido por 24 horas. Se nao foi voce, ignore.</p>
<p style="color:#8a96a3;font-size:12px;">Ou copie e cole no navegador: ${link}</p>`;

  return sendEmail({ to: registration.email, subject, text, html });
};

const sanitizeResourceInput = (body: ChurchResourceInput): ChurchResourceInput => ({
  name: String(body.name || "").trim(),
  location: String(body.location || "").trim(),
  capacity: Math.max(0, Number(body.capacity) || 0),
  description: String(body.description || "").trim(),
  isActive: Boolean(body.isActive)
});

const sanitizeRoomReservationInput = (body: RoomReservationInput): RoomReservationInput => ({
  resourceId: String(body.resourceId || "").trim(),
  eventId: String(body.eventId || "").trim(),
  title: String(body.title || "").trim(),
  date: String(body.date || "").trim(),
  startTime: String(body.startTime || "").trim(),
  endTime: String(body.endTime || "").trim(),
  reservedBy: String(body.reservedBy || "").trim(),
  status: body.status === "cancelled" ? "cancelled" : "confirmed",
  notes: String(body.notes || "").trim()
});

const sanitizeEventCheckInInput = (body: EventCheckInInput): EventCheckInInput => ({
  eventId: String(body.eventId || "").trim(),
  personId: String(body.personId || "").trim(),
  notes: String(body.notes || "").trim()
});

const sanitizeChildCheckInInput = (body: ChildCheckInInput): ChildCheckInInput => ({
  eventId: String(body.eventId || "").trim(),
  childPersonId: String(body.childPersonId || "").trim(),
  childName: String(body.childName || "").trim(),
  guardianPersonId: String(body.guardianPersonId || "").trim(),
  guardianName: String(body.guardianName || "").trim(),
  guardianPhone: String(body.guardianPhone || "").trim(),
  notes: String(body.notes || "").trim()
});

const youtubeErrorMessages: Record<"missing_channel_url" | "invalid_channel_url" | "channel_not_found" | "feed_unavailable", string> = {
  missing_channel_url: "A igreja ainda nao configurou o canal do YouTube.",
  invalid_channel_url: "A URL do canal nao e reconhecida. Use /channel/UC..., /@handle, /c/handle ou /user/handle.",
  channel_not_found: "Nao foi possivel resolver o canal a partir do handle informado.",
  feed_unavailable: "Nao foi possivel ler o feed do YouTube no momento. Tente novamente em alguns minutos."
};

const handleListYouTubeVideos = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const profile = await churchRepository.getProfile();
  const result = await fetchYouTubeFeed(profile.youtubeChannelUrl);
  if (!result.ok) {
    sendJson(res, 200, { error: result.error, message: youtubeErrorMessages[result.error] });
    return;
  }

  sendJson(res, 200, result.feed);
};

const sanitizeLabelTemplateInput = (body: LabelTemplateInput): LabelTemplateInput => ({
  name: String(body.name || "").trim(),
  printerModel: String(body.printerModel || "").trim(),
  widthMm: Math.max(0, Number(body.widthMm) || 0),
  heightMm: Math.max(0, Number(body.heightMm) || 0),
  isContinuous: Boolean(body.isContinuous),
  layout: body.layout === "visitor" ? "visitor" : "kids_checkin",
  isDefault: Boolean(body.isDefault)
});

const handleListLabelTemplates = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const layoutParam = (url.searchParams.get("layout") || "").trim();

  if (layoutParam === "kids_checkin" || layoutParam === "visitor") {
    sendJson(res, 200, await labelTemplateRepository.listByLayout(layoutParam as LabelLayout));
    return;
  }

  sendJson(res, 200, await labelTemplateRepository.list());
};

const handleCreateLabelTemplate = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<LabelTemplateInput>(req);
  if (!body?.name) {
    sendError(res, 400, "invalid_json", "Informe o nome do template.");
    return;
  }

  const template = await labelTemplateRepository.create(sanitizeLabelTemplateInput(body));
  await recordAudit(user, "create", "label_template", template.id, `Template criado: ${template.name}`);
  sendJson(res, 201, template);
};

const handleUpdateLabelTemplate = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<LabelTemplateInput>(req);
  if (!body?.name) {
    sendError(res, 400, "invalid_json", "Informe o nome do template.");
    return;
  }

  const template = await labelTemplateRepository.update(id, sanitizeLabelTemplateInput(body));
  if (!template) {
    sendError(res, 404, "not_found", "Template nao encontrado.");
    return;
  }

  await recordAudit(user, "update", "label_template", template.id, `Template atualizado: ${template.name}`);
  sendJson(res, 200, template);
};

const handleDeleteLabelTemplate = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const removed = await labelTemplateRepository.remove(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Template nao encontrado.");
    return;
  }

  await recordAudit(user, "delete", "label_template", id, `Template removido: ${id}`);
  sendJson(res, 200, { ok: true });
};

const handleListPeopleMessages = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  sendJson(res, 200, await peopleMessageRepository.list());
};

const handleCreatePeopleMessage = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleManage(req, res, "messages");
  if (!user) return;

  const body = await readJson<PeopleMessageInput>(req);
  if (!body?.subject || !Array.isArray(body?.recipientPersonIds)) {
    sendError(res, 400, "invalid_json", "Informe assunto e destinatarios.");
    return;
  }

  const message = await peopleMessageRepository.create(body, toPublicUser(user));
  if (message === "invalid") {
    sendError(res, 400, "invalid_json", "Mensagem invalida ou sem destinatarios.");
    return;
  }

  await recordAudit(user, "create", "people_message", message.id, `Mensagem para ${message.recipientPersonIds.length} pessoa(s): ${message.subject}`);

  const delivery: PeopleMessageDelivery = { sent: 0, skipped: 0, failed: 0 };

  if (message.channel === "email") {
    if (!isEmailConfigured()) {
      delivery.reason = "not_configured";
    } else {
      const allPeople = await personRepository.list();
      const recipients = message.recipientPersonIds
        .map((id) => allPeople.find((person) => person.id === id))
        .filter((person): person is NonNullable<typeof person> => Boolean(person));

      if (recipients.length === 0) {
        delivery.reason = "no_recipients_with_email";
      } else {
        const churchProfile = await churchRepository.getProfile();
        const churchName = churchProfile.name || "";
        for (const person of recipients) {
          if (!person.email) {
            delivery.skipped += 1;
            continue;
          }
          const context = {
            firstName: person.firstName,
            lastName: person.lastName,
            email: person.email,
            phone: person.phone,
            churchName
          };
          const result = await sendEmail({
            to: person.email,
            subject: substituteMessageVariables(message.subject, context),
            text: substituteMessageVariables(message.body, context)
          });
          if (result.ok) {
            delivery.sent += 1;
          } else {
            delivery.failed += 1;
          }
        }
      }
    }
  } else {
    delivery.reason = "manual_channel";
  }

  const response: PeopleMessageResponse = { message, delivery };
  sendJson(res, 201, response);
};

const sanitizeMessageTemplateInput = (body: MessageTemplateInput): MessageTemplateInput => ({
  name: String(body.name || "").trim(),
  channel: body.channel === "email" || body.channel === "whatsapp" ? body.channel : "manual",
  subject: String(body.subject || "").trim(),
  body: String(body.body || "")
});

const handleListMessageTemplates = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;
  sendJson(res, 200, await messageTemplateRepository.list());
};

const handleCreateMessageTemplate = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleManage(req, res, "messages");
  if (!user) return;

  const body = await readJson<MessageTemplateInput>(req);
  if (!body?.name) {
    sendError(res, 400, "invalid_json", "Informe o nome do template.");
    return;
  }

  const template = await messageTemplateRepository.create(sanitizeMessageTemplateInput(body));
  await recordAudit(user, "create", "message_template", template.id, `Template criado: ${template.name}`);
  sendJson(res, 201, template);
};

const handleUpdateMessageTemplate = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleManage(req, res, "messages");
  if (!user) return;

  const body = await readJson<MessageTemplateInput>(req);
  if (!body?.name) {
    sendError(res, 400, "invalid_json", "Informe o nome do template.");
    return;
  }

  const updated = await messageTemplateRepository.update(id, sanitizeMessageTemplateInput(body));
  if (!updated) {
    sendError(res, 404, "not_found", "Template nao encontrado.");
    return;
  }

  await recordAudit(user, "update", "message_template", updated.id, `Template atualizado: ${updated.name}`);
  sendJson(res, 200, updated);
};

const handleDeleteMessageTemplate = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleManage(req, res, "messages");
  if (!user) return;

  const removed = await messageTemplateRepository.remove(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Template nao encontrado.");
    return;
  }

  await recordAudit(user, "delete", "message_template", id, `Template removido: ${id}`);
  sendJson(res, 200, { ok: true });
};

const handleListBlockOuts = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const personId = (url.searchParams.get("personId") || "").trim();

  if (personId) {
    sendJson(res, 200, await blockOutRepository.listForPerson(personId));
    return;
  }

  sendJson(res, 200, await blockOutRepository.list());
};

const handleCreateBlockOut = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJson<PersonBlockOutInput>(req);
  if (!body?.personId || !body?.startDate) {
    sendError(res, 400, "invalid_json", "Informe pessoa e data inicial.");
    return;
  }

  const isOwner = user.personId && body.personId === user.personId;
  if (!isOwner && user.role !== "admin") {
    sendError(res, 403, "forbidden", "Voce so pode criar bloqueio para si.");
    return;
  }

  const created = await blockOutRepository.create(body, toPublicUser(user));
  if (created === "invalid") {
    sendError(res, 400, "invalid_json", "Datas invalidas; o fim deve ser igual ou posterior ao inicio.");
    return;
  }

  await recordAudit(user, "create", "person_block_out", created.id, `Bloqueio de ${created.startDate} a ${created.endDate} para ${created.personId}`);
  sendJson(res, 201, created);
};

const handleDeleteBlockOut = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const blockOut = await blockOutRepository.findById(id);
  if (!blockOut) {
    sendError(res, 404, "not_found", "Bloqueio nao encontrado.");
    return;
  }

  const isOwner = user.personId && blockOut.personId === user.personId;
  if (!isOwner && user.role !== "admin") {
    sendError(res, 403, "forbidden", "Voce so pode remover seu proprio bloqueio.");
    return;
  }

  await blockOutRepository.remove(id);
  await recordAudit(user, "delete", "person_block_out", id, `Bloqueio removido de ${blockOut.personId}`);
  sendJson(res, 200, { ok: true });
};

const buildSubstituteSuggestions = async (plan: ServingPlan, group: GroupProfile | undefined, role = ""): Promise<SubstituteSuggestion[]> => {
  if (!group) return [];

  const [blockOuts, allPlans, people] = await Promise.all([
    blockOutRepository.list(),
    servingPlanRepository.list(),
    personRepository.list()
  ]);

  const cutoff = new Date(plan.date);
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const recentLoadByPerson = new Map<string, number>();
  for (const otherPlan of allPlans) {
    if (otherPlan.date < cutoffIso) continue;
    if (otherPlan.date > plan.date) continue;
    for (const item of otherPlan.assignments) {
      if (!item.personId) continue;
      if (item.status === "declined") continue;
      recentLoadByPerson.set(item.personId, (recentLoadByPerson.get(item.personId) || 0) + 1);
    }
  }

  const alreadyAssigned = new Set(plan.assignments.map((item) => item.personId).filter(Boolean));
  const requiresPosition = Boolean(role && group.servicePositions.includes(role));
  return group.memberPersonIds
    .filter((personId) => !alreadyAssigned.has(personId))
    .filter((personId) => !requiresPosition || (group.memberServicePositions[personId] || []).includes(role))
    .map((personId) => {
      const person = people.find((item) => item.id === personId);
      const name = person ? `${person.firstName} ${person.lastName}`.trim() : "Pessoa";
      return {
        personId,
        name,
        recentLoad: recentLoadByPerson.get(personId) || 0,
        hasBlockOut: isPersonBlockedOnDate(blockOuts, personId, plan.date)
      };
    })
    .filter((candidate) => !candidate.hasBlockOut)
    .sort((a, b) => a.recentLoad - b.recentLoad || a.name.localeCompare(b.name))
    .slice(0, 5);
};

const handleSuggestSubstitutes = async (req: IncomingMessage, res: ServerResponse, planId: string, assignmentId: string) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const plans = await servingPlanRepository.list();
  const plan = plans.find((item) => item.id === planId);
  if (!plan) {
    sendError(res, 404, "not_found", "Plano nao encontrado.");
    return;
  }

  const assignment = plan.assignments.find((item) => item.id === assignmentId);
  if (!assignment) {
    sendError(res, 404, "not_found", "Atribuicao nao encontrada.");
    return;
  }

  const groups = await groupRepository.list();
  const group = groups.find((item) => item.id === plan.groupId);
  const isLeader = Boolean(group && user.personId && group.leaderPersonId === user.personId);
  if (user.role !== "admin" && !isLeader) {
    sendError(res, 403, "forbidden", "Apenas admin ou lider da equipe pode pedir substituto.");
    return;
  }
  if (!group) {
    sendJson(res, 200, []);
    return;
  }

  sendJson(res, 200, await buildSubstituteSuggestions(plan, group, assignment.role));
};

const handleListAttendance = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  sendJson(res, 200, await attendanceRepository.list());
};

const handleCreateAttendance = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<AttendanceInput>(req);
  if (!body?.date) {
    sendError(res, 400, "invalid_json", "Informe a data da presenca.");
    return;
  }

  const record = await attendanceRepository.create(sanitizeAttendanceInput(body));
  sendJson(res, 201, record);
};

const handleUpdateAttendance = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<AttendanceInput>(req);
  if (!body?.date) {
    sendError(res, 400, "invalid_json", "Informe a data da presenca.");
    return;
  }

  const record = await attendanceRepository.update(id, sanitizeAttendanceInput(body));
  if (!record) {
    sendError(res, 404, "not_found", "Presenca nao encontrada.");
    return;
  }

  sendJson(res, 200, record);
};

const handleDeleteAttendance = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const removed = await attendanceRepository.remove(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Presenca nao encontrada.");
    return;
  }

  sendJson(res, 200, { ok: true });
};

const handleListEvents = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  try {
    await eventRepository.materializeCronOccurrences();
  } catch (error) {
    console.error("Failed to materialize recurring event occurrences while listing events.", error);
  }

  sendJson(res, 200, await eventRepository.list());
};

const handleGenerateEventOccurrences = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  let result;
  try {
    result = await eventRepository.regenerateForMaster(id);
    if (!result) {
      sendError(res, 404, "not_found", "Evento nao encontrado.");
      return;
    }
  } catch (error) {
    console.error("Failed to generate recurring event occurrences.", error);
    sendError(res, 400, "invalid_json", "Nao foi possivel gerar ocorrencias agora. Tente novamente em alguns instantes.");
    return;
  }

  await recordAudit(user, "update", "event", id, `Ocorrencias geradas: ${result.generated}/${result.total}`);
  sendJson(res, 200, result);
};

const handleGetPublicEvent = async (res: ServerResponse, slug: string) => {
  const event = await eventRegistrationRepository.findPublicEvent(slug);
  if (!event) {
    sendError(res, 404, "not_found", "Evento nao encontrado ou inscricoes fechadas.");
    return;
  }

  const registrations = await eventRegistrationRepository.list();
  const reservedQuantity = reservedQuantityFor(event, registrations);

  sendJson(res, 200, {
    event,
    reservedQuantity,
    availableQuantity: event.registrationCapacity > 0 ? Math.max(0, event.registrationCapacity - reservedQuantity) : null
  });
};

const handleCreatePublicRegistration = async (req: IncomingMessage, res: ServerResponse, slug: string) => {
  const event = await eventRegistrationRepository.findPublicEvent(slug);
  if (!event) {
    sendError(res, 404, "not_found", "Evento nao encontrado ou inscricoes fechadas.");
    return;
  }

  const body = await readJson<EventRegistrationInput>(req);
  if (!body?.name || !body?.email) {
    sendError(res, 400, "invalid_json", "Informe nome e email.");
    return;
  }

  const requireConfirmation = Boolean(event.registrationRequiresEmailConfirmation) && isEmailConfigured();
  const result = await eventRegistrationRepository.create(
    event,
    sanitizeEventRegistrationInput(body),
    { emailConfirmationRequired: requireConfirmation }
  );
  if (result === "full") {
    sendError(res, 409, "conflict", "Limite de vagas atingido.");
    return;
  }

  if (requireConfirmation && result.confirmationToken && result.registration.email) {
    try {
      await sendEventRegistrationConfirmationEmail(event, result.registration, result.confirmationToken);
    } catch {
      // best-effort
    }
  }

  sendJson(res, 201, result.registration);
};

const handleConfirmEventRegistration = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await readJson<EventRegistrationConfirmInput>(req);
  const token = String(body?.token || "").trim();
  if (!token) {
    sendError(res, 400, "invalid_json", "Token invalido ou expirado.");
    return;
  }

  const result = await eventRegistrationRepository.confirmEmail(token);
  if (result === "invalid") {
    sendError(res, 400, "invalid_json", "Link invalido ou ja utilizado.");
    return;
  }
  if (result === "expired") {
    sendError(res, 400, "invalid_json", "Link expirado. Inscreva-se novamente.");
    return;
  }

  const users = await userRepository.listUsers();
  const adminActor = users.find((user) => user.role === "admin");
  if (adminActor) {
    await auditRepository.create({
      action: "update",
      entityType: "event_registration",
      entityId: result.id,
      actor: adminActor,
      summary: `Email confirmado: ${result.name}`
    });
  }

  const response: EventRegistrationConfirmResponse = { ok: true, status: result.status };
  sendJson(res, 200, response);
};

const handlePublicEventRegistrationCheckIn = async (req: IncomingMessage, res: ServerResponse) => {
  const body = sanitizeEventRegistrationSelfCheckInRequest(await readJson<EventRegistrationSelfCheckInRequest>(req));
  const parsed = parseTicketPayload(body.ticketPayload);
  if (!parsed || !body.eventSlug) {
    sendError(res, 400, "invalid_json", "Informe um QR Code de ingresso valido.");
    return;
  }

  const event = (await eventRepository.list()).find((entry) => normalizePublicSlug(entry.registrationSlug) === normalizePublicSlug(body.eventSlug));
  if (!event) {
    sendError(res, 404, "not_found", "Evento nao encontrado ou check-in indisponivel.");
    return;
  }

  const registrations = await eventRegistrationRepository.list();
  const registration = registrations.find((entry) => entry.id === parsed.id);
  if (!registration) {
    sendError(res, 404, "not_found", "Inscricao nao encontrada.");
    return;
  }
  if (registration.eventId !== event.id) {
    sendError(res, 403, "forbidden", "Este ingresso nao pertence a este evento.");
    return;
  }

  const result = await eventRegistrationRepository.checkIn(parsed.id, parsed.ticketCode, "self_service");
  if (!result) {
    sendError(res, 404, "not_found", "Inscricao nao encontrada.");
    return;
  }
  if (result === "invalid") {
    sendError(res, 403, "forbidden", "Codigo do ingresso invalido.");
    return;
  }
  if (result === "not_confirmed") {
    sendError(res, 403, "forbidden", "Inscricao ainda nao esta confirmada.");
    return;
  }

  const users = await userRepository.listUsers();
  const adminActor = users.find((user) => user.role === "admin");
  if (adminActor) {
    await auditRepository.create({
      action: "update",
      entityType: "event_registration",
      entityId: result.id,
      actor: adminActor,
      summary: `Self check-in de inscricao: ${result.name}`
    });
  }

  sendJson(res, 200, result);
};

const handleListEventRegistrations = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleManage(req, res, "events");
  if (!user) return;

  sendJson(res, 200, await eventRegistrationRepository.list());
};

const handleResendEventRegistrationConfirmation = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleManage(req, res, "events");
  if (!user) return;

  const result = await eventRegistrationRepository.resendEmailConfirmation(id);
  if (result === "not_found") {
    sendError(res, 404, "not_found", "Inscricao nao encontrada.");
    return;
  }
  if (result === "not_pending") {
    sendError(res, 400, "invalid_json", "A inscricao nao esta aguardando confirmacao de email.");
    return;
  }
  if (result === "missing_email") {
    sendError(res, 400, "invalid_json", "A inscricao nao possui email para confirmacao.");
    return;
  }

  const event = (await eventRepository.list()).find((entry) => entry.id === result.registration.eventId);
  if (!event) {
    sendError(res, 404, "not_found", "Evento da inscricao nao encontrado.");
    return;
  }

  const emailResult = await sendEventRegistrationConfirmationEmail(event, result.registration, result.confirmationToken);
  await recordAudit(user, "update", "event_registration", result.registration.id, `Confirmacao reenviada: ${result.registration.email}`);

  const response: EventRegistrationResendConfirmationResponse = {
    ok: true,
    status: result.registration.status,
    emailSent: emailResult.ok,
    expiresAt: result.registration.emailConfirmationExpiresAt
  };
  sendJson(res, 200, response);
};

const handleUpdateEventRegistrationStatus = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleManage(req, res, "events");
  if (!user) return;

  const body = await readJson<EventRegistrationStatusUpdate>(req);
  if (!body?.status) {
    sendError(res, 400, "invalid_json", "Informe o status da inscricao.");
    return;
  }

  const updated = await eventRegistrationRepository.updateStatus(id, sanitizeEventRegistrationStatusUpdate(body).status);
  if (!updated) {
    sendError(res, 404, "not_found", "Inscricao nao encontrada.");
    return;
  }

  await recordAudit(user, "update", "event_registration", updated.id, `Inscricao atualizada: ${updated.status}`);
  sendJson(res, 200, updated);
};

const handleCheckInEventRegistration = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleManage(req, res, "events");
  if (!user) return;

  const body = await readJson<EventRegistrationCheckInRequest>(req);
  if (!body?.ticketCode) {
    sendError(res, 400, "invalid_json", "Informe o codigo do ingresso.");
    return;
  }

  const result = await eventRegistrationRepository.checkIn(id, sanitizeEventRegistrationCheckInRequest(body).ticketCode, user.id);
  if (!result) {
    sendError(res, 404, "not_found", "Inscricao nao encontrada.");
    return;
  }
  if (result === "invalid") {
    sendError(res, 403, "forbidden", "Codigo do ingresso invalido.");
    return;
  }
  if (result === "not_confirmed") {
    sendError(res, 403, "forbidden", "Inscricao ainda nao esta confirmada.");
    return;
  }

  await recordAudit(user, "update", "event_registration", result.id, `Check-in de inscricao: ${result.name}`);
  sendJson(res, 200, result);
};

const handleCreateEvent = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<ChurchEventInput>(req);
  const validationMessage = validateEventInput(body);
  if (validationMessage) {
    sendError(res, 400, "invalid_json", validationMessage);
    return;
  }

  try {
    if (!body) return;
    const event = await eventRepository.create(sanitizeEventInput(body));
    await recordAudit(user, "create", "event", event.id, `Evento criado: ${event.title}`);
    sendJson(res, 201, event);
  } catch (error) {
    sendSaveError(res, error, "Nao foi possivel salvar o evento. Revise os campos e tente novamente.");
  }
};

const handleUpdateEvent = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<ChurchEventInput>(req);
  const validationMessage = validateEventInput(body);
  if (validationMessage) {
    sendError(res, 400, "invalid_json", validationMessage);
    return;
  }

  try {
    if (!body) return;
    const event = await eventRepository.update(id, sanitizeEventInput(body));
    if (!event) {
      sendError(res, 404, "not_found", "Evento nao encontrado.");
      return;
    }

    await recordAudit(user, "update", "event", event.id, `Evento atualizado: ${event.title}`);
    sendJson(res, 200, event);
  } catch (error) {
    sendSaveError(res, error, "Nao foi possivel salvar o evento. Revise os campos e tente novamente.");
  }
};

const handleDeleteEvent = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const removed = await eventRepository.remove(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Evento nao encontrado.");
    return;
  }

  await recordAudit(user, "delete", "event", id, `Evento removido: ${id}`);
  sendJson(res, 200, { ok: true });
};

const handleListResources = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleAccess(req, res, "resources");
  if (!user) return;

  sendJson(res, 200, await resourceRepository.listResources());
};

const handleCreateResource = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleManage(req, res, "resources");
  if (!user) return;

  const body = await readJson<ChurchResourceInput>(req);
  if (!body?.name) {
    sendError(res, 400, "invalid_json", "Informe o nome do ambiente.");
    return;
  }

  const resource = await resourceRepository.createResource(sanitizeResourceInput(body));
  await recordAudit(user, "create", "resource", resource.id, `Ambiente criado: ${resource.name}`);
  sendJson(res, 201, resource);
};

const handleUpdateResource = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleManage(req, res, "resources");
  if (!user) return;

  const body = await readJson<ChurchResourceInput>(req);
  if (!body?.name) {
    sendError(res, 400, "invalid_json", "Informe o nome do ambiente.");
    return;
  }

  const resource = await resourceRepository.updateResource(id, sanitizeResourceInput(body));
  if (!resource) {
    sendError(res, 404, "not_found", "Ambiente nao encontrado.");
    return;
  }

  await recordAudit(user, "update", "resource", resource.id, `Ambiente atualizado: ${resource.name}`);
  sendJson(res, 200, resource);
};

const handleDeleteResource = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleManage(req, res, "resources");
  if (!user) return;

  const removed = await resourceRepository.removeResource(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Ambiente nao encontrado.");
    return;
  }
  if (removed === "in_use") {
    sendError(res, 409, "conflict", "Ambiente possui reservas e nao pode ser removido.");
    return;
  }

  await recordAudit(user, "delete", "resource", id, `Ambiente removido: ${id}`);
  sendJson(res, 200, { ok: true });
};

const handleListRoomReservations = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleAccess(req, res, "resources");
  if (!user) return;

  sendJson(res, 200, await resourceRepository.listReservations());
};

const handleCreateRoomReservation = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleManage(req, res, "resources");
  if (!user) return;

  const body = await readJson<RoomReservationInput>(req);
  if (!body?.resourceId || !body?.title || !body?.date || !body?.startTime || !body?.endTime) {
    sendError(res, 400, "invalid_json", "Informe ambiente, titulo, data e horario.");
    return;
  }

  const reservation = await resourceRepository.createReservation(sanitizeRoomReservationInput(body));
  if (reservation === "conflict") {
    sendError(res, 409, "conflict", "Ja existe reserva para este ambiente neste horario.");
    return;
  }

  await recordAudit(user, "create", "room_reservation", reservation.id, `Reserva criada: ${reservation.title}`);
  sendJson(res, 201, reservation);
};

const handleUpdateRoomReservation = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleManage(req, res, "resources");
  if (!user) return;

  const body = await readJson<RoomReservationInput>(req);
  if (!body?.resourceId || !body?.title || !body?.date || !body?.startTime || !body?.endTime) {
    sendError(res, 400, "invalid_json", "Informe ambiente, titulo, data e horario.");
    return;
  }

  const reservation = await resourceRepository.updateReservation(id, sanitizeRoomReservationInput(body));
  if (!reservation) {
    sendError(res, 404, "not_found", "Reserva nao encontrada.");
    return;
  }
  if (reservation === "conflict") {
    sendError(res, 409, "conflict", "Ja existe reserva para este ambiente neste horario.");
    return;
  }

  await recordAudit(user, "update", "room_reservation", reservation.id, `Reserva atualizada: ${reservation.title}`);
  sendJson(res, 200, reservation);
};

const handleDeleteRoomReservation = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleManage(req, res, "resources");
  if (!user) return;

  const removed = await resourceRepository.removeReservation(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Reserva nao encontrada.");
    return;
  }

  await recordAudit(user, "delete", "room_reservation", id, `Reserva removida: ${id}`);
  sendJson(res, 200, { ok: true });
};

const handleListEventCheckIns = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleAccess(req, res, "checkin");
  if (!user) return;

  sendJson(res, 200, await checkInRepository.listEventCheckIns());
};

const handleCreateEventCheckIn = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleManage(req, res, "checkin");
  if (!user) return;

  const body = await readJson<EventCheckInInput>(req);
  if (!body?.eventId || !body?.personId) {
    sendError(res, 400, "invalid_json", "Informe evento e pessoa.");
    return;
  }

  const checkIn = await checkInRepository.createEventCheckIn(sanitizeEventCheckInInput(body));
  await attendanceRepository.syncFromEventCheckIns(checkIn.eventId);
  await recordAudit(user, "create", "event_checkin", checkIn.id, `Check-in de pessoa no evento: ${checkIn.eventId}`);
  sendJson(res, 201, checkIn);
};

const handleDeleteEventCheckIn = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireModuleManage(req, res, "checkin");
  if (!user) return;

  const existing = (await checkInRepository.listEventCheckIns()).find((checkIn) => checkIn.id === id);
  const removed = await checkInRepository.removeEventCheckIn(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Check-in nao encontrado.");
    return;
  }

  if (existing) await attendanceRepository.syncFromEventCheckIns(existing.eventId);
  await recordAudit(user, "delete", "event_checkin", id, `Check-in de pessoa removido: ${id}`);
  sendJson(res, 200, { ok: true });
};

const handleListChildCheckIns = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleAccess(req, res, "checkin");
  if (!user) return;

  const checkIns = await checkInRepository.listChildCheckIns();
  if (user.role === "admin" || user.role === "leader") {
    sendJson(res, 200, checkIns);
    return;
  }

  const people = await personRepository.list();
  const allowed = checkIns.filter((checkIn) => isChildGuardian(checkIn, user.personId, people));
  sendJson(res, 200, allowed);
};

const handleCreateChildCheckIn = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleManage(req, res, "checkin");
  if (!user) return;

  const body = await readJson<ChildCheckInInput>(req);
  if (!body?.eventId || !body?.childName || !body?.guardianName) {
    sendError(res, 400, "invalid_json", "Informe evento, crianca e responsavel.");
    return;
  }

  const checkIn = await checkInRepository.createChildCheckIn(sanitizeChildCheckInInput(body));
  await recordAudit(user, "create", "child_checkin", checkIn.id, `Check-in infantil: ${checkIn.childName}`);
  sendJson(res, 201, checkIn);
};

const handleCheckOutChild = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const checkIns = await checkInRepository.listChildCheckIns();
  const existing = checkIns.find((item) => item.id === id);
  if (!existing) {
    sendError(res, 404, "not_found", "Check-in infantil nao encontrado.");
    return;
  }

  const canManage = user.role === "admin" || user.role === "leader";
  if (!canManage) {
    const body = await readJson<ChildCheckOutRequest>(req);
    const people = await personRepository.list();
    const isGuardian = isChildGuardian(existing, user.personId, people);
    if (!isGuardian) {
      sendError(res, 403, "forbidden", "Voce nao esta vinculado como responsavel desta crianca.");
      return;
    }
    if (!body?.securityCode || body.securityCode !== existing.securityCode) {
      sendError(res, 403, "forbidden", "Codigo de seguranca invalido.");
      return;
    }
  }

  const checkIn = await checkInRepository.checkOutChild(id, user.personId);
  if (!checkIn) {
    sendError(res, 404, "not_found", "Check-in infantil nao encontrado.");
    return;
  }

  await recordAudit(user, "update", "child_checkin", checkIn.id, `Saida infantil: ${checkIn.childName}`);
  sendJson(res, 200, checkIn);
};

const isChildGuardian = (checkIn: ChildCheckIn, personId: string, people: Array<{ id: string; guardianPersonIds: string[] }>) => {
  if (!personId) return false;
  if (checkIn.guardianPersonId === personId) return true;
  const child = people.find((person) => person.id === checkIn.childPersonId);
  return Boolean(child?.guardianPersonIds.includes(personId));
};

const sanitizeServingPlanInput = (body: ServingPlanInput): ServingPlanInput => ({
  date: String(body.date || "").trim(),
  title: String(body.title || "").trim(),
  groupId: String(body.groupId || "").trim(),
  eventId: String(body.eventId || "").trim(),
  notes: String(body.notes || "").trim(),
  assignments: Array.isArray(body.assignments) ? body.assignments : []
});

const handleListServingPlans = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const groupId = (url.searchParams.get("groupId") || "").trim();

  if (groupId) {
    sendJson(res, 200, await servingPlanRepository.listByGroupIds([groupId]));
    return;
  }

  sendJson(res, 200, await servingPlanRepository.list());
};

const handleCreateServingPlan = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<ServingPlanInput>(req);
  if (!body?.date || !body?.title) {
    sendError(res, 400, "invalid_json", "Informe data e titulo do plano.");
    return;
  }

  const plan = await servingPlanRepository.create(sanitizeServingPlanInput(body));
  sendJson(res, 201, plan);
};

const handleUpdateServingPlan = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJson<ServingPlanInput>(req);
  if (!body?.date || !body?.title) {
    sendError(res, 400, "invalid_json", "Informe data e titulo do plano.");
    return;
  }

  const existingPlans = await servingPlanRepository.list();
  const existingPlan = existingPlans.find((plan) => plan.id === id);
  if (!existingPlan) {
    sendError(res, 404, "not_found", "Plano nao encontrado.");
    return;
  }

  if (user.role !== "admin") {
    const groups = await groupRepository.list();
    const planGroup = groups.find((group) => group.id === existingPlan.groupId);
    const isLeader = Boolean(planGroup && user.personId && planGroup.leaderPersonId === user.personId);
    if (!isLeader) {
      sendError(res, 403, "forbidden", "Apenas admin ou lider da equipe pode editar este plano.");
      return;
    }

    const memberSet = new Set(planGroup?.memberPersonIds || []);
    const incomingAssignments = Array.isArray(body.assignments) ? body.assignments : [];
    const invalidAssignment = incomingAssignments.find((assignment) => {
      const personId = String(assignment.personId || "").trim();
      return personId && !memberSet.has(personId);
    });
    if (invalidAssignment) {
      sendError(res, 403, "forbidden", "Lider so pode escalar pessoas da propria equipe.");
      return;
    }
  }

  const previousPersonIds = new Set(
    existingPlan.assignments.map((assignment) => assignment.personId).filter(Boolean)
  );

  const plan = await servingPlanRepository.update(id, sanitizeServingPlanInput(body));
  if (!plan) {
    sendError(res, 404, "not_found", "Plano nao encontrado.");
    return;
  }

  for (const assignment of plan.assignments) {
    if (assignment.personId && !previousPersonIds.has(assignment.personId)) {
      await notifyNewAssignment(assignment.personId, { title: plan.title, date: plan.date }, assignment.role);
    }
  }

  sendJson(res, 200, plan);
};

const handleDeleteServingPlan = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const removed = await servingPlanRepository.remove(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Plano nao encontrado.");
    return;
  }

  sendJson(res, 200, { ok: true });
};

const sanitizeServingAssignmentStatusUpdate = (body: ServingAssignmentStatusUpdate): ServingAssignmentStatusUpdate => ({
  status: body.status === "confirmed" || body.status === "declined" ? body.status : "pending",
  notes: String(body.notes || "").trim()
});

const notifyNewAssignment = async (personId: string, plan: { title: string; date: string }, role: string) => {
  if (!isEmailConfigured()) return;
  try {
    const person = (await personRepository.list()).find((item) => item.id === personId);
    if (!person?.email) return;

    const safeRole = role || "Funcao a definir";
    const link = `${webBaseUrl}/`;
    const subject = `Voce foi escalado em ${plan.title}`;
    const text = `Ola ${person.firstName},\n\nVoce foi escalado para servir em "${plan.title}" no dia ${plan.date}.\nFuncao: ${safeRole}.\n\nAcesse ${link} para confirmar ou recusar.\n\nObrigado.`;
    const html = `<p>Ola, <strong>${person.firstName}</strong>.</p>
<p>Voce foi escalado para servir em <strong>${plan.title}</strong> no dia ${plan.date}.</p>
<p>Funcao: ${safeRole}</p>
<p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#216869;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Abrir EcclesiaOS</a></p>
<p style="color:#5c6b78;font-size:13px;">Acesse o sistema para confirmar ou recusar.</p>`;

    await sendEmail({ to: person.email, subject, text, html });
  } catch {
    // best effort
  }
};

const processUpcomingReminders = async () => {
  if (!isEmailConfigured()) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + reminderDaysBefore);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const plans = await servingPlanRepository.list();
  const upcoming = plans.filter((plan) => plan.date >= todayStr && plan.date <= cutoffStr);
  if (upcoming.length === 0) return;

  const people = await personRepository.list();
  const peopleById = new Map(people.map((person) => [person.id, person]));

  const updates: Array<{ planId: string; assignmentId: string; sentAt: string }> = [];

  for (const plan of upcoming) {
    for (const assignment of plan.assignments) {
      if (!assignment.personId) continue;
      if (assignment.status === "declined") continue;
      if (assignment.reminderSentAt) continue;

      const person = peopleById.get(assignment.personId);
      if (!person?.email) continue;

      const role = assignment.role || "Funcao a definir";
      const link = `${webBaseUrl}/`;
      const subject = `Lembrete: voce esta escalado em ${plan.title}`;
      const text = `Ola ${person.firstName},\n\nLembrete: voce esta escalado para servir em "${plan.title}" no dia ${plan.date}.\nFuncao: ${role}\n\nAcesse ${link} para ver detalhes.\n\nObrigado!`;
      const html = `<p>Ola, <strong>${person.firstName}</strong>.</p>
<p>Este e um lembrete: voce esta escalado para servir em <strong>${plan.title}</strong> no dia <strong>${plan.date}</strong>.</p>
<p>Funcao: ${role}</p>
<p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#216869;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Abrir EcclesiaOS</a></p>
<p style="color:#5c6b78;font-size:13px;">Obrigado por servir!</p>`;

      try {
        const result = await sendEmail({ to: person.email, subject, text, html });
        if (result.ok) {
          updates.push({ planId: plan.id, assignmentId: assignment.id, sentAt: new Date().toISOString() });
        }
      } catch {
        // best effort
      }
    }
  }

  if (updates.length > 0) {
    try {
      await servingPlanRepository.markRemindersSent(updates);
    } catch {
      // ignore — reminder just may go again next run
    }
  }
};

const notifyAssignmentResponse = async (
  plan: { title: string; date: string; groupId: string },
  assignment: { personId: string; role: string },
  status: "confirmed" | "declined" | "pending",
  substitutes: SubstituteSuggestion[] = []
): Promise<boolean> => {
  if (!isEmailConfigured()) return false;
  if (status === "pending") return false;
  if (!plan.groupId) return false;
  try {
    const group = (await groupRepository.list()).find((item) => item.id === plan.groupId);
    if (!group?.leaderPersonId) return false;
    const people = await personRepository.list();
    const leader = people.find((item) => item.id === group.leaderPersonId);
    if (!leader?.email) return false;

    const respondent = people.find((item) => item.id === assignment.personId);
    const respondentName = respondent ? `${respondent.firstName} ${respondent.lastName}`.trim() : "Pessoa";
    const verb = status === "confirmed" ? "confirmou" : "recusou";
    const role = assignment.role || "funcao a definir";
    const link = `${webBaseUrl}/`;
    const subject = `${respondentName} ${verb} a escala de ${plan.title}`;
    const substituteText = status === "declined" && substitutes.length > 0
      ? `\n\nSubstitutos sugeridos automaticamente:\n${substitutes.map((item, index) => `${index + 1}. ${item.name} (${item.recentLoad} escala(s) recentes)`).join("\n")}`
      : "";
    const substituteHtml = status === "declined" && substitutes.length > 0
      ? `<p>Substitutos sugeridos automaticamente:</p><ul>${substitutes.map((item) => `<li>${item.name} (${item.recentLoad} escala(s) recentes)</li>`).join("")}</ul>`
      : "";
    const text = `Ola ${leader.firstName},\n\n${respondentName} ${verb} a escala em "${plan.title}" no dia ${plan.date}.\nFuncao: ${role}${substituteText}\n\nAcesse ${link} para acompanhar.`;
    const html = `<p>Ola, <strong>${leader.firstName}</strong>.</p>
<p><strong>${respondentName}</strong> ${verb} a escala em <strong>${plan.title}</strong> no dia ${plan.date}.</p>
<p>Funcao: ${role}</p>
${substituteHtml}
<p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#216869;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Abrir EcclesiaOS</a></p>`;

    const result = await sendEmail({ to: leader.email, subject, text, html });
    return result.ok;
  } catch {
    // best effort
    return false;
  }
};

const handleUpdateServingAssignmentStatus = async (req: IncomingMessage, res: ServerResponse, planId: string, assignmentId: string) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJson<ServingAssignmentStatusUpdate>(req);
  if (!body?.status) {
    sendError(res, 400, "invalid_json", "Informe o status da escala.");
    return;
  }

  const existingPlan = (await servingPlanRepository.list()).find((plan) => plan.id === planId);
  const assignment = existingPlan?.assignments.find((item) => item.id === assignmentId);
  if (!existingPlan || !assignment) {
    sendError(res, 404, "not_found", "Escala ou pessoa escalada nao encontrada.");
    return;
  }

  const canUpdate = user.role === "admin" || (user.personId && user.personId === assignment.personId);
  if (!canUpdate) {
    sendError(res, 403, "forbidden", "Voce so pode responder suas proprias escalas.");
    return;
  }

  const update = sanitizeServingAssignmentStatusUpdate(body);
  const plan = await servingPlanRepository.updateAssignmentStatus(planId, assignmentId, update.status, update.notes);
  let substituteSuggestions: SubstituteSuggestion[] = [];
  let substituteEmailSent = false;
  if (plan) {
    const updatedAssignment = plan.assignments.find((item) => item.id === assignmentId);
    if (updatedAssignment) {
      if (update.status === "declined") {
        const group = (await groupRepository.list()).find((item) => item.id === plan.groupId);
        substituteSuggestions = await buildSubstituteSuggestions(plan, group, updatedAssignment.role);
      }
      substituteEmailSent = await notifyAssignmentResponse(
        { title: plan.title, date: plan.date, groupId: plan.groupId },
        { personId: updatedAssignment.personId, role: updatedAssignment.role },
        update.status,
        substituteSuggestions
      );
      if (update.status === "declined" && substituteSuggestions.length > 0) {
        await recordAudit(user, "update", "serving_plan", plan.id, `Substitutos sugeridos para recusa: ${substituteSuggestions.map((item) => item.name).join(", ")}`);
      }
    }
  }
  if (!plan) {
    sendError(res, 404, "not_found", "Escala ou pessoa escalada nao encontrada.");
    return;
  }
  const response: ServingAssignmentStatusResponse = {
    ...plan,
    substituteSuggestions,
    substituteEmailSent
  };
  sendJson(res, 200, response);
};

const handleListServingNotifications = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

  await processUpcomingReminders();

  const notifications = await servingPlanRepository.listNotifications(user.personId, user.role === "admin");
  sendJson(res, 200, notifications);
};

const sanitizeFinancialTransactionInput = (body: FinancialTransactionInput): FinancialTransactionInput => ({
  date: String(body.date || "").trim(),
  type: body.type === "expense" ? "expense" : "income",
  amount: Math.max(0, Number(body.amount) || 0),
  fund: String(body.fund || "").trim(),
  category: String(body.category || "").trim(),
  paymentMethod: ["cash", "card", "transfer", "check", "other"].includes(body.paymentMethod) ? body.paymentMethod : "other",
  personId: String(body.personId || "").trim(),
  description: String(body.description || "").trim()
});

const handleListFinancialTransactions = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleAccess(req, res, "finance");
  if (!user) return;

  sendJson(res, 200, await financialTransactionRepository.list());
};

const handleCreateFinancialTransaction = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<FinancialTransactionInput>(req);
  if (!body?.date || !body?.category || !body?.amount) {
    sendError(res, 400, "invalid_json", "Informe data, categoria e valor.");
    return;
  }

  const transaction = await financialTransactionRepository.create(sanitizeFinancialTransactionInput(body));
  await recordAudit(user, "create", "financial_transaction", transaction.id, `Lancamento financeiro criado: ${transaction.category}`);
  sendJson(res, 201, transaction);
};

const handleUpdateFinancialTransaction = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<FinancialTransactionInput>(req);
  if (!body?.date || !body?.category || !body?.amount) {
    sendError(res, 400, "invalid_json", "Informe data, categoria e valor.");
    return;
  }

  const transaction = await financialTransactionRepository.update(id, sanitizeFinancialTransactionInput(body));
  if (!transaction) {
    sendError(res, 404, "not_found", "Lancamento financeiro nao encontrado.");
    return;
  }

  await recordAudit(user, "update", "financial_transaction", transaction.id, `Lancamento financeiro atualizado: ${transaction.category}`);
  sendJson(res, 200, transaction);
};

const handleDeleteFinancialTransaction = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const removed = await financialTransactionRepository.remove(id);
  if (!removed) {
    sendError(res, 404, "not_found", "Lancamento financeiro nao encontrado.");
    return;
  }

  await recordAudit(user, "delete", "financial_transaction", id, `Lancamento financeiro removido: ${id}`);
  sendJson(res, 200, { ok: true });
};

export const createEcclesiaServer = () => createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    handleHealth(res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/system/email-status") {
    const response: EmailStatus = { configured: isEmailConfigured() };
    sendJson(res, 200, response);
    return;
  }

  if (req.method === "POST" && url.pathname === "/auth/login") {
    void handleLogin(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/auth/register") {
    void handleRegister(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/public/visitors") {
    void handleCreateVisitor(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/auth/me") {
    void handleMe(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/auth/change-password") {
    void handleChangeOwnPassword(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/auth/request-password-reset") {
    void handleRequestPasswordReset(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/auth/reset-password") {
    void handleResetPasswordWithToken(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/audit-logs") {
    void handleListAuditLogs(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/users") {
    void handleListUsers(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/users") {
    void handleCreateUser(req, res);
    return;
  }

  const userResetMatch = url.pathname.match(/^\/users\/([^/]+)\/reset-password$/);
  if (userResetMatch && req.method === "POST") {
    void handleAdminResetPassword(req, res, userResetMatch[1]);
    return;
  }

  const userMatch = url.pathname.match(/^\/users\/([^/]+)$/);
  if (userMatch && req.method === "PUT") {
    void handleUpdateUser(req, res, userMatch[1]);
    return;
  }

  if (userMatch && req.method === "DELETE") {
    void handleDeleteUser(req, res, userMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/church/profile") {
    void handleGetChurchProfile(req, res);
    return;
  }

  if (req.method === "PUT" && url.pathname === "/church/profile") {
    void handleUpdateChurchProfile(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/people") {
    void handleListPeople(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/people") {
    void handleCreatePerson(req, res);
    return;
  }

  const personMatch = url.pathname.match(/^\/people\/([^/]+)$/);
  if (personMatch && req.method === "PUT") {
    void handleUpdatePerson(req, res, personMatch[1]);
    return;
  }

  if (personMatch && req.method === "DELETE") {
    void handleDeletePerson(req, res, personMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/groups") {
    void handleListGroups(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/groups") {
    void handleCreateGroup(req, res);
    return;
  }

  const groupMatch = url.pathname.match(/^\/groups\/([^/]+)$/);
  if (groupMatch && req.method === "PUT") {
    void handleUpdateGroup(req, res, groupMatch[1]);
    return;
  }

  if (groupMatch && req.method === "DELETE") {
    void handleDeleteGroup(req, res, groupMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/songs") {
    void handleListSongs(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/songs") {
    void handleCreateSong(req, res);
    return;
  }

  const songMatch = url.pathname.match(/^\/songs\/([^/]+)$/);
  if (songMatch && req.method === "PUT") {
    void handleUpdateSong(req, res, songMatch[1]);
    return;
  }

  if (songMatch && req.method === "DELETE") {
    void handleDeleteSong(req, res, songMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/worship-sets") {
    void handleListWorshipSets(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/worship-sets") {
    void handleCreateWorshipSet(req, res);
    return;
  }

  const worshipSetMatch = url.pathname.match(/^\/worship-sets\/([^/]+)$/);
  if (worshipSetMatch && req.method === "PUT") {
    void handleUpdateWorshipSet(req, res, worshipSetMatch[1]);
    return;
  }

  if (worshipSetMatch && req.method === "DELETE") {
    void handleDeleteWorshipSet(req, res, worshipSetMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/youtube/videos") {
    void handleListYouTubeVideos(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/people-messages") {
    void handleListPeopleMessages(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/people-messages") {
    void handleCreatePeopleMessage(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/message-templates") {
    void handleListMessageTemplates(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/message-templates") {
    void handleCreateMessageTemplate(req, res);
    return;
  }

  const messageTemplateMatch = url.pathname.match(/^\/message-templates\/([^/]+)$/);
  if (messageTemplateMatch && req.method === "PUT") {
    void handleUpdateMessageTemplate(req, res, messageTemplateMatch[1]);
    return;
  }
  if (messageTemplateMatch && req.method === "DELETE") {
    void handleDeleteMessageTemplate(req, res, messageTemplateMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/block-outs") {
    void handleListBlockOuts(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/block-outs") {
    void handleCreateBlockOut(req, res);
    return;
  }

  const blockOutMatch = url.pathname.match(/^\/block-outs\/([^/]+)$/);
  if (blockOutMatch && req.method === "DELETE") {
    void handleDeleteBlockOut(req, res, blockOutMatch[1]);
    return;
  }

  const substitutesMatch = url.pathname.match(/^\/serving-plans\/([^/]+)\/substitutes\/([^/]+)$/);
  if (substitutesMatch && req.method === "GET") {
    void handleSuggestSubstitutes(req, res, substitutesMatch[1], substitutesMatch[2]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/label-templates") {
    void handleListLabelTemplates(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/label-templates") {
    void handleCreateLabelTemplate(req, res);
    return;
  }

  const labelTemplateMatch = url.pathname.match(/^\/label-templates\/([^/]+)$/);
  if (labelTemplateMatch && req.method === "PUT") {
    void handleUpdateLabelTemplate(req, res, labelTemplateMatch[1]);
    return;
  }

  if (labelTemplateMatch && req.method === "DELETE") {
    void handleDeleteLabelTemplate(req, res, labelTemplateMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/attendance") {
    void handleListAttendance(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/attendance") {
    void handleCreateAttendance(req, res);
    return;
  }

  const attendanceMatch = url.pathname.match(/^\/attendance\/([^/]+)$/);
  if (attendanceMatch && req.method === "PUT") {
    void handleUpdateAttendance(req, res, attendanceMatch[1]);
    return;
  }

  if (attendanceMatch && req.method === "DELETE") {
    void handleDeleteAttendance(req, res, attendanceMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/events") {
    void handleListEvents(req, res);
    return;
  }

  const publicEventMatch = url.pathname.match(/^\/public\/events\/([^/]+)$/);
  if (publicEventMatch && req.method === "GET") {
    void handleGetPublicEvent(res, publicEventMatch[1]);
    return;
  }

  const publicRegistrationMatch = url.pathname.match(/^\/public\/events\/([^/]+)\/registrations$/);
  if (publicRegistrationMatch && req.method === "POST") {
    void handleCreatePublicRegistration(req, res, publicRegistrationMatch[1]);
    return;
  }

  if (req.method === "POST" && url.pathname === "/public/event-registrations/confirm") {
    void handleConfirmEventRegistration(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/public/event-registrations/checkin") {
    void handlePublicEventRegistrationCheckIn(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/event-registrations") {
    void handleListEventRegistrations(req, res);
    return;
  }

  const eventRegistrationResendMatch = url.pathname.match(/^\/event-registrations\/([^/]+)\/resend-confirmation$/);
  if (eventRegistrationResendMatch && req.method === "POST") {
    void handleResendEventRegistrationConfirmation(req, res, eventRegistrationResendMatch[1]);
    return;
  }

  const eventRegistrationMatch = url.pathname.match(/^\/event-registrations\/([^/]+)\/status$/);
  if (eventRegistrationMatch && req.method === "PATCH") {
    void handleUpdateEventRegistrationStatus(req, res, eventRegistrationMatch[1]);
    return;
  }

  const eventRegistrationCheckInMatch = url.pathname.match(/^\/event-registrations\/([^/]+)\/checkin$/);
  if (eventRegistrationCheckInMatch && req.method === "PATCH") {
    void handleCheckInEventRegistration(req, res, eventRegistrationCheckInMatch[1]);
    return;
  }

  if (req.method === "POST" && url.pathname === "/events") {
    void handleCreateEvent(req, res);
    return;
  }

  const eventGenerateMatch = url.pathname.match(/^\/events\/([^/]+)\/generate-occurrences$/);
  if (eventGenerateMatch && req.method === "POST") {
    void handleGenerateEventOccurrences(req, res, eventGenerateMatch[1]);
    return;
  }

  const eventMatch = url.pathname.match(/^\/events\/([^/]+)$/);
  if (eventMatch && req.method === "PUT") {
    void handleUpdateEvent(req, res, eventMatch[1]);
    return;
  }

  if (eventMatch && req.method === "DELETE") {
    void handleDeleteEvent(req, res, eventMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/resources") {
    void handleListResources(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/resources") {
    void handleCreateResource(req, res);
    return;
  }

  const resourceMatch = url.pathname.match(/^\/resources\/([^/]+)$/);
  if (resourceMatch && req.method === "PUT") {
    void handleUpdateResource(req, res, resourceMatch[1]);
    return;
  }

  if (resourceMatch && req.method === "DELETE") {
    void handleDeleteResource(req, res, resourceMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/room-reservations") {
    void handleListRoomReservations(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/room-reservations") {
    void handleCreateRoomReservation(req, res);
    return;
  }

  const roomReservationMatch = url.pathname.match(/^\/room-reservations\/([^/]+)$/);
  if (roomReservationMatch && req.method === "PUT") {
    void handleUpdateRoomReservation(req, res, roomReservationMatch[1]);
    return;
  }

  if (roomReservationMatch && req.method === "DELETE") {
    void handleDeleteRoomReservation(req, res, roomReservationMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/event-checkins") {
    void handleListEventCheckIns(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/event-checkins") {
    void handleCreateEventCheckIn(req, res);
    return;
  }

  const eventCheckInMatch = url.pathname.match(/^\/event-checkins\/([^/]+)$/);
  if (eventCheckInMatch && req.method === "DELETE") {
    void handleDeleteEventCheckIn(req, res, eventCheckInMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/child-checkins") {
    void handleListChildCheckIns(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/child-checkins") {
    void handleCreateChildCheckIn(req, res);
    return;
  }

  const childCheckOutMatch = url.pathname.match(/^\/child-checkins\/([^/]+)\/checkout$/);
  if (childCheckOutMatch && req.method === "PATCH") {
    void handleCheckOutChild(req, res, childCheckOutMatch[1]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/serving-plans") {
    void handleListServingPlans(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/serving-plans") {
    void handleCreateServingPlan(req, res);
    return;
  }

  const servingPlanMatch = url.pathname.match(/^\/serving-plans\/([^/]+)$/);
  if (servingPlanMatch && req.method === "PUT") {
    void handleUpdateServingPlan(req, res, servingPlanMatch[1]);
    return;
  }

  if (servingPlanMatch && req.method === "DELETE") {
    void handleDeleteServingPlan(req, res, servingPlanMatch[1]);
    return;
  }

  const servingAssignmentMatch = url.pathname.match(/^\/serving-plans\/([^/]+)\/assignments\/([^/]+)\/status$/);
  if (servingAssignmentMatch && req.method === "PATCH") {
    void handleUpdateServingAssignmentStatus(req, res, servingAssignmentMatch[1], servingAssignmentMatch[2]);
    return;
  }

  if (req.method === "GET" && url.pathname === "/serving-notifications") {
    void handleListServingNotifications(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/financial-transactions") {
    void handleListFinancialTransactions(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/financial-transactions") {
    void handleCreateFinancialTransaction(req, res);
    return;
  }

  const financialTransactionMatch = url.pathname.match(/^\/financial-transactions\/([^/]+)$/);
  if (financialTransactionMatch && req.method === "PUT") {
    void handleUpdateFinancialTransaction(req, res, financialTransactionMatch[1]);
    return;
  }

  if (financialTransactionMatch && req.method === "DELETE") {
    void handleDeleteFinancialTransaction(req, res, financialTransactionMatch[1]);
    return;
  }

  notFound(req, res);
});

const isMainModule = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMainModule) {
  const server = createEcclesiaServer();
  server.listen(port, () => {
    console.log(`EcclesiaOS API listening on http://localhost:${port}`);
  });
}
