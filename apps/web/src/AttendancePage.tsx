import React, { useEffect, useState } from "react";
import type { AttendanceInput, AttendanceRecord, ChurchEvent, CurrentUser, GroupProfile, PersonProfile } from "@ecclesiaos/shared";
import { deleteAttendance, loadAttendance, loadEvents, loadGroups, loadPeople, saveAttendance } from "./api";
import { attendanceTypeLabels, emptyAttendanceInput } from "./constants";
import { toAttendanceInput } from "./mappers";

interface Props {
  token: string;
  user: CurrentUser;
}

export const AttendancePage: React.FC<Props> = ({ token, user }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [attendanceForm, setAttendanceForm] = useState<AttendanceInput>(emptyAttendanceInput);
  const [attendanceStatus, setAttendanceStatus] = useState("");

  const refreshAttendance = async () => setAttendance(await loadAttendance(token));

  useEffect(() => {
    loadPeople(token).then(setPeople).catch(() => setAttendanceStatus("Nao foi possivel carregar pessoas."));
    loadGroups(token).then(setGroups).catch(() => setAttendanceStatus("Nao foi possivel carregar grupos."));
    loadEvents(token).then(setEvents).catch(() => setAttendanceStatus("Nao foi possivel carregar eventos."));
    refreshAttendance().catch(() => setAttendanceStatus("Nao foi possivel carregar presencas."));
  }, [token]);

  const selectAttendance = (record: AttendanceRecord) => {
    setSelectedAttendanceId(record.id);
    setAttendanceForm(toAttendanceInput(record));
    setAttendanceStatus("");
  };

  const startNewAttendance = () => {
    setSelectedAttendanceId(null);
    setAttendanceForm(emptyAttendanceInput);
    setAttendanceStatus("");
  };

  const updateAttendanceField = (field: keyof AttendanceInput, value: string) => {
    const linkedEvent = field === "eventId" ? events.find((event) => event.id === value) : null;
    setAttendanceForm((current) => ({
      ...current,
      [field]: field === "type" && value === "group" ? "group" : value,
      ...(field === "type" && value === "service" ? { groupId: "" } : {}),
      ...(linkedEvent ? {
        date: linkedEvent.date,
        type: linkedEvent.groupId ? "group" : "service",
        groupId: linkedEvent.groupId
      } : {})
    }));
  };

  const togglePresentPerson = (personId: string) => {
    setAttendanceForm((current) => {
      const exists = current.presentPersonIds.includes(personId);
      const presentPersonIds = exists ? current.presentPersonIds.filter((id) => id !== personId) : [...current.presentPersonIds, personId];
      return { ...current, presentPersonIds };
    });
  };

  const handleAttendanceSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user.role !== "admin") return;

    setAttendanceStatus("Salvando...");
    try {
      const saved = await saveAttendance(token, attendanceForm, selectedAttendanceId || undefined);
      await refreshAttendance();
      selectAttendance(saved);
      setAttendanceStatus("Presenca salva.");
    } catch {
      setAttendanceStatus("Nao foi possivel salvar a presenca.");
    }
  };

  const handleDeleteAttendance = async () => {
    if (!selectedAttendanceId || user.role !== "admin") return;
    if (!window.confirm("Remover este registro de presenca?")) return;

    setAttendanceStatus("Removendo...");
    try {
      await deleteAttendance(token, selectedAttendanceId);
      await refreshAttendance();
      startNewAttendance();
      setAttendanceStatus("Presenca removida.");
    } catch {
      setAttendanceStatus("Nao foi possivel remover a presenca.");
    }
  };

  const groupName = (groupId: string) => groups.find((group) => group.id === groupId)?.name || "Sem grupo";
  const eventName = (eventId: string) => events.find((event) => event.id === eventId)?.title || "Sem evento";
  const totalPresent = attendance.reduce((sum, record) => sum + record.presentPersonIds.length, 0);
  const serviceRecords = attendance.filter((record) => record.type === "service").length;
  const groupRecords = attendance.filter((record) => record.type === "group").length;
  const averagePresent = attendance.length > 0 ? Math.round((totalPresent / attendance.length) * 10) / 10 : 0;
  const personSummary = people
    .map((person) => ({
      id: person.id,
      name: `${person.firstName} ${person.lastName}`.trim(),
      count: attendance.filter((record) => record.presentPersonIds.includes(person.id)).length
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const groupSummary = groups
    .map((group) => ({
      id: group.id,
      name: group.name,
      count: attendance.filter((record) => record.groupId === group.id).length
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const eventSummary = events
    .map((event) => ({
      id: event.id,
      name: event.title,
      count: attendance.filter((record) => record.eventId === event.id).length
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <section className="panel attendance-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Presenca</p>
          <h2>Registros de frequencia</h2>
        </div>
        {user.role === "admin" && <button className="secondary-button" type="button" onClick={startNewAttendance}>Nova presenca</button>}
      </div>

      <div className="report-grid">
        <article>
          <span>Registros</span>
          <strong>{attendance.length}</strong>
        </article>
        <article>
          <span>Presencas marcadas</span>
          <strong>{totalPresent}</strong>
        </article>
        <article>
          <span>Media por registro</span>
          <strong>{averagePresent}</strong>
        </article>
        <article>
          <span>Cultos / Grupos</span>
          <strong>{serviceRecords} / {groupRecords}</strong>
        </article>
      </div>

      <div className="report-columns">
        <div>
          <h3>Pessoas mais presentes</h3>
          {personSummary.length === 0 ? <p className="muted">Sem presencas registradas.</p> : personSummary.map((item) => (
            <p className="report-row" key={item.id}><span>{item.name}</span><strong>{item.count}</strong></p>
          ))}
        </div>
        <div>
          <h3>Grupos com registros</h3>
          {groupSummary.length === 0 ? <p className="muted">Sem registros de grupo.</p> : groupSummary.map((item) => (
            <p className="report-row" key={item.id}><span>{item.name}</span><strong>{item.count}</strong></p>
          ))}
        </div>
      </div>

      <div className="report-columns">
        <div>
          <h3>Presenca por evento</h3>
          {eventSummary.length === 0 ? <p className="muted">Sem presencas vinculadas a eventos.</p> : eventSummary.map((item) => (
            <p className="report-row" key={item.id}><span>{item.name}</span><strong>{item.count}</strong></p>
          ))}
        </div>
        <div>
          <h3>Eventos sem presenca</h3>
          {events.filter((event) => !attendance.some((record) => record.eventId === event.id)).slice(0, 5).map((event) => (
            <p className="report-row" key={event.id}><span>{event.title}</span><strong>{event.date}</strong></p>
          ))}
        </div>
      </div>

      <div className="people-layout">
        <div className="people-list" aria-label="Lista de presencas">
          {attendance.map((record) => (
            <button className={record.id === selectedAttendanceId ? "person-row selected" : "person-row"} key={record.id} type="button" onClick={() => selectAttendance(record)}>
              <strong>{record.date}</strong>
              <span>{attendanceTypeLabels[record.type]} - {record.eventId ? eventName(record.eventId) : record.type === "group" ? groupName(record.groupId) : "Culto geral"} - {record.presentPersonIds.length} pessoa(s)</span>
            </button>
          ))}
        </div>

        <form className="person-form" onSubmit={handleAttendanceSubmit}>
          <label>
            Evento
            <select disabled={user.role !== "admin"} value={attendanceForm.eventId} onChange={(event) => updateAttendanceField("eventId", event.target.value)}>
              <option value="">Sem evento vinculado</option>
              {events.map((event) => (
                <option value={event.id} key={event.id}>{event.date} - {event.title}</option>
              ))}
            </select>
          </label>
          <label>Data<input disabled={user.role !== "admin"} type="date" value={attendanceForm.date} onChange={(event) => updateAttendanceField("date", event.target.value)} /></label>
          <label>
            Tipo
            <select disabled={user.role !== "admin"} value={attendanceForm.type} onChange={(event) => updateAttendanceField("type", event.target.value)}>
              <option value="service">Culto geral</option>
              <option value="group">Grupo</option>
            </select>
          </label>
          <label>
            Grupo
            <select disabled={user.role !== "admin" || attendanceForm.type !== "group"} value={attendanceForm.groupId} onChange={(event) => updateAttendanceField("groupId", event.target.value)}>
              <option value="">Selecione</option>
              {groups.map((group) => (
                <option value={group.id} key={group.id}>{group.name}</option>
              ))}
            </select>
          </label>
          <label className="wide-field">Observacoes<textarea disabled={user.role !== "admin"} value={attendanceForm.notes} onChange={(event) => updateAttendanceField("notes", event.target.value)} /></label>

          <fieldset className="member-picker">
            <legend>Presentes</legend>
            {people.map((person) => (
              <label key={person.id}>
                <input disabled={user.role !== "admin"} type="checkbox" checked={attendanceForm.presentPersonIds.includes(person.id)} onChange={() => togglePresentPerson(person.id)} />
                {person.firstName} {person.lastName}
              </label>
            ))}
          </fieldset>

          <div className="form-footer">
            {user.role === "admin" && <button type="submit">{selectedAttendanceId ? "Salvar presenca" : "Criar presenca"}</button>}
            {user.role === "admin" && selectedAttendanceId && <button className="danger-button" type="button" onClick={handleDeleteAttendance}>Remover</button>}
            <p>{user.role === "admin" ? attendanceStatus : "Somente administradores podem alterar presencas."}</p>
          </div>
        </form>
      </div>
    </section>
  );
};
