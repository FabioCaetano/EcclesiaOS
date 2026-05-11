import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, Sparkles } from "lucide-react";
import { canManageModule } from "@ecclesiaos/shared";
import type { ChurchEvent, ChurchResource, ChurchResourceInput, CurrentUser, RoomReservation, RoomReservationInput } from "@ecclesiaos/shared";
import { deleteResource, deleteRoomReservation, loadEvents, loadResources, loadRoomReservations, saveResource, saveRoomReservation } from "./api";
import { emptyResourceInput, emptyRoomReservationInput, roomReservationStatusLabels } from "./constants";
import { Card, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

type Section = "resources" | "reservations" | "calendar";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const PILL_PALETTE = [
  "#2563eb", "#dc2626", "#ea580c", "#65a30d", "#0d9488",
  "#7c3aed", "#db2777", "#0891b2", "#a16207", "#475569"
];

const colorForResource = (resourceId: string): string => {
  if (!resourceId) return PILL_PALETTE[PILL_PALETTE.length - 1];
  let hash = 0;
  for (let i = 0; i < resourceId.length; i += 1) {
    hash = (hash * 31 + resourceId.charCodeAt(i)) >>> 0;
  }
  return PILL_PALETTE[hash % PILL_PALETTE.length];
};

const parseMonth = (value: string): { year: number; month: number } => {
  const fallback = new Date();
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return { year: fallback.getFullYear(), month: fallback.getMonth() };
  }
  const [year, month] = value.split("-").map(Number);
  return { year, month: month - 1 };
};

interface CalendarCell {
  iso: string;
  day: number;
  inMonth: boolean;
}

const buildMonthGrid = (year: number, month: number): CalendarCell[] => {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startWeekday; i += 1) {
    const date = new Date(year, month, -startWeekday + 1 + i);
    cells.push({
      iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      day: date.getDate(),
      inMonth: false
    });
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ iso, day: d, inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const lastDate = new Date(cells[cells.length - 1].iso);
    lastDate.setDate(lastDate.getDate() + 1);
    cells.push({
      iso: `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, "0")}-${String(lastDate.getDate()).padStart(2, "0")}`,
      day: lastDate.getDate(),
      inMonth: false
    });
  }

  return cells;
};

export const ResourcesPage: React.FC<Props> = ({ token, user }) => {
  const [resources, setResources] = useState<ChurchResource[]>([]);
  const [reservations, setReservations] = useState<RoomReservation[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState<ChurchResourceInput>(emptyResourceInput);
  const [reservationForm, setReservationForm] = useState<RoomReservationInput>(emptyRoomReservationInput);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [activeSection, setActiveSection] = useState<Section>("calendar");
  const [calendarResourceFilter, setCalendarResourceFilter] = useState("");
  const [resourceStatus, setResourceStatus] = useState("");
  const [reservationStatus, setReservationStatus] = useState("");

  const canManage = canManageModule(user.role, "resources");

  const activeResources = resources.filter((resource) => resource.isActive);
  const filteredReservations = useMemo(() => reservations.filter((reservation) => !monthFilter || reservation.date.startsWith(monthFilter)), [reservations, monthFilter]);
  const confirmedReservations = reservations.filter((reservation) => reservation.status === "confirmed");
  const selectedResourceReservations = selectedResourceId ? filteredReservations.filter((reservation) => reservation.resourceId === selectedResourceId) : filteredReservations;
  const reservationsByResource = resources.map((resource) => ({
    resource,
    count: confirmedReservations.filter((reservation) => reservation.resourceId === resource.id).length
  }));

  const calendarReservations = useMemo(() => (
    reservations.filter((reservation) => (
      (!monthFilter || reservation.date.startsWith(monthFilter))
      && (!calendarResourceFilter || reservation.resourceId === calendarResourceFilter)
    ))
  ), [reservations, monthFilter, calendarResourceFilter]);

  const reservationsByDay = useMemo(() => {
    const map = new Map<string, RoomReservation[]>();
    calendarReservations.forEach((reservation) => {
      const list = map.get(reservation.date) || [];
      list.push(reservation);
      map.set(reservation.date, list);
    });
    map.forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [calendarReservations]);

  const { year, month } = parseMonth(monthFilter);
  const calendarCells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const refresh = async () => {
    const [nextResources, nextReservations, nextEvents] = await Promise.all([loadResources(token), loadRoomReservations(token), loadEvents(token)]);
    setResources(nextResources);
    setReservations(nextReservations);
    setEvents(nextEvents);
    setReservationForm((current) => ({ ...current, resourceId: current.resourceId || nextResources[0]?.id || "" }));
  };

  useEffect(() => {
    refresh().catch(() => {
      setResourceStatus("Nao foi possivel carregar ambientes.");
      setReservationStatus("Nao foi possivel carregar reservas.");
    });
  }, [token]);

  const resourceName = (id: string) => resources.find((resource) => resource.id === id)?.name || "Ambiente removido";
  const eventTitle = (id: string) => events.find((event) => event.id === id)?.title || "Sem evento vinculado";

  const selectResource = (resource: ChurchResource) => {
    setSelectedResourceId(resource.id);
    setResourceForm({
      name: resource.name,
      location: resource.location,
      capacity: resource.capacity,
      description: resource.description,
      isActive: resource.isActive
    });
    setResourceStatus("");
  };

  const startNewResource = () => {
    setSelectedResourceId(null);
    setResourceForm(emptyResourceInput);
    setResourceStatus("");
  };

  const selectReservation = (reservation: RoomReservation) => {
    setSelectedReservationId(reservation.id);
    setReservationForm({
      resourceId: reservation.resourceId,
      eventId: reservation.eventId,
      title: reservation.title,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      reservedBy: reservation.reservedBy,
      status: reservation.status,
      notes: reservation.notes
    });
    setReservationStatus("");
  };

  const startNewReservation = (overrides: Partial<RoomReservationInput> = {}) => {
    setSelectedReservationId(null);
    setReservationForm({
      ...emptyRoomReservationInput,
      resourceId: overrides.resourceId || calendarResourceFilter || selectedResourceId || resources[0]?.id || "",
      ...overrides
    });
    setReservationStatus("");
  };

  const updateResourceField = (field: keyof ChurchResourceInput, value: string) => {
    setResourceForm((current) => ({
      ...current,
      [field]: field === "capacity" ? Number(value) || 0 : field === "isActive" ? value === "true" : value
    }));
  };

  const updateReservationField = (field: keyof RoomReservationInput, value: string) => {
    setReservationForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleResourceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;

    if (!resourceForm.name.trim()) {
      setResourceStatus("Informe o nome do ambiente.");
      return;
    }

    setResourceStatus("Salvando ambiente...");
    try {
      const saved = await saveResource(token, resourceForm, selectedResourceId || undefined);
      await refresh();
      selectResource(saved);
      setResourceStatus("Ambiente salvo.");
    } catch (error) {
      setResourceStatus(error instanceof Error ? error.message : "Nao foi possivel salvar o ambiente.");
    }
  };

  const handleReservationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;

    if (!reservationForm.resourceId) {
      setReservationStatus("Selecione o ambiente da reserva.");
      return;
    }
    if (!reservationForm.title.trim()) {
      setReservationStatus("Informe o titulo da reserva.");
      return;
    }
    if (!reservationForm.date || !reservationForm.startTime || !reservationForm.endTime) {
      setReservationStatus("Informe data, inicio e fim da reserva.");
      return;
    }

    setReservationStatus("Salvando reserva...");
    try {
      const saved = await saveRoomReservation(token, reservationForm, selectedReservationId || undefined);
      await refresh();
      selectReservation(saved);
      setReservationStatus("Reserva salva.");
    } catch (error) {
      setReservationStatus(error instanceof Error ? error.message : "Nao foi possivel salvar a reserva.");
    }
  };

  const handleDeleteResource = async () => {
    if (!selectedResourceId || !canManage) return;
    if (!window.confirm("Remover este ambiente?")) return;

    setResourceStatus("Removendo ambiente...");
    try {
      await deleteResource(token, selectedResourceId);
      await refresh();
      startNewResource();
      setResourceStatus("Ambiente removido.");
    } catch {
      setResourceStatus("Nao foi possivel remover o ambiente. Verifique se existem reservas vinculadas.");
    }
  };

  const handleDeleteReservation = async () => {
    if (!selectedReservationId || !canManage) return;
    if (!window.confirm("Remover esta reserva?")) return;

    setReservationStatus("Removendo reserva...");
    try {
      await deleteRoomReservation(token, selectedReservationId);
      await refresh();
      startNewReservation();
      setReservationStatus("Reserva removida.");
    } catch {
      setReservationStatus("Nao foi possivel remover a reserva.");
    }
  };

  const handleCalendarPillClick = (reservation: RoomReservation) => {
    selectReservation(reservation);
    setActiveSection("reservations");
  };

  const handleCalendarDayClick = (cell: CalendarCell) => {
    if (!canManage || !cell.inMonth) return;
    setActiveSection("reservations");
    startNewReservation({ date: cell.iso });
  };

  return (
    <>
      <PageHeader
        eyebrow="Cadastro"
        icon={Sparkles}
        title="Ambientes"
        description="Salas e espacos da igreja com reservas e bloqueio de conflito por horario."
        actions={canManage && (
          <button className="secondary-button" type="button" onClick={() => { setActiveSection("reservations"); startNewReservation(); }}>
            <Plus size={16} /> Nova reserva
          </button>
        )}
      />

      <Card className="events-panel">
      <div className="report-grid">
        <article><span>Ambientes</span><strong>{resources.length}</strong></article>
        <article><span>Ativos</span><strong>{activeResources.length}</strong></article>
        <article><span>Reservas</span><strong>{reservations.length}</strong></article>
        <article><span>Confirmadas</span><strong>{confirmedReservations.length}</strong></article>
      </div>

      <div className="filter-bar">
        <label>Mes<input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} /></label>
        <button className="secondary-button" type="button" onClick={() => setMonthFilter("")}>Todos</button>
      </div>

      <div className="tab-bar" role="tablist" aria-label="Areas de ambientes">
        <button className={activeSection === "calendar" ? "active" : ""} type="button" onClick={() => setActiveSection("calendar")}><CalendarDays size={14} style={{ marginRight: 6 }} />Calendario</button>
        <button className={activeSection === "reservations" ? "active" : ""} type="button" onClick={() => setActiveSection("reservations")}>Reservas</button>
        <button className={activeSection === "resources" ? "active" : ""} type="button" onClick={() => setActiveSection("resources")}>Cadastro de ambientes</button>
      </div>

      {activeSection === "calendar" && (
        <>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Calendario</p>
              <h2>Reservas do mes</h2>
            </div>
            <label className="filter-bar-label">
              Ambiente
              <select value={calendarResourceFilter} onChange={(event) => setCalendarResourceFilter(event.target.value)}>
                <option value="">Todos</option>
                {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}
              </select>
            </label>
          </div>

          {resources.length === 0 ? (
            <p className="muted">Cadastre um ambiente antes de visualizar reservas no calendario.</p>
          ) : (
            <>
              <div className="resources-calendar-weekdays">
                {WEEKDAY_LABELS.map((label) => <span key={label}>{label}</span>)}
              </div>
              <div className="resources-calendar-grid">
                {calendarCells.map((cell) => {
                  const dayReservations = reservationsByDay.get(cell.iso) || [];
                  const visible = dayReservations.slice(0, 3);
                  const overflow = Math.max(0, dayReservations.length - visible.length);
                  return (
                    <div
                      key={cell.iso}
                      className={`resources-calendar-day${cell.inMonth ? "" : " muted"}${canManage && cell.inMonth ? " clickable" : ""}`}
                      onClick={() => handleCalendarDayClick(cell)}
                      role={canManage && cell.inMonth ? "button" : undefined}
                      tabIndex={canManage && cell.inMonth ? 0 : undefined}
                      onKeyDown={(event) => {
                        if (!canManage || !cell.inMonth) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleCalendarDayClick(cell);
                        }
                      }}
                    >
                      <span className="resources-calendar-day-number">{cell.day}</span>
                      <div className="resources-calendar-pill-list">
                        {visible.map((reservation) => (
                          <button
                            key={reservation.id}
                            type="button"
                            className={`resources-calendar-pill${reservation.status === "cancelled" ? " cancelled" : ""}`}
                            style={{ background: colorForResource(reservation.resourceId) }}
                            onClick={(event) => { event.stopPropagation(); handleCalendarPillClick(reservation); }}
                            title={`${reservation.title} - ${resourceName(reservation.resourceId)} - ${reservation.startTime}/${reservation.endTime}`}
                          >
                            <span className="resources-calendar-pill-time">{reservation.startTime}</span>
                            <span className="resources-calendar-pill-title">{reservation.title}</span>
                          </button>
                        ))}
                        {overflow > 0 && (
                          <button
                            type="button"
                            className="resources-calendar-pill overflow"
                            onClick={(event) => { event.stopPropagation(); setActiveSection("reservations"); }}
                          >
                            +{overflow}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="muted resources-calendar-hint">
                {canManage ? "Clique num dia vazio para criar uma reserva ou numa pill para abrir a existente." : "Selecione uma pill para ver os detalhes da reserva."}
              </p>
            </>
          )}
        </>
      )}

      {activeSection !== "calendar" && (
        <div className="report-columns">
          <div>
            <h3>Uso por ambiente</h3>
            {reservationsByResource.map(({ resource, count }) => (
              <p className="report-row" key={resource.id}><span>{resource.name}</span><strong>{count}</strong></p>
            ))}
          </div>
          <div>
            <h3>Filtro atual</h3>
            <p className="report-row"><span>Reservas no periodo</span><strong>{filteredReservations.length}</strong></p>
            <p className="report-row"><span>Ambiente selecionado</span><strong>{selectedResourceId ? resourceName(selectedResourceId) : "Todos"}</strong></p>
          </div>
        </div>
      )}

      {activeSection === "resources" && <div className="section-heading">
        <div>
          <p className="eyebrow">Ambientes</p>
          <h2>Criar e editar ambientes</h2>
        </div>
        {canManage && <button className="secondary-button" type="button" onClick={startNewResource}>Novo ambiente</button>}
      </div>}

      {activeSection === "resources" && <div className="people-layout">
        <div className="people-list" aria-label="Lista de ambientes">
          {resources.map((resource) => (
            <button className={resource.id === selectedResourceId ? "person-row selected" : "person-row"} key={resource.id} type="button" onClick={() => selectResource(resource)}>
              <strong>{resource.name}</strong>
              <span>{resource.location || "Sem local"} - {resource.capacity || 0} pessoas</span>
              <span>{resource.isActive ? "Ativo" : "Inativo"} - {confirmedReservations.filter((reservation) => reservation.resourceId === resource.id).length} reserva(s)</span>
            </button>
          ))}
        </div>

        <form className="person-form" onSubmit={handleResourceSubmit}>
          <label>Nome<input disabled={!canManage} value={resourceForm.name} onChange={(event) => updateResourceField("name", event.target.value)} /></label>
          <label>Local<input disabled={!canManage} value={resourceForm.location} onChange={(event) => updateResourceField("location", event.target.value)} /></label>
          <label>Capacidade<input disabled={!canManage} type="number" min="0" value={resourceForm.capacity} onChange={(event) => updateResourceField("capacity", event.target.value)} /></label>
          <label>
            Status
            <select disabled={!canManage} value={resourceForm.isActive ? "true" : "false"} onChange={(event) => updateResourceField("isActive", event.target.value)}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </label>
          <label className="wide-field">Descricao<textarea disabled={!canManage} value={resourceForm.description} onChange={(event) => updateResourceField("description", event.target.value)} /></label>
          <div className="form-footer">
            {canManage && <button type="submit">{selectedResourceId ? "Salvar ambiente" : "Criar ambiente"}</button>}
            {canManage && selectedResourceId && <button className="danger-button" type="button" onClick={handleDeleteResource}>Remover</button>}
            <p>{canManage ? resourceStatus : "Somente admin ou lider pode alterar ambientes."}</p>
          </div>
        </form>
      </div>}

      {activeSection === "reservations" && <div className="section-heading">
        <div>
          <p className="eyebrow">Reservas</p>
          <h2>Criar e controlar reservas</h2>
        </div>
        {canManage && <button className="secondary-button" type="button" onClick={() => startNewReservation()}>Nova reserva</button>}
      </div>}

      {activeSection === "reservations" && <div className="people-layout">
        <div className="people-list" aria-label="Lista de reservas">
          {selectedResourceReservations.map((reservation) => (
            <button className={reservation.id === selectedReservationId ? "person-row selected" : "person-row"} key={reservation.id} type="button" onClick={() => selectReservation(reservation)}>
              <strong>{reservation.date} - {reservation.title}</strong>
              <span>{reservation.startTime} ate {reservation.endTime} - {resourceName(reservation.resourceId)}</span>
              <span>{roomReservationStatusLabels[reservation.status]} - {eventTitle(reservation.eventId)}</span>
            </button>
          ))}
        </div>

        <form className="person-form" onSubmit={handleReservationSubmit}>
          <label>
            Ambiente
            <select disabled={!canManage} value={reservationForm.resourceId} onChange={(event) => updateReservationField("resourceId", event.target.value)}>
              <option value="">Selecione</option>
              {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}
            </select>
          </label>
          <label>Titulo<input disabled={!canManage} value={reservationForm.title} onChange={(event) => updateReservationField("title", event.target.value)} /></label>
          <label>Data<input disabled={!canManage} type="date" value={reservationForm.date} onChange={(event) => updateReservationField("date", event.target.value)} /></label>
          <label>Inicio<input disabled={!canManage} type="time" value={reservationForm.startTime} onChange={(event) => updateReservationField("startTime", event.target.value)} /></label>
          <label>Fim<input disabled={!canManage} type="time" value={reservationForm.endTime} onChange={(event) => updateReservationField("endTime", event.target.value)} /></label>
          <label>Responsavel<input disabled={!canManage} value={reservationForm.reservedBy} onChange={(event) => updateReservationField("reservedBy", event.target.value)} /></label>
          <label>
            Evento
            <select disabled={!canManage} value={reservationForm.eventId} onChange={(event) => updateReservationField("eventId", event.target.value)}>
              <option value="">Sem evento vinculado</option>
              {events.map((event) => <option key={event.id} value={event.id}>{event.date} - {event.title}</option>)}
            </select>
          </label>
          <label>
            Status
            <select disabled={!canManage} value={reservationForm.status} onChange={(event) => updateReservationField("status", event.target.value)}>
              {Object.entries(roomReservationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="wide-field">Notas<textarea disabled={!canManage} value={reservationForm.notes} onChange={(event) => updateReservationField("notes", event.target.value)} /></label>

          <div className="form-footer">
            {canManage && <button type="submit">{selectedReservationId ? "Salvar reserva" : "Criar reserva"}</button>}
            {canManage && selectedReservationId && <button className="danger-button" type="button" onClick={handleDeleteReservation}>Remover</button>}
            <p>{canManage ? reservationStatus : "Somente admin ou lider pode alterar reservas."}</p>
          </div>
        </form>
      </div>}
      </Card>
    </>
  );
};
