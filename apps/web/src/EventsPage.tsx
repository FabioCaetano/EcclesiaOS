import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { ChurchEvent, ChurchEventInput, ChurchResource, CurrentUser, EventRegistration, EventRegistrationStatus, GroupProfile } from "@ecclesiaos/shared";
import { apiBaseUrl, checkInEventRegistration, deleteEvent, generateEventOccurrences, loadEventRegistrations, loadEvents, loadGroups, loadResources, saveEvent, updateEventRegistrationStatus } from "./api";
import { emptyEventInput, eventTypeLabels, recurrenceLabels } from "./constants";
import { toEventInput } from "./mappers";
import { useQrScanner } from "./useQrScanner";

interface Props {
  token: string;
  user: CurrentUser;
}

const registrationStatusLabels: Record<EventRegistrationStatus, string> = {
  confirmed: "Confirmada",
  pending_payment: "Pagamento pendente",
  cancelled: "Cancelada"
};

const ticketPayload = (registration: EventRegistration) => `ecclesiaos-event-ticket:${registration.id}:${registration.ticketCode || registration.id}`;

const parseTicketPayload = (value: string) => {
  const parts = value.trim().split(":");
  if (parts.length !== 3 || parts[0] !== "ecclesiaos-event-ticket") return null;
  return { id: parts[1], ticketCode: parts[2] };
};

const TicketQrCode: React.FC<{ value: string }> = ({ value }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { errorCorrectionLevel: "M", margin: 1, width: 164 })
      .then((nextSrc) => {
        if (active) setSrc(nextSrc);
      })
      .catch(() => {
        if (active) setSrc("");
      });
    return () => {
      active = false;
    };
  }, [value]);

  return src ? <img className="ticket-qr" src={src} alt="QR Code do ingresso" /> : <div className="ticket-qr placeholder" />;
};

export const EventsPage: React.FC<Props> = ({ token, user }) => {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [resources, setResources] = useState<ChurchResource[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState<EventRegistrationStatus | "all">("all");
  const [ticketScanInput, setTicketScanInput] = useState("");
  const [ticketScannerActive, setTicketScannerActive] = useState(false);
  const [eventForm, setEventForm] = useState<ChurchEventInput>(emptyEventInput);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [status, setStatus] = useState("");

  const upcomingEvents = useMemo(() => events.filter((event) => event.date >= new Date().toISOString().slice(0, 10)), [events]);
  const filteredEvents = useMemo(() => events.filter((event) => !monthFilter || event.date.startsWith(monthFilter)), [events, monthFilter]);
  const serviceCount = events.filter((event) => event.type === "service").length;
  const groupLinkedCount = events.filter((event) => event.groupId).length;
  const recurringCount = events.filter((event) => event.recurrence !== "none").length;
  const eventsByDay = filteredEvents.reduce<Record<string, ChurchEvent[]>>((acc, event) => {
    const day = event.date.slice(-2);
    acc[day] = [...(acc[day] || []), event];
    return acc;
  }, {});

  const refreshEvents = async () => {
    const [nextEvents, nextRegistrations] = await Promise.all([
      loadEvents(token),
      user.role === "admin" ? loadEventRegistrations(token) : Promise.resolve([])
    ]);
    setEvents(nextEvents);
    setRegistrations(nextRegistrations);
  };

  useEffect(() => {
    loadGroups(token).then(setGroups).catch(() => setStatus("Nao foi possivel carregar grupos."));
    loadResources(token).then(setResources).catch(() => setStatus("Nao foi possivel carregar ambientes."));
    refreshEvents().catch(() => setStatus("Nao foi possivel carregar eventos."));
  }, [token]);

  const handleTicketScan = async (rawValue: string) => {
    setTicketScanInput(rawValue);
    await completeTicketCheckIn(rawValue);
    setTicketScannerActive(false);
  };

  const { videoRef: ticketVideoRef, canvasRef: ticketCanvasRef, message: ticketScannerStatus } = useQrScanner({
    active: ticketScannerActive,
    onDecode: handleTicketScan
  });

  const selectEvent = (event: ChurchEvent) => {
    setSelectedEventId(event.id);
    setEventForm(toEventInput(event));
    setStatus("");
  };

  const startNewEvent = () => {
    setSelectedEventId(null);
    setEventForm(emptyEventInput);
    setStatus("");
  };

  const updateField = (field: keyof ChurchEventInput, value: string) => {
    setEventForm((current) => ({
      ...current,
      [field]: field === "type" && !Object.keys(eventTypeLabels).includes(value)
        ? "other"
        : field === "recurrence" && !Object.keys(recurrenceLabels).includes(value)
          ? "none"
          : field === "registrationEnabled"
            ? Boolean(value)
            : field === "registrationCapacity" || field === "registrationPrice"
              ? Number(value) || 0
              : value,
      ...(field === "recurrence" && value !== "cron" ? { recurrenceRule: "" } : {}),
      ...(field === "recurrence" && value === "none" ? { recurrenceUntil: "" } : {})
    }));
  };

  const toggleRequestedTeam = (groupId: string) => {
    setEventForm((current) => {
      const has = current.requestedTeamIds.includes(groupId);
      return {
        ...current,
        requestedTeamIds: has
          ? current.requestedTeamIds.filter((id) => id !== groupId)
          : [...current.requestedTeamIds, groupId]
      };
    });
  };

  const teamGroups = useMemo(() => groups.filter((group) => group.type === "ministry" || group.type === "team"), [groups]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user.role !== "admin") return;

    setStatus("Salvando...");
    try {
      const saved = await saveEvent(token, eventForm, selectedEventId || undefined);
      await refreshEvents();
      selectEvent(saved);
      setStatus("Evento salvo.");
    } catch {
      setStatus("Nao foi possivel salvar o evento.");
    }
  };

  const handleDelete = async () => {
    if (!selectedEventId || user.role !== "admin") return;
    if (!window.confirm("Remover este evento?")) return;

    setStatus("Removendo...");
    try {
      await deleteEvent(token, selectedEventId);
      await refreshEvents();
      startNewEvent();
      setStatus("Evento removido.");
    } catch {
      setStatus("Nao foi possivel remover o evento.");
    }
  };

  const handleGenerateOccurrences = async () => {
    if (!selectedEventId || user.role !== "admin") return;
    setStatus("Gerando ocorrencias...");
    try {
      const result = await generateEventOccurrences(token, selectedEventId);
      await refreshEvents();
      setStatus(`Ocorrencias geradas: ${result.generated} novas (${result.skipped} ja existiam, ${result.total} planejadas).`);
    } catch {
      setStatus("Nao foi possivel gerar as ocorrencias.");
    }
  };

  const groupName = (groupId: string) => groups.find((group) => group.id === groupId)?.name || "Sem grupo";
  const registrationCount = (eventId: string) => registrations.filter((registration) => registration.eventId === eventId && registration.status !== "cancelled").reduce((sum, registration) => sum + registration.quantity, 0);
  const selectedEvent = events.find((event) => event.id === selectedEventId) || null;
  const selectedPublicLink = selectedEvent?.registrationSlug ? `${window.location.origin}/register/${selectedEvent.registrationSlug}` : "";
  const selectedEventRegistrations = registrations.filter((registration) => registration.eventId === selectedEventId);
  const filteredRegistrations = selectedEventRegistrations.filter((registration) => registrationStatusFilter === "all" || registration.status === registrationStatusFilter);
  const selectedRegistration = registrations.find((registration) => registration.id === selectedRegistrationId) || null;
  const confirmedQuantity = selectedEventRegistrations.filter((registration) => registration.status === "confirmed").reduce((sum, registration) => sum + registration.quantity, 0);
  const pendingQuantity = selectedEventRegistrations.filter((registration) => registration.status === "pending_payment").reduce((sum, registration) => sum + registration.quantity, 0);
  const cancelledQuantity = selectedEventRegistrations.filter((registration) => registration.status === "cancelled").reduce((sum, registration) => sum + registration.quantity, 0);
  const amountConfirmed = selectedEventRegistrations.filter((registration) => registration.status === "confirmed").reduce((sum, registration) => sum + registration.amountDue, 0);

  const updateRegistration = async (registration: EventRegistration, nextStatus: EventRegistrationStatus) => {
    if (user.role !== "admin") return;
    setStatus("Atualizando inscricao...");
    try {
      const updated = await updateEventRegistrationStatus(token, registration.id, { status: nextStatus });
      await refreshEvents();
      setSelectedRegistrationId(updated.id);
      setStatus("Inscricao atualizada.");
    } catch {
      setStatus("Nao foi possivel atualizar a inscricao.");
    }
  };

  const completeTicketCheckIn = async (value: string) => {
    const parsed = parseTicketPayload(value);
    if (!parsed) {
      setStatus("QR Code invalido para ingresso.");
      return;
    }

    try {
      const updated = await checkInEventRegistration(token, parsed.id, { ticketCode: parsed.ticketCode });
      await refreshEvents();
      setSelectedRegistrationId(updated.id);
      setStatus(updated.checkedInAt ? "Check-in do participante registrado." : "Ingresso validado.");
    } catch {
      setStatus("Nao foi possivel validar este ingresso.");
    }
  };

  const checkInRegistration = async (registration: EventRegistration) => {
    await completeTicketCheckIn(ticketPayload(registration));
  };

  return (
    <section className="panel events-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Agenda</p>
          <h2>Eventos e cultos</h2>
        </div>
        {user.role === "admin" && <button className="secondary-button" type="button" onClick={startNewEvent}>Novo evento</button>}
      </div>

      <div className="report-grid">
        <article><span>Eventos</span><strong>{events.length}</strong></article>
        <article><span>Proximos</span><strong>{upcomingEvents.length}</strong></article>
        <article><span>Cultos</span><strong>{serviceCount}</strong></article>
        <article><span>Inscricoes</span><strong>{registrations.filter((registration) => registration.status !== "cancelled").reduce((sum, registration) => sum + registration.quantity, 0)}</strong></article>
      </div>

      <div className="filter-bar">
        <label>Mes<input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} /></label>
        <button className="secondary-button" type="button" onClick={() => setMonthFilter("")}>Todos</button>
      </div>

      <div className="report-columns">
        <div>
          <h3>Resumo do mes</h3>
          {Object.keys(eventsByDay).length === 0 ? <p className="muted">Sem eventos neste periodo.</p> : Object.entries(eventsByDay).map(([day, dayEvents]) => (
            <p className="report-row" key={day}><span>Dia {day}</span><strong>{dayEvents.length}</strong></p>
          ))}
        </div>
        <div>
          <h3>Agenda vinculada</h3>
          <p className="report-row"><span>Com grupo</span><strong>{groupLinkedCount}</strong></p>
          <p className="report-row"><span>Sem grupo</span><strong>{events.length - groupLinkedCount}</strong></p>
        </div>
      </div>

      <div className="people-layout">
        <div className="people-list" aria-label="Lista de eventos">
          {filteredEvents.map((event) => (
            <button className={event.id === selectedEventId ? "person-row selected" : "person-row"} key={event.id} type="button" onClick={() => selectEvent(event)}>
              <strong>
                {event.date} - {event.title}
                {event.parentEventId && <span className="event-tag generated"> ocorrencia</span>}
                {!event.parentEventId && event.recurrence === "cron" && <span className="event-tag master"> cron</span>}
              </strong>
              <span>{eventTypeLabels[event.type]} - {event.startTime || "sem horario"} - {event.location || "sem local"}</span>
              <span>{event.groupId ? groupName(event.groupId) : "Agenda geral"} - {recurrenceLabels[event.recurrence]} - {event.registrationEnabled ? `${registrationCount(event.id)} inscrito(s)` : "sem inscricoes"}</span>
            </button>
          ))}
        </div>

        <form className="person-form" onSubmit={handleSubmit}>
          <label>Titulo<input disabled={user.role !== "admin"} value={eventForm.title} onChange={(event) => updateField("title", event.target.value)} /></label>
          <label>
            Tipo
            <select disabled={user.role !== "admin"} value={eventForm.type} onChange={(event) => updateField("type", event.target.value)}>
              {Object.entries(eventTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Data<input disabled={user.role !== "admin"} type="date" value={eventForm.date} onChange={(event) => updateField("date", event.target.value)} /></label>
          <label>Inicio<input disabled={user.role !== "admin"} type="time" value={eventForm.startTime} onChange={(event) => updateField("startTime", event.target.value)} /></label>
          <label>Fim<input disabled={user.role !== "admin"} type="time" value={eventForm.endTime} onChange={(event) => updateField("endTime", event.target.value)} /></label>
          <label>Local<input disabled={user.role !== "admin"} list="event-locations" value={eventForm.location} onChange={(event) => updateField("location", event.target.value)} /></label>
          <datalist id="event-locations">
            {resources.filter((resource) => resource.isActive).map((resource) => (
              <option key={resource.id} value={resource.name}>{resource.location}</option>
            ))}
          </datalist>
          <label>
            Recorrencia
            <select disabled={user.role !== "admin"} value={eventForm.recurrence} onChange={(event) => updateField("recurrence", event.target.value)}>
              {Object.entries(recurrenceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Repetir ate<input disabled={user.role !== "admin" || eventForm.recurrence === "none"} type="date" value={eventForm.recurrenceUntil} onChange={(event) => updateField("recurrenceUntil", event.target.value)} /></label>
          {eventForm.recurrence === "cron" && (
            <label className="wide-field">Expressao cron<input disabled={user.role !== "admin"} value={eventForm.recurrenceRule} onChange={(event) => updateField("recurrenceRule", event.target.value)} placeholder="0 0 * * 0#1" /></label>
          )}
          <label>
            Inscricoes
            <select disabled={user.role !== "admin"} value={eventForm.registrationEnabled ? "yes" : "no"} onChange={(event) => updateField("registrationEnabled", event.target.value === "yes" ? "true" : "")}>
              <option value="no">Fechadas</option>
              <option value="yes">Abertas</option>
            </select>
          </label>
          <label>Limite<input disabled={user.role !== "admin" || !eventForm.registrationEnabled} type="number" min="0" value={eventForm.registrationCapacity} onChange={(event) => updateField("registrationCapacity", event.target.value)} /></label>
          <label>Valor<input disabled={user.role !== "admin" || !eventForm.registrationEnabled} type="number" min="0" step="0.01" value={eventForm.registrationPrice} onChange={(event) => updateField("registrationPrice", event.target.value)} /></label>
          <label>Moeda<input disabled={user.role !== "admin" || !eventForm.registrationEnabled} value={eventForm.registrationCurrency} onChange={(event) => updateField("registrationCurrency", event.target.value)} /></label>
          <label>
            Grupo
            <select disabled={user.role !== "admin"} value={eventForm.groupId} onChange={(event) => updateField("groupId", event.target.value)}>
              <option value="">Agenda geral</option>
              {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select>
          </label>
          <fieldset className="wide-field requested-teams">
            <legend>Equipes que servem</legend>
            {teamGroups.length === 0 ? (
              <p className="muted">Nenhum ministerio ou equipe cadastrado em Grupos.</p>
            ) : (
              <div className="checkbox-grid">
                {teamGroups.map((group) => (
                  <label key={group.id}>
                    <input
                      type="checkbox"
                      disabled={user.role !== "admin"}
                      checked={eventForm.requestedTeamIds.includes(group.id)}
                      onChange={() => toggleRequestedTeam(group.id)}
                    />
                    {group.name}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
          <label className="wide-field">Descricao<textarea disabled={user.role !== "admin"} value={eventForm.description} onChange={(event) => updateField("description", event.target.value)} /></label>
          <label className="wide-field">Slug publico<input disabled={user.role !== "admin" || !eventForm.registrationEnabled} value={eventForm.registrationSlug} onChange={(event) => updateField("registrationSlug", event.target.value)} /></label>

          {selectedPublicLink && (
            <div className="receipt-preview wide-field">
              <h3>Link de inscricao</h3>
              <p><span>Pagina</span><strong>{selectedPublicLink}</strong></p>
              <p><span>API</span><strong>{apiBaseUrl}/public/events/{selectedEvent?.registrationSlug}</strong></p>
            </div>
          )}

          <div className="form-footer">
            {user.role === "admin" && <button type="submit">{selectedEventId ? "Salvar evento" : "Criar evento"}</button>}
            {user.role === "admin" && selectedEventId && eventForm.recurrence === "cron" && eventForm.recurrenceRule && !eventForm.parentEventId && (
              <button className="secondary-button" type="button" onClick={handleGenerateOccurrences}>Gerar ocorrencias</button>
            )}
            {user.role === "admin" && selectedEventId && <button className="danger-button" type="button" onClick={handleDelete}>Remover</button>}
            <p>{user.role === "admin" ? status : "Somente administradores podem alterar eventos."}</p>
          </div>
        </form>
      </div>

      {user.role === "admin" && selectedEvent && selectedEvent.registrationEnabled && (
        <div className="registration-admin">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Inscricoes</p>
              <h2>{selectedEvent.title}</h2>
            </div>
            <button className="secondary-button" type="button" onClick={() => selectedRegistrationId && window.print()} disabled={!selectedRegistration}>Imprimir recibo</button>
          </div>

          <div className="report-grid">
            <article><span>Confirmadas</span><strong>{confirmedQuantity}</strong></article>
            <article><span>Pendentes</span><strong>{pendingQuantity}</strong></article>
            <article><span>Canceladas</span><strong>{cancelledQuantity}</strong></article>
            <article><span>Recebido</span><strong>{selectedEvent.registrationCurrency} {amountConfirmed.toFixed(2)}</strong></article>
          </div>

          <div className="filter-bar">
            <label>
              Status
              <select value={registrationStatusFilter} onChange={(event) => setRegistrationStatusFilter(event.target.value as EventRegistrationStatus | "all")}>
                <option value="all">Todos</option>
                <option value="confirmed">Confirmadas</option>
                <option value="pending_payment">Pagamento pendente</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </label>
          </div>

          <div className="scanner-panel">
            <div>
              <h3>Check-in por ingresso</h3>
              <p className="muted">Leia o QR Code do ingresso ou cole o payload manualmente.</p>
            </div>
            <div className="scanner-actions">
              <button className="secondary-button" type="button" onClick={() => setTicketScannerActive((current) => !current)}>{ticketScannerActive ? "Parar camera" : "Abrir camera"}</button>
              <input value={ticketScanInput} onChange={(event) => setTicketScanInput(event.target.value)} placeholder="ecclesiaos-event-ticket:..." />
              <button className="secondary-button" type="button" onClick={() => completeTicketCheckIn(ticketScanInput)}>Validar ingresso</button>
            </div>
            {ticketScannerActive && <video className="scanner-video" ref={ticketVideoRef} muted playsInline />}
            <canvas className="scanner-canvas" ref={ticketCanvasRef} />
            <p className="muted">{ticketScannerStatus}</p>
          </div>

          <div className="registration-list">
            {filteredRegistrations.length === 0 ? <p className="muted">Sem inscricoes para este filtro.</p> : filteredRegistrations.map((registration) => (
              <article className={registration.id === selectedRegistrationId ? "registration-row selected" : "registration-row"} key={registration.id}>
                <button type="button" onClick={() => setSelectedRegistrationId(registration.id)}>
                  <strong>{registration.name}</strong>
                  <span>{registrationStatusLabels[registration.status]} - {registration.quantity} vaga(s) - {selectedEvent.registrationCurrency} {registration.amountDue.toFixed(2)}</span>
                  <small>{registration.email} {registration.phone ? `- ${registration.phone}` : ""}</small>
                </button>
                <div className="response-actions">
                  <button className="secondary-button" type="button" onClick={() => checkInRegistration(registration)}>{registration.checkedInAt ? "Entrada OK" : "Check-in"}</button>
                  <button className="secondary-button" type="button" onClick={() => updateRegistration(registration, "confirmed")}>Confirmar</button>
                  <button className="secondary-button" type="button" onClick={() => updateRegistration(registration, "pending_payment")}>Pendente</button>
                  <button className="danger-button" type="button" onClick={() => updateRegistration(registration, "cancelled")}>Cancelar</button>
                </div>
              </article>
            ))}
          </div>

          {selectedRegistration && (
            <div className="event-ticket-print">
              <p className="eyebrow">EcclesiaOS Eventos</p>
              <h3>{selectedEvent.title}</h3>
              <p>{selectedEvent.date} {selectedEvent.startTime} - {selectedEvent.location || "Local a confirmar"}</p>
              <p>Participante: {selectedRegistration.name}</p>
              <p>Quantidade: {selectedRegistration.quantity}</p>
              <p>Status: {registrationStatusLabels[selectedRegistration.status]}</p>
              <p>Entrada: {selectedRegistration.checkedInAt ? new Date(selectedRegistration.checkedInAt).toLocaleString() : "Nao utilizada"}</p>
              <p>Valor: {selectedEvent.registrationCurrency} {selectedRegistration.amountDue.toFixed(2)}</p>
              <TicketQrCode value={ticketPayload(selectedRegistration)} />
              <strong>{selectedRegistration.id}</strong>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
