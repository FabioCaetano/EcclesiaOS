import React, { useEffect, useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import type { ChurchEvent, ChurchResource, CurrentUser, EventRegistration, RoomReservation } from "@ecclesiaos/shared";
import { loadEventRegistrations, loadEvents, loadResources, loadRoomReservations } from "./api";
import { eventTypeLabels, roomReservationStatusLabels } from "./constants";
import { Card, EmptyState, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

type CalendarItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  kind: "event" | "reservation";
  resourceId: string;
  detail: string;
  muted: boolean;
};

type CalendarViewMode = "month" | "week";

const monthLabel = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return "Periodo";
  return new Date(year, monthNumber - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

const buildCalendarDays = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return [];
  const firstDay = new Date(year, monthNumber - 1, 1);
  const lastDay = new Date(year, monthNumber, 0);
  const leadingDays = firstDay.getDay();
  const days: Array<{ date: string; day: number; inMonth: boolean }> = [];

  for (let index = leadingDays - 1; index >= 0; index -= 1) {
    const date = new Date(year, monthNumber - 1, -index);
    days.push({ date: date.toISOString().slice(0, 10), day: date.getDate(), inMonth: false });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, monthNumber - 1, day);
    days.push({ date: date.toISOString().slice(0, 10), day, inMonth: true });
  }

  while (days.length % 7 !== 0) {
    const next = new Date(year, monthNumber - 1, lastDay.getDate() + (days.length % 7));
    days.push({ date: next.toISOString().slice(0, 10), day: next.getDate(), inMonth: false });
  }

  return days;
};

const buildWeekDays = (selectedDate: string) => {
  const baseDate = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const sunday = new Date(baseDate);
  sunday.setDate(baseDate.getDate() - baseDate.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return { date: date.toISOString().slice(0, 10), day: date.getDate(), inMonth: true };
  });
};

const formatDate = (date: string) => {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
};

export const CalendarPage: React.FC<Props> = ({ token, user }) => {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [resources, setResources] = useState<ChurchResource[]>([]);
  const [reservations, setReservations] = useState<RoomReservation[]>([]);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [typeFilter, setTypeFilter] = useState<"all" | "event" | "reservation">("all");
  const [resourceFilter, setResourceFilter] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([
      loadEvents(token),
      user.role === "admin" ? loadEventRegistrations(token) : Promise.resolve([]),
      loadResources(token),
      loadRoomReservations(token)
    ])
      .then(([nextEvents, nextRegistrations, nextResources, nextReservations]) => {
        setEvents(nextEvents);
        setRegistrations(nextRegistrations);
        setResources(nextResources);
        setReservations(nextReservations);
      })
      .catch(() => setStatus("Nao foi possivel carregar o calendario."));
  }, [token, user.role]);

  const resourceName = (id: string) => resources.find((resource) => resource.id === id)?.name || "Ambiente removido";
  const registrationCount = (eventId: string) => registrations.filter((registration) => registration.eventId === eventId && registration.status !== "cancelled").reduce((sum, registration) => sum + registration.quantity, 0);

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const eventItems = events.map((event): CalendarItem => ({
      id: `event-${event.id}`,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      title: event.title,
      kind: "event",
      resourceId: "",
      detail: `${eventTypeLabels[event.type]}${event.registrationEnabled ? ` - ${registrationCount(event.id)} inscrito(s)` : ""}`,
      muted: false
    }));

    const reservationItems = reservations.map((reservation): CalendarItem => ({
      id: `reservation-${reservation.id}`,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      title: reservation.title,
      kind: "reservation",
      resourceId: reservation.resourceId,
      detail: `${resourceName(reservation.resourceId)} - ${roomReservationStatusLabels[reservation.status]}`,
      muted: reservation.status === "cancelled"
    }));

    return [...eventItems, ...reservationItems]
      .filter((item) => item.date.startsWith(monthFilter))
      .filter((item) => typeFilter === "all" || item.kind === typeFilter)
      .filter((item) => !resourceFilter || item.resourceId === resourceFilter)
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }, [events, registrations, reservations, resources, monthFilter, typeFilter, resourceFilter]);

  const calendarDays = viewMode === "month" ? buildCalendarDays(monthFilter) : buildWeekDays(selectedDate);
  const itemsByDate = calendarItems.reduce<Record<string, CalendarItem[]>>((acc, item) => {
    acc[item.date] = [...(acc[item.date] || []), item];
    return acc;
  }, {});
  const eventCount = calendarItems.filter((item) => item.kind === "event").length;
  const reservationCount = calendarItems.filter((item) => item.kind === "reservation").length;
  const busyDays = Object.keys(itemsByDate).length;
  const selectedItems = (itemsByDate[selectedDate] || []).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleMonthChange = (nextMonth: string) => {
    setMonthFilter(nextMonth);
    if (!selectedDate.startsWith(nextMonth)) setSelectedDate(`${nextMonth}-01`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operacao"
        icon={CalendarRange}
        title="Calendario"
        description={monthLabel(monthFilter)}
      />

      <Card className="calendar-panel">
      <div className="report-grid">
        <article><span>Itens</span><strong>{calendarItems.length}</strong></article>
        <article><span>Eventos</span><strong>{eventCount}</strong></article>
        <article><span>Reservas</span><strong>{reservationCount}</strong></article>
        <article><span>Dias ocupados</span><strong>{busyDays}</strong></article>
      </div>

      <div className="filter-bar">
        <label>Mes<input type="month" value={monthFilter} onChange={(event) => handleMonthChange(event.target.value)} /></label>
        <label>
          Visao
          <select value={viewMode} onChange={(event) => setViewMode(event.target.value as CalendarViewMode)}>
            <option value="month">Mensal</option>
            <option value="week">Semanal</option>
          </select>
        </label>
        <label>
          Tipo
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}>
            <option value="all">Tudo</option>
            <option value="event">Eventos</option>
            <option value="reservation">Reservas</option>
          </select>
        </label>
        <label>
          Ambiente
          <select value={resourceFilter} onChange={(event) => setResourceFilter(event.target.value)}>
            <option value="">Todos</option>
            {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}
          </select>
        </label>
      </div>

      {status && <p className="error-message">{status}</p>}

      <div className="calendar-weekdays" aria-hidden="true">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="calendar-grid" aria-label="Calendario mensal">
        {calendarDays.map((day) => (
          <article className={`${day.inMonth ? "calendar-day" : "calendar-day outside-month"} ${day.date === selectedDate ? "selected-day" : ""}`} key={day.date}>
            <strong>{day.day}</strong>
            <div>
              {(itemsByDate[day.date] || []).slice(0, 3).map((item) => (
                <button className={`calendar-item ${item.kind} ${item.muted ? "muted-item" : ""}`} key={item.id} type="button" onClick={() => setSelectedDate(day.date)}>
                  <span>{item.startTime || "--:--"}</span>
                  <b>{item.title}</b>
                  <small>{item.detail}</small>
                </button>
              ))}
              {(itemsByDate[day.date] || []).length > 3 && <small className="calendar-more">+{itemsByDate[day.date].length - 3} item(ns)</small>}
            </div>
          </article>
        ))}
      </div>

      <div className="report-columns calendar-list">
        <div>
          <h3>{formatDate(selectedDate) || "Dia selecionado"}</h3>
          {selectedItems.map((item) => (
            <button className={`calendar-detail-row ${item.kind} ${item.muted ? "muted-item" : ""}`} key={`selected-${item.id}`} type="button">
              <span>{item.startTime || "--:--"}{item.endTime ? ` ate ${item.endTime}` : ""}</span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </button>
          ))}
          {selectedItems.length === 0 && (
            <EmptyState
              icon={CalendarRange}
              title="Sem itens neste dia"
              description="Selecione outro dia ou ajuste os filtros."
            />
          )}
        </div>
        <div>
          <h3>Proximos no periodo</h3>
          {calendarItems.slice(0, 6).map((item) => (
            <p className="report-row" key={`list-${item.id}`}><span>{item.date} {item.startTime}</span><strong>{item.title}</strong></p>
          ))}
          {calendarItems.length === 0 && <p className="muted">Sem itens neste periodo.</p>}
        </div>
      </div>

      <div className="receipt-preview calendar-legend">
        <h3>Legenda</h3>
        <p><span>Evento</span><strong>Agenda</strong></p>
        <p><span>Reserva</span><strong>Ambientes</strong></p>
        <p><span>Cancelada</span><strong>Sem bloqueio</strong></p>
      </div>
      </Card>
    </>
  );
};
