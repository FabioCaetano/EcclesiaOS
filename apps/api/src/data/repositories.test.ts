import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after, before } from "node:test";

const testDir = await mkdtemp(join(tmpdir(), "ecclesiaos-api-"));
process.env.ECCLESIAOS_DATA_FILE = join(testDir, "dev-db.json");
process.env.ECCLESIAOS_DATA_PROVIDER = "json";

const { readData } = await import("./dataStore.js");
const { eventRepository } = await import("./eventRepository.js");
const { financialTransactionRepository } = await import("./financialTransactionRepository.js");
const { labelTemplateRepository } = await import("./labelTemplateRepository.js");
const { eventRegistrationRepository, reservedQuantityFor } = await import("./eventRegistrationRepository.js");
const { messageTemplateRepository } = await import("./messageTemplateRepository.js");
const { personRepository } = await import("./personRepository.js");
const { resourceRepository } = await import("./resourceRepository.js");
const { servingPlanRepository } = await import("./servingPlanRepository.js");
const { planCronOccurrences } = await import("../cron.js");
const { substituteMessageVariables } = await import("@ecclesiaos/shared");

before(async () => {
  await rm(process.env.ECCLESIAOS_DATA_FILE || "", { force: true });
});

after(async () => {
  await rm(testDir, { force: true, recursive: true });
});

test("readData creates an isolated default data file", async () => {
  const data = await readData();

  assert.equal(data.church.name, "Igreja Ecclesia");
  assert.equal(data.users.length, 3);
  assert.equal(data.people.length, 3);
  assert.equal(data.financialTransactions.length, 2);
  assert.equal(data.resources.length, 2);
  assert.equal(data.roomReservations.length, 1);
});

test("personRepository creates, updates and removes normalized people", async () => {
  const created = await personRepository.create({
    firstName: "  Ana ",
    lastName: " Silva ",
    email: " ana@example.com ",
    phone: " 9999 ",
    birthDate: "",
    status: "visitor",
    guardianPersonIds: [],
    notes: "  primeira visita "
  });

  assert.equal(created.firstName, "Ana");
  assert.equal(created.lastName, "Silva");
  assert.equal(created.status, "visitor");
  assert.equal(created.notes, "primeira visita");

  const updated = await personRepository.update(created.id, {
    firstName: "Ana",
    lastName: "Souza",
    email: "",
    phone: "",
    birthDate: "",
    status: "member",
    guardianPersonIds: [],
    notes: ""
  });

  assert.equal(updated?.lastName, "Souza");
  assert.equal(updated?.status, "member");
  assert.equal(await personRepository.remove(created.id), true);
  assert.equal(await personRepository.remove(created.id), false);
});

test("personRepository persists guardian links", async () => {
  const child = await personRepository.create({
    firstName: "Crianca",
    lastName: "Teste",
    email: "",
    phone: "",
    birthDate: "",
    status: "visitor",
    guardianPersonIds: ["per_001"],
    notes: ""
  });

  assert.deepEqual(child.guardianPersonIds, ["per_001"]);

  const updated = await personRepository.update(child.id, {
    ...child,
    guardianPersonIds: ["per_001", "per_002"]
  });

  assert.deepEqual(updated?.guardianPersonIds, ["per_001", "per_002"]);
});

test("servingPlanRepository normalizes assignment status and ignores empty rows", async () => {
  const plan = await servingPlanRepository.create({
    date: "2026-05-03",
    title: " Culto da noite ",
    groupId: "",
    eventId: "",
    notes: "",
    assignments: [
      { id: "", personId: " per_001 ", role: " Louvor ", status: "confirmed", notes: " ok ", reminderSentAt: "" },
      { id: "", personId: "per_002", role: "Recepcao", status: "unknown" as never, notes: "", reminderSentAt: "" },
      { id: "", personId: "", role: "", status: "declined", notes: "", reminderSentAt: "" }
    ]
  });

  assert.equal(plan.title, "Culto da noite");
  assert.equal(plan.assignments.length, 2);
  assert.equal(plan.assignments[0].personId, "per_001");
  assert.equal(plan.assignments[0].status, "confirmed");
  assert.equal(plan.assignments[1].status, "pending");
});

test("financialTransactionRepository normalizes money fields and sorts newest first", async () => {
  const created = await financialTransactionRepository.create({
    date: "2026-05-05",
    type: "expense",
    amount: -25,
    fund: " Missoes ",
    category: " Material ",
    paymentMethod: "invalid" as never,
    personId: " per_001 ",
    description: "  ajuste "
  });

  assert.equal(created.amount, 0);
  assert.equal(created.fund, "Missoes");
  assert.equal(created.category, "Material");
  assert.equal(created.paymentMethod, "other");
  assert.equal(created.personId, "per_001");

  const transactions = await financialTransactionRepository.list();
  assert.equal(transactions[0].date, "2026-05-05");

  const updated = await financialTransactionRepository.update(created.id, {
    ...created,
    amount: 125.5,
    paymentMethod: "transfer"
  });

  assert.equal(updated?.amount, 125.5);
  assert.equal(updated?.paymentMethod, "transfer");
  assert.equal(await financialTransactionRepository.remove(created.id), true);
});

test("planCronOccurrences expands a weekly cron up to recurrenceUntil", async () => {
  const occurrences = planCronOccurrences({
    id: "evt_cron",
    title: "Teste",
    type: "service",
    date: "2026-05-01",
    startTime: "19:00",
    endTime: "20:00",
    location: "",
    groupId: "",
    recurrence: "cron",
    recurrenceUntil: "2026-05-31",
    recurrenceRule: "0 19 * * 3",
    parentEventId: "",
    requestedTeamIds: [],
    registrationEnabled: false,
    registrationCapacity: 0,
    registrationPrice: 0,
    registrationCurrency: "BRL",
    registrationSlug: "",
    registrationRequiresEmailConfirmation: false,
    description: "",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z"
  }, new Date("2026-05-01T00:00:00.000Z"));

  assert.ok(occurrences.length >= 4);
  assert.ok(occurrences.length <= 5);
  assert.equal(occurrences[0].startTime, "19:00");
  assert.ok(occurrences.every((occ) => occ.date >= "2026-05-01" && occ.date <= "2026-05-31"));
});

test("eventRepository materializes cron occurrences as children and removes them with the master", async () => {
  const master = await eventRepository.create({
    title: "Culto cron",
    type: "service",
    date: "2026-06-01",
    startTime: "19:00",
    endTime: "20:00",
    location: "",
    groupId: "",
    recurrence: "cron",
    recurrenceUntil: "2026-06-30",
    recurrenceRule: "0 19 * * 3",
    parentEventId: "",
    requestedTeamIds: [],
    registrationEnabled: false,
    registrationCapacity: 0,
    registrationPrice: 0,
    registrationCurrency: "BRL",
    registrationSlug: "",
    registrationRequiresEmailConfirmation: false,
    description: ""
  });

  const firstResult = await eventRepository.regenerateForMaster(master.id, new Date("2026-06-01T00:00:00.000Z"));
  assert.notEqual(firstResult, null);
  assert.ok((firstResult?.generated || 0) >= 4);

  const events = await eventRepository.list();
  const children = events.filter((event) => event.parentEventId === master.id);
  assert.equal(children.length, firstResult?.generated || 0);

  const secondResult = await eventRepository.regenerateForMaster(master.id, new Date("2026-06-01T00:00:00.000Z"));
  assert.equal(secondResult?.generated, 0);
  assert.equal(secondResult?.skipped, firstResult?.generated || 0);

  await eventRepository.remove(master.id);
  const remaining = await eventRepository.list();
  assert.equal(remaining.find((event) => event.id === master.id), undefined);
  assert.equal(remaining.filter((event) => event.parentEventId === master.id).length, 0);
});

test("labelTemplateRepository enforces single default per layout", async () => {
  const created = await labelTemplateRepository.create({
    name: "Visitante 50x30",
    printerModel: "Brother QL-700",
    widthMm: 50,
    heightMm: 30,
    isContinuous: false,
    layout: "visitor",
    isDefault: true
  });
  assert.equal(created.isDefault, true);

  const second = await labelTemplateRepository.create({
    name: "Visitante 60x30",
    printerModel: "Brother QL-820NWB",
    widthMm: 60,
    heightMm: 30,
    isContinuous: false,
    layout: "visitor",
    isDefault: true
  });
  assert.equal(second.isDefault, true);

  const visitorTemplates = await labelTemplateRepository.listByLayout("visitor");
  const defaults = visitorTemplates.filter((template) => template.isDefault);
  assert.equal(defaults.length, 1);
  assert.equal(defaults[0]?.id, second.id);

  const updated = await labelTemplateRepository.update(created.id, {
    name: created.name,
    printerModel: created.printerModel,
    widthMm: created.widthMm,
    heightMm: created.heightMm,
    isContinuous: created.isContinuous,
    layout: created.layout,
    isDefault: true
  });
  assert.equal(updated?.isDefault, true);

  const reloaded = await labelTemplateRepository.listByLayout("visitor");
  assert.equal(reloaded.filter((template) => template.isDefault).length, 1);
  assert.equal(reloaded.find((template) => template.isDefault)?.id, created.id);

  await labelTemplateRepository.remove(created.id);
  await labelTemplateRepository.remove(second.id);
});

test("substituteMessageVariables replaces known placeholders and keeps unknown", async () => {
  const result = substituteMessageVariables("Ola {{firstName}} {{lastName}}, bem-vindo a {{churchName}}! {{unknownKey}}", {
    firstName: "Joao",
    lastName: "Silva",
    email: "joao@example.com",
    phone: "999",
    churchName: "Igreja Ecclesia"
  });
  assert.equal(result, "Ola Joao Silva, bem-vindo a Igreja Ecclesia! {{unknownKey}}");

  const fullName = substituteMessageVariables("{{ fullName }}", {
    firstName: "Ana",
    lastName: "Souza",
    email: "",
    phone: "",
    churchName: ""
  });
  assert.equal(fullName, "Ana Souza");
});

test("messageTemplateRepository creates, updates, sorts and removes templates", async () => {
  const a = await messageTemplateRepository.create({
    name: "Zeta",
    channel: "email",
    subject: "Ola",
    body: "Texto"
  });
  const b = await messageTemplateRepository.create({
    name: "Alpha",
    channel: "whatsapp",
    subject: "Oi",
    body: "Texto"
  });

  const list = await messageTemplateRepository.list();
  const ids = list.map((template) => template.id);
  const indexA = ids.indexOf(a.id);
  const indexB = ids.indexOf(b.id);
  assert.ok(indexB < indexA, "list deve estar em ordem alfabetica por name");

  const updated = await messageTemplateRepository.update(a.id, {
    name: "Aaaa",
    channel: "manual",
    subject: "novo",
    body: "novo body"
  });
  assert.equal(updated?.name, "Aaaa");
  assert.equal(updated?.channel, "manual");

  assert.equal(await messageTemplateRepository.remove(a.id), true);
  assert.equal(await messageTemplateRepository.remove(b.id), true);
  assert.equal(await messageTemplateRepository.remove("invalido"), false);
});

test("eventRegistrationRepository confirms email and counts capacity correctly", async () => {
  const master = await eventRepository.create({
    title: "Retiro 2026",
    type: "outreach",
    date: "2026-08-01",
    startTime: "09:00",
    endTime: "18:00",
    location: "Sitio",
    groupId: "",
    recurrence: "none",
    recurrenceUntil: "",
    recurrenceRule: "",
    parentEventId: "",
    requestedTeamIds: [],
    registrationEnabled: true,
    registrationCapacity: 2,
    registrationPrice: 0,
    registrationCurrency: "BRL",
    registrationSlug: "retiro-2026",
    registrationRequiresEmailConfirmation: true,
    description: ""
  });

  const created = await eventRegistrationRepository.create(master, {
    name: "Maria",
    email: "maria@example.com",
    phone: "",
    quantity: 1,
    notes: ""
  }, { emailConfirmationRequired: true });

  assert.notEqual(created, "full");
  if (created === "full") return;
  assert.equal(created.registration.status, "pending_email_confirmation");
  assert.ok(created.confirmationToken.length > 10);
  assert.notEqual(created.registration.emailConfirmationTokenHash, "");
  assert.notEqual(created.registration.emailConfirmationExpiresAt, "");

  const all = await eventRegistrationRepository.list();
  assert.equal(reservedQuantityFor(master, all), 1);

  const invalid = await eventRegistrationRepository.confirmEmail("nope");
  assert.equal(invalid, "invalid");

  const confirmed = await eventRegistrationRepository.confirmEmail(created.confirmationToken);
  assert.notEqual(confirmed, "invalid");
  assert.notEqual(confirmed, "expired");
  if (confirmed === "invalid" || confirmed === "expired") return;
  assert.equal(confirmed.status, "confirmed");
  assert.equal(confirmed.emailConfirmationTokenHash, "");

  const reused = await eventRegistrationRepository.confirmEmail(created.confirmationToken);
  assert.equal(reused, "invalid");

  await eventRepository.remove(master.id);
});

test("resourceRepository blocks overlapping room reservations", async () => {
  const created = await resourceRepository.createReservation({
    resourceId: "res_children_room",
    eventId: "",
    title: "Classe infantil",
    date: "2026-05-06",
    startTime: "19:00",
    endTime: "20:00",
    reservedBy: "Equipe infantil",
    status: "confirmed",
    notes: ""
  });

  assert.notEqual(created, "conflict");

  const conflict = await resourceRepository.createReservation({
    resourceId: "res_children_room",
    eventId: "",
    title: "Ensaio",
    date: "2026-05-06",
    startTime: "19:30",
    endTime: "20:30",
    reservedBy: "Louvor",
    status: "confirmed",
    notes: ""
  });

  assert.equal(conflict, "conflict");
});
