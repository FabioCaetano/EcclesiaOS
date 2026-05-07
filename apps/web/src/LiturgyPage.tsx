import React, { useEffect, useMemo, useState } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { canManageModule } from "@ecclesiaos/shared";
import type { ChurchEvent, CurrentUser, PersonProfile, ServiceChecklist, ServiceChecklistInput } from "@ecclesiaos/shared";
import { deleteServiceChecklist, loadEvents, loadPeople, loadServiceChecklists, saveServiceChecklist } from "./api";
import { Card, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

const emptyChecklist: ServiceChecklistInput = {
  eventId: "",
  title: "",
  date: "",
  notes: "",
  items: []
};

const eventLabel = (event: ChurchEvent) => `${event.date} ${event.startTime} - ${event.title}`;

export const LiturgyPage: React.FC<Props> = ({ token, user }) => {
  const [checklists, setChecklists] = useState<ServiceChecklist[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [checklistForm, setChecklistForm] = useState<ServiceChecklistInput>(emptyChecklist);
  const [status, setStatus] = useState("");

  const canManage = canManageModule(user.role, "liturgy");

  const refresh = async () => {
    const [checklistData, eventData, peopleData] = await Promise.all([loadServiceChecklists(token), loadEvents(token), loadPeople(token)]);
    setChecklists(checklistData);
    setEvents(eventData);
    setPeople(peopleData);
  };

  useEffect(() => {
    refresh().catch(() => setStatus("Nao foi possivel carregar liturgias."));
  }, [token]);

  const selectedChecklist = checklists.find((checklist) => checklist.id === selectedChecklistId) || null;
  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, `${person.firstName} ${person.lastName}`.trim()])), [people]);
  const upcomingEvents = useMemo(() => [...events].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)).slice(0, 60), [events]);

  const selectChecklist = (checklist: ServiceChecklist) => {
    setSelectedChecklistId(checklist.id);
    setChecklistForm({
      eventId: checklist.eventId,
      title: checklist.title,
      date: checklist.date,
      notes: checklist.notes,
      items: checklist.items
    });
    setStatus("");
  };

  const startNewChecklist = () => {
    setSelectedChecklistId(null);
    setChecklistForm(emptyChecklist);
    setStatus("");
  };

  const handleChecklistEventChange = (eventId: string) => {
    const event = events.find((item) => item.id === eventId);
    setChecklistForm((current) => ({
      ...current,
      eventId,
      title: event ? `Liturgia - ${event.title}` : current.title,
      date: event?.date || current.date
    }));
  };

  const addChecklistItem = () => {
    setChecklistForm((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: "",
          title: "",
          responsiblePersonId: "",
          scheduledTime: "",
          notes: "",
          completed: false,
          order: current.items.length + 1
        }
      ]
    }));
  };

  const updateChecklistItem = (index: number, field: keyof ServiceChecklistInput["items"][number], value: string | boolean) => {
    setChecklistForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    }));
  };

  const removeChecklistItem = (index: number) => {
    setChecklistForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, order: itemIndex + 1 }))
    }));
  };

  const handleChecklistSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;
    setStatus("Salvando liturgia...");
    try {
      const saved = await saveServiceChecklist(token, checklistForm, selectedChecklistId || undefined);
      await refresh();
      selectChecklist(saved);
      setStatus("Liturgia salva.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel salvar a liturgia.");
    }
  };

  const handleDeleteChecklist = async () => {
    if (!canManage || !selectedChecklistId || !window.confirm("Remover esta liturgia?")) return;
    await deleteServiceChecklist(token, selectedChecklistId);
    await refresh();
    startNewChecklist();
    setStatus("Liturgia removida.");
  };

  const completedCount = checklists.reduce((sum, checklist) => sum + checklist.items.filter((item) => item.completed).length, 0);
  const itemCount = checklists.reduce((sum, checklist) => sum + checklist.items.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Operacao"
        icon={ListChecks}
        title="Liturgia"
        description="Planejamento e checklist do culto com ordem, responsaveis e acompanhamento."
        actions={canManage && (
          <button className="secondary-button" type="button" onClick={startNewChecklist}><Plus size={16} /> Liturgia</button>
        )}
      />

      {status && <p className="form-status">{status}</p>}

      <div className="report-grid">
        <article><span>Liturgias</span><strong>{checklists.length}</strong></article>
        <article><span>Itens</span><strong>{itemCount}</strong></article>
        <article><span>Concluidos</span><strong>{completedCount}</strong></article>
        <article><span>Permissao</span><strong>{canManage ? "Edicao" : "Leitura"}</strong></article>
      </div>

      <div className="people-layout">
        <Card className="people-list" aria-label="Lista de liturgias">
          <h3>Liturgias</h3>
          {checklists.length === 0 ? <p className="muted">Nenhuma liturgia cadastrada.</p> : checklists.map((checklist) => {
            const completed = checklist.items.filter((item) => item.completed).length;
            return (
              <button className={selectedChecklistId === checklist.id ? "person-row selected" : "person-row"} key={checklist.id} type="button" onClick={() => selectChecklist(checklist)}>
                <strong>{checklist.title}</strong>
                <span>{checklist.date || "Sem data"} - {completed}/{checklist.items.length} concluidos</span>
              </button>
            );
          })}
        </Card>

        <form className="person-form" onSubmit={handleChecklistSubmit}>
          <label className="wide-field">
            Culto/evento
            <select disabled={!canManage} value={checklistForm.eventId} onChange={(event) => handleChecklistEventChange(event.target.value)}>
              <option value="">Sem evento vinculado</option>
              {upcomingEvents.map((event) => <option key={event.id} value={event.id}>{eventLabel(event)}</option>)}
            </select>
          </label>
          <label>Titulo<input disabled={!canManage} value={checklistForm.title} onChange={(event) => setChecklistForm((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Data<input disabled={!canManage} type="date" value={checklistForm.date} onChange={(event) => setChecklistForm((current) => ({ ...current, date: event.target.value }))} /></label>
          <div className="wide-field">
            <div className="section-title-row">
              <h3>Ordem do culto</h3>
              {canManage && <button className="secondary-button" type="button" onClick={addChecklistItem}><Plus size={16} /> Item</button>}
            </div>
            {checklistForm.items.length === 0 ? <p className="muted">Adicione itens da liturgia ou tarefas do culto.</p> : checklistForm.items.map((item, index) => (
              <div className="checklist-editor-row" key={`${item.id}-${index}`}>
                <label>
                  Concluido
                  <input disabled={!canManage} type="checkbox" checked={item.completed} onChange={(event) => updateChecklistItem(index, "completed", event.target.checked)} />
                </label>
                <label>
                  Horario
                  <input disabled={!canManage} type="time" value={item.scheduledTime} onChange={(event) => updateChecklistItem(index, "scheduledTime", event.target.value)} />
                </label>
                <label>
                  Item
                  <input disabled={!canManage} value={item.title} onChange={(event) => updateChecklistItem(index, "title", event.target.value)} />
                </label>
                <label>
                  Responsavel
                  <select disabled={!canManage} value={item.responsiblePersonId} onChange={(event) => updateChecklistItem(index, "responsiblePersonId", event.target.value)}>
                    <option value="">Sem responsavel</option>
                    {people.map((person) => <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>)}
                  </select>
                </label>
                <label className="wide-field">
                  Notas
                  <input disabled={!canManage} value={item.notes} onChange={(event) => updateChecklistItem(index, "notes", event.target.value)} />
                </label>
                <p className="wide-field muted">{item.responsiblePersonId ? `Responsavel: ${peopleById.get(item.responsiblePersonId) || "Pessoa nao encontrada"}` : "Sem responsavel definido"}</p>
                {canManage && <button className="danger-button wide-field" type="button" onClick={() => removeChecklistItem(index)}><Trash2 size={16} /> Remover item</button>}
              </div>
            ))}
          </div>
          <label className="wide-field">Notas da liturgia<textarea disabled={!canManage} value={checklistForm.notes} onChange={(event) => setChecklistForm((current) => ({ ...current, notes: event.target.value }))} /></label>
          <div className="form-footer">
            {canManage && <button type="submit">{selectedChecklist ? "Salvar liturgia" : "Criar liturgia"}</button>}
            {canManage && selectedChecklist && <button className="danger-button" type="button" onClick={handleDeleteChecklist}><Trash2 size={16} /> Remover</button>}
          </div>
        </form>
      </div>
    </>
  );
};
