import "../env.js";
import { readData } from "../data/dataStore.js";
import { userRepository } from "../data/userRepository.js";
import { prisma } from "../data/prismaClient.js";
import { isPasswordHash } from "../passwords.js";

if (process.env.ECCLESIAOS_DATA_PROVIDER !== "prisma") {
  throw new Error("Set ECCLESIAOS_DATA_PROVIDER=prisma before running db:verify.");
}

const data = await readData();

console.log("Prisma provider verified.");
console.log(`Church: ${data.church.name}`);
console.log(`Users: ${data.users.length}`);
console.log(`People: ${data.people.length}`);
console.log(`Groups: ${data.groups.length}`);
console.log(`Attendance: ${data.attendance.length}`);
console.log(`Attendance linked to events: ${data.attendance.filter((record) => record.eventId).length}`);
console.log(`Events: ${data.events.length}`);
console.log(`Event check-ins: ${data.eventCheckIns.length}`);
console.log(`Child check-ins: ${data.childCheckIns.length}`);
console.log(`Event registrations: ${data.eventRegistrations.length}`);
console.log(`Resources: ${data.resources.length}`);
console.log(`Room reservations: ${data.roomReservations.length}`);
console.log(`Serving plans: ${data.servingPlans.length}`);
console.log(`Financial transactions: ${data.financialTransactions.length}`);
console.log(`Audit logs: ${data.auditLogs.length}`);

const credentials = [
  ["admin@ecclesiaos.local", "admin123"],
  ["lider@ecclesiaos.local", "lider123"],
  ["membro@ecclesiaos.local", "membro123"]
];

for (const [email, password] of credentials) {
  const user = await userRepository.findByCredentials(email, password);
  if (!user) {
    throw new Error(`Missing or invalid seeded credential: ${email}`);
  }
  if (!user.personId || !data.people.some((person) => person.id === user.personId)) {
    throw new Error(`Seeded credential is not linked to a person: ${email}`);
  }
  if (!isPasswordHash(user.password)) {
    throw new Error(`Seeded credential is not hashed: ${email}`);
  }
}

console.log("Seeded credentials verified and hashed: admin, lider, membro.");

await prisma.$disconnect();
