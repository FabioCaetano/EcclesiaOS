import React, { useEffect, useMemo, useState } from "react";
import type { ChurchEvent, ChurchResource, ChurchResourceInput, CurrentUser, RoomReservation, RoomReservationInput } from "@ecclesiaos/shared";
import { deleteResource, deleteRoomReservation, loadEvents, loadResources, loadRoomReservations, saveResource, saveRoomReservation } from "./api";
import { emptyResourceInput, emptyRoomReservationInput, roomReservationStatusLabels } from "./constants";

interface Props {
  token: string;
  user: CurrentUser;
}

export const ResourcesPage: React.FC<Props> = ({ token, user }) => {
  const [resources, setResources] = useState<ChurchResource[]>([]);
  const [reservations, setReservations] = useState<RoomReservation[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [resourceForm, setResourceForm] = useState<ChurchResourceInput>(emptyResourceInput);
  const [reservationForm, setReservationForm] = useState<RoomReservationInput>(emptyRoomReservationInput);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [status, setStatus] = useState("");

  const activeResources = resources.filter((resource) => resource.isActive);
  const filteredReservations = useMemo(() => reservations.filter((reservation) => !monthFilter || reservation.date.startsWith(monthFilter)), [reservations, monthFilter]);
  const confirmedReservations = reservations.filter((reservation) => reservation.status === "confirmed");
  const selectedResourceReservations = selectedResourceId ? filteredReservations.filter((reservation) => reservation.resourceId === selectedResourceId) : filteredReservations;
  const reservationsByResource = resources.map((resource) => ({
    resource,
    count: confirmedReservations.filter((reservation) => reservation.resourceId === resource.id).length
  }));

  const refresh = async () => {
    const [nextResources, nextReservations, nextEvents] = await Promise.all([loadResources(token), loadRoomReservations(token), loadEvents(token)]);
    setResources(nextResources);
    setReservations(nextReservations);
    setEvents(nextEvents);
    setReservationForm((current) => ({ ...current, resourceId: current.resourceId || nextResources[0]?.id || "" }));
  };

  useEffect(() => {
    refresh().catch(() => setStatus("Nao foi possivel carregar ambientes."));
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
    setStatus("");
  };

  const startNewResource = () => {
    setSelectedResourceId(null);
    setResourceForm(emptyResourceInput);
    setStatus("");
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
    setStatus("");
  };

  const startNewReservation = () => {
    setSelectedReservationId(null);
    setReservationForm({ ...emptyRoomReservationInput, resourceId: selectedResourceId || resources[0]?.id || "" });
    setStatus("");
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
    if (user.role !== "admin") return;

    setStatus("Salvando ambiente...");
    try {
      const saved = await saveResource(token, resourceForm, selectedResourceId || undefined);
      await refresh();
      selectResource(saved);
      setStatus("Ambiente salvo.");
    } catch {
      setStatus("Nao foi possivel salvar o ambiente.");
    }
  };

  const handleReservationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user.role !== "admin") return;

    setStatus("Salvando reserva...");
    try {
      const saved = await saveRoomReservation(token, reservationForm, selectedReservationId || undefined);
      await refresh();
      selectReservation(saved);
      setStatus("Reserva salva.");
    } catch (error) {
      setStatus(error instanceof Error && error.message === "room-reservation-conflict" ? "Conflito: este ambiente ja esta reservado neste horario." : "Nao foi possivel salvar a reserva.");
    }
  };

  const handleDeleteResource = async () => {
    if (!selectedResourceId || user.role !== "admin") return;
    if (!window.confirm("Remover este ambiente?")) return;

    setStatus("Removendo ambiente...");
    try {
      await deleteResource(token, selectedResourceId);
      await refresh();
      startNewResource();
      setStatus("Ambiente removido.");
    } catch {
      setStatus("Nao foi possivel remover o ambiente. Verifique se existem reservas vinculadas.");
    }
  };

  const handleDeleteReservation = async () => {
    if (!selectedReservationId || user.role !== "admin") return;
    if (!window.confirm("Remover esta reserva?")) return;

    setStatus("Removendo reserva...");
    try {
      await deleteRoomReservation(token, selectedReservationId);
      await refresh();
      startNewReservation();
      setStatus("Reserva removida.");
    } catch {
      setStatus("Nao foi possivel remover a reserva.");
    }
  };

  return (
    <section className="panel events-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Ambientes</p>
          <h2>Reservas da igreja</h2>
        </div>
        {user.role === "admin" && <button className="secondary-button" type="button" onClick={startNewReservation}>Nova reserva</button>}
      </div>

      <div className="report-grid">
        <article><span>Ambientes</span><strong>{resources.length}</strong></article>
        <article><span>Ativos</span><strong>{activeResources.length}</strong></article>
        <article><span>Reservas</span><strong>{reservations.length}</strong></article>
        <article><span>Confirmadas</span><strong>{confirmedReservations.length}</strong></article>
      </div>

      <div className="filter-bar">
        <label>Mes<input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} /></label>
        <button className="secondary-button" type="button" onClick={() => setMonthFilter("")}>Todos</button>
        <button className="secondary-button" type="button" onClick={startNewResource}>Novo ambiente</button>
      </div>

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

      <div className="people-layout">
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
          <label>Nome<input disabled={user.role !== "admin"} value={resourceForm.name} onChange={(event) => updateResourceField("name", event.target.value)} /></label>
          <label>Local<input disabled={user.role !== "admin"} value={resourceForm.location} onChange={(event) => updateResourceField("location", event.target.value)} /></label>
          <label>Capacidade<input disabled={user.role !== "admin"} type="number" min="0" value={resourceForm.capacity} onChange={(event) => updateResourceField("capacity", event.target.value)} /></label>
          <label>
            Status
            <select disabled={user.role !== "admin"} value={resourceForm.isActive ? "true" : "false"} onChange={(event) => updateResourceField("isActive", event.target.value)}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </label>
          <label className="wide-field">Descricao<textarea disabled={user.role !== "admin"} value={resourceForm.description} onChange={(event) => updateResourceField("description", event.target.value)} /></label>
          <div className="form-footer">
            {user.role === "admin" && <button type="submit">{selectedResourceId ? "Salvar ambiente" : "Criar ambiente"}</button>}
            {user.role === "admin" && selectedResourceId && <button className="danger-button" type="button" onClick={handleDeleteResource}>Remover</button>}
          </div>
        </form>
      </div>

      <div className="people-layout">
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
            <select disabled={user.role !== "admin"} value={reservationForm.resourceId} onChange={(event) => updateReservationField("resourceId", event.target.value)}>
              <option value="">Selecione</option>
              {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}
            </select>
          </label>
          <label>Titulo<input disabled={user.role !== "admin"} value={reservationForm.title} onChange={(event) => updateReservationField("title", event.target.value)} /></label>
          <label>Data<input disabled={user.role !== "admin"} type="date" value={reservationForm.date} onChange={(event) => updateReservationField("date", event.target.value)} /></label>
          <label>Inicio<input disabled={user.role !== "admin"} type="time" value={reservationForm.startTime} onChange={(event) => updateReservationField("startTime", event.target.value)} /></label>
          <label>Fim<input disabled={user.role !== "admin"} type="time" value={reservationForm.endTime} onChange={(event) => updateReservationField("endTime", event.target.value)} /></label>
          <label>Responsavel<input disabled={user.role !== "admin"} value={reservationForm.reservedBy} onChange={(event) => updateReservationField("reservedBy", event.target.value)} /></label>
          <label>
            Evento
            <select disabled={user.role !== "admin"} value={reservationForm.eventId} onChange={(event) => updateReservationField("eventId", event.target.value)}>
              <option value="">Sem evento vinculado</option>
              {events.map((event) => <option key={event.id} value={event.id}>{event.date} - {event.title}</option>)}
            </select>
          </label>
          <label>
            Status
            <select disabled={user.role !== "admin"} value={reservationForm.status} onChange={(event) => updateReservationField("status", event.target.value)}>
              {Object.entries(roomReservationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="wide-field">Notas<textarea disabled={user.role !== "admin"} value={reservationForm.notes} onChange={(event) => updateReservationField("notes", event.target.value)} /></label>

          <div className="form-footer">
            {user.role === "admin" && <button type="submit">{selectedReservationId ? "Salvar reserva" : "Criar reserva"}</button>}
            {user.role === "admin" && selectedReservationId && <button className="danger-button" type="button" onClick={handleDeleteReservation}>Remover</button>}
            <p>{user.role === "admin" ? status : "Somente administradores podem alterar ambientes e reservas."}</p>
          </div>
        </form>
      </div>
    </section>
  );
};
