import type { AttendanceInput, AttendanceRecord, AuditLogEntry, AuthErrorResponse, AuthSession, ChangePasswordRequest, ChildCheckIn, ChildCheckInInput, ChildCheckOutRequest, ChurchEvent, ChurchEventInput, ChurchProfile, ChurchProfileUpdate, ChurchResource, ChurchResourceInput, CronGenerationResult, CurrentUser, CustomForm, CustomFormInput, CustomFormResponse, CustomFormSubmissionInput, EmailStatus, EventCheckIn, EventCheckInInput, EventRegistration, EventRegistrationCheckInRequest, EventRegistrationConfirmResponse, EventRegistrationInput, EventRegistrationResendConfirmationResponse, EventRegistrationSelfCheckInRequest, EventRegistrationStatusUpdate, FinancialTransaction, FinancialTransactionInput, GroupInput, GroupProfile, GuardianChildInput, KidsRoom, KidsRoomInput, LabelLayout, LabelTemplate, LabelTemplateInput, LoginRequest, MessageTemplate, MessageTemplateInput, PeopleMessage, PeopleMessageInput, PeopleMessageResponse, PersonBlockOut, PersonBlockOutInput, PersonInput, PersonProfile, RegisterRequest, ResetPasswordResponse, RoomReservation, RoomReservationInput, ServiceChecklist, ServiceChecklistInput, ServingAssignmentStatusResponse, ServingAssignmentStatusUpdate, ServingNotification, ServingPlan, ServingPlanInput, ServingSubstituteApplyInput, ServingSubstituteApplyResponse, Song, SongInput, SubstituteSuggestion, UserInput, VisitorRegistrationInput, VisitorRegistrationResponse, WorshipSet, WorshipSetInput, YouTubeFeed, YouTubeFeedError } from "@ecclesiaos/shared";

export type YouTubeVideosResponse = YouTubeFeed | YouTubeFeedError;

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
export const sessionStorageKey = "ecclesiaos.session";

const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

const readApiErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const body = await response.json() as Partial<AuthErrorResponse>;
    return body.message || fallback;
  } catch {
    return fallback;
  }
};

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

export const changeOwnPassword = async (token: string, payload: ChangePasswordRequest): Promise<{ ok: boolean }> => {
  const response = await fetch(`${apiBaseUrl}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload)
  });

  if (response.status === 401) throw new Error("invalid-current-password");
  if (response.status === 400) throw new Error("invalid-new-password");
  if (!response.ok) throw new Error("change-password-failed");
  return response.json() as Promise<{ ok: boolean }>;
};

export const requestPasswordReset = async (email: string): Promise<{ ok: boolean; message: string }> => {
  const response = await fetch(`${apiBaseUrl}/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  if (!response.ok) throw new Error("request-reset-failed");
  return response.json() as Promise<{ ok: boolean; message: string }>;
};

export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<{ ok: boolean }> => {
  const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword })
  });

  if (!response.ok) {
    const text = await response.text();
    let message = "invalid-token";
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return response.json() as Promise<{ ok: boolean }>;
};

export const adminResetUserPassword = async (token: string, userId: string): Promise<ResetPasswordResponse> => {
  const response = await fetch(`${apiBaseUrl}/users/${userId}/reset-password`, {
    method: "POST",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("reset-password-failed");
  return response.json() as Promise<ResetPasswordResponse>;
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

export const loadLabelTemplates = async (token: string, layout?: LabelLayout): Promise<LabelTemplate[]> => {
  const url = layout ? `${apiBaseUrl}/label-templates?layout=${layout}` : `${apiBaseUrl}/label-templates`;
  const response = await fetch(url, { headers: authHeaders(token) });

  if (!response.ok) throw new Error("label-templates-load-failed");
  return response.json() as Promise<LabelTemplate[]>;
};

export const saveLabelTemplate = async (token: string, input: LabelTemplateInput, id?: string): Promise<LabelTemplate> => {
  const response = await fetch(id ? `${apiBaseUrl}/label-templates/${id}` : `${apiBaseUrl}/label-templates`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("label-template-save-failed");
  return response.json() as Promise<LabelTemplate>;
};

export const deleteLabelTemplate = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/label-templates/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("label-template-delete-failed");
};

export const loadKidsRooms = async (token: string): Promise<KidsRoom[]> => {
  const response = await fetch(`${apiBaseUrl}/kids-rooms`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("kids-rooms-load-failed");
  return response.json() as Promise<KidsRoom[]>;
};

export const saveKidsRoom = async (token: string, input: KidsRoomInput, id?: string): Promise<KidsRoom> => {
  const response = await fetch(id ? `${apiBaseUrl}/kids-rooms/${id}` : `${apiBaseUrl}/kids-rooms`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("kids-room-save-failed");
  return response.json() as Promise<KidsRoom>;
};

export const deleteKidsRoom = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/kids-rooms/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("kids-room-delete-failed");
};

export const loadBlockOuts = async (token: string, personId?: string): Promise<PersonBlockOut[]> => {
  const url = personId ? `${apiBaseUrl}/block-outs?personId=${encodeURIComponent(personId)}` : `${apiBaseUrl}/block-outs`;
  const response = await fetch(url, { headers: authHeaders(token) });

  if (!response.ok) throw new Error("block-outs-load-failed");
  return response.json() as Promise<PersonBlockOut[]>;
};

export const createBlockOut = async (token: string, input: PersonBlockOutInput): Promise<PersonBlockOut> => {
  const response = await fetch(`${apiBaseUrl}/block-outs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (response.status === 403) throw new Error("forbidden");
  if (!response.ok) throw new Error("block-out-create-failed");
  return response.json() as Promise<PersonBlockOut>;
};

export const deleteBlockOut = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/block-outs/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("block-out-delete-failed");
};

export const loadSubstituteSuggestions = async (token: string, planId: string, assignmentId: string): Promise<SubstituteSuggestion[]> => {
  const response = await fetch(`${apiBaseUrl}/serving-plans/${planId}/substitutes/${assignmentId}`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("substitutes-load-failed");
  return response.json() as Promise<SubstituteSuggestion[]>;
};

export const applyServingSubstitute = async (token: string, planId: string, assignmentId: string, input: ServingSubstituteApplyInput): Promise<ServingSubstituteApplyResponse> => {
  const response = await fetch(`${apiBaseUrl}/serving-plans/${planId}/assignments/${assignmentId}/substitute`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("serving-substitute-apply-failed");
  return response.json() as Promise<ServingSubstituteApplyResponse>;
};

export const loadPeopleMessages = async (token: string): Promise<PeopleMessage[]> => {
  const response = await fetch(`${apiBaseUrl}/people-messages`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("people-messages-load-failed");
  return response.json() as Promise<PeopleMessage[]>;
};

export const sendPeopleMessage = async (token: string, input: PeopleMessageInput): Promise<PeopleMessageResponse> => {
  const response = await fetch(`${apiBaseUrl}/people-messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (response.status === 403) throw new Error("forbidden");
  if (!response.ok) throw new Error("people-message-create-failed");
  return response.json() as Promise<PeopleMessageResponse>;
};

export const loadMessageTemplates = async (token: string): Promise<MessageTemplate[]> => {
  const response = await fetch(`${apiBaseUrl}/message-templates`, {
    headers: authHeaders(token)
  });
  if (!response.ok) throw new Error("message-templates-load-failed");
  return response.json() as Promise<MessageTemplate[]>;
};

export const createMessageTemplate = async (token: string, input: MessageTemplateInput): Promise<MessageTemplate> => {
  const response = await fetch(`${apiBaseUrl}/message-templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });
  if (response.status === 403) throw new Error("forbidden");
  if (!response.ok) throw new Error("message-template-create-failed");
  return response.json() as Promise<MessageTemplate>;
};

export const updateMessageTemplate = async (token: string, id: string, input: MessageTemplateInput): Promise<MessageTemplate> => {
  const response = await fetch(`${apiBaseUrl}/message-templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });
  if (response.status === 403) throw new Error("forbidden");
  if (!response.ok) throw new Error("message-template-update-failed");
  return response.json() as Promise<MessageTemplate>;
};

export const deleteMessageTemplate = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${apiBaseUrl}/message-templates/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
  if (response.status === 403) throw new Error("forbidden");
  if (!response.ok) throw new Error("message-template-delete-failed");
};

export const loadEmailStatus = async (): Promise<EmailStatus> => {
  const response = await fetch(`${apiBaseUrl}/system/email-status`);
  if (!response.ok) return { configured: false };
  return response.json() as Promise<EmailStatus>;
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

export const createMyChild = async (token: string, input: GuardianChildInput): Promise<PersonProfile> => {
  const response = await fetch(`${apiBaseUrl}/people/my-children`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("guardian-child-create-failed");
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

export const loadSongs = async (token: string): Promise<Song[]> => {
  const response = await fetch(`${apiBaseUrl}/songs`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("songs-load-failed");
  return response.json() as Promise<Song[]>;
};

export const saveSong = async (token: string, input: SongInput, id?: string): Promise<Song> => {
  const response = await fetch(id ? `${apiBaseUrl}/songs/${id}` : `${apiBaseUrl}/songs`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error(await readApiErrorMessage(response, "Nao foi possivel salvar a musica."));
  return response.json() as Promise<Song>;
};

export const deleteSong = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/songs/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("song-delete-failed");
};

export const loadWorshipSets = async (token: string): Promise<WorshipSet[]> => {
  const response = await fetch(`${apiBaseUrl}/worship-sets`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("worship-sets-load-failed");
  return response.json() as Promise<WorshipSet[]>;
};

export const saveWorshipSet = async (token: string, input: WorshipSetInput, id?: string): Promise<WorshipSet> => {
  const response = await fetch(id ? `${apiBaseUrl}/worship-sets/${id}` : `${apiBaseUrl}/worship-sets`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error(await readApiErrorMessage(response, "Nao foi possivel salvar o repertorio."));
  return response.json() as Promise<WorshipSet>;
};

export const deleteWorshipSet = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/worship-sets/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("worship-set-delete-failed");
};

export const loadServiceChecklists = async (token: string): Promise<ServiceChecklist[]> => {
  const response = await fetch(`${apiBaseUrl}/service-checklists`, {
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("service-checklists-load-failed");
  return response.json() as Promise<ServiceChecklist[]>;
};

export const saveServiceChecklist = async (token: string, input: ServiceChecklistInput, id?: string): Promise<ServiceChecklist> => {
  const response = await fetch(id ? `${apiBaseUrl}/service-checklists/${id}` : `${apiBaseUrl}/service-checklists`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error(await readApiErrorMessage(response, "Nao foi possivel salvar a liturgia."));
  return response.json() as Promise<ServiceChecklist>;
};

export const deleteServiceChecklist = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/service-checklists/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("service-checklist-delete-failed");
};

export const loadCustomForms = async (token: string): Promise<CustomForm[]> => {
  const response = await fetch(`${apiBaseUrl}/forms`, { headers: authHeaders(token) });
  if (!response.ok) throw new Error("forms-load-failed");
  return response.json() as Promise<CustomForm[]>;
};

export const saveCustomForm = async (token: string, input: CustomFormInput, id?: string): Promise<CustomForm> => {
  const response = await fetch(id ? `${apiBaseUrl}/forms/${id}` : `${apiBaseUrl}/forms`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error(await readApiErrorMessage(response, "Nao foi possivel salvar o formulario."));
  return response.json() as Promise<CustomForm>;
};

export const deleteCustomForm = async (token: string, id: string) => {
  const response = await fetch(`${apiBaseUrl}/forms/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
  if (!response.ok) throw new Error("form-delete-failed");
};

export const loadCustomFormResponses = async (token: string, formId?: string): Promise<CustomFormResponse[]> => {
  const url = formId ? `${apiBaseUrl}/forms/${formId}/responses` : `${apiBaseUrl}/form-responses`;
  const response = await fetch(url, { headers: authHeaders(token) });
  if (!response.ok) throw new Error("form-responses-load-failed");
  return response.json() as Promise<CustomFormResponse[]>;
};

export const loadPublicCustomForm = async (slug: string): Promise<CustomForm> => {
  const response = await fetch(`${apiBaseUrl}/public/forms/${slug}`);
  if (!response.ok) throw new Error("public-form-load-failed");
  return response.json() as Promise<CustomForm>;
};

export const submitPublicCustomForm = async (slug: string, input: CustomFormSubmissionInput): Promise<CustomFormResponse> => {
  const response = await fetch(`${apiBaseUrl}/public/forms/${slug}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new Error(await readApiErrorMessage(response, "Nao foi possivel enviar o formulario."));
  return response.json() as Promise<CustomFormResponse>;
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

  if (!response.ok) throw new Error(await readApiErrorMessage(response, "Nao foi possivel salvar o evento."));
  return response.json() as Promise<ChurchEvent>;
};

export const generateEventOccurrences = async (token: string, id: string): Promise<CronGenerationResult> => {
  const response = await fetch(`${apiBaseUrl}/events/${id}/generate-occurrences`, {
    method: "POST",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("event-generate-failed");
  return response.json() as Promise<CronGenerationResult>;
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

export const resendEventRegistrationConfirmation = async (token: string, id: string): Promise<EventRegistrationResendConfirmationResponse> => {
  const response = await fetch(`${apiBaseUrl}/event-registrations/${id}/resend-confirmation`, {
    method: "POST",
    headers: authHeaders(token)
  });

  if (!response.ok) throw new Error("event-registration-resend-confirmation-failed");
  return response.json() as Promise<EventRegistrationResendConfirmationResponse>;
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

  if (!response.ok) throw new Error(await readApiErrorMessage(response, "Nao foi possivel salvar o ambiente."));
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

  if (!response.ok) throw new Error(response.status === 409 ? "Conflito: este ambiente ja esta reservado neste horario." : await readApiErrorMessage(response, "Nao foi possivel salvar a reserva."));
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

export const registerVisitor = async (input: VisitorRegistrationInput): Promise<VisitorRegistrationResponse> => {
  const response = await fetch(`${apiBaseUrl}/public/visitors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("public-visitor-failed");
  return response.json() as Promise<VisitorRegistrationResponse>;
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

export const confirmEventRegistrationEmail = async (token: string): Promise<EventRegistrationConfirmResponse> => {
  const response = await fetch(`${apiBaseUrl}/public/event-registrations/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  });

  if (response.status === 400) {
    const data = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(data.message || "Link invalido ou expirado.");
  }
  if (!response.ok) throw new Error("confirm-failed");
  return response.json() as Promise<EventRegistrationConfirmResponse>;
};

export const selfCheckInEventRegistration = async (input: EventRegistrationSelfCheckInRequest): Promise<EventRegistration> => {
  const response = await fetch(`${apiBaseUrl}/public/event-registrations/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(data.message || "Nao foi possivel validar este ingresso.");
  }
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

export const loadServingPlans = async (token: string, groupId?: string): Promise<ServingPlan[]> => {
  const url = groupId ? `${apiBaseUrl}/serving-plans?groupId=${encodeURIComponent(groupId)}` : `${apiBaseUrl}/serving-plans`;
  const response = await fetch(url, {
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

export const updateServingAssignmentStatus = async (token: string, planId: string, assignmentId: string, input: ServingAssignmentStatusUpdate): Promise<ServingAssignmentStatusResponse> => {
  const response = await fetch(`${apiBaseUrl}/serving-plans/${planId}/assignments/${assignmentId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new Error("serving-assignment-status-update-failed");
  return response.json() as Promise<ServingAssignmentStatusResponse>;
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
