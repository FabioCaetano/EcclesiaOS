import type { AttendanceInput, AttendanceRecord, ChurchEvent, ChurchEventInput, ChurchProfile, ChurchProfileUpdate, FinancialTransaction, FinancialTransactionInput, GroupInput, GroupProfile, PersonInput, PersonProfile, ServingPlan, ServingPlanInput } from "@ecclesiaos/shared";

export const toChurchUpdate = (profile: ChurchProfile): ChurchProfileUpdate => ({
  name: profile.name,
  email: profile.email,
  phone: profile.phone,
  website: profile.website,
  youtubeChannelUrl: profile.youtubeChannelUrl,
  addressLine1: profile.addressLine1,
  addressLine2: profile.addressLine2,
  city: profile.city,
  state: profile.state,
  postalCode: profile.postalCode,
  country: profile.country
});

export const toPersonInput = (person: PersonProfile): PersonInput => ({
  firstName: person.firstName,
  lastName: person.lastName,
  email: person.email,
  phone: person.phone,
  birthDate: person.birthDate,
  status: person.status,
  guardianPersonIds: person.guardianPersonIds || [],
  notes: person.notes
});

export const toGroupInput = (group: GroupProfile): GroupInput => ({
  name: group.name,
  type: group.type,
  description: group.description,
  leaderPersonId: group.leaderPersonId,
  memberPersonIds: group.memberPersonIds
});

export const toAttendanceInput = (record: AttendanceRecord): AttendanceInput => ({
  date: record.date,
  type: record.type,
  eventId: record.eventId,
  groupId: record.groupId,
  presentPersonIds: record.presentPersonIds,
  notes: record.notes
});

export const toEventInput = (event: ChurchEvent): ChurchEventInput => ({
  title: event.title,
  type: event.type,
  date: event.date,
  startTime: event.startTime,
  endTime: event.endTime,
  location: event.location,
  groupId: event.groupId,
  recurrence: event.recurrence,
  recurrenceUntil: event.recurrenceUntil,
  recurrenceRule: event.recurrenceRule,
  registrationEnabled: event.registrationEnabled,
  registrationCapacity: event.registrationCapacity,
  registrationPrice: event.registrationPrice,
  registrationCurrency: event.registrationCurrency,
  registrationSlug: event.registrationSlug,
  description: event.description
});

export const toServingPlanInput = (plan: ServingPlan): ServingPlanInput => ({
  date: plan.date,
  title: plan.title,
  groupId: plan.groupId,
  notes: plan.notes,
  assignments: plan.assignments
});

export const toFinancialTransactionInput = (transaction: FinancialTransaction): FinancialTransactionInput => ({
  date: transaction.date,
  type: transaction.type,
  amount: transaction.amount,
  fund: transaction.fund,
  category: transaction.category,
  paymentMethod: transaction.paymentMethod,
  personId: transaction.personId,
  description: transaction.description
});
