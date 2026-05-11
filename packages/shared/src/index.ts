export interface HealthResponse {
  status: "ok";
  app: "EcclesiaOS";
  version: string;
  timestamp: string;
}

export type UserRole = "admin" | "leader" | "member";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  personId: string;
}

export type UserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  personId: string;
};

export type AppModuleKey = "home" | "church" | "people" | "groups" | "attendance" | "events" | "checkin" | "resources" | "calendar" | "serving" | "serviceOps" | "music" | "liturgy" | "forms" | "finance" | "reports" | "users" | "audit" | "account" | "messages";

export type MessageChannel = "email" | "whatsapp" | "manual";

export interface PeopleMessage {
  id: string;
  subject: string;
  body: string;
  channel: MessageChannel;
  recipientPersonIds: string[];
  createdAt: string;
  createdByUserId: string;
  createdByName: string;
}

export type PeopleMessageInput = Pick<PeopleMessage, "subject" | "body" | "channel" | "recipientPersonIds">;

export interface PeopleMessageDelivery {
  sent: number;
  skipped: number;
  failed: number;
  reason?: "not_configured" | "manual_channel" | "no_recipients_with_email";
}

export interface PeopleMessageResponse {
  message: PeopleMessage;
  delivery: PeopleMessageDelivery;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: MessageChannel;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageTemplateInput = Pick<MessageTemplate, "name" | "channel" | "subject" | "body">;

export interface MessageVariableContext {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  churchName: string;
}

export const messageVariableKeys = ["firstName", "lastName", "fullName", "email", "phone", "churchName"] as const;
export type MessageVariableKey = typeof messageVariableKeys[number];

export const substituteMessageVariables = (text: string, context: MessageVariableContext): string => {
  if (!text) return text;
  const fullName = `${context.firstName} ${context.lastName}`.trim();
  const replacements: Record<MessageVariableKey, string> = {
    firstName: context.firstName,
    lastName: context.lastName,
    fullName,
    email: context.email,
    phone: context.phone,
    churchName: context.churchName
  };
  return text.replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (match, key: string) => {
    const replacement = replacements[key as MessageVariableKey];
    return replacement === undefined ? match : replacement;
  });
};

export interface EmailStatus {
  configured: boolean;
}

export interface PersonBlockOut {
  id: string;
  personId: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
  createdByUserId: string;
}

export type PersonBlockOutInput = Pick<PersonBlockOut, "personId" | "startDate" | "endDate" | "reason">;

export interface SubstituteSuggestion {
  personId: string;
  name: string;
  recentLoad: number;
  hasBlockOut: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  userId: string;
  email: string;
  temporaryPassword: string;
}

export interface RequestPasswordResetInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface PasswordResetGenericResponse {
  ok: true;
  message: string;
}

export interface VisitorRegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

export interface VisitorRegistrationResponse {
  ok: true;
  message: string;
}

export type PermissionAction = "view" | "manage";

const adminOnlyModules: AppModuleKey[] = ["finance", "reports", "users", "audit"];

export const canAccessModule = (role: UserRole, module: AppModuleKey) => {
  if (adminOnlyModules.includes(module)) return role === "admin";
  if (module === "people") return role === "admin" || role === "leader";
  if (module === "resources") return role === "admin" || role === "leader";
  if (module === "serviceOps") return role === "admin" || role === "leader";
  if (module === "messages") return role === "admin" || role === "leader";
  if (module === "music") return role === "admin" || role === "leader";
  return true;
};

export const canManageModule = (role: UserRole, module: AppModuleKey) => {
  if (module === "checkin") return role === "admin" || role === "leader";
  if (module === "messages") return role === "admin" || role === "leader";
  if (module === "music") return role === "admin" || role === "leader";
  if (module === "liturgy") return role === "admin" || role === "leader";
  if (module === "serviceOps") return role === "admin" || role === "leader";
  if (module === "forms") return role === "admin" || role === "leader";
  if (module === "serving") return role === "admin";
  return role === "admin";
};

export interface EventResponsibilityActor {
  role: UserRole;
  personId?: string;
}

export interface EventResponsibilityTarget {
  groupId: string;
  requestedTeamIds: string[];
}

export interface EventResponsibilityGroup {
  id: string;
  leaderPersonId: string;
}

const leadsGroup = (personId: string, groupId: string, groups: EventResponsibilityGroup[]): boolean => {
  if (!groupId || !personId) return false;
  const group = groups.find((entry) => entry.id === groupId);
  return Boolean(group && group.leaderPersonId === personId);
};

export const isUserResponsibleForEvent = (
  user: EventResponsibilityActor,
  event: EventResponsibilityTarget,
  groups: EventResponsibilityGroup[]
): boolean => {
  if (!user.personId) return false;
  if (event.groupId && leadsGroup(user.personId, event.groupId, groups)) return true;
  return event.requestedTeamIds.some((teamId) => leadsGroup(user.personId as string, teamId, groups));
};

export const canEditEvent = (
  user: EventResponsibilityActor,
  event: EventResponsibilityTarget,
  groups: EventResponsibilityGroup[]
): boolean => {
  if (user.role === "admin") return true;
  if (user.role !== "leader") return false;
  return isUserResponsibleForEvent(user, event, groups);
};

export const canCreateEventDraft = (
  user: EventResponsibilityActor,
  draft: EventResponsibilityTarget,
  groups: EventResponsibilityGroup[]
): boolean => {
  if (user.role === "admin") return true;
  if (user.role !== "leader") return false;
  return isUserResponsibleForEvent(user, draft, groups);
};

export const leadsAnyGroup = (
  user: EventResponsibilityActor,
  groups: EventResponsibilityGroup[]
): boolean => {
  if (!user.personId) return false;
  return groups.some((group) => group.leaderPersonId === user.personId);
};

export type AuditAction = "create" | "update" | "delete";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  actorUserId: string;
  actorName: string;
  summary: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  status: PersonStatus;
}

export interface AuthSession {
  token: string;
  user: CurrentUser;
}

export interface AuthErrorResponse {
  error: "invalid_credentials" | "unauthorized" | "forbidden" | "invalid_json" | "not_found" | "conflict";
  message: string;
}

export interface ChurchProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  youtubeChannelUrl: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  logoDataUrl: string;
}

export type ChurchProfileUpdate = Omit<ChurchProfile, "id">;

export interface PublicChurchInfo {
  name: string;
  logoDataUrl: string;
}

export const ALLOWED_LOGO_MIME = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"] as const;
export const MAX_LOGO_DATA_URL_BYTES = 100 * 1024;

export type AllowedLogoMime = typeof ALLOWED_LOGO_MIME[number];

const LOGO_DATA_URL_RE = /^data:(image\/(?:png|jpeg|svg\+xml|webp));base64,([A-Za-z0-9+/=]+)$/;

export const validateLogoDataUrl = (value: string): { ok: true } | { ok: false; reason: "empty" | "format" | "mime" | "size" } => {
  if (!value) return { ok: true };
  const match = LOGO_DATA_URL_RE.exec(value);
  if (!match) return { ok: false, reason: "format" };
  if (!ALLOWED_LOGO_MIME.includes(match[1] as AllowedLogoMime)) return { ok: false, reason: "mime" };
  if (value.length > MAX_LOGO_DATA_URL_BYTES) return { ok: false, reason: "size" };
  return { ok: true };
};

export type PersonStatus = "member" | "visitor";
export type PersonGender = "female" | "male" | "unspecified";

export interface PersonProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  membershipDate: string;
  address: string;
  baptized: boolean;
  gender: PersonGender;
  status: PersonStatus;
  guardianPersonIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type PersonInput = Omit<PersonProfile, "id" | "createdAt" | "updatedAt">;

export interface GuardianChildInput {
  firstName: string;
  lastName: string;
  birthDate: string;
  allergies: string;
  medicalNotes: string;
  pickupNotes: string;
  notes: string;
}

export type GroupType = "small_group" | "ministry" | "class" | "team";

export interface GroupProfile {
  id: string;
  name: string;
  type: GroupType;
  description: string;
  leaderPersonId: string;
  memberPersonIds: string[];
  servicePositions: string[];
  memberServicePositions: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
}

export type GroupInput = Omit<GroupProfile, "id" | "createdAt" | "updatedAt">;

export type AttendanceType = "service" | "group";

export interface AttendanceRecord {
  id: string;
  date: string;
  type: AttendanceType;
  eventId: string;
  groupId: string;
  presentPersonIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceInput = Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt">;

export interface EventCheckIn {
  id: string;
  eventId: string;
  personId: string;
  checkedInAt: string;
  notes: string;
}

export type EventCheckInInput = Omit<EventCheckIn, "id" | "checkedInAt">;

export interface ChildCheckIn {
  id: string;
  eventId: string;
  childPersonId: string;
  childName: string;
  guardianPersonId: string;
  guardianName: string;
  guardianPhone: string;
  securityCode: string;
  checkedInAt: string;
  checkedOutAt: string;
  checkedOutByPersonId: string;
  notes: string;
}

export type ChildCheckInInput = Omit<ChildCheckIn, "id" | "securityCode" | "checkedInAt" | "checkedOutAt" | "checkedOutByPersonId">;

export interface ChildCheckOutRequest {
  securityCode: string;
}

export interface KidsRoom {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  capacity: number;
  responsiblePersonIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type KidsRoomInput = Omit<KidsRoom, "id" | "createdAt" | "updatedAt">;

export type EventType = "service" | "meeting" | "class" | "outreach" | "other";
export type EventRecurrence = "none" | "weekly" | "monthly" | "cron";

export interface ChurchEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  groupId: string;
  recurrence: EventRecurrence;
  recurrenceUntil: string;
  recurrenceRule: string;
  parentEventId: string;
  requestedTeamIds: string[];
  operatorPersonIds: string[];
  registrationEnabled: boolean;
  registrationCapacity: number;
  registrationPrice: number;
  registrationCurrency: string;
  registrationSlug: string;
  registrationRequiresEmailConfirmation: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type ChurchEventInput = Omit<ChurchEvent, "id" | "createdAt" | "updatedAt">;

export interface CronGenerationResult {
  generated: number;
  skipped: number;
  total: number;
}

export type EventRegistrationStatus = "confirmed" | "pending_payment" | "pending_email_confirmation" | "cancelled";

export interface EventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  quantity: number;
  amountDue: number;
  status: EventRegistrationStatus;
  ticketCode: string;
  checkedInAt: string;
  checkedInByUserId: string;
  notes: string;
  emailConfirmationTokenHash: string;
  emailConfirmationExpiresAt: string;
  createdAt: string;
}

export type EventRegistrationInput = Pick<EventRegistration, "name" | "email" | "phone" | "quantity" | "notes">;

export interface EventRegistrationStatusUpdate {
  status: EventRegistrationStatus;
}

export interface EventRegistrationCheckInRequest {
  ticketCode: string;
}

export interface EventRegistrationSelfCheckInRequest {
  ticketPayload: string;
  eventSlug: string;
}

export interface EventRegistrationConfirmInput {
  token: string;
}

export interface EventRegistrationConfirmResponse {
  ok: boolean;
  status: EventRegistrationStatus;
}

export interface EventRegistrationResendConfirmationResponse {
  ok: boolean;
  status: EventRegistrationStatus;
  emailSent: boolean;
  expiresAt: string;
}

export interface ChurchResource {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ChurchResourceInput = Omit<ChurchResource, "id" | "createdAt" | "updatedAt">;

export type RoomReservationStatus = "confirmed" | "cancelled";

export interface RoomReservation {
  id: string;
  resourceId: string;
  eventId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  reservedBy: string;
  status: RoomReservationStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type RoomReservationInput = Omit<RoomReservation, "id" | "createdAt" | "updatedAt">;

export type ServingAssignmentStatus = "pending" | "confirmed" | "declined";

export interface ServingAssignment {
  id: string;
  personId: string;
  role: string;
  status: ServingAssignmentStatus;
  notes: string;
  reminderSentAt: string;
}

export interface ServingPlan {
  id: string;
  date: string;
  title: string;
  groupId: string;
  eventId: string;
  notes: string;
  assignments: ServingAssignment[];
  createdAt: string;
  updatedAt: string;
}

export type ServingPlanInput = Omit<ServingPlan, "id" | "createdAt" | "updatedAt">;

export interface ServingAssignmentStatusUpdate {
  status: ServingAssignmentStatus;
  notes: string;
}

export interface ServingAssignmentStatusResponse extends ServingPlan {
  substituteSuggestions: SubstituteSuggestion[];
  substituteEmailSent: boolean;
}

export interface ServingSubstituteApplyInput {
  personId: string;
  notes: string;
}

export interface ServingSubstituteApplyResponse extends ServingPlan {
  substituteEmailSent: boolean;
}

export interface ServingNotification {
  id: string;
  planId: string;
  assignmentId: string;
  personId: string;
  title: string;
  message: string;
  status: ServingAssignmentStatus;
  date: string;
}

export type NotificationKind = "serving_pending" | "serving_declined" | "event_upcoming" | "registration_email_pending";

export interface NotificationLink {
  module: AppModuleKey;
  entityId?: string;
}

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  link: NotificationLink;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  defaultKey: string;
  bpm: number;
  theme: string;
  lyrics: string;
  chords: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type SongInput = Omit<Song, "id" | "createdAt" | "updatedAt">;

export interface WorshipSetItem {
  songId: string;
  key: string;
  notes: string;
  order: number;
}

export interface WorshipSet {
  id: string;
  eventId: string;
  title: string;
  date: string;
  notes: string;
  items: WorshipSetItem[];
  createdAt: string;
  updatedAt: string;
}

export type WorshipSetInput = Omit<WorshipSet, "id" | "createdAt" | "updatedAt">;

export interface ServiceChecklistItem {
  id: string;
  title: string;
  responsiblePersonId: string;
  scheduledTime: string;
  notes: string;
  completed: boolean;
  order: number;
}

export interface ServiceChecklist {
  id: string;
  eventId: string;
  title: string;
  date: string;
  notes: string;
  items: ServiceChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export type ServiceChecklistInput = Omit<ServiceChecklist, "id" | "createdAt" | "updatedAt">;

export type CustomFormFieldType = "text" | "textarea" | "email" | "phone" | "number" | "date" | "select" | "checkbox";

export interface CustomFormField {
  id: string;
  label: string;
  type: CustomFormFieldType;
  required: boolean;
  options: string[];
  order: number;
}

export interface CustomForm {
  id: string;
  title: string;
  description: string;
  slug: string;
  responsiblePersonIds: string[];
  fields: CustomFormField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomFormInput = Omit<CustomForm, "id" | "createdAt" | "updatedAt">;

export interface CustomFormResponse {
  id: string;
  formId: string;
  answers: Record<string, string>;
  submittedAt: string;
}

export interface CustomFormSubmissionInput {
  answers: Record<string, string>;
}

export type FinancialTransactionType = "income" | "expense";

export type FinancialPaymentMethod = "cash" | "card" | "transfer" | "check" | "other";

export interface FinancialTransaction {
  id: string;
  date: string;
  type: FinancialTransactionType;
  amount: number;
  fund: string;
  category: string;
  paymentMethod: FinancialPaymentMethod;
  personId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type FinancialTransactionInput = Omit<FinancialTransaction, "id" | "createdAt" | "updatedAt">;

export type LabelLayout = "kids_checkin" | "visitor";

export interface LabelTemplate {
  id: string;
  name: string;
  printerModel: string;
  widthMm: number;
  heightMm: number;
  isContinuous: boolean;
  layout: LabelLayout;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LabelTemplateInput = Omit<LabelTemplate, "id" | "createdAt" | "updatedAt">;

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export interface YouTubeFeed {
  channelId: string;
  channelTitle: string;
  channelUrl: string;
  videos: YouTubeVideo[];
}

export interface YouTubeFeedError {
  error: "missing_channel_url" | "invalid_channel_url" | "channel_not_found" | "feed_unavailable";
  message: string;
}

export interface AppModuleSummary {
  key: string;
  name: string;
  phase: string;
  status: "planned" | "active" | "deferred";
}

export const plannedModules: AppModuleSummary[] = [
  { key: "auth", name: "Autenticacao e usuarios", phase: "Fase 2", status: "planned" },
  { key: "church", name: "Dados da igreja", phase: "Fase 3", status: "planned" },
  { key: "people", name: "Pessoas", phase: "Fase 4", status: "planned" },
  { key: "groups", name: "Grupos e ministerios", phase: "Fase 5", status: "planned" },
  { key: "attendance", name: "Presenca", phase: "Fase 6", status: "planned" },
  { key: "events", name: "Agenda e eventos", phase: "Fase 25", status: "active" },
  { key: "checkin", name: "Check-in", phase: "Fase 27", status: "active" },
  { key: "resources", name: "Ambientes", phase: "Fase 29", status: "active" },
  { key: "calendar", name: "Calendario da igreja", phase: "Fase 30", status: "active" },
  { key: "serving", name: "Escalas e cultos", phase: "Fase 7", status: "planned" },
  { key: "serviceOps", name: "Operacao do culto", phase: "Fase 82", status: "active" },
  { key: "music", name: "Musicas e repertorio", phase: "Fase 76", status: "active" },
  { key: "liturgy", name: "Liturgia e checklist", phase: "Fase 77", status: "active" },
  { key: "forms", name: "Formularios", phase: "Fase 79", status: "active" },
  { key: "finance", name: "Financeiro", phase: "Fase 8", status: "planned" },
  { key: "reports", name: "Relatorios", phase: "Fase 75", status: "active" },
  { key: "users", name: "Usuarios e permissoes", phase: "Fase 22", status: "active" },
  { key: "audit", name: "Auditoria", phase: "Fase 40", status: "active" }
];
