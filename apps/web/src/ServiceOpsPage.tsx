import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, Music, UsersRound, ListChecks } from "lucide-react";
import type { ChurchEvent, CurrentUser, EventRegistration, GroupProfile, PersonProfile, ServiceChecklist, ServingPlan, Song, WorshipSet } from "@ecclesiaos/shared";
import { loadEventRegistrations, loadEvents, loadGroups, loadPeople, loadServiceChecklists, loadServingPlans, loadSongs, loadWorshipSets } from "./api";
import { eventTypeLabels } from "./constants";
import { Card, EmptyState, PageHeader, StatusPill } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

const todayString = () => new Date().toISOString().slice(0, 10);

const fullName = (person?: PersonProfile) => person ? `${person.firstName} ${person.lastName}`.trim() : "Pessoa nao encontrada";

const assignmentStatusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado"
};

const registrationStatusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada"
};

export const ServiceOpsPage: React.FC<Props> = ({ token, user }) => {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [plans, setPlans] = useState<ServingPlan[]>([]);
  const [sets, setSets] = useState<WorshipSet[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [checklists, setChecklists] = useState<ServiceChecklist[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([
      loadEvents(token),
      loadGroups(token),
      loadPeople(token),
      loadServingPlans(token),
      loadWorshipSets(token),
      loadSongs(token),
      loadServiceChecklists(token),
      user.role === "admin" ? loadEventRegistrations(token) : Promise.resolve([])
    ])
      .then(([eventData, groupData, peopleData, planData, setData, songData, checklistData, registrationData]) => {
        setEvents(eventData);
        setGroups(groupData);
        setPeople(peopleData);
        setPlans(planData);
        setSets(setData);
        setSongs(songData);
        setChecklists(checklistData);
        setRegistrations(registrationData);
        const nextEvent = eventData.find((event) => event.date >= todayString() && event.type === "service") || eventData.find((event) => event.date >= todayString()) || eventData[0];
        setSelectedEventId((current) => current || nextEvent?.id || "");
        setStatus("");
      })
      .catch(() => setStatus("Nao foi possivel carregar a operacao do culto."));
  }, [token, user.role]);

  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);
  const groupsById = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups]);
  const songsById = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs]);
  const operationalEvents = useMemo(() => [...events].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)), [events]);
  const selectedEvent = events.find((event) => event.id === selectedEventId) || null;
  const selectedPlans = selectedEvent ? plans.filter((plan) => plan.eventId === selectedEvent.id) : [];
  const selectedSets = selectedEvent ? sets.filter((set) => set.eventId === selectedEvent.id) : [];
  const selectedChecklists = selectedEvent ? checklists.filter((checklist) => checklist.eventId === selectedEvent.id) : [];
  const selectedRegistrations = selectedEvent ? registrations.filter((registration) => registration.eventId === selectedEvent.id && registration.status !== "cancelled") : [];
  const requestedTeams = selectedEvent ? selectedEvent.requestedTeamIds.map((id) => groupsById.get(id)).filter((group): group is GroupProfile => Boolean(group)) : [];
  const assignments = selectedPlans.flatMap((plan) => plan.assignments.map((assignment) => ({ ...assignment, planTitle: plan.title, groupId: plan.groupId })));
  const checklistItems = selectedChecklists.flatMap((checklist) => checklist.items.map((item) => ({ ...item, checklistTitle: checklist.title }))).sort((a, b) => a.order - b.order);
  const setItems = selectedSets.flatMap((set) => set.items.map((item) => ({ ...item, setTitle: set.title })));
  const confirmedAssignments = assignments.filter((assignment) => assignment.status === "confirmed").length;
  const pendingAssignments = assignments.filter((assignment) => assignment.status === "pending").length;
  const completedItems = checklistItems.filter((item) => item.completed).length;
  const registeredQuantity = selectedRegistrations.reduce((sum, registration) => sum + registration.quantity, 0);

  return (
    <>
      <PageHeader
        eyebrow="Operacao"
        icon={ClipboardList}
        title="Operacao do culto"
        description="Visao unica de agenda, equipes, escala, repertorio, liturgia e inscricoes."
      />

      {status && <p className="form-status">{status}</p>}

      <div className="events-panel">
        <div className="filter-bar">
          <label>
            Culto/evento
            <select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
              <option value="">Selecione</option>
              {operationalEvents.map((event) => (
                <option key={event.id} value={event.id}>{event.date} {event.startTime} - {event.title}</option>
              ))}
            </select>
          </label>
        </div>

        {!selectedEvent ? (
          <EmptyState icon={ClipboardList} title="Nenhum culto selecionado" description="Selecione um evento para ver a operacao." />
        ) : (
          <>
            <div className="receipt-preview">
              <p className="eyebrow">{eventTypeLabels[selectedEvent.type]}</p>
              <h2>{selectedEvent.title}</h2>
              <p>{selectedEvent.date} {selectedEvent.startTime || ""} {selectedEvent.location ? `- ${selectedEvent.location}` : ""}</p>
              {selectedEvent.description && <p>{selectedEvent.description}</p>}
            </div>

            <div className="report-grid">
              <article><span>Equipes</span><strong>{requestedTeams.length}</strong></article>
              <article><span>Escalados</span><strong>{assignments.length}</strong></article>
              <article><span>Musicas</span><strong>{setItems.length}</strong></article>
              <article><span>Liturgia</span><strong>{completedItems}/{checklistItems.length}</strong></article>
            </div>

            <div className="report-grid">
              <article><span>Confirmados</span><strong>{confirmedAssignments}</strong></article>
              <article><span>Pendentes</span><strong>{pendingAssignments}</strong></article>
              <article><span>Inscritos</span><strong>{registeredQuantity}</strong></article>
              <article><span>Repertorios</span><strong>{selectedSets.length}</strong></article>
            </div>

            <div className="report-columns">
              <Card>
                <h3><UsersRound size={18} /> Equipes e escala</h3>
                {requestedTeams.length === 0 ? <p className="muted">Nenhuma equipe solicitada na Agenda.</p> : requestedTeams.map((group) => (
                  <p className="report-row" key={group.id}><span>{group.name}</span><strong>{assignments.filter((assignment) => assignment.groupId === group.id).length} escala(s)</strong></p>
                ))}
                {assignments.length === 0 ? <p className="muted">Nenhuma pessoa escalada.</p> : assignments.map((assignment) => (
                  <p className="report-row" key={assignment.id || `${assignment.personId}-${assignment.role}`}>
                    <span>{fullName(peopleById.get(assignment.personId))} - {assignment.role || "Funcao"}</span>
                    <StatusPill tone={assignment.status === "confirmed" ? "success" : assignment.status === "declined" ? "danger" : "muted"}>{assignmentStatusLabels[assignment.status] || assignment.status}</StatusPill>
                  </p>
                ))}
              </Card>

              <Card>
                <h3><Music size={18} /> Repertorio</h3>
                {selectedSets.length === 0 ? <p className="muted">Nenhum repertorio vinculado.</p> : selectedSets.map((set) => (
                  <div key={set.id}>
                    <p className="report-row"><span>{set.title}</span><strong>{set.items.length} musica(s)</strong></p>
                    {set.items.map((item, index) => (
                      <p className="report-row" key={`${set.id}-${index}`}><span>{index + 1}. {songsById.get(item.songId)?.title || "Musica removida"}</span><strong>Tom {item.key || songsById.get(item.songId)?.defaultKey || "n/i"}</strong></p>
                    ))}
                  </div>
                ))}
              </Card>
            </div>

            <div className="report-columns">
              <Card>
                <h3><ListChecks size={18} /> Liturgia</h3>
                {checklistItems.length === 0 ? <p className="muted">Nenhuma liturgia vinculada.</p> : checklistItems.map((item) => (
                  <p className="report-row" key={item.id}>
                    <span>{item.scheduledTime ? `${item.scheduledTime} - ` : ""}{item.title}</span>
                    <StatusPill tone={item.completed ? "success" : "muted"}>{item.completed ? "Concluido" : "Pendente"}</StatusPill>
                  </p>
                ))}
              </Card>

              <Card>
                <h3>Inscricoes e check-in</h3>
                {user.role !== "admin" ? <p className="muted">Somente administradores veem inscricoes neste painel.</p> : selectedRegistrations.length === 0 ? <p className="muted">Sem inscricoes vinculadas.</p> : selectedRegistrations.map((registration) => (
                  <p className="report-row" key={registration.id}>
                    <span>{registration.name} - {registration.quantity} vaga(s)</span>
                    <StatusPill tone={registration.checkedInAt ? "success" : "muted"}>{registration.checkedInAt ? "Check-in" : registrationStatusLabels[registration.status] || registration.status}</StatusPill>
                  </p>
                ))}
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
};
