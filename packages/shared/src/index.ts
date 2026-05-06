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

export type AppModuleKey = "home" | "church" | "people" | "groups" | "attendance" | "events" | "checkin" | "resources" | "calendar" | "serving" | "finance" | "users" | "audit" | "account" | "messages";

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

export type PermissionAction = "view" | "manage";

const adminOnlyModules: AppModuleKey[] = ["finance", "users", "audit"];

export const canAccessModule = (role: UserRole, module: AppModuleKey) => !adminOnlyModules.includes(module) || role === "admin";

export const canManageModule = (role: UserRole, module: AppModuleKey) => {
  if (module === "checkin") return role === "admin" || role === "leader";
  if (module === "messages") return role === "admin" || role === "leader";
  if (module === "serving") return role === "admin";
  return role === "admin";
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
}

export type ChurchProfileUpdate = Omit<ChurchProfile, "id">;

export type PersonStatus = "member" | "visitor";

export interface PersonProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  status: PersonStatus;
  guardianPersonIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type PersonInput = Omit<PersonProfile, "id" | "createdAt" | "updatedAt">;

export type GroupType = "small_group" | "ministry" | "class" | "team";

export interface GroupProfile {
  id: string;
  name: string;
  type: GroupType;
  description: string;
  leaderPersonId: string;
  memberPersonIds: string[];
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
  registrationEnabled: boolean;
  registrationCapacity: number;
  registrationPrice: number;
  registrationCurrency: string;
  registrationSlug: string;
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

export type EventRegistrationStatus = "confirmed" | "pending_payment" | "cancelled";

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
  createdAt: string;
}

export type EventRegistrationInput = Pick<EventRegistration, "name" | "email" | "phone" | "quantity" | "notes">;

export interface EventRegistrationStatusUpdate {
  status: EventRegistrationStatus;
}

export interface EventRegistrationCheckInRequest {
  ticketCode: string;
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
  { key: "finance", name: "Financeiro", phase: "Fase 8", status: "planned" },
  { key: "users", name: "Usuarios e permissoes", phase: "Fase 22", status: "active" },
  { key: "audit", name: "Auditoria", phase: "Fase 40", status: "active" }
];
