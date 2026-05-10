import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Download } from "lucide-react";
import type { ChurchEvent, CurrentUser, EventRegistration, EventRegistrationStatus, GroupProfile, PersonProfile } from "@ecclesiaos/shared";
import { loadEventRegistrations, loadEvents, loadGroups, loadPeople } from "./api";
import { Card, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

const statusLabels: Record<PersonProfile["status"], string> = {
  member: "Membro",
  visitor: "Visitante"
};

const genderLabels: Record<PersonProfile["gender"], string> = {
  female: "Mulheres",
  male: "Homens",
  unspecified: "Nao informado"
};

const groupTypeLabels: Record<GroupProfile["type"], string> = {
  small_group: "Grupo",
  ministry: "Ministerio",
  class: "Classe",
  team: "Equipe"
};

const eventRegistrationStatusLabels: Record<EventRegistrationStatus, string> = {
  confirmed: "Confirmada",
  pending_payment: "Pagamento pendente",
  pending_email_confirmation: "Aguardando email",
  cancelled: "Cancelada"
};

const fullName = (person: PersonProfile) => `${person.firstName} ${person.lastName}`.trim();

const parseLocalDate = (value: string): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const ageFromBirthDate = (birthDate: string, now = new Date()): number | null => {
  const date = parseLocalDate(birthDate);
  if (!date) return null;
  let age = now.getFullYear() - date.getFullYear();
  const hadBirthday = now.getMonth() > date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 ? age : null;
};

const daysUntilBirthday = (birthDate: string, now = new Date()): number | null => {
  const date = parseLocalDate(birthDate);
  if (!date) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let nextBirthday = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (nextBirthday < today) nextBirthday = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate());
  return Math.round((nextBirthday.getTime() - today.getTime()) / 86400000);
};

const csvCell = (value: string | number | boolean) => `"${String(value).replace(/"/g, '""')}"`;

const downloadPeopleCsv = (people: PersonProfile[], groups: GroupProfile[]) => {
  const ministryNamesByPerson = new Map<string, string[]>();
  groups.forEach((group) => {
    if (group.type !== "ministry" && group.type !== "team") return;
    group.memberPersonIds.forEach((personId) => {
      const current = ministryNamesByPerson.get(personId) || [];
      ministryNamesByPerson.set(personId, [...current, group.name]);
    });
  });

  const rows = [
    ["Nome", "Status", "Nascimento", "Membrou em", "Genero", "Batismo", "Telefone", "Email", "Ministerios", "Notas"],
    ...people.map((person) => [
      fullName(person),
      statusLabels[person.status],
      person.birthDate,
      person.membershipDate,
      genderLabels[person.gender],
      person.baptized ? "Sim" : "Nao",
      person.phone,
      person.email,
      (ministryNamesByPerson.get(person.id) || []).join("; "),
      person.notes
    ])
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ecclesiaos-pessoas-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const downloadEventCsv = (rows: EventReportRow[]) => {
  const csvRows = [
    ["Evento", "Data", "Nome", "Email", "Telefone", "Quantidade", "Status", "Presenca", "Check-in", "Valor", "Notas"],
    ...rows.map((row) => [
      row.eventTitle,
      row.eventDate,
      row.registration.name,
      row.registration.email,
      row.registration.phone,
      row.registration.quantity,
      row.statusLabel,
      row.presenceLabel,
      row.registration.checkedInAt,
      row.registration.amountDue.toFixed(2),
      row.registration.notes
    ])
  ];
  const csv = csvRows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ecclesiaos-eventos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

type EventPresenceFilter = "all" | "present" | "absent";

interface EventReportRow {
  event: ChurchEvent;
  eventTitle: string;
  eventDate: string;
  registration: EventRegistration;
  statusLabel: string;
  presenceLabel: string;
}

export const ReportsPage: React.FC<Props> = ({ token }) => {
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventIdFilter, setEventIdFilter] = useState("all");
  const [eventStatusFilter, setEventStatusFilter] = useState<EventRegistrationStatus | "all">("all");
  const [eventPresenceFilter, setEventPresenceFilter] = useState<EventPresenceFilter>("all");
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([loadPeople(token), loadGroups(token), loadEvents(token), loadEventRegistrations(token)])
      .then(([peopleData, groupData, eventData, registrationData]) => {
        setPeople(peopleData);
        setGroups(groupData);
        setEvents(eventData);
        setEventRegistrations(registrationData);
        setStatus("");
      })
      .catch(() => setStatus("Nao foi possivel carregar os dados dos relatorios."));
  }, [token]);

  const report = useMemo(() => {
    const members = people.filter((person) => person.status === "member");
    const visitors = people.filter((person) => person.status === "visitor");
    const baptized = members.filter((person) => person.baptized);
    const withMembershipDate = members.filter((person) => person.membershipDate);
    const birthdays = people
      .map((person) => ({ person, days: daysUntilBirthday(person.birthDate) }))
      .filter((item): item is { person: PersonProfile; days: number } => item.days !== null && item.days <= 7)
      .sort((a, b) => a.days - b.days || fullName(a.person).localeCompare(fullName(b.person)));

    const membersByGender = {
      female: members.filter((person) => person.gender === "female").length,
      male: members.filter((person) => person.gender === "male").length,
      unspecified: members.filter((person) => person.gender === "unspecified").length
    };

    const ageBands = members.reduce(
      (acc, person) => {
        const age = ageFromBirthDate(person.birthDate);
        if (age === null) acc.unknown += 1;
        else if (age <= 11) acc.kids += 1;
        else if (age <= 17) acc.teenagers += 1;
        else acc.adults += 1;
        return acc;
      },
      { kids: 0, teenagers: 0, adults: 0, unknown: 0 }
    );

    const ministrySummary = groups
      .filter((group) => group.type === "ministry" || group.type === "team")
      .map((group) => ({
        id: group.id,
        name: group.name,
        type: group.type,
        members: group.memberPersonIds.length,
        positions: group.servicePositions.length
      }))
      .sort((a, b) => b.members - a.members || a.name.localeCompare(b.name));

    return { members, visitors, baptized, withMembershipDate, birthdays, membersByGender, ageBands, ministrySummary };
  }, [people, groups]);

  const eventReport = useMemo(() => {
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const rows = eventRegistrations
      .map((registration): EventReportRow | null => {
        const event = eventsById.get(registration.eventId);
        if (!event) return null;
        return {
          event,
          eventTitle: event.title,
          eventDate: event.date,
          registration,
          statusLabel: eventRegistrationStatusLabels[registration.status],
          presenceLabel: registration.checkedInAt ? "Presente" : "Ausente"
        };
      })
      .filter((row): row is EventReportRow => Boolean(row))
      .filter((row) => !eventStartDate || row.eventDate >= eventStartDate)
      .filter((row) => !eventEndDate || row.eventDate <= eventEndDate)
      .filter((row) => eventIdFilter === "all" || row.event.id === eventIdFilter)
      .filter((row) => eventStatusFilter === "all" || row.registration.status === eventStatusFilter)
      .filter((row) => {
        if (eventPresenceFilter === "present") return Boolean(row.registration.checkedInAt);
        if (eventPresenceFilter === "absent") return !row.registration.checkedInAt && row.registration.status === "confirmed";
        return true;
      })
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate) || a.eventTitle.localeCompare(b.eventTitle) || a.registration.name.localeCompare(b.registration.name));

    const presentQuantity = rows.filter((row) => row.registration.checkedInAt).reduce((sum, row) => sum + row.registration.quantity, 0);
    const absentQuantity = rows.filter((row) => !row.registration.checkedInAt && row.registration.status === "confirmed").reduce((sum, row) => sum + row.registration.quantity, 0);
    const pendingQuantity = rows.filter((row) => row.registration.status === "pending_payment" || row.registration.status === "pending_email_confirmation").reduce((sum, row) => sum + row.registration.quantity, 0);
    const confirmedQuantity = rows.filter((row) => row.registration.status === "confirmed").reduce((sum, row) => sum + row.registration.quantity, 0);
    const amountConfirmed = rows.filter((row) => row.registration.status === "confirmed").reduce((sum, row) => sum + row.registration.amountDue, 0);
    const eventCount = new Set(rows.map((row) => row.event.id)).size;

    return { rows, presentQuantity, absentQuantity, pendingQuantity, confirmedQuantity, amountConfirmed, eventCount };
  }, [events, eventRegistrations, eventStartDate, eventEndDate, eventIdFilter, eventStatusFilter, eventPresenceFilter]);

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        icon={BarChart3}
        title="Relatorios"
        description="Indicadores de pessoas, aniversariantes e composicao da membresia."
        actions={(
          <button className="secondary-button" type="button" onClick={() => downloadPeopleCsv(people, groups)}>
            <Download size={16} /> Exportar pessoas
          </button>
        )}
      />

      {status && <p className="form-status">{status}</p>}

      <Card>
        <div className="report-grid">
          <article>
            <span>Pessoas</span>
            <strong>{people.length}</strong>
          </article>
          <article>
            <span>Membros</span>
            <strong>{report.members.length}</strong>
          </article>
          <article>
            <span>Visitantes</span>
            <strong>{report.visitors.length}</strong>
          </article>
          <article>
            <span>Batizados</span>
            <strong>{report.baptized.length}</strong>
          </article>
        </div>
      </Card>

      <div className="report-columns">
        <Card>
          <h3>Aniversariantes da semana</h3>
          {report.birthdays.length === 0 ? <p className="muted">Nenhum aniversario nos proximos 7 dias.</p> : report.birthdays.map(({ person, days }) => (
            <p className="report-row" key={person.id}>
              <span>{fullName(person)}</span>
              <strong>{days === 0 ? "Hoje" : `${days} dia${days > 1 ? "s" : ""}`}</strong>
            </p>
          ))}
        </Card>

        <Card>
          <h3>Membros por perfil</h3>
          <p className="report-row"><span>Mulheres</span><strong>{report.membersByGender.female}</strong></p>
          <p className="report-row"><span>Homens</span><strong>{report.membersByGender.male}</strong></p>
          <p className="report-row"><span>Genero nao informado</span><strong>{report.membersByGender.unspecified}</strong></p>
          <p className="report-row"><span>Com data de membresia</span><strong>{report.withMembershipDate.length}</strong></p>
        </Card>
      </div>

      <div className="report-columns">
        <Card>
          <h3>Membros por faixa</h3>
          <p className="report-row"><span>Kids</span><strong>{report.ageBands.kids}</strong></p>
          <p className="report-row"><span>Adolescentes</span><strong>{report.ageBands.teenagers}</strong></p>
          <p className="report-row"><span>Adultos</span><strong>{report.ageBands.adults}</strong></p>
          <p className="report-row"><span>Sem data de nascimento</span><strong>{report.ageBands.unknown}</strong></p>
        </Card>

        <Card>
          <h3>Ministerios e equipes</h3>
          {report.ministrySummary.length === 0 ? <p className="muted">Nenhum ministerio ou equipe cadastrado.</p> : report.ministrySummary.slice(0, 8).map((group) => (
            <p className="report-row" key={group.id}>
              <span>{group.name} <small>({groupTypeLabels[group.type]})</small></span>
              <strong>{group.members} pessoa{group.members === 1 ? "" : "s"}</strong>
            </p>
          ))}
        </Card>
      </div>

      <Card>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Eventos</p>
            <h2>Historico de inscricoes e check-in</h2>
            <p className="muted">Filtre eventos por periodo, status e presenca antes de exportar.</p>
          </div>
          <button className="secondary-button" type="button" onClick={() => downloadEventCsv(eventReport.rows)} disabled={eventReport.rows.length === 0}>
            <Download size={16} /> Exportar eventos
          </button>
        </div>

        <div className="filter-bar reports-event-filters">
          <label>Inicio<input type="date" value={eventStartDate} onChange={(event) => setEventStartDate(event.target.value)} /></label>
          <label>Fim<input type="date" value={eventEndDate} onChange={(event) => setEventEndDate(event.target.value)} /></label>
          <label>
            Evento
            <select value={eventIdFilter} onChange={(event) => setEventIdFilter(event.target.value)}>
              <option value="all">Todos</option>
              {events.filter((event) => event.registrationEnabled).map((event) => (
                <option key={event.id} value={event.id}>{event.date} - {event.title}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={eventStatusFilter} onChange={(event) => setEventStatusFilter(event.target.value as EventRegistrationStatus | "all")}>
              <option value="all">Todos</option>
              <option value="confirmed">Confirmadas</option>
              <option value="pending_payment">Pagamento pendente</option>
              <option value="pending_email_confirmation">Aguardando email</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </label>
          <label>
            Presenca
            <select value={eventPresenceFilter} onChange={(event) => setEventPresenceFilter(event.target.value as EventPresenceFilter)}>
              <option value="all">Todos</option>
              <option value="present">Presentes</option>
              <option value="absent">Ausentes confirmados</option>
            </select>
          </label>
        </div>

        <div className="report-grid">
          <article><span>Eventos</span><strong>{eventReport.eventCount}</strong></article>
          <article><span>Confirmados</span><strong>{eventReport.confirmedQuantity}</strong></article>
          <article><span>Presentes</span><strong>{eventReport.presentQuantity}</strong></article>
          <article><span>Ausentes</span><strong>{eventReport.absentQuantity}</strong></article>
          <article><span>Pendentes</span><strong>{eventReport.pendingQuantity}</strong></article>
          <article><span>Receita confirmada</span><strong>BRL {eventReport.amountConfirmed.toFixed(2)}</strong></article>
        </div>

        <div className="registration-list reports-event-list">
          {eventReport.rows.length === 0 ? <p className="muted">Nenhuma inscricao encontrada para os filtros atuais.</p> : eventReport.rows.slice(0, 80).map((row) => (
            <article className={row.registration.checkedInAt ? "registration-row selected" : "registration-row"} key={row.registration.id}>
              <button type="button">
                <strong>{row.registration.name}</strong>
                <span>{row.eventDate} - {row.eventTitle}</span>
                <small>{row.statusLabel} - {row.presenceLabel} - {row.registration.quantity} vaga(s)</small>
                <small>{row.registration.email} {row.registration.phone ? `- ${row.registration.phone}` : ""}</small>
              </button>
              <div className="response-actions">
                <span className={row.registration.checkedInAt ? "status-pill success" : "status-pill muted"}>{row.presenceLabel}</span>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </>
  );
};
