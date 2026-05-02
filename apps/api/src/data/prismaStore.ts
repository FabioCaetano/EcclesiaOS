import type { Prisma } from "@prisma/client";
import type { AttendanceRecord, AuditLogEntry, AuditAction, ChildCheckIn, ChurchEvent, ChurchProfile, ChurchResource, EventCheckIn, EventRegistration, EventRegistrationStatus, EventRecurrence, EventType, FinancialTransaction, GroupProfile, RoomReservation, RoomReservationStatus, ServingAssignment, ServingPlan, UserRole } from "@ecclesiaos/shared";
import type { DataFile } from "./dataStore.js";
import { prisma } from "./prismaClient.js";

const asUserRole = (role: string): UserRole => (
  role === "leader" || role === "member" ? role : "admin"
);

const asStringArray = (value: Prisma.JsonValue): string[] => (
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
);

const asAssignments = (value: Prisma.JsonValue): ServingAssignment[] => (
  Array.isArray(value) ? value as unknown as ServingAssignment[] : []
);

const toGroup = (group: {
  id: string;
  name: string;
  type: string;
  description: string;
  leaderPersonId: string;
  memberPersonIds: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): GroupProfile => ({
  ...group,
  type: group.type === "ministry" || group.type === "class" || group.type === "team" ? group.type : "small_group",
  memberPersonIds: asStringArray(group.memberPersonIds),
  createdAt: group.createdAt.toISOString(),
  updatedAt: group.updatedAt.toISOString()
});

const toAttendance = (record: {
  id: string;
  date: string;
  type: string;
  eventId: string;
  groupId: string;
  presentPersonIds: Prisma.JsonValue;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}): AttendanceRecord => ({
  ...record,
  type: record.type === "group" ? "group" : "service",
  eventId: record.eventId || "",
  presentPersonIds: asStringArray(record.presentPersonIds),
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString()
});

const toEventType = (type: string): EventType => (
  ["service", "meeting", "class", "outreach", "other"].includes(type) ? type as EventType : "other"
);

const toEventRecurrence = (recurrence: string): EventRecurrence => (
  recurrence === "weekly" || recurrence === "monthly" || recurrence === "cron" ? recurrence : "none"
);

const toChurch = (church: Omit<ChurchProfile, "youtubeChannelUrl"> & { youtubeChannelUrl?: string }): ChurchProfile => ({
  ...church,
  youtubeChannelUrl: church.youtubeChannelUrl || ""
});

const toEvent = (event: {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  groupId: string;
  recurrence: string;
  recurrenceUntil: string;
  recurrenceRule: string;
  parentEventId?: string | null;
  registrationEnabled: boolean;
  registrationCapacity: number;
  registrationPrice: number;
  registrationCurrency: string;
  registrationSlug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}): ChurchEvent => ({
  ...event,
  type: toEventType(event.type),
  recurrence: toEventRecurrence(event.recurrence),
  recurrenceUntil: event.recurrenceUntil || "",
  recurrenceRule: event.recurrence === "cron" ? event.recurrenceRule || "" : "",
  parentEventId: event.parentEventId || "",
  registrationEnabled: event.registrationEnabled,
  registrationCapacity: event.registrationCapacity,
  registrationPrice: event.registrationPrice,
  registrationCurrency: event.registrationCurrency,
  registrationSlug: event.registrationSlug,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString()
});

const toServingPlan = (plan: {
  id: string;
  date: string;
  title: string;
  groupId: string;
  notes: string;
  assignments: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): ServingPlan => ({
  ...plan,
  assignments: asAssignments(plan.assignments),
  createdAt: plan.createdAt.toISOString(),
  updatedAt: plan.updatedAt.toISOString()
});

const toFinancialTransaction = (transaction: {
  id: string;
  date: string;
  type: string;
  amount: number;
  fund: string;
  category: string;
  paymentMethod: string;
  personId: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}): FinancialTransaction => ({
  ...transaction,
  type: transaction.type === "expense" ? "expense" : "income",
  paymentMethod: ["cash", "card", "transfer", "check", "other"].includes(transaction.paymentMethod)
    ? transaction.paymentMethod as FinancialTransaction["paymentMethod"]
    : "other",
  createdAt: transaction.createdAt.toISOString(),
  updatedAt: transaction.updatedAt.toISOString()
});

const toRegistrationStatus = (status: string): EventRegistrationStatus => (
  status === "pending_payment" || status === "cancelled" ? status : "confirmed"
);

const toRoomReservationStatus = (status: string): RoomReservationStatus => (
  status === "cancelled" ? "cancelled" : "confirmed"
);

export const readPrismaData = async (): Promise<DataFile> => {
  const [church, users, people, groups, attendance, events, eventCheckIns, childCheckIns, eventRegistrations, resources, roomReservations, servingPlans, financialTransactions, auditLogs] = await Promise.all([
    prisma.churchProfileRecord.findFirst(),
    prisma.userRecord.findMany(),
    prisma.personRecord.findMany(),
    prisma.groupRecord.findMany(),
    prisma.attendanceRecord.findMany(),
    prisma.eventRecord.findMany(),
    prisma.eventCheckInRecord.findMany(),
    prisma.childCheckInRecord.findMany(),
    prisma.eventRegistrationRecord.findMany(),
    prisma.churchResourceRecord.findMany(),
    prisma.roomReservationRecord.findMany(),
    prisma.servingPlanRecord.findMany(),
    prisma.financialTransactionRecord.findMany(),
    prisma.auditLogRecord.findMany({ orderBy: { createdAt: "desc" } })
  ]);

  if (!church) {
    throw new Error("Prisma database is empty. Run npm run reset-dev-data with ECCLESIAOS_DATA_PROVIDER=prisma.");
  }

  return {
    church: toChurch(church),
    users: users.map((user) => {
      const userWithPerson = user as typeof user & { personId?: string };
      return { ...user, role: asUserRole(user.role), personId: userWithPerson.personId || "" };
    }),
    people: people.map((person) => ({
      ...person,
      status: person.status === "visitor" ? "visitor" : "member",
      guardianPersonIds: asStringArray(person.guardianPersonIds),
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString()
    })),
    groups: groups.map(toGroup),
    attendance: attendance.map(toAttendance),
    events: events.map(toEvent),
    eventCheckIns: eventCheckIns.map((checkIn): EventCheckIn => ({ ...checkIn, checkedInAt: checkIn.checkedInAt.toISOString() })),
    childCheckIns: childCheckIns.map((checkIn): ChildCheckIn => ({
      ...checkIn,
      childPersonId: checkIn.childPersonId || "",
      guardianPersonId: checkIn.guardianPersonId || "",
      checkedOutByPersonId: checkIn.checkedOutByPersonId || "",
      checkedInAt: checkIn.checkedInAt.toISOString()
    })),
    eventRegistrations: eventRegistrations.map((registration): EventRegistration => ({
      ...registration,
      status: toRegistrationStatus(registration.status),
      ticketCode: registration.ticketCode || registration.id,
      checkedInAt: registration.checkedInAt || "",
      checkedInByUserId: registration.checkedInByUserId || "",
      createdAt: registration.createdAt.toISOString()
    })),
    resources: resources.map((resource): ChurchResource => ({
      ...resource,
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString()
    })),
    roomReservations: roomReservations.map((reservation): RoomReservation => ({
      ...reservation,
      status: toRoomReservationStatus(reservation.status),
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString()
    })),
    servingPlans: servingPlans.map(toServingPlan),
    financialTransactions: financialTransactions.map(toFinancialTransaction),
    auditLogs: auditLogs.map((log): AuditLogEntry => ({
      ...log,
      action: log.action === "update" || log.action === "delete" ? log.action as AuditAction : "create",
      createdAt: log.createdAt.toISOString()
    }))
  };
};

export const writePrismaData = async (data: DataFile) => {
  await prisma.$transaction(async (tx) => {
    await tx.financialTransactionRecord.deleteMany();
    await tx.auditLogRecord.deleteMany();
    await tx.roomReservationRecord.deleteMany();
    await tx.churchResourceRecord.deleteMany();
    await tx.eventRegistrationRecord.deleteMany();
    await tx.childCheckInRecord.deleteMany();
    await tx.eventCheckInRecord.deleteMany();
    await tx.eventRecord.deleteMany();
    await tx.servingPlanRecord.deleteMany();
    await tx.attendanceRecord.deleteMany();
    await tx.groupRecord.deleteMany();
    await tx.personRecord.deleteMany();
    await tx.userRecord.deleteMany();
    await tx.churchProfileRecord.deleteMany();

    await tx.churchProfileRecord.create({ data: data.church });

    for (const user of data.users) {
      await tx.userRecord.create({ data: user });
    }

    for (const person of data.people) {
      await tx.personRecord.create({
        data: {
          ...person,
          guardianPersonIds: person.guardianPersonIds,
          createdAt: new Date(person.createdAt),
          updatedAt: new Date(person.updatedAt)
        }
      });
    }

    for (const group of data.groups) {
      await tx.groupRecord.create({
        data: {
          ...group,
          memberPersonIds: group.memberPersonIds,
          createdAt: new Date(group.createdAt),
          updatedAt: new Date(group.updatedAt)
        }
      });
    }

    for (const record of data.attendance) {
      await tx.attendanceRecord.create({
        data: {
          ...record,
          presentPersonIds: record.presentPersonIds,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt)
        }
      });
    }

    for (const event of data.events) {
      await tx.eventRecord.create({
        data: {
          ...event,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt)
        }
      });
    }

    for (const checkIn of data.eventCheckIns) {
      await tx.eventCheckInRecord.create({
        data: {
          ...checkIn,
          checkedInAt: new Date(checkIn.checkedInAt)
        }
      });
    }

    for (const checkIn of data.childCheckIns) {
      await tx.childCheckInRecord.create({
        data: {
          ...checkIn,
          checkedInAt: new Date(checkIn.checkedInAt)
        }
      });
    }

    for (const registration of data.eventRegistrations) {
      await tx.eventRegistrationRecord.create({
        data: {
          ...registration,
          createdAt: new Date(registration.createdAt)
        }
      });
    }

    for (const resource of data.resources) {
      await tx.churchResourceRecord.create({
        data: {
          ...resource,
          createdAt: new Date(resource.createdAt),
          updatedAt: new Date(resource.updatedAt)
        }
      });
    }

    for (const reservation of data.roomReservations) {
      await tx.roomReservationRecord.create({
        data: {
          ...reservation,
          createdAt: new Date(reservation.createdAt),
          updatedAt: new Date(reservation.updatedAt)
        }
      });
    }

    for (const plan of data.servingPlans) {
      await tx.servingPlanRecord.create({
        data: {
          ...plan,
          assignments: plan.assignments as unknown as Prisma.InputJsonValue,
          createdAt: new Date(plan.createdAt),
          updatedAt: new Date(plan.updatedAt)
        }
      });
    }

    for (const transaction of data.financialTransactions) {
      await tx.financialTransactionRecord.create({
        data: {
          ...transaction,
          createdAt: new Date(transaction.createdAt),
          updatedAt: new Date(transaction.updatedAt)
        }
      });
    }

    for (const log of data.auditLogs) {
      await tx.auditLogRecord.create({
        data: {
          ...log,
          createdAt: new Date(log.createdAt)
        }
      });
    }
  });
};
