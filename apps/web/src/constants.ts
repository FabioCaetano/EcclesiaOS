import type { AttendanceInput, ChurchEventInput, ChurchResourceInput, EventRecurrence, EventType, FinancialPaymentMethod, FinancialTransactionInput, FinancialTransactionType, GroupInput, LoginRequest, PersonInput, RegisterRequest, RoomReservationInput, ServingPlanInput, UserInput, UserRole } from "@ecclesiaos/shared";

export const principles = [
  "Uma igreja especifica primeiro",
  "APIs proprias desde o inicio",
  "Fases pequenas e documentadas",
  "Sem multi-campus ate existir decisao explicita"
];

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  leader: "Lider",
  member: "Membro"
};

export const demoAccounts: Array<LoginRequest & { label: string }> = [
  { label: "Admin", email: "admin@ecclesiaos.local", password: "admin123" },
  { label: "Lider", email: "lider@ecclesiaos.local", password: "lider123" },
  { label: "Membro", email: "membro@ecclesiaos.local", password: "membro123" }
];

export const emptyRegisterRequest: RegisterRequest = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  status: "member"
};

export const emptyPersonInput: PersonInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  status: "member",
  guardianPersonIds: [],
  notes: ""
};

export const emptyUserInput: UserInput = {
  name: "",
  email: "",
  password: "",
  role: "member",
  personId: ""
};

export const groupTypeLabels: Record<GroupInput["type"], string> = {
  small_group: "Grupo pequeno",
  ministry: "Ministerio",
  class: "Classe",
  team: "Equipe"
};

export const emptyGroupInput: GroupInput = {
  name: "",
  type: "small_group",
  description: "",
  leaderPersonId: "",
  memberPersonIds: []
};

export const attendanceTypeLabels: Record<AttendanceInput["type"], string> = {
  service: "Culto geral",
  group: "Grupo"
};

export const eventTypeLabels: Record<EventType, string> = {
  service: "Culto",
  meeting: "Reuniao",
  class: "Classe",
  outreach: "Acao externa",
  other: "Outro"
};

export const recurrenceLabels: Record<EventRecurrence, string> = {
  none: "Nao repetir",
  weekly: "Semanal",
  monthly: "Mensal",
  cron: "Expressao cron"
};

export const emptyEventInput: ChurchEventInput = {
  title: "",
  type: "service",
  date: new Date().toISOString().slice(0, 10),
  startTime: "10:00",
  endTime: "",
  location: "",
  groupId: "",
  recurrence: "none",
  recurrenceUntil: "",
  recurrenceRule: "",
  registrationEnabled: false,
  registrationCapacity: 0,
  registrationPrice: 0,
  registrationCurrency: "BRL",
  registrationSlug: "",
  description: ""
};

export const emptyAttendanceInput: AttendanceInput = {
  date: new Date().toISOString().slice(0, 10),
  type: "service",
  eventId: "",
  groupId: "",
  presentPersonIds: [],
  notes: ""
};

export const emptyResourceInput: ChurchResourceInput = {
  name: "",
  location: "",
  capacity: 0,
  description: "",
  isActive: true
};

export const emptyRoomReservationInput: RoomReservationInput = {
  resourceId: "",
  eventId: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  startTime: "09:00",
  endTime: "10:00",
  reservedBy: "",
  status: "confirmed",
  notes: ""
};

export const roomReservationStatusLabels: Record<RoomReservationInput["status"], string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada"
};

export const emptyServingPlanInput: ServingPlanInput = {
  date: new Date().toISOString().slice(0, 10),
  title: "",
  groupId: "",
  notes: "",
  assignments: []
};

export const financialTypeLabels: Record<FinancialTransactionType, string> = {
  income: "Receita",
  expense: "Despesa"
};

export const paymentMethodLabels: Record<FinancialPaymentMethod, string> = {
  cash: "Dinheiro",
  card: "Cartao",
  transfer: "Transferencia",
  check: "Cheque",
  other: "Outro"
};

export const emptyFinancialTransactionInput: FinancialTransactionInput = {
  date: new Date().toISOString().slice(0, 10),
  type: "income",
  amount: 0,
  fund: "Geral",
  category: "",
  paymentMethod: "cash",
  personId: "",
  description: ""
};
