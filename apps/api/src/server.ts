import "./env.js";
import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";
import { canAccessModule } from "@ecclesiaos/shared";
import type { AppModuleKey, AttendanceInput, AuthErrorResponse, AuthSession, ChildCheckIn, ChildCheckInInput, ChildCheckOutRequest, ChurchEventInput, ChurchProfileUpdate, ChurchResourceInput, CurrentUser, EventCheckInInput, EventRegistrationCheckInRequest, EventRegistrationInput, EventRegistrationStatusUpdate, FinancialTransactionInput, GroupInput, HealthResponse, LoginRequest, PersonInput, RegisterRequest, RoomReservationInput, ServingAssignmentStatusUpdate, ServingPlanInput, UserInput } from "@ecclesiaos/shared";
import { auditRepository } from "./data/auditRepository.js";
import { attendanceRepository } from "./data/attendanceRepository.js";
import { churchRepository } from "./data/churchRepository.js";
import { financialTransactionRepository } from "./data/financialTransactionRepository.js";
import { eventRepository } from "./data/eventRepository.js";
import { eventRegistrationRepository } from "./data/eventRegistrationRepository.js";
import { checkInRepository } from "./data/checkInRepository.js";
import { groupRepository } from "./data/groupRepository.js";
import { personRepository } from "./data/personRepository.js";
import { resourceRepository } from "./data/resourceRepository.js";
import { servingPlanRepository } from "./data/servingPlanRepository.js";
import { userRepository } from "./data/userRepository.js";

const port = Number(process.env.PORT || 4000);
const tokenSecret = process.env.AUTH_TOKEN_SECRET || "ecclesiaos-development-secret";

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
  const canManage = module === "checkin" ? user.role === "admin" || user.role === "leader" : user.role === "admin";
  if (!canManage) {
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
  memberPersonIds: Array.isArray(body.memberPersonIds) ? body.memberPersonIds.map(String) : []
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
  registrationEnabled: Boolean(body.registrationEnabled),
  registrationCapacity: Math.max(0, Number(body.registrationCapacity) || 0),
  registrationPrice: Math.max(0, Number(body.registrationPrice) || 0),
  registrationCurrency: String(body.registrationCurrency || "BRL").trim().toUpperCase() || "BRL",
  registrationSlug: String(body.registrationSlug || "").trim(),
  description: String(body.description || "").trim()
});

const sanitizeEventRegistrationInput = (body: EventRegistrationInput): EventRegistrationInput => ({
  name: String(body.name || "").trim(),
  email: String(body.email || "").trim().toLowerCase(),
  phone: String(body.phone || "").trim(),
  quantity: Math.max(1, Number(body.quantity) || 1),
  notes: String(body.notes || "").trim()
});

const sanitizeEventRegistrationStatusUpdate = (body: EventRegistrationStatusUpdate): EventRegistrationStatusUpdate => ({
  status: body.status === "cancelled" || body.status === "pending_payment" ? body.status : "confirmed"
});

const sanitizeEventRegistrationCheckInRequest = (body: EventRegistrationCheckInRequest): EventRegistrationCheckInRequest => ({
  ticketCode: String(body.ticketCode || "").trim()
});

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

  sendJson(res, 200, await eventRepository.list());
};

const handleGetPublicEvent = async (res: ServerResponse, slug: string) => {
  const event = await eventRegistrationRepository.findPublicEvent(slug);
  if (!event) {
    sendError(res, 404, "not_found", "Evento nao encontrado ou inscricoes fechadas.");
    return;
  }

  const registrations = await eventRegistrationRepository.list();
  const reservedQuantity = registrations
    .filter((registration) => registration.eventId === event.id && registration.status !== "cancelled")
    .reduce((sum, registration) => sum + registration.quantity, 0);

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

  const registration = await eventRegistrationRepository.create(event, sanitizeEventRegistrationInput(body));
  if (registration === "full") {
    sendError(res, 409, "conflict", "Limite de vagas atingido.");
    return;
  }

  sendJson(res, 201, registration);
};

const handleListEventRegistrations = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireModuleManage(req, res, "events");
  if (!user) return;

  sendJson(res, 200, await eventRegistrationRepository.list());
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
  if (!body?.title || !body?.date) {
    sendError(res, 400, "invalid_json", "Informe titulo e data do evento.");
    return;
  }

  const event = await eventRepository.create(sanitizeEventInput(body));
  await recordAudit(user, "create", "event", event.id, `Evento criado: ${event.title}`);
  sendJson(res, 201, event);
};

const handleUpdateEvent = async (req: IncomingMessage, res: ServerResponse, id: string) => {
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<ChurchEventInput>(req);
  if (!body?.title || !body?.date) {
    sendError(res, 400, "invalid_json", "Informe titulo e data do evento.");
    return;
  }

  const event = await eventRepository.update(id, sanitizeEventInput(body));
  if (!event) {
    sendError(res, 404, "not_found", "Evento nao encontrado.");
    return;
  }

  await recordAudit(user, "update", "event", event.id, `Evento atualizado: ${event.title}`);
  sendJson(res, 200, event);
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
  notes: String(body.notes || "").trim(),
  assignments: Array.isArray(body.assignments) ? body.assignments : []
});

const handleListServingPlans = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

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
  const user = await requireAdmin(req, res);
  if (!user) return;

  const body = await readJson<ServingPlanInput>(req);
  if (!body?.date || !body?.title) {
    sendError(res, 400, "invalid_json", "Informe data e titulo do plano.");
    return;
  }

  const plan = await servingPlanRepository.update(id, sanitizeServingPlanInput(body));
  if (!plan) {
    sendError(res, 404, "not_found", "Plano nao encontrado.");
    return;
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
  sendJson(res, 200, plan);
};

const handleListServingNotifications = async (req: IncomingMessage, res: ServerResponse) => {
  const user = await requireUser(req, res);
  if (!user) return;

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

  if (req.method === "POST" && url.pathname === "/auth/login") {
    void handleLogin(req, res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/auth/register") {
    void handleRegister(req, res);
    return;
  }

  if (req.method === "GET" && url.pathname === "/auth/me") {
    void handleMe(req, res);
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

  if (req.method === "GET" && url.pathname === "/event-registrations") {
    void handleListEventRegistrations(req, res);
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
