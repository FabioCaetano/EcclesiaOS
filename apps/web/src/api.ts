import type { AttendanceInput, AttendanceRecord, AuditLogEntry, AuthSession, ChildCheckIn, ChildCheckInInput, ChildCheckOutRequest, ChurchEvent, ChurchEventInput, ChurchProfile, ChurchProfileUpdate, ChurchResource, ChurchResourceInput, CurrentUser, EventCheckIn, EventCheckInInput, EventRegistration, EventRegistrationCheckInRequest, EventRegistrationInput, EventRegistrationStatusUpdate, FinancialTransaction, FinancialTransactionInput, GroupInput, GroupProfile, LoginRequest, PersonInput, PersonProfile, RegisterRequest, RoomReservation, RoomReservationInput, ServingAssignmentStatusUpdate, ServingNotification, ServingPlan, ServingPlanInput, UserInput, YouTubeFeed, YouTubeFeedError } from "@ecclesiaos/shared";

export type YouTubeVideosResponse = YouTubeFeed | YouTubeFeedError;

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
export const sessionStorageKey = "ecclesiaos.session";

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

export const loadStoredSession = (): AuthSession | null => {
  const stored = window.localStorage.getItem(sessionStorageKey);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthSession;
  } catch {
    window.localStorage.removeItem(sessionStorageKey);
    return null;
  }
};

export const saveSession = (session: AuthSession) => {
  window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
};

export const clearSession = () => {
  window.localStorage.removeItem(sessionStorageKey);
};

export const login = async (request: LoginRequest): Promise<AuthSession> => {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });

  if (!response.ok) throw new Error("invalid-login");
  return response.json() as Promise<AuthSession>;
};

export const register = async (request: RegisterRequest): Promise<AuthSession> => {
  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });

  if (!response.ok) throw new Error(response.status === 409 ? "duplicate-register" : "invalid-register");
  return response.json() as Promise<AuthSession>;
};

export const loadCurrentUser = async (token: string): Promise<CurrentUser> => {
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("invalid-session");
  return response.json() as Promise<CurrentUser>;
};

export const loadUsers = async (token: string): Promise<CurrentUser[]> => {
  const response = await fetch(`${apiBaseUrl}/users`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("users-load-failed");
  return response.json() as Promise<CurrentUser[]>;
};

export const loadAuditLogs = async (token: string): Promise<AuditLogEntry[]> => {
  const response = await fetch(`${apiBaseUrl}/audit-logs`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("audit-logs-load-failed");
  return response.json() as Promise<AuditLogEntry[]>;
};

export const saveUser = async (token: string, input: UserInput, id?: string): Promise<CurrentUser> => {
  const response = await fetch(id ? `${apiBaseUrl}/users/${id}` : `${apiBaseUrl}/users`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("user-save-failed");
  return response.json() as Promise<CurrentUser>;
};

export const deleteUser = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("user-delete-failed");
};

export const loadChurchProfile = async (token: string): Promise<ChurchProfile> => {
  const response = await fetch(`${apiBaseUrl}/church/profile`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("church-load-failed");
  return response.json() as Promise<ChurchProfile>;
};

export const loadYouTubeVideos = async (token: string): Promise<YouTubeVideosResponse> => {
  const response = await fetch(`${apiBaseUrl}/youtube/videos`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("youtube-load-failed");
  return response.json() as Promise<YouTubeVideosResponse>;
};

export const updateChurchProfile = async (token: string, profile: ChurchProfileUpdate): Promise<ChurchProfile> => {
  const response = await fetch(`${apiBaseUrl}/church/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(profile)
  });

  if (!response.ok) throw new Error("church-save-failed");
  return response.json() as Promise<ChurchProfile>;
};

export const loadPeople = async (token: string): Promise<PersonProfile[]> => {
  const response = await fetch(`${apiBaseUrl}/people`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("people-load-failed");
  return response.json() as Promise<PersonProfile[]>;
};

export const savePerson = async (token: string, input: PersonInput, id?: string): Promise<PersonProfile> => {
  const response = await fetch(id ? `${apiBaseUrl}/people/${id}` : `${apiBaseUrl}/people`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("person-save-failed");
  return response.json() as Promise<PersonProfile>;
};

export const deletePerson = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/people/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("person-delete-failed");
};

export const loadGroups = async (token: string): Promise<GroupProfile[]> => {
  const response = await fetch(`${apiBaseUrl}/groups`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("groups-load-failed");
  return response.json() as Promise<GroupProfile[]>;
};

export const saveGroup = async (token: string, input: GroupInput, id?: string): Promise<GroupProfile> => {
  const response = await fetch(id ? `${apiBaseUrl}/groups/${id}` : `${apiBaseUrl}/groups`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("group-save-failed");
  return response.json() as Promise<GroupProfile>;
};

export const deleteGroup = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/groups/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("group-delete-failed");
};

export const loadAttendance = async (token: string): Promise<AttendanceRecord[]> => {
  const response = await fetch(`${apiBaseUrl}/attendance`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("attendance-load-failed");
  return response.json() as Promise<AttendanceRecord[]>;
};

export const saveAttendance = async (token: string, input: AttendanceInput, id?: string): Promise<AttendanceRecord> => {
  const response = await fetch(id ? `${apiBaseUrl}/attendance/${id}` : `${apiBaseUrl}/attendance`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("attendance-save-failed");
  return response.json() as Promise<AttendanceRecord>;
};

export const deleteAttendance = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/attendance/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("attendance-delete-failed");
};

export const loadEvents = async (token: string): Promise<ChurchEvent[]> => {
  const response = await fetch(`${apiBaseUrl}/events`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("events-load-failed");
  return response.json() as Promise<ChurchEvent[]>;
};

export const saveEvent = async (token: string, input: ChurchEventInput, id?: string): Promise<ChurchEvent> => {
  const response = await fetch(id ? `${apiBaseUrl}/events/${id}` : `${apiBaseUrl}/events`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("event-save-failed");
  return response.json() as Promise<ChurchEvent>;
};

export const deleteEvent = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/events/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("event-delete-failed");
};

export const loadEventRegistrations = async (token: string): Promise<EventRegistration[]> => {
  const response = await fetch(`${apiBaseUrl}/event-registrations`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("event-registrations-load-failed");
  return response.json() as Promise<EventRegistration[]>;
};

export const updateEventRegistrationStatus = async (token: string, id: string, input: EventRegistrationStatusUpdate): Promise<EventRegistration> => {
  const response = await fetch(`${apiBaseUrl}/event-registrations/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("event-registration-status-update-failed");
  return response.json() as Promise<EventRegistration>;
};

export const checkInEventRegistration = async (token: string, id: string, input: EventRegistrationCheckInRequest): Promise<EventRegistration> => {
  const response = await fetch(`${apiBaseUrl}/event-registrations/${id}/checkin`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("event-registration-checkin-failed");
  return response.json() as Promise<EventRegistration>;
};

export const loadResources = async (token: string): Promise<ChurchResource[]> => {
  const response = await fetch(`${apiBaseUrl}/resources`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("resources-load-failed");
  return response.json() as Promise<ChurchResource[]>;
};

export const saveResource = async (token: string, input: ChurchResourceInput, id?: string): Promise<ChurchResource> => {
  const response = await fetch(id ? `${apiBaseUrl}/resources/${id}` : `${apiBaseUrl}/resources`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("resource-save-failed");
  return response.json() as Promise<ChurchResource>;
};

export const deleteResource = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/resources/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("resource-delete-failed");
};

export const loadRoomReservations = async (token: string): Promise<RoomReservation[]> => {
  const response = await fetch(`${apiBaseUrl}/room-reservations`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("room-reservations-load-failed");
  return response.json() as Promise<RoomReservation[]>;
};

export const saveRoomReservation = async (token: string, input: RoomReservationInput, id?: string): Promise<RoomReservation> => {
  const response = await fetch(id ? `${apiBaseUrl}/room-reservations/${id}` : `${apiBaseUrl}/room-reservations`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error(response.status === 409 ? "room-reservation-conflict" : "room-reservation-save-failed");
  return response.json() as Promise<RoomReservation>;
};

export const deleteRoomReservation = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/room-reservations/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("room-reservation-delete-failed");
};

export const loadPublicEvent = async (slug: string): Promise<{ event: ChurchEvent; reservedQuantity: number; availableQuantity: number | null }> => {
  const response = await fetch(`${apiBaseUrl}/public/events/${slug}`);

  if (!response.ok) throw new Error("public-event-load-failed");
  return response.json() as Promise<{ event: ChurchEvent; reservedQuantity: number; availableQuantity: number | null }>;
};

export const registerForPublicEvent = async (slug: string, input: EventRegistrationInput): Promise<EventRegistration> => {
  const response = await fetch(`${apiBaseUrl}/public/events/${slug}/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("public-registration-failed");
  return response.json() as Promise<EventRegistration>;
};

export const loadEventCheckIns = async (token: string): Promise<EventCheckIn[]> => {
  const response = await fetch(`${apiBaseUrl}/event-checkins`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("event-checkins-load-failed");
  return response.json() as Promise<EventCheckIn[]>;
};

export const saveEventCheckIn = async (token: string, input: EventCheckInInput): Promise<EventCheckIn> => {
  const response = await fetch(`${apiBaseUrl}/event-checkins`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("event-checkin-save-failed");
  return response.json() as Promise<EventCheckIn>;
};

export const deleteEventCheckIn = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/event-checkins/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("event-checkin-delete-failed");
};

export const loadChildCheckIns = async (token: string): Promise<ChildCheckIn[]> => {
  const response = await fetch(`${apiBaseUrl}/child-checkins`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("child-checkins-load-failed");
  return response.json() as Promise<ChildCheckIn[]>;
};

export const saveChildCheckIn = async (token: string, input: ChildCheckInInput): Promise<ChildCheckIn> => {
  const response = await fetch(`${apiBaseUrl}/child-checkins`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("child-checkin-save-failed");
  return response.json() as Promise<ChildCheckIn>;
};

export const checkOutChild = async (token: string, id: string, input?: ChildCheckOutRequest): Promise<ChildCheckIn> => {
  const response = await fetch(`${apiBaseUrl}/child-checkins/${id}/checkout`, {
    method: "PATCH",
    headers: input ? { "Content-Type": "application/json", ...authHeaders(token) } : authHeaders(token),
    body: input ? JSON.stringify(input) : undefined
  });

  if (!response.ok) throw new Error("child-checkout-failed");
  return response.json() as Promise<ChildCheckIn>;
};

export const loadServingPlans = async (token: string): Promise<ServingPlan[]> => {
  const response = await fetch(`${apiBaseUrl}/serving-plans`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("serving-plans-load-failed");
  return response.json() as Promise<ServingPlan[]>;
};

export const saveServingPlan = async (token: string, input: ServingPlanInput, id?: string): Promise<ServingPlan> => {
  const response = await fetch(id ? `${apiBaseUrl}/serving-plans/${id}` : `${apiBaseUrl}/serving-plans`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("serving-plan-save-failed");
  return response.json() as Promise<ServingPlan>;
};

export const deleteServingPlan = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/serving-plans/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("serving-plan-delete-failed");
};

export const updateServingAssignmentStatus = async (token: string, planId: string, assignmentId: string, input: ServingAssignmentStatusUpdate): Promise<ServingPlan> => {
  const response = await fetch(`${apiBaseUrl}/serving-plans/${planId}/assignments/${assignmentId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("serving-assignment-status-update-failed");
  return response.json() as Promise<ServingPlan>;
};

export const loadServingNotifications = async (token: string): Promise<ServingNotification[]> => {
  const response = await fetch(`${apiBaseUrl}/serving-notifications`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("serving-notifications-load-failed");
  return response.json() as Promise<ServingNotification[]>;
};

export const loadFinancialTransactions = async (token: string): Promise<FinancialTransaction[]> => {
  const response = await fetch(`${apiBaseUrl}/financial-transactions`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("financial-transactions-load-failed");
  return response.json() as Promise<FinancialTransaction[]>;
};

export const saveFinancialTransaction = async (token: string, input: FinancialTransactionInput, id?: string): Promise<FinancialTransaction> => {
  const response = await fetch(id ? `${apiBaseUrl}/financial-transactions/${id}` : `${apiBaseUrl}/financial-transactions`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("financial-transaction-save-failed");
  return response.json() as Promise<FinancialTransaction>;
};

export const deleteFinancialTransaction = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/financial-transactions/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("financial-transaction-delete-failed");
};
