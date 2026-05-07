import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after, before } from "node:test";
import type { AuthSession, ChurchEvent, GroupProfile, ServingPlan } from "@ecclesiaos/shared";

const testDir = await mkdtemp(join(tmpdir(), "ecclesiaos-http-"));
process.env.ECCLESIAOS_DATA_FILE = join(testDir, "dev-db.json");
process.env.ECCLESIAOS_DATA_PROVIDER = "json";
process.env.AUTH_TOKEN_SECRET = "ecclesiaos-http-test-secret";
process.env.RESEND_API_KEY = "";
process.env.EMAIL_FROM = "";

const { createEcclesiaServer } = await import("./server.js");
const { passwordResetTokenRepository } = await import("./data/passwordResetTokenRepository.js");
const { eventRegistrationRepository } = await import("./data/eventRegistrationRepository.js");

let server: Server;
let baseUrl = "";
let adminSession: AuthSession;
let leaderSession: AuthSession;
let memberSession: AuthSession;

const requestJson = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) as T : null;
  return { body, response };
};

const authHeaders = (session: AuthSession) => ({ Authorization: `Bearer ${session.token}` });

const login = async (email: string, password: string) => {
  const { body, response } = await requestJson<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  assert.equal(response.status, 200);
  assert.ok(body?.token);
  return body;
};

before(async () => {
  await rm(process.env.ECCLESIAOS_DATA_FILE || "", { force: true });
  server = createEcclesiaServer();
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert.equal(typeof address, "object");
  assert.ok(address);
  baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
  adminSession = await login("admin@ecclesiaos.local", "admin123");
  leaderSession = await login("lider@ecclesiaos.local", "lider123");
  memberSession = await login("membro@ecclesiaos.local", "membro123");
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await rm(testDir, { force: true, recursive: true });
});

test("health and auth endpoints return expected public data", async () => {
  const health = await requestJson<{ app: string; status: string }>("/health");
  assert.equal(health.response.status, 200);
  assert.equal(health.body?.app, "EcclesiaOS");
  assert.equal(health.body?.status, "ok");

  const me = await requestJson<{ email: string; role: string; personId: string }>("/auth/me", {
    headers: authHeaders(adminSession)
  });
  assert.equal(me.response.status, 200);
  assert.equal(me.body?.email, "admin@ecclesiaos.local");
  assert.equal(me.body?.role, "admin");
  assert.equal(typeof me.body?.personId, "string");
});

test("public registration creates member user linked to a person", async () => {
  const registered = await requestJson<AuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      firstName: "Paula",
      lastName: "Responsavel",
      email: "paula.responsavel@example.com",
      phone: "555-2222",
      password: "paula123",
      status: "visitor"
    })
  });

  assert.equal(registered.response.status, 201);
  assert.equal(registered.body?.user.role, "member");
  assert.ok(registered.body?.user.personId);

  const people = await requestJson<Array<{ id: string; status: string; email: string }>>("/people", {
    headers: authHeaders(registered.body as AuthSession)
  });
  const person = people.body?.find((item) => item.id === registered.body?.user.personId);
  assert.equal(person?.status, "visitor");
  assert.equal(person?.email, "paula.responsavel@example.com");

  const duplicate = await requestJson<{ error: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      firstName: "Paula",
      lastName: "Outra",
      email: "paula.responsavel@example.com",
      phone: "",
      password: "paula123",
      status: "member"
    })
  });
  assert.equal(duplicate.response.status, 409);
});

test("public visitor registration creates a visitor person without user", async () => {
  const created = await requestJson<{ ok: true; message: string }>("/public/visitors", {
    method: "POST",
    body: JSON.stringify({
      firstName: "Joao",
      lastName: "Visitante",
      email: "joao.visitante@example.com",
      phone: "555-9999",
      notes: "Veio com a familia"
    })
  });

  assert.equal(created.response.status, 200);
  assert.equal(created.body?.ok, true);
  assert.equal(typeof created.body?.message, "string");

  const people = await requestJson<Array<{ firstName: string; lastName: string; status: string; email: string; notes: string }>>("/people", {
    headers: authHeaders(adminSession)
  });
  const person = people.body?.find((item) => item.email === "joao.visitante@example.com");
  assert.ok(person, "visitor person should be persisted");
  assert.equal(person?.status, "visitor");
  assert.equal(person?.firstName, "Joao");
  assert.ok(person?.notes.startsWith("Visitante via QR"));

  const missing = await requestJson<{ error: string }>("/public/visitors", {
    method: "POST",
    body: JSON.stringify({ firstName: "", lastName: "", email: "", phone: "", notes: "" })
  });
  assert.equal(missing.response.status, 400);
});

test("authenticated list endpoints reject missing token and accept member token", async () => {
  const protectedPaths = ["/people", "/groups", "/attendance", "/events", "/resources", "/room-reservations", "/serving-plans", "/songs", "/worship-sets", "/service-checklists"];

  for (const path of protectedPaths) {
    const anonymous = await requestJson<{ error: string }>(path);
    assert.equal(anonymous.response.status, 401, path);
    assert.equal(anonymous.body?.error, "unauthorized");

    const member = await requestJson<unknown[]>(path, {
      headers: authHeaders(memberSession)
    });
    assert.equal(member.response.status, 200, path);
    assert.equal(Array.isArray(member.body), true, path);
  }
});

test("leaders can manage songs and worship sets while members only read", async () => {
  const memberCreate = await requestJson<{ error: string }>("/songs", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ title: "Musica bloqueada" })
  });
  assert.equal(memberCreate.response.status, 403);

  const song = await requestJson<{ id: string; title: string; defaultKey: string }>("/songs", {
    method: "POST",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({
      title: "Grande Amor",
      artist: "Ministerio Local",
      defaultKey: "G",
      bpm: 72,
      theme: "Adoracao",
      lyrics: "",
      chords: "G C Em D",
      notes: "Entrada suave"
    })
  });
  assert.equal(song.response.status, 201);
  assert.ok(song.body?.id);
  assert.equal(song.body?.defaultKey, "G");

  const set = await requestJson<{ id: string; items: Array<{ songId: string; order: number }> }>("/worship-sets", {
    method: "POST",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({
      eventId: "",
      title: "Repertorio Domingo",
      date: "2026-05-10",
      notes: "Culto da manha",
      items: [{ songId: song.body?.id, key: "A", notes: "Subir tom", order: 1 }]
    })
  });
  assert.equal(set.response.status, 201);
  assert.equal(set.body?.items.length, 1);
  assert.equal(set.body?.items[0]?.order, 1);

  const memberList = await requestJson<Array<{ title: string }>>("/songs", {
    headers: authHeaders(memberSession)
  });
  assert.equal(memberList.response.status, 200);
  assert.equal(memberList.body?.some((item) => item.title === "Grande Amor"), true);
});

test("leaders can manage service liturgy checklists while members only read", async () => {
  const forbidden = await requestJson<{ error: string }>("/service-checklists", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ title: "Liturgia bloqueada" })
  });
  assert.equal(forbidden.response.status, 403);

  const checklist = await requestJson<{ id: string; items: Array<{ title: string; completed: boolean; order: number }> }>("/service-checklists", {
    method: "POST",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({
      eventId: "",
      title: "Culto Domingo",
      date: "2026-05-10",
      notes: "Liturgia da manha",
      items: [
        { id: "", title: "Boas-vindas", responsiblePersonId: "", scheduledTime: "10:00", notes: "", completed: false, order: 1 },
        { id: "", title: "Louvor", responsiblePersonId: "", scheduledTime: "10:10", notes: "", completed: true, order: 2 }
      ]
    })
  });
  assert.equal(checklist.response.status, 201);
  assert.equal(checklist.body?.items.length, 2);
  assert.equal(checklist.body?.items[1]?.completed, true);

  const memberList = await requestJson<Array<{ title: string }>>("/service-checklists", {
    headers: authHeaders(memberSession)
  });
  assert.equal(memberList.response.status, 200);
  assert.equal(memberList.body?.some((item) => item.title === "Culto Domingo"), true);
});

test("leaders can manage custom forms and public users can submit responses", async () => {
  const forbidden = await requestJson<{ error: string }>("/forms", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ title: "Formulario bloqueado" })
  });
  assert.equal(forbidden.response.status, 403);

  const form = await requestJson<{ id: string; slug: string; fields: Array<{ id: string; label: string }> }>("/forms", {
    method: "POST",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({
      title: "Pedido de Oracao",
      description: "Conte seu pedido",
      slug: "pedido-oracao",
      responsiblePersonIds: [leaderSession.user.personId],
      isActive: true,
      fields: [
        { id: "", label: "Nome", type: "text", required: true, options: [], order: 1 },
        { id: "", label: "Pedido", type: "textarea", required: true, options: [], order: 2 }
      ]
    })
  });
  assert.equal(form.response.status, 201);
  assert.equal(form.body?.slug, "pedido-oracao");

  const publicForm = await requestJson<{ title: string }>("/public/forms/pedido-oracao");
  assert.equal(publicForm.response.status, 200);
  assert.equal(publicForm.body?.title, "Pedido de Oracao");

  const firstFieldId = form.body?.fields[0]?.id || "";
  const secondFieldId = form.body?.fields[1]?.id || "";
  const response = await requestJson<{ id: string; formId: string }>("/public/forms/pedido-oracao", {
    method: "POST",
    body: JSON.stringify({ answers: { [firstFieldId]: "Maria", [secondFieldId]: "Oracao pela familia" } })
  });
  assert.equal(response.response.status, 201);
  assert.equal(response.body?.formId, form.body?.id);

  const responses = await requestJson<Array<{ formId: string }>>(`/forms/${form.body?.id}/responses`, {
    headers: authHeaders(leaderSession)
  });
  assert.equal(responses.response.status, 200);
  assert.equal(responses.body?.length, 1);
});

test("admin can create events while member cannot", async () => {
  const input = {
    title: "Reuniao de planejamento",
    type: "meeting",
    date: "2026-05-20",
    startTime: "19:00",
    endTime: "20:00",
    location: "Sala 1",
    groupId: "",
    description: "Planejamento mensal"
  };

  const forbidden = await requestJson<{ error: string }>("/events", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify(input)
  });
  assert.equal(forbidden.response.status, 403);

  const created = await requestJson<{ id: string; title: string }>("/events", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify(input)
  });
  assert.equal(created.response.status, 201);
  assert.ok(created.body?.id);
  assert.equal(created.body?.title, "Reuniao de planejamento");

  const audit = await requestJson<Array<{ entityType: string; action: string }>>("/audit-logs", {
    headers: authHeaders(adminSession)
  });
  assert.equal(audit.body?.some((log) => log.entityType === "event" && log.action === "create"), true);
});

test("public event registration respects capacity and payment status", async () => {
  const event = await requestJson<{ registrationSlug: string }>("/events", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      title: "Retiro Especial",
      type: "other",
      date: "2026-06-10",
      startTime: "09:00",
      endTime: "17:00",
      location: "Chacara",
      groupId: "",
      recurrence: "none",
      recurrenceUntil: "",
      recurrenceRule: "",
      registrationEnabled: true,
      registrationCapacity: 2,
      registrationPrice: 50,
      registrationCurrency: "BRL",
      registrationSlug: "retiro-especial",
      description: "Evento pago manual"
    })
  });
  assert.equal(event.response.status, 201);
  assert.equal(event.body?.registrationSlug, "retiro-especial");

  const publicEvent = await requestJson<{ availableQuantity: number }>("/public/events/retiro-especial");
  assert.equal(publicEvent.response.status, 200);
  assert.equal(publicEvent.body?.availableQuantity, 2);

  const registration = await requestJson<{ id: string; status: string; amountDue: number; ticketCode: string }>("/public/events/retiro-especial/registrations", {
    method: "POST",
    body: JSON.stringify({ name: "Visitante", email: "visitante@example.com", phone: "555", quantity: 2, notes: "" })
  });
  assert.equal(registration.response.status, 201);
  assert.equal(registration.body?.status, "pending_payment");
  assert.equal(registration.body?.amountDue, 100);
  assert.ok(registration.body?.ticketCode);

  const paid = await requestJson<{ status: string }>("/event-registrations/" + registration.body?.id + "/status", {
    method: "PATCH",
    headers: authHeaders(adminSession),
    body: JSON.stringify({ status: "confirmed" })
  });
  assert.equal(paid.response.status, 200);
  assert.equal(paid.body?.status, "confirmed");

  const checkIn = await requestJson<{ checkedInAt: string; checkedInByUserId: string }>("/event-registrations/" + registration.body?.id + "/checkin", {
    method: "PATCH",
    headers: authHeaders(adminSession),
    body: JSON.stringify({ ticketCode: registration.body?.ticketCode })
  });
  assert.equal(checkIn.response.status, 200);
  assert.ok(checkIn.body?.checkedInAt);
  assert.equal(checkIn.body?.checkedInByUserId, "usr_admin");

  const full = await requestJson<{ error: string }>("/public/events/retiro-especial/registrations", {
    method: "POST",
    body: JSON.stringify({ name: "Outro", email: "outro@example.com", phone: "", quantity: 1, notes: "" })
  });
  assert.equal(full.response.status, 409);
  assert.equal(full.body?.error, "conflict");
});

test("admin can renew pending event registration email confirmation", async () => {
  const event = await requestJson<ChurchEvent>("/events", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      title: "Workshop Confirmacao",
      type: "class",
      date: "2026-06-18",
      startTime: "19:00",
      endTime: "21:00",
      location: "Sala 2",
      groupId: "",
      recurrence: "none",
      recurrenceUntil: "",
      recurrenceRule: "",
      registrationEnabled: true,
      registrationCapacity: 10,
      registrationPrice: 0,
      registrationCurrency: "BRL",
      registrationSlug: "workshop-confirmacao",
      registrationRequiresEmailConfirmation: true,
      description: "Evento com confirmacao manual"
    })
  });
  assert.equal(event.response.status, 201);
  assert.ok(event.body);

  const created = await eventRegistrationRepository.create(event.body, {
    name: "Pessoa Pendente",
    email: "pendente@example.com",
    phone: "",
    quantity: 1,
    notes: ""
  }, { emailConfirmationRequired: true });
  assert.notEqual(created, "full");
  if (created === "full") return;

  const firstExpiresAt = created.registration.emailConfirmationExpiresAt;
  const renewed = await requestJson<{ ok: boolean; emailSent: boolean; expiresAt: string; status: string }>(`/event-registrations/${created.registration.id}/resend-confirmation`, {
    method: "POST",
    headers: authHeaders(adminSession)
  });

  assert.equal(renewed.response.status, 200);
  assert.equal(renewed.body?.ok, true);
  assert.equal(renewed.body?.status, "pending_email_confirmation");
  assert.equal(renewed.body?.emailSent, false);
  assert.notEqual(renewed.body?.expiresAt, firstExpiresAt);
});

test("public self-service event check-in validates ticket payload and event slug", async () => {
  const event = await requestJson<ChurchEvent>("/events", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      title: "Encontro Self Service",
      type: "other",
      date: "2026-06-22",
      startTime: "10:00",
      endTime: "12:00",
      location: "Auditorio",
      groupId: "",
      recurrence: "none",
      recurrenceUntil: "",
      recurrenceRule: "",
      registrationEnabled: true,
      registrationCapacity: 20,
      registrationPrice: 0,
      registrationCurrency: "BRL",
      registrationSlug: "encontro-self-service",
      registrationRequiresEmailConfirmation: false,
      description: "Evento com check-in publico"
    })
  });
  assert.equal(event.response.status, 201);

  const registration = await requestJson<{ id: string; status: string; ticketCode: string; checkedInByUserId: string }>("/public/events/encontro-self-service/registrations", {
    method: "POST",
    body: JSON.stringify({ name: "Participante Self", email: "self@example.com", phone: "", quantity: 1, notes: "" })
  });
  assert.equal(registration.response.status, 201);
  assert.equal(registration.body?.status, "confirmed");

  const payload = `ecclesiaos-event-ticket:${registration.body?.id}:${registration.body?.ticketCode}`;
  const checkedIn = await requestJson<{ checkedInAt: string; checkedInByUserId: string }>("/public/event-registrations/checkin", {
    method: "POST",
    body: JSON.stringify({ ticketPayload: payload, eventSlug: "encontro-self-service" })
  });

  assert.equal(checkedIn.response.status, 200);
  assert.ok(checkedIn.body?.checkedInAt);
  assert.equal(checkedIn.body?.checkedInByUserId, "self_service");

  const wrongEvent = await requestJson<{ error: string }>("/events", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      title: "Outro Self Service",
      type: "other",
      date: "2026-06-23",
      startTime: "10:00",
      endTime: "12:00",
      location: "Auditorio",
      groupId: "",
      recurrence: "none",
      recurrenceUntil: "",
      recurrenceRule: "",
      registrationEnabled: true,
      registrationCapacity: 20,
      registrationPrice: 0,
      registrationCurrency: "BRL",
      registrationSlug: "outro-self-service",
      registrationRequiresEmailConfirmation: false,
      description: ""
    })
  });
  assert.equal(wrongEvent.response.status, 201);

  const rejected = await requestJson<{ error: string }>("/public/event-registrations/checkin", {
    method: "POST",
    body: JSON.stringify({ ticketPayload: payload, eventSlug: "outro-self-service" })
  });
  assert.equal(rejected.response.status, 403);
});

test("leaders can register event and children check-ins", async () => {
  const eventCheckIn = await requestJson<{ eventId: string; personId: string }>("/event-checkins", {
    method: "POST",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({ eventId: "evt_001", personId: "per_001", notes: "Entrada" })
  });
  assert.equal(eventCheckIn.response.status, 201);
  assert.equal(eventCheckIn.body?.eventId, "evt_001");
  assert.equal(eventCheckIn.body?.personId, "per_001");

  const groupEventCheckIn = await requestJson<{ eventId: string; personId: string }>("/event-checkins", {
    method: "POST",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({ eventId: "evt_002", personId: "per_002", notes: "Entrada grupo" })
  });
  assert.equal(groupEventCheckIn.response.status, 201);

  const attendance = await requestJson<Array<{ eventId: string; presentPersonIds: string[] }>>("/attendance", {
    headers: authHeaders(leaderSession)
  });
  const consolidated = attendance.body?.find((record) => record.eventId === "evt_002");
  assert.equal(consolidated?.presentPersonIds.includes("per_002"), true);

  const childCheckIn = await requestJson<{ id: string; childName: string; securityCode: string; guardianPersonId: string }>("/child-checkins", {
    method: "POST",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({ eventId: "evt_001", childPersonId: "", childName: "Crianca Teste", guardianPersonId: "per_001", guardianName: "Responsavel", guardianPhone: "555-0100", notes: "" })
  });
  assert.equal(childCheckIn.response.status, 201);
  assert.equal(childCheckIn.body?.childName, "Crianca Teste");
  assert.equal(childCheckIn.body?.guardianPersonId, "per_001");
  assert.equal(typeof childCheckIn.body?.securityCode, "string");

  const childCheckout = await requestJson<{ checkedOutAt: string; checkedOutByPersonId: string }>("/child-checkins/" + childCheckIn.body?.id + "/checkout", {
    method: "PATCH",
    headers: authHeaders(leaderSession)
  });
  assert.equal(childCheckout.response.status, 200);
  assert.ok(childCheckout.body?.checkedOutAt);
  assert.equal(childCheckout.body?.checkedOutByPersonId, "per_002");

  const memberForbidden = await requestJson<{ error: string }>("/event-checkins", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ eventId: "evt_001", personId: "per_002", notes: "" })
  });
  assert.equal(memberForbidden.response.status, 403);
});

test("linked guardians can check out their children with security code", async () => {
  const childCheckIn = await requestJson<{ id: string; childName: string; securityCode: string; guardianPersonId: string }>("/child-checkins", {
    method: "POST",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({ eventId: "evt_001", childPersonId: "", childName: "Filho Da Ana", guardianPersonId: "per_001", guardianName: "Ana Silva", guardianPhone: "555-0100", notes: "" })
  });
  assert.equal(childCheckIn.response.status, 201);
  assert.equal(childCheckIn.body?.guardianPersonId, "per_001");

  const memberList = await requestJson<Array<{ id: string; childName: string }>>("/child-checkins", {
    headers: authHeaders(memberSession)
  });
  assert.equal(memberList.response.status, 200);
  assert.equal(memberList.body?.some((item) => item.id === childCheckIn.body?.id), true);

  const wrongCode = await requestJson<{ error: string }>("/child-checkins/" + childCheckIn.body?.id + "/checkout", {
    method: "PATCH",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ securityCode: "000000" })
  });
  assert.equal(wrongCode.response.status, 403);

  const childCheckout = await requestJson<{ checkedOutAt: string; checkedOutByPersonId: string }>("/child-checkins/" + childCheckIn.body?.id + "/checkout", {
    method: "PATCH",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ securityCode: childCheckIn.body?.securityCode })
  });
  assert.equal(childCheckout.response.status, 200);
  assert.ok(childCheckout.body?.checkedOutAt);
  assert.equal(childCheckout.body?.checkedOutByPersonId, "per_001");

  const otherChild = await requestJson<{ id: string; securityCode: string }>("/child-checkins", {
    method: "POST",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({ eventId: "evt_001", childPersonId: "", childName: "Filho Do Lider", guardianPersonId: "per_002", guardianName: "Carlos Oliveira", guardianPhone: "555-0200", notes: "" })
  });
  assert.equal(otherChild.response.status, 201);

  const forbidden = await requestJson<{ error: string }>("/child-checkins/" + otherChild.body?.id + "/checkout", {
    method: "PATCH",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ securityCode: otherChild.body?.securityCode })
  });
  assert.equal(forbidden.response.status, 403);
});

test("admin can manage room reservations and conflicts are rejected", async () => {
  const memberCreate = await requestJson<{ error: string }>("/room-reservations", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({
      resourceId: "res_children_room",
      eventId: "",
      title: "Uso por membro",
      date: "2026-05-07",
      startTime: "19:00",
      endTime: "20:00",
      reservedBy: "Membro",
      status: "confirmed",
      notes: ""
    })
  });
  assert.equal(memberCreate.response.status, 403);

  const created = await requestJson<{ id: string; resourceId: string }>("/room-reservations", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      resourceId: "res_children_room",
      eventId: "",
      title: "Treinamento infantil",
      date: "2026-05-07",
      startTime: "19:00",
      endTime: "20:00",
      reservedBy: "Coordenacao",
      status: "confirmed",
      notes: ""
    })
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body?.resourceId, "res_children_room");

  const conflict = await requestJson<{ error: string }>("/room-reservations", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      resourceId: "res_children_room",
      eventId: "",
      title: "Conflito",
      date: "2026-05-07",
      startTime: "19:30",
      endTime: "20:30",
      reservedBy: "Outra equipe",
      status: "confirmed",
      notes: ""
    })
  });
  assert.equal(conflict.response.status, 409);
  assert.equal(conflict.body?.error, "conflict");
});

test("financial list endpoint is restricted to admin", async () => {
  const anonymous = await requestJson<{ error: string }>("/financial-transactions");
  assert.equal(anonymous.response.status, 401);
  assert.equal(anonymous.body?.error, "unauthorized");

  const forbidden = await requestJson<{ error: string }>("/financial-transactions", {
    headers: authHeaders(memberSession)
  });
  assert.equal(forbidden.response.status, 403);
  assert.equal(forbidden.body?.error, "forbidden");

  const admin = await requestJson<unknown[]>("/financial-transactions", {
    headers: authHeaders(adminSession)
  });
  assert.equal(admin.response.status, 200);
  assert.equal(Array.isArray(admin.body), true);
});

test("admin can manage users while member cannot", async () => {
  const memberList = await requestJson<{ error: string }>("/users", {
    headers: authHeaders(memberSession)
  });
  assert.equal(memberList.response.status, 403);

  const adminList = await requestJson<unknown[]>("/users", {
    headers: authHeaders(adminSession)
  });
  assert.equal(adminList.response.status, 200);
  assert.equal(adminList.body?.length, 4);
  assert.equal("password" in (adminList.body?.[0] as Record<string, unknown>), false);

  const input = {
    name: "Usuario Teste",
    email: "usuario.teste@example.com",
    password: "teste123",
    role: "member",
    personId: ""
  };

  const created = await requestJson<{ id: string; email: string; role: string; personId: string }>("/users", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify(input)
  });
  assert.equal(created.response.status, 201);
  assert.ok(created.body?.id);
  assert.equal(created.body?.email, "usuario.teste@example.com");
  assert.ok(created.body?.personId);

  const memberAudit = await requestJson<{ error: string }>("/audit-logs", {
    headers: authHeaders(memberSession)
  });
  assert.equal(memberAudit.response.status, 403);

  const adminAudit = await requestJson<Array<{ entityType: string; action: string }>>("/audit-logs", {
    headers: authHeaders(adminSession)
  });
  assert.equal(adminAudit.response.status, 200);
  assert.equal(adminAudit.body?.some((log) => log.entityType === "user" && log.action === "create"), true);

  const loginCreated = await requestJson<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: input.email, password: input.password })
  });
  assert.equal(loginCreated.response.status, 200);
  assert.equal(loginCreated.body?.user.role, "member");

  const updated = await requestJson<{ role: string }>("/users/" + created.body?.id, {
    method: "PUT",
    headers: authHeaders(adminSession),
    body: JSON.stringify({ ...input, password: "", role: "leader" })
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body?.role, "leader");

  const removed = await requestJson<{ ok: boolean }>("/users/" + created.body?.id, {
    method: "DELETE",
    headers: authHeaders(adminSession)
  });
  assert.equal(removed.response.status, 200);
  assert.equal(removed.body?.ok, true);
});

test("admin can create people while member cannot", async () => {
  const input = {
    firstName: "Joao",
    lastName: "Teste",
    email: "joao@example.com",
    phone: "",
    birthDate: "",
    status: "member",
    notes: ""
  };

  const forbidden = await requestJson<{ error: string }>("/people", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify(input)
  });
  assert.equal(forbidden.response.status, 403);
  assert.equal(forbidden.body?.error, "forbidden");

  const created = await requestJson<{ id: string; firstName: string }>("/people", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify(input)
  });
  assert.equal(created.response.status, 201);
  assert.ok(created.body?.id);
  assert.equal(created.body?.firstName, "Joao");
});

test("admin can create finance records while member cannot", async () => {
  const input = {
    date: "2026-05-10",
    type: "income",
    amount: 300,
    fund: "Geral",
    category: "Oferta",
    paymentMethod: "cash",
    personId: "",
    description: "Teste HTTP"
  };

  const forbidden = await requestJson<{ error: string }>("/financial-transactions", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify(input)
  });
  assert.equal(forbidden.response.status, 403);

  const created = await requestJson<{ amount: number; category: string }>("/financial-transactions", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify(input)
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body?.amount, 300);
  assert.equal(created.body?.category, "Oferta");
});

test("requested teams sync serving plans and leader can only schedule members of own team", async () => {
  const team = await requestJson<GroupProfile>("/groups", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      name: "Time de Recepcao",
      type: "team",
      description: "Equipe de recepcao",
      leaderPersonId: leaderSession.user.personId,
      memberPersonIds: [leaderSession.user.personId, memberSession.user.personId]
    })
  });
  assert.equal(team.response.status, 201);
  const teamId = team.body!.id;

  const event = await requestJson<ChurchEvent>("/events", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      title: "Culto teste escala",
      type: "service",
      date: "2026-08-01",
      startTime: "10:00",
      endTime: "11:30",
      location: "",
      groupId: "",
      recurrence: "none",
      recurrenceUntil: "",
      recurrenceRule: "",
      parentEventId: "",
      requestedTeamIds: [teamId],
      registrationEnabled: false,
      registrationCapacity: 0,
      registrationPrice: 0,
      registrationCurrency: "BRL",
      registrationSlug: "",
      description: ""
    })
  });
  assert.equal(event.response.status, 201);
  const eventId = event.body!.id;

  const filteredPlans = await requestJson<ServingPlan[]>(`/serving-plans?groupId=${teamId}`, {
    headers: authHeaders(leaderSession)
  });
  assert.equal(filteredPlans.response.status, 200);
  const plan = filteredPlans.body?.find((item) => item.eventId === eventId);
  assert.ok(plan, "plan was created for the requested team");

  const updateOk = await requestJson<ServingPlan>(`/serving-plans/${plan!.id}`, {
    method: "PUT",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({
      date: plan!.date,
      title: plan!.title,
      groupId: plan!.groupId,
      eventId: plan!.eventId,
      notes: "Escalado pelo lider",
      assignments: [
        { id: "", personId: memberSession.user.personId, role: "Recepcao", status: "pending", notes: "" }
      ]
    })
  });
  assert.equal(updateOk.response.status, 200);
  assert.equal(updateOk.body?.assignments.length, 1);

  const updateForbidden = await requestJson<{ error: string }>(`/serving-plans/${plan!.id}`, {
    method: "PUT",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({
      date: plan!.date,
      title: plan!.title,
      groupId: plan!.groupId,
      eventId: plan!.eventId,
      notes: "",
      assignments: [
        { id: "", personId: adminSession.user.personId, role: "Outro", status: "pending", notes: "" }
      ]
    })
  });
  assert.equal(updateForbidden.response.status, 403);

  const removed = await requestJson<{ ok: boolean }>(`/events/${eventId}`, {
    method: "DELETE",
    headers: authHeaders(adminSession)
  });
  assert.equal(removed.response.status, 200);

  const remainingPlans = await requestJson<ServingPlan[]>(`/serving-plans?groupId=${teamId}`, {
    headers: authHeaders(adminSession)
  });
  assert.equal(remainingPlans.body?.find((item) => item.eventId === eventId), undefined);
});

test("person can manage own block-outs and admin can manage anyone", async () => {
  const memberPerson = memberSession.user.personId;
  const adminPerson = adminSession.user.personId;

  const cannotCreateForOther = await requestJson<{ error: string }>("/block-outs", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ personId: adminPerson, startDate: "2026-12-25", endDate: "2026-12-25", reason: "viagem" })
  });
  assert.equal(cannotCreateForOther.response.status, 403);

  const ownBlock = await requestJson<{ id: string }>("/block-outs", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ personId: memberPerson, startDate: "2026-12-20", endDate: "2026-12-22", reason: "viagem" })
  });
  assert.equal(ownBlock.response.status, 201);

  const adminBlock = await requestJson<{ id: string }>("/block-outs", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({ personId: adminPerson, startDate: "2026-12-25", endDate: "2026-12-25", reason: "natal" })
  });
  assert.equal(adminBlock.response.status, 201);

  const filtered = await requestJson<unknown[]>(`/block-outs?personId=${memberPerson}`, {
    headers: authHeaders(memberSession)
  });
  assert.equal(filtered.response.status, 200);
  assert.ok(Array.isArray(filtered.body));
  assert.ok((filtered.body as Array<{ personId: string }>).every((item) => item.personId === memberPerson));

  const cannotDeleteOther = await requestJson<{ error: string }>(`/block-outs/${adminBlock.body!.id}`, {
    method: "DELETE",
    headers: authHeaders(memberSession)
  });
  assert.equal(cannotDeleteOther.response.status, 403);

  const ownDelete = await requestJson<{ ok: boolean }>(`/block-outs/${ownBlock.body!.id}`, {
    method: "DELETE",
    headers: authHeaders(memberSession)
  });
  assert.equal(ownDelete.response.status, 200);

  const invalid = await requestJson<{ error: string }>("/block-outs", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({ personId: adminPerson, startDate: "2026-12-25", endDate: "2026-12-20", reason: "fim antes" })
  });
  assert.equal(invalid.response.status, 400);
});

test("declined serving assignment returns automatic substitute suggestions", async () => {
  const availablePerson = await requestJson<{ id: string }>("/people", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      firstName: "Substituto",
      lastName: "Disponivel",
      email: "substituto.disponivel@example.com",
      phone: "",
      birthDate: "",
      status: "member",
      guardianPersonIds: [],
      notes: ""
    })
  });
  assert.equal(availablePerson.response.status, 201);

  const blockedPerson = await requestJson<{ id: string }>("/people", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      firstName: "Substituto",
      lastName: "Bloqueado",
      email: "substituto.bloqueado@example.com",
      phone: "",
      birthDate: "",
      status: "member",
      guardianPersonIds: [],
      notes: ""
    })
  });
  assert.equal(blockedPerson.response.status, 201);

  const team = await requestJson<GroupProfile>("/groups", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      name: "Equipe Substituicao Automatica",
      type: "team",
      description: "",
      leaderPersonId: leaderSession.user.personId,
      memberPersonIds: [
        memberSession.user.personId,
        availablePerson.body!.id,
        blockedPerson.body!.id
      ]
    })
  });
  assert.equal(team.response.status, 201);

  const block = await requestJson<{ id: string }>("/block-outs", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      personId: blockedPerson.body!.id,
      startDate: "2027-02-01",
      endDate: "2027-02-01",
      reason: "Indisponivel"
    })
  });
  assert.equal(block.response.status, 201);

  const plan = await requestJson<ServingPlan>("/serving-plans", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      date: "2027-02-01",
      title: "Culto com substituto automatico",
      groupId: team.body!.id,
      eventId: "",
      notes: "",
      assignments: [
        { id: "", personId: memberSession.user.personId, role: "Recepcao", status: "pending", notes: "", reminderSentAt: "" }
      ]
    })
  });
  assert.equal(plan.response.status, 201);
  const assignmentId = plan.body!.assignments[0].id;

  const declined = await requestJson<ServingPlan & { substituteSuggestions: Array<{ personId: string; name: string }>; substituteEmailSent: boolean }>(`/serving-plans/${plan.body!.id}/assignments/${assignmentId}/status`, {
    method: "PATCH",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ status: "declined", notes: "Nao consigo servir" })
  });

  assert.equal(declined.response.status, 200);
  assert.equal(declined.body?.assignments.find((assignment) => assignment.id === assignmentId)?.status, "declined");
  assert.equal(declined.body?.substituteEmailSent, false);
  assert.equal(declined.body?.substituteSuggestions.some((item) => item.personId === availablePerson.body!.id), true);
  assert.equal(declined.body?.substituteSuggestions.some((item) => item.personId === blockedPerson.body!.id), false);
});

test("admin and leader can send people messages while member can only read", async () => {
  const memberPerson = memberSession.user.personId;
  const adminPerson = adminSession.user.personId;

  const memberCannotSend = await requestJson<{ error: string }>("/people-messages", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({
      subject: "Aviso",
      body: "Bom dia",
      channel: "manual",
      recipientPersonIds: [adminPerson]
    })
  });
  assert.equal(memberCannotSend.response.status, 403);

  const leaderSend = await requestJson<{ message: { recipientPersonIds: string[] } }>("/people-messages", {
    method: "POST",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({
      subject: "Convite ensaio",
      body: "Hoje as 19h",
      channel: "whatsapp",
      recipientPersonIds: [memberPerson]
    })
  });
  assert.equal(leaderSend.response.status, 201);
  assert.equal(leaderSend.body?.message.recipientPersonIds.length, 1);

  const adminSend = await requestJson<{ message: { id: string }; delivery: { reason?: string } }>("/people-messages", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({
      subject: "Reuniao mensal",
      body: "Domingo",
      channel: "email",
      recipientPersonIds: [memberPerson, adminPerson]
    })
  });
  assert.equal(adminSend.response.status, 201);
  assert.equal(adminSend.body?.delivery.reason, "not_configured");

  const emailStatus = await requestJson<{ configured: boolean }>("/system/email-status");
  assert.equal(emailStatus.response.status, 200);
  assert.equal(emailStatus.body?.configured, false);

  const memberCanRead = await requestJson<unknown[]>("/people-messages", {
    headers: authHeaders(memberSession)
  });
  assert.equal(memberCanRead.response.status, 200);
  assert.ok(Array.isArray(memberCanRead.body));
  assert.ok((memberCanRead.body || []).length >= 2);

  const noRecipients = await requestJson<{ error: string }>("/people-messages", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({ subject: "Vazio", body: "", channel: "manual", recipientPersonIds: [] })
  });
  assert.equal(noRecipients.response.status, 400);
});

test("public event registration confirmation rejects invalid tokens", async () => {
  const invalid = await requestJson<{ error: string }>("/public/event-registrations/confirm", {
    method: "POST",
    body: JSON.stringify({ token: "" })
  });
  assert.equal(invalid.response.status, 400);

  const garbage = await requestJson<{ error: string }>("/public/event-registrations/confirm", {
    method: "POST",
    body: JSON.stringify({ token: "naoexiste" })
  });
  assert.equal(garbage.response.status, 400);
});

test("admin and leader manage message templates while member only reads", async () => {
  const memberCannotCreate = await requestJson<{ error: string }>("/message-templates", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ name: "Boas-vindas", channel: "email", subject: "Ola {{firstName}}", body: "Bem-vindo a {{churchName}}!" })
  });
  assert.equal(memberCannotCreate.response.status, 403);

  const created = await requestJson<{ id: string; name: string; channel: string }>("/message-templates", {
    method: "POST",
    headers: authHeaders(adminSession),
    body: JSON.stringify({ name: "Boas-vindas", channel: "email", subject: "Ola {{firstName}}", body: "Bem-vindo a {{churchName}}!" })
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body?.name, "Boas-vindas");
  assert.equal(created.body?.channel, "email");

  const leaderUpdate = await requestJson<{ id: string; name: string }>(`/message-templates/${created.body?.id}`, {
    method: "PUT",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({ name: "Boas-vindas v2", channel: "whatsapp", subject: "Oi {{firstName}}", body: "{{churchName}} convida {{fullName}}." })
  });
  assert.equal(leaderUpdate.response.status, 200);
  assert.equal(leaderUpdate.body?.name, "Boas-vindas v2");

  const list = await requestJson<Array<{ id: string; name: string }>>("/message-templates", {
    headers: authHeaders(memberSession)
  });
  assert.equal(list.response.status, 200);
  assert.ok((list.body || []).some((template) => template.id === created.body?.id));

  const memberCannotDelete = await requestJson<{ error: string }>(`/message-templates/${created.body?.id}`, {
    method: "DELETE",
    headers: authHeaders(memberSession)
  });
  assert.equal(memberCannotDelete.response.status, 403);

  const removed = await requestJson<{ ok: boolean }>(`/message-templates/${created.body?.id}`, {
    method: "DELETE",
    headers: authHeaders(adminSession)
  });
  assert.equal(removed.response.status, 200);

  const missing = await requestJson<{ error: string }>(`/message-templates/${created.body?.id}`, {
    method: "PUT",
    headers: authHeaders(adminSession),
    body: JSON.stringify({ name: "X", channel: "manual", subject: "", body: "" })
  });
  assert.equal(missing.response.status, 404);
});

test("forgot password flow returns generic responses and resets via valid token", async () => {
  const unknown = await requestJson<{ ok: boolean; message: string }>("/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email: "ninguem@example.com" })
  });
  assert.equal(unknown.response.status, 200);
  assert.equal(unknown.body?.ok, true);

  const known = await requestJson<{ ok: boolean; message: string }>("/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email: "membro@ecclesiaos.local" })
  });
  assert.equal(known.response.status, 200);
  assert.equal(known.body?.message, unknown.body?.message);

  const invalid = await requestJson<{ error: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: "nao-existe", newPassword: "nova-senha-1" })
  });
  assert.equal(invalid.response.status, 400);

  const tooShort = await requestJson<{ error: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: "qualquer", newPassword: "abc" })
  });
  assert.equal(tooShort.response.status, 400);

  const issued = await passwordResetTokenRepository.create(memberSession.user.id);

  const reset = await requestJson<{ ok: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: issued.token, newPassword: "novaSenhaForte1" })
  });
  assert.equal(reset.response.status, 200);

  const reloggedAfterReset = await login("membro@ecclesiaos.local", "novaSenhaForte1");
  memberSession = reloggedAfterReset;

  const reused = await requestJson<{ error: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: issued.token, newPassword: "tentaDeNovo1" })
  });
  assert.equal(reused.response.status, 400);

  // Restaura a senha original para nao quebrar testes seguintes.
  const restoreToken = await passwordResetTokenRepository.create(memberSession.user.id);
  const restore = await requestJson<{ ok: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: restoreToken.token, newPassword: "membro123" })
  });
  assert.equal(restore.response.status, 200);
  memberSession = await login("membro@ecclesiaos.local", "membro123");
});

test("members can change their own password and admin can reset others", async () => {
  const wrongPassword = await requestJson<{ error: string }>("/auth/change-password", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ currentPassword: "wrong", newPassword: "novaSenha123" })
  });
  assert.equal(wrongPassword.response.status, 401);

  const tooShort = await requestJson<{ error: string }>("/auth/change-password", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ currentPassword: "membro123", newPassword: "abc" })
  });
  assert.equal(tooShort.response.status, 400);

  const ok = await requestJson<{ ok: boolean }>("/auth/change-password", {
    method: "POST",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ currentPassword: "membro123", newPassword: "membroNova1" })
  });
  assert.equal(ok.response.status, 200);

  const reloggedMember = await login("membro@ecclesiaos.local", "membroNova1");
  memberSession = reloggedMember;

  const memberCannotReset = await requestJson<{ error: string }>(`/users/${adminSession.user.id}/reset-password`, {
    method: "POST",
    headers: authHeaders(memberSession)
  });
  assert.equal(memberCannotReset.response.status, 403);

  const adminReset = await requestJson<{ temporaryPassword: string }>(`/users/${memberSession.user.id}/reset-password`, {
    method: "POST",
    headers: authHeaders(adminSession)
  });
  assert.equal(adminReset.response.status, 200);
  assert.ok(adminReset.body?.temporaryPassword && adminReset.body.temporaryPassword.length >= 8);

  const reloginAfterReset = await login("membro@ecclesiaos.local", adminReset.body!.temporaryPassword);
  memberSession = reloginAfterReset;
});

test("leaders and members can only respond to their own serving assignments", async () => {
  const memberForbidden = await requestJson<{ error: string }>("/serving-plans/srv_001/assignments/asg_002/status", {
    method: "PATCH",
    headers: authHeaders(memberSession),
    body: JSON.stringify({ status: "confirmed", notes: "" })
  });
  assert.equal(memberForbidden.response.status, 403);

  const leaderNotifications = await requestJson<unknown[]>("/serving-notifications", {
    headers: authHeaders(leaderSession)
  });
  assert.equal(leaderNotifications.response.status, 200);
  assert.equal(leaderNotifications.body?.length, 1);

  const leaderResponse = await requestJson<{ assignments: Array<{ id: string; status: string }> }>("/serving-plans/srv_001/assignments/asg_002/status", {
    method: "PATCH",
    headers: authHeaders(leaderSession),
    body: JSON.stringify({ status: "confirmed", notes: "Confirmado pelo lider" })
  });
  assert.equal(leaderResponse.response.status, 200);
  assert.equal(leaderResponse.body?.assignments.find((assignment) => assignment.id === "asg_002")?.status, "confirmed");
});
