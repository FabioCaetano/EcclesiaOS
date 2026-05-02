import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after, before } from "node:test";

const testDir = await mkdtemp(join(tmpdir(), "ecclesiaos-api-"));
process.env.ECCLESIAOS_DATA_FILE = join(testDir, "dev-db.json");
process.env.ECCLESIAOS_DATA_PROVIDER = "json";

const { readData } = await import("./dataStore.js");
const { financialTransactionRepository } = await import("./financialTransactionRepository.js");
const { personRepository } = await import("./personRepository.js");
const { resourceRepository } = await import("./resourceRepository.js");
const { servingPlanRepository } = await import("./servingPlanRepository.js");

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
    notes: "",
    assignments: [
      { id: "", personId: " per_001 ", role: " Louvor ", status: "confirmed", notes: " ok " },
      { id: "", personId: "per_002", role: "Recepcao", status: "unknown" as never, notes: "" },
      { id: "", personId: "", role: "", status: "declined", notes: "" }
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
