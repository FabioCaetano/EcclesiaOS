import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import type { AttendanceRecord, AuditLogEntry, ChildCheckIn, ChurchEvent, ChurchProfile, ChurchResource, EventCheckIn, EventRegistration, FinancialTransaction, GroupProfile, LabelTemplate, PeopleMessage, PersonBlockOut, PersonProfile, RoomReservation, ServingPlan } from "@ecclesiaos/shared";
import { defaultAttendance } from "./defaultAttendance.js";
import { defaultChurch } from "./defaultChurch.js";
import { defaultFinancialTransactions } from "./defaultFinancialTransactions.js";
import { defaultGroups } from "./defaultGroups.js";
import { defaultLabelTemplates } from "./defaultLabelTemplates.js";
import { defaultPeople } from "./defaultPeople.js";
import { defaultEvents } from "./defaultEvents.js";
import { defaultServingPlans } from "./defaultServingPlans.js";
import { defaultResources, defaultRoomReservations } from "./defaultResources.js";
import { defaultUsers, type UserRecord } from "./defaultUsers.js";
import { hashPassword, isPasswordHash } from "../passwords.js";

export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface DataFile {
  attendance: AttendanceRecord[];
  auditLogs: AuditLogEntry[];
  childCheckIns: ChildCheckIn[];
  church: ChurchProfile;
  eventCheckIns: EventCheckIn[];
  eventRegistrations: EventRegistration[];
  events: ChurchEvent[];
  financialTransactions: FinancialTransaction[];
  groups: GroupProfile[];
  labelTemplates: LabelTemplate[];
  peopleMessages: PeopleMessage[];
  personBlockOuts: PersonBlockOut[];
  passwordResetTokens: PasswordResetTokenRecord[];
  people: PersonProfile[];
  resources: ChurchResource[];
  roomReservations: RoomReservation[];
  servingPlans: ServingPlan[];
  users: UserRecord[];
}

export const dataFilePath = process.env.ECCLESIAOS_DATA_FILE || resolve(process.cwd(), "data", "dev-db.json");
const dataProvider = process.env.ECCLESIAOS_DATA_PROVIDER || "json";

const defaultData = (): DataFile => ({
  attendance: defaultAttendance,
  auditLogs: [],
  childCheckIns: [],
  church: defaultChurch,
  eventCheckIns: [],
  eventRegistrations: [],
  events: defaultEvents,
  financialTransactions: defaultFinancialTransactions,
  groups: defaultGroups,
  labelTemplates: defaultLabelTemplates,
  peopleMessages: [],
  personBlockOuts: [],
  passwordResetTokens: [],
  people: defaultPeople,
  resources: defaultResources,
  roomReservations: defaultRoomReservations,
  servingPlans: defaultServingPlans,
  users: defaultUsers.map((user) => ({
    ...user,
    password: isPasswordHash(user.password) ? user.password : hashPassword(user.password)
  }))
});

const normalizeData = (data: Partial<DataFile>): DataFile => ({
  attendance: (data.attendance || defaultAttendance).map((record) => ({ ...record, eventId: record.eventId || "" })),
  auditLogs: data.auditLogs || [],
  childCheckIns: (data.childCheckIns || []).map((checkIn) => ({
    ...checkIn,
    childPersonId: checkIn.childPersonId || "",
    guardianPersonId: checkIn.guardianPersonId || "",
    checkedOutByPersonId: checkIn.checkedOutByPersonId || ""
  })),
  church: { ...defaultChurch, ...(data.church || {}) },
  eventCheckIns: data.eventCheckIns || [],
  eventRegistrations: (data.eventRegistrations || []).map((registration) => ({
    ...registration,
    ticketCode: registration.ticketCode || registration.id,
    checkedInAt: registration.checkedInAt || "",
    checkedInByUserId: registration.checkedInByUserId || ""
  })),
  events: (data.events || defaultEvents).map((event) => ({
    ...event,
    recurrence: event.recurrence || "none",
    recurrenceUntil: event.recurrenceUntil || "",
    recurrenceRule: event.recurrence === "cron" ? event.recurrenceRule || "" : "",
    parentEventId: event.parentEventId || "",
    requestedTeamIds: Array.isArray(event.requestedTeamIds) ? event.requestedTeamIds : [],
    registrationEnabled: event.registrationEnabled || false,
    registrationCapacity: event.registrationCapacity || 0,
    registrationPrice: event.registrationPrice || 0,
    registrationCurrency: event.registrationCurrency || "BRL",
    registrationSlug: event.registrationSlug || event.id
  })),
  financialTransactions: data.financialTransactions || defaultFinancialTransactions,
  groups: data.groups || defaultGroups,
  labelTemplates: (data.labelTemplates || defaultLabelTemplates).map((template) => ({
    ...template,
    layout: template.layout === "visitor" ? "visitor" : "kids_checkin",
    isContinuous: Boolean(template.isContinuous),
    isDefault: Boolean(template.isDefault),
    widthMm: Number(template.widthMm) || 0,
    heightMm: Number(template.heightMm) || 0,
    printerModel: template.printerModel || ""
  })),
  people: (data.people || defaultPeople).map((person) => ({ ...person, guardianPersonIds: person.guardianPersonIds || [] })),
  resources: data.resources || defaultResources,
  roomReservations: (data.roomReservations || defaultRoomReservations).map((reservation) => ({ ...reservation, status: reservation.status === "cancelled" ? "cancelled" : "confirmed" })),
  peopleMessages: (data.peopleMessages || []).map((message) => ({
    ...message,
    channel: message.channel === "email" || message.channel === "whatsapp" ? message.channel : "manual",
    recipientPersonIds: Array.isArray(message.recipientPersonIds) ? message.recipientPersonIds.map(String) : [],
    createdByUserId: message.createdByUserId || "",
    createdByName: message.createdByName || ""
  })),
  personBlockOuts: (data.personBlockOuts || []).map((blockOut) => ({
    ...blockOut,
    reason: blockOut.reason || "",
    createdByUserId: blockOut.createdByUserId || ""
  })),
  passwordResetTokens: (data.passwordResetTokens || []).map((token) => ({
    ...token,
    usedAt: token.usedAt || null
  })),
  servingPlans: (data.servingPlans || defaultServingPlans).map((plan) => ({
    ...plan,
    eventId: plan.eventId || ""
  })),
  users: (data.users || defaultUsers).map((user) => ({ ...user, personId: user.personId || "" }))
});

export const ensureDataFile = async () => {
  try {
    await readFile(dataFilePath, "utf8");
  } catch {
    await mkdir(dirname(dataFilePath), { recursive: true });
    await writeData(defaultData());
  }
};

export const readData = async (): Promise<DataFile> => {
  if (dataProvider === "prisma") {
    const { readPrismaData } = await import("./prismaStore.js");
    return readPrismaData();
  }

  await ensureDataFile();
  const contents = await readFile(dataFilePath, "utf8");
  const parsed = JSON.parse(contents) as Partial<DataFile>;
  const data = normalizeData(parsed);
  if (JSON.stringify(parsed) !== JSON.stringify(data)) {
    await writeData(data);
  }
  return data;
};

export const writeData = async (data: DataFile) => {
  if (dataProvider === "prisma") {
    const { writePrismaData } = await import("./prismaStore.js");
    await writePrismaData(data);
    return;
  }

  await mkdir(dirname(dataFilePath), { recursive: true });
  const tempFilePath = `${dataFilePath}.${process.pid}.${Date.now()}.${randomUUID()}.tmp`;
  await writeFile(tempFilePath, JSON.stringify(data, null, 2));
  await rename(tempFilePath, dataFilePath);
};

export const getDefaultData = (): DataFile => defaultData();
