import type { Prisma } from "@prisma/client";
import type { AttendanceRecord, AuditLogEntry, AuditAction, ChildCheckIn, ChurchEvent, ChurchProfile, ChurchResource, CustomForm, CustomFormField, CustomFormFieldType, CustomFormResponse, EventCheckIn, EventRegistration, EventRegistrationStatus, EventRecurrence, EventType, FinancialTransaction, GroupProfile, KidsRoom, LabelLayout, LabelTemplate, MessageChannel, MessageTemplate, PeopleMessage, PersonBlockOut, RoomReservation, RoomReservationStatus, ServiceChecklist, ServiceChecklistItem, ServingAssignment, ServingPlan, Song, UserRole, WorshipSet, WorshipSetItem } from "@ecclesiaos/shared";
import type { DataFile, PasswordResetTokenRecord } from "./dataStore.js";
import { prisma } from "./prismaClient.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isDeadlockError = (error: unknown) => (
  error instanceof Error && (error.message.includes("deadlock detected") || error.message.includes("40P01"))
);

const withDeadlockRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isDeadlockError(error) || attempt === 2) break;
      await sleep(100 * (attempt + 1));
    }
  }
  throw lastError;
};

const asUserRole = (role: string): UserRole => (
  role === "leader" || role === "member" ? role : "admin"
);

const asStringArray = (value: Prisma.JsonValue): string[] => (
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
);

const asStringArrayRecord = (value: Prisma.JsonValue): Record<string, string[]> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, asStringArray(item as Prisma.JsonValue)] as const)
      .filter(([, positions]) => positions.length > 0)
  );
};

const asAssignments = (value: Prisma.JsonValue): ServingAssignment[] => {
  if (!Array.isArray(value)) return [];
  return value.map((raw) => {
    const item = raw as Partial<ServingAssignment>;
    return {
      id: typeof item.id === "string" ? item.id : "",
      personId: typeof item.personId === "string" ? item.personId : "",
      role: typeof item.role === "string" ? item.role : "",
      status: item.status === "confirmed" || item.status === "declined" ? item.status : "pending",
      notes: typeof item.notes === "string" ? item.notes : "",
      reminderSentAt: typeof item.reminderSentAt === "string" ? item.reminderSentAt : ""
    };
  });
};

const asWorshipSetItems = (value: Prisma.JsonValue): WorshipSetItem[] => {
  if (!Array.isArray(value)) return [];
  return value.map((raw, index) => {
    const item = raw as Partial<WorshipSetItem>;
    return {
      songId: typeof item.songId === "string" ? item.songId : "",
      key: typeof item.key === "string" ? item.key : "",
      notes: typeof item.notes === "string" ? item.notes : "",
      order: Number(item.order) || index + 1
    };
  }).filter((item) => item.songId);
};

const asServiceChecklistItems = (value: Prisma.JsonValue): ServiceChecklistItem[] => {
  if (!Array.isArray(value)) return [];
  return value.map((raw, index) => {
    const item = raw as Partial<ServiceChecklistItem>;
    return {
      id: typeof item.id === "string" ? item.id : `item_${index + 1}`,
      title: typeof item.title === "string" ? item.title : "",
      responsiblePersonId: typeof item.responsiblePersonId === "string" ? item.responsiblePersonId : "",
      scheduledTime: typeof item.scheduledTime === "string" ? item.scheduledTime : "",
      notes: typeof item.notes === "string" ? item.notes : "",
      completed: Boolean(item.completed),
      order: Number(item.order) || index + 1
    };
  }).filter((item) => item.title);
};

const asCustomFormFields = (value: Prisma.JsonValue): CustomFormField[] => {
  if (!Array.isArray(value)) return [];
  return value.map((raw, index) => {
    const field = raw as Partial<CustomFormField>;
    const type: CustomFormFieldType = field.type === "textarea" || field.type === "email" || field.type === "phone" || field.type === "number" || field.type === "date" || field.type === "select" || field.type === "checkbox" ? field.type : "text";
    return {
      id: typeof field.id === "string" ? field.id : `field_${index + 1}`,
      label: typeof field.label === "string" ? field.label : "",
      type,
      required: Boolean(field.required),
      options: asStringArray(field.options as Prisma.JsonValue),
      order: Number(field.order) || index + 1
    };
  }).filter((field) => field.label);
};

const asAnswerRecord = (value: Prisma.JsonValue): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item || "")]));
};

const toGroup = (group: {
  id: string;
  name: string;
  type: string;
  description: string;
  leaderPersonId: string;
  memberPersonIds: Prisma.JsonValue;
  servicePositions?: Prisma.JsonValue;
  memberServicePositions?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): GroupProfile => ({
  ...group,
  type: group.type === "ministry" || group.type === "class" || group.type === "team" ? group.type : "small_group",
  memberPersonIds: asStringArray(group.memberPersonIds),
  servicePositions: asStringArray(group.servicePositions ?? []),
  memberServicePositions: asStringArrayRecord(group.memberServicePositions ?? {}),
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
  requestedTeamIds?: Prisma.JsonValue;
  registrationEnabled: boolean;
  registrationCapacity: number;
  registrationPrice: number;
  registrationCurrency: string;
  registrationSlug: string;
  registrationRequiresEmailConfirmation?: boolean | null;
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
  requestedTeamIds: asStringArray(event.requestedTeamIds ?? []),
  registrationEnabled: event.registrationEnabled,
  registrationCapacity: event.registrationCapacity,
  registrationPrice: event.registrationPrice,
  registrationCurrency: event.registrationCurrency,
  registrationSlug: event.registrationSlug,
  registrationRequiresEmailConfirmation: Boolean(event.registrationRequiresEmailConfirmation),
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString()
});

const toServingPlan = (plan: {
  id: string;
  date: string;
  title: string;
  groupId: string;
  eventId?: string | null;
  notes: string;
  assignments: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): ServingPlan => ({
  ...plan,
  eventId: plan.eventId || "",
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

const toSong = (song: {
  id: string;
  title: string;
  artist: string;
  defaultKey: string;
  bpm: number;
  theme: string;
  lyrics: string;
  chords: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}): Song => ({
  ...song,
  createdAt: song.createdAt.toISOString(),
  updatedAt: song.updatedAt.toISOString()
});

const toWorshipSet = (set: {
  id: string;
  eventId: string;
  title: string;
  date: string;
  notes: string;
  items: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): WorshipSet => ({
  ...set,
  items: asWorshipSetItems(set.items),
  createdAt: set.createdAt.toISOString(),
  updatedAt: set.updatedAt.toISOString()
});

const toServiceChecklist = (checklist: {
  id: string;
  eventId: string;
  title: string;
  date: string;
  notes: string;
  items: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): ServiceChecklist => ({
  ...checklist,
  items: asServiceChecklistItems(checklist.items),
  createdAt: checklist.createdAt.toISOString(),
  updatedAt: checklist.updatedAt.toISOString()
});

const toCustomForm = (form: {
  id: string;
  title: string;
  description: string;
  slug: string;
  responsiblePersonIds: Prisma.JsonValue;
  fields: Prisma.JsonValue;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CustomForm => ({
  ...form,
  responsiblePersonIds: asStringArray(form.responsiblePersonIds),
  fields: asCustomFormFields(form.fields),
  createdAt: form.createdAt.toISOString(),
  updatedAt: form.updatedAt.toISOString()
});

const toCustomFormResponse = (response: {
  id: string;
  formId: string;
  answers: Prisma.JsonValue;
  submittedAt: Date;
}): CustomFormResponse => ({
  ...response,
  answers: asAnswerRecord(response.answers),
  submittedAt: response.submittedAt.toISOString()
});

const toRegistrationStatus = (status: string): EventRegistrationStatus => (
  status === "pending_payment" || status === "cancelled" || status === "pending_email_confirmation" ? status : "confirmed"
);

const toRoomReservationStatus = (status: string): RoomReservationStatus => (
  status === "cancelled" ? "cancelled" : "confirmed"
);

const toLabelLayout = (layout: string): LabelLayout => (
  layout === "visitor" ? "visitor" : "kids_checkin"
);

const toMessageChannel = (channel: string): MessageChannel => (
  channel === "email" || channel === "whatsapp" ? channel : "manual"
);

const toPeopleMessage = (message: {
  id: string;
  subject: string;
  body: string;
  channel: string;
  recipientPersonIds: Prisma.JsonValue;
  createdAt: Date;
  createdByUserId: string;
  createdByName: string;
}): PeopleMessage => ({
  ...message,
  channel: toMessageChannel(message.channel),
  recipientPersonIds: asStringArray(message.recipientPersonIds),
  createdAt: message.createdAt.toISOString()
});

const toPasswordResetToken = (token: {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}): PasswordResetTokenRecord => ({
  id: token.id,
  userId: token.userId,
  tokenHash: token.tokenHash,
  expiresAt: token.expiresAt.toISOString(),
  usedAt: token.usedAt ? token.usedAt.toISOString() : null,
  createdAt: token.createdAt.toISOString()
});

const toPersonBlockOut = (blockOut: {
  id: string;
  personId: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: Date;
  createdByUserId: string;
}): PersonBlockOut => ({
  ...blockOut,
  createdAt: blockOut.createdAt.toISOString()
});

const toLabelTemplate = (template: {
  id: string;
  name: string;
  printerModel: string;
  widthMm: number;
  heightMm: number;
  isContinuous: boolean;
  layout: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}): LabelTemplate => ({
  ...template,
  layout: toLabelLayout(template.layout),
  createdAt: template.createdAt.toISOString(),
  updatedAt: template.updatedAt.toISOString()
});

const toMessageTemplate = (template: {
  id: string;
  name: string;
  channel: string;
  subject: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}): MessageTemplate => ({
  ...template,
  channel: toMessageChannel(template.channel),
  createdAt: template.createdAt.toISOString(),
  updatedAt: template.updatedAt.toISOString()
});

const toKidsRoom = (room: {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  capacity: number;
  responsiblePersonIds: Prisma.JsonValue;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): KidsRoom => ({
  ...room,
  responsiblePersonIds: asStringArray(room.responsiblePersonIds),
  createdAt: room.createdAt.toISOString(),
  updatedAt: room.updatedAt.toISOString()
});

export const readPrismaData = async (): Promise<DataFile> => {
  const [church, users, people, groups, attendance, events, eventCheckIns, childCheckIns, kidsRooms, eventRegistrations, resources, roomReservations, servingPlans, songs, worshipSets, serviceChecklists, customForms, customFormResponses, financialTransactions, auditLogs, labelTemplates, peopleMessages, personBlockOuts, passwordResetTokens, messageTemplates] = await Promise.all([
    prisma.churchProfileRecord.findFirst(),
    prisma.userRecord.findMany(),
    prisma.personRecord.findMany(),
    prisma.groupRecord.findMany(),
    prisma.attendanceRecord.findMany(),
    prisma.eventRecord.findMany(),
    prisma.eventCheckInRecord.findMany(),
    prisma.childCheckInRecord.findMany(),
    prisma.kidsRoomRecord.findMany({ orderBy: { minAge: "asc" } }),
    prisma.eventRegistrationRecord.findMany(),
    prisma.churchResourceRecord.findMany(),
    prisma.roomReservationRecord.findMany(),
    prisma.servingPlanRecord.findMany(),
    prisma.songRecord.findMany({ orderBy: { title: "asc" } }),
    prisma.worshipSetRecord.findMany({ orderBy: { date: "asc" } }),
    prisma.serviceChecklistRecord.findMany({ orderBy: { date: "asc" } }),
    prisma.customFormRecord.findMany({ orderBy: { title: "asc" } }),
    prisma.customFormResponseRecord.findMany({ orderBy: { submittedAt: "desc" } }),
    prisma.financialTransactionRecord.findMany(),
    prisma.auditLogRecord.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.labelTemplateRecord.findMany(),
    prisma.peopleMessageRecord.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.personBlockOutRecord.findMany({ orderBy: { startDate: "desc" } }),
    prisma.passwordResetTokenRecord.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.messageTemplateRecord.findMany({ orderBy: { name: "asc" } })
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
      gender: person.gender === "female" || person.gender === "male" ? person.gender : "unspecified",
      membershipDate: person.membershipDate || "",
      address: person.address || "",
      baptized: Boolean(person.baptized),
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
    kidsRooms: kidsRooms.map(toKidsRoom),
    eventRegistrations: eventRegistrations.map((registration): EventRegistration => {
      const extended = registration as typeof registration & {
        emailConfirmationTokenHash?: string | null;
        emailConfirmationExpiresAt?: string | null;
      };
      return {
        ...registration,
        status: toRegistrationStatus(registration.status),
        ticketCode: registration.ticketCode || registration.id,
        checkedInAt: registration.checkedInAt || "",
        checkedInByUserId: registration.checkedInByUserId || "",
        emailConfirmationTokenHash: extended.emailConfirmationTokenHash || "",
        emailConfirmationExpiresAt: extended.emailConfirmationExpiresAt || "",
        createdAt: registration.createdAt.toISOString()
      };
    }),
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
    songs: songs.map(toSong),
    worshipSets: worshipSets.map(toWorshipSet),
    serviceChecklists: serviceChecklists.map(toServiceChecklist),
    customForms: customForms.map(toCustomForm),
    customFormResponses: customFormResponses.map(toCustomFormResponse),
    financialTransactions: financialTransactions.map(toFinancialTransaction),
    auditLogs: auditLogs.map((log): AuditLogEntry => ({
      ...log,
      action: log.action === "update" || log.action === "delete" ? log.action as AuditAction : "create",
      createdAt: log.createdAt.toISOString()
    })),
    labelTemplates: labelTemplates.map(toLabelTemplate),
    messageTemplates: messageTemplates.map(toMessageTemplate),
    peopleMessages: peopleMessages.map(toPeopleMessage),
    personBlockOuts: personBlockOuts.map(toPersonBlockOut),
    passwordResetTokens: passwordResetTokens.map(toPasswordResetToken)
  };
};

export const writePrismaData = async (data: DataFile) => {
  await withDeadlockRetry(() => prisma.$transaction(async (tx) => {
    await tx.financialTransactionRecord.deleteMany();
    await tx.auditLogRecord.deleteMany();
    await tx.peopleMessageRecord.deleteMany();
    await tx.messageTemplateRecord.deleteMany();
    await tx.personBlockOutRecord.deleteMany();
    await tx.passwordResetTokenRecord.deleteMany();
    await tx.labelTemplateRecord.deleteMany();
    await tx.kidsRoomRecord.deleteMany();
    await tx.roomReservationRecord.deleteMany();
    await tx.churchResourceRecord.deleteMany();
    await tx.eventRegistrationRecord.deleteMany();
    await tx.childCheckInRecord.deleteMany();
    await tx.eventCheckInRecord.deleteMany();
    await tx.eventRecord.deleteMany();
    await tx.servingPlanRecord.deleteMany();
    await tx.customFormResponseRecord.deleteMany();
    await tx.customFormRecord.deleteMany();
    await tx.serviceChecklistRecord.deleteMany();
    await tx.worshipSetRecord.deleteMany();
    await tx.songRecord.deleteMany();
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
          servicePositions: group.servicePositions as unknown as Prisma.InputJsonValue,
          memberServicePositions: group.memberServicePositions as unknown as Prisma.InputJsonValue,
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
          requestedTeamIds: event.requestedTeamIds as unknown as Prisma.InputJsonValue,
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

    for (const room of data.kidsRooms) {
      await tx.kidsRoomRecord.create({
        data: {
          ...room,
          responsiblePersonIds: room.responsiblePersonIds as unknown as Prisma.InputJsonValue,
          createdAt: new Date(room.createdAt),
          updatedAt: new Date(room.updatedAt)
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

    for (const song of data.songs) {
      await tx.songRecord.create({
        data: {
          ...song,
          createdAt: new Date(song.createdAt),
          updatedAt: new Date(song.updatedAt)
        }
      });
    }

    for (const set of data.worshipSets) {
      await tx.worshipSetRecord.create({
        data: {
          ...set,
          items: set.items as unknown as Prisma.InputJsonValue,
          createdAt: new Date(set.createdAt),
          updatedAt: new Date(set.updatedAt)
        }
      });
    }

    for (const checklist of data.serviceChecklists) {
      await tx.serviceChecklistRecord.create({
        data: {
          ...checklist,
          items: checklist.items as unknown as Prisma.InputJsonValue,
          createdAt: new Date(checklist.createdAt),
          updatedAt: new Date(checklist.updatedAt)
        }
      });
    }

    for (const form of data.customForms) {
      await tx.customFormRecord.create({
        data: {
          ...form,
          responsiblePersonIds: form.responsiblePersonIds as unknown as Prisma.InputJsonValue,
          fields: form.fields as unknown as Prisma.InputJsonValue,
          createdAt: new Date(form.createdAt),
          updatedAt: new Date(form.updatedAt)
        }
      });
    }

    for (const response of data.customFormResponses) {
      await tx.customFormResponseRecord.create({
        data: {
          ...response,
          answers: response.answers as unknown as Prisma.InputJsonValue,
          submittedAt: new Date(response.submittedAt)
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

    for (const template of data.labelTemplates) {
      await tx.labelTemplateRecord.create({
        data: {
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt)
        }
      });
    }

    for (const message of data.peopleMessages) {
      await tx.peopleMessageRecord.create({
        data: {
          ...message,
          recipientPersonIds: message.recipientPersonIds as unknown as Prisma.InputJsonValue,
          createdAt: new Date(message.createdAt)
        }
      });
    }

    for (const template of data.messageTemplates) {
      await tx.messageTemplateRecord.create({
        data: {
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt)
        }
      });
    }

    for (const blockOut of data.personBlockOuts) {
      await tx.personBlockOutRecord.create({
        data: {
          ...blockOut,
          createdAt: new Date(blockOut.createdAt)
        }
      });
    }

    for (const token of data.passwordResetTokens) {
      await tx.passwordResetTokenRecord.create({
        data: {
          ...token,
          expiresAt: new Date(token.expiresAt),
          usedAt: token.usedAt ? new Date(token.usedAt) : null,
          createdAt: new Date(token.createdAt)
        }
      });
    }
  }, {
    maxWait: 10000,
    timeout: 60000
  }));
};

export const appendPrismaEventsAndServingPlans = async (events: ChurchEvent[], servingPlans: ServingPlan[]) => {
  if (events.length === 0 && servingPlans.length === 0) return;

  await withDeadlockRetry(() => prisma.$transaction(async (tx) => {
    if (events.length > 0) {
      await tx.eventRecord.createMany({
        data: events.map((event) => ({
          ...event,
          requestedTeamIds: event.requestedTeamIds as unknown as Prisma.InputJsonValue,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt)
        })),
        skipDuplicates: true
      });
    }

    if (servingPlans.length > 0) {
      await tx.servingPlanRecord.createMany({
        data: servingPlans.map((plan) => ({
          ...plan,
          assignments: plan.assignments as unknown as Prisma.InputJsonValue,
          createdAt: new Date(plan.createdAt),
          updatedAt: new Date(plan.updatedAt)
        })),
        skipDuplicates: true
      });
    }
  }, {
    maxWait: 10000,
    timeout: 30000
  }));
};
