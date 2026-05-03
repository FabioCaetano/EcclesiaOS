import React, { useEffect, useMemo, useState } from "react";
import type { CurrentUser, GroupProfile, PersonProfile, ServingAssignment, ServingNotification, ServingPlan, ServingPlanInput } from "@ecclesiaos/shared";
import { deleteServingPlan, loadGroups, loadPeople, loadServingNotifications, loadServingPlans, saveServingPlan, updateServingAssignmentStatus } from "./api";
import { emptyServingPlanInput } from "./constants";
import { toServingPlanInput } from "./mappers";

interface Props {
  token: string;
  user: CurrentUser;
}

const emptyAssignment = (): ServingAssignment => ({
  id: "",
  personId: "",
  role: "",
  status: "pending",
  notes: ""
});

const assignmentStatusLabels: Record<ServingAssignment["status"], string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusado"
};

export const ServingPage: React.FC<Props> = ({ token, user }) => {
  const [plans, setPlans] = useState<ServingPlan[]>([]);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [notifications, setNotifications] = useState<ServingNotification[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<ServingPlanInput>(emptyServingPlanInput);
  const [servingStatus, setServingStatus] = useState("");

  const refreshPlans = async () => setPlans(await loadServingPlans(token));
  const refreshNotifications = async () => setNotifications(await loadServingNotifications(token));

  useEffect(() => {
    loadPeople(token).then(setPeople).catch(() => setServingStatus("Nao foi possivel carregar pessoas."));
    loadGroups(token).then(setGroups).catch(() => setServingStatus("Nao foi possivel carregar grupos."));
    refreshPlans().catch(() => setServingStatus("Nao foi possivel carregar escalas."));
    refreshNotifications().catch(() => setServingStatus("Nao foi possivel carregar notificacoes de escala."));
  }, [token]);

  const selectPlan = (plan: ServingPlan) => {
    setSelectedPlanId(plan.id);
    setPlanForm(toServingPlanInput(plan));
    setServingStatus("");
  };

  const startNewPlan = () => {
    setSelectedPlanId(null);
    setPlanForm(emptyServingPlanInput);
    setServingStatus("");
  };

  const updatePlanField = (field: keyof ServingPlanInput, value: string) => {
    setPlanForm((current) => ({ ...current, [field]: value }));
  };

  const updateAssignment = (index: number, field: keyof ServingAssignment, value: string) => {
    setPlanForm((current) => ({
      ...current,
      assignments: current.assignments.map((assignment, itemIndex) => itemIndex === index ? { ...assignment, [field]: value } : assignment)
    }));
  };

  const addAssignment = () => {
    setPlanForm((current) => ({ ...current, assignments: [...current.assignments, emptyAssignment()] }));
  };

  const removeAssignment = (index: number) => {
    setPlanForm((current) => ({ ...current, assignments: current.assignments.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const handlePlanSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user.role !== "admin" && !canEditAssignments) return;
    if (!selectedPlanId && user.role !== "admin") return;

    setServingStatus("Salvando...");
    try {
      const saved = await saveServingPlan(token, planForm, selectedPlanId || undefined);
      await refreshPlans();
      await refreshNotifications();
      selectPlan(saved);
      setServingStatus("Escala salva.");
    } catch {
      setServingStatus("Nao foi possivel salvar a escala.");
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlanId || user.role !== "admin") return;
    if (!window.confirm("Remover esta escala?")) return;

    setServingStatus("Removendo...");
    try {
      await deleteServingPlan(token, selectedPlanId);
      await refreshPlans();
      await refreshNotifications();
      startNewPlan();
      setServingStatus("Escala removida.");
    } catch {
      setServingStatus("Nao foi possivel remover a escala.");
    }
  };

  const personName = (personId: string) => people.find((person) => person.id === personId)?.firstName || "Pessoa";
  const groupName = (groupId: string) => groups.find((group) => group.id === groupId)?.name || "Sem grupo";

  const myLeadingGroupIds = useMemo(() => {
    if (!user.personId) return [] as string[];
    return groups.filter((group) => group.leaderPersonId === user.personId).map((group) => group.id);
  }, [groups, user.personId]);

  const isLeaderOfGroup = (groupId: string) => myLeadingGroupIds.includes(groupId);
  const visiblePlans = useMemo(() => {
    if (user.role === "admin") return plans;
    if (myLeadingGroupIds.length === 0) return plans;
    return plans.filter((plan) => isLeaderOfGroup(plan.groupId));
  }, [plans, user.role, myLeadingGroupIds]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || null;
  const canManagePlan = (plan: ServingPlan | null) => {
    if (user.role === "admin") return true;
    if (!plan) return false;
    return isLeaderOfGroup(plan.groupId);
  };
  const canEditMeta = user.role === "admin";
  const canEditAssignments = canManagePlan(selectedPlan);
  const eligiblePeople = useMemo(() => {
    if (user.role === "admin" || !selectedPlan) return people;
    const group = groups.find((item) => item.id === selectedPlan.groupId);
    if (!group) return [];
    const memberSet = new Set(group.memberPersonIds);
    return people.filter((person) => memberSet.has(person.id));
  }, [people, groups, selectedPlan, user.role]);
  const declinedCount = (plan: ServingPlan) => plan.assignments.filter((assignment) => assignment.status === "declined").length;
  const confirmedCount = (plan: ServingPlan) => plan.assignments.filter((assignment) => assignment.status === "confirmed").length;
  const pendingCount = (plan: ServingPlan) => plan.assignments.filter((assignment) => assignment.status === "pending").length;

  const pendingAssignments = plans.flatMap((plan) => plan.assignments.map((assignment) => ({ plan, assignment }))).filter((item) => item.assignment.status === "pending");
  const declinedAssignments = plans.flatMap((plan) => plan.assignments.map((assignment) => ({ plan, assignment }))).filter((item) => item.assignment.status === "declined");
  const myAssignments = user.personId ? plans.flatMap((plan) => plan.assignments.map((assignment) => ({ plan, assignment }))).filter((item) => item.assignment.personId === user.personId) : [];

  const respondToAssignment = async (planId: string, assignmentId: string, status: ServingAssignment["status"]) => {
    setServingStatus("Atualizando resposta...");
    try {
      const updated = await updateServingAssignmentStatus(token, planId, assignmentId, { status, notes: "" });
      await refreshPlans();
      await refreshNotifications();
      if (selectedPlanId === updated.id) selectPlan(updated);
      setServingStatus(status === "confirmed" ? "Escala confirmada." : "Escala recusada.");
    } catch {
      setServingStatus("Nao foi possivel responder a escala.");
    }
  };

  return (
    <section className="panel serving-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Escalas e cultos</p>
          <h2>Planos de servico</h2>
        </div>
        {user.role === "admin" && <button className="secondary-button" type="button" onClick={startNewPlan}>Nova escala</button>}
      </div>

      <div className="report-grid">
        <article>
          <span>Escalas</span>
          <strong>{plans.length}</strong>
        </article>
        <article>
          <span>Pendentes</span>
          <strong>{pendingAssignments.length}</strong>
        </article>
        <article>
          <span>Recusadas</span>
          <strong>{declinedAssignments.length}</strong>
        </article>
        <article>
          <span>Notificacoes</span>
          <strong>{notifications.length}</strong>
        </article>
      </div>

      <div className="report-columns">
        <div>
          <h3>{user.role === "admin" ? "Pendencias da equipe" : "Minhas escalas"}</h3>
          {(user.role === "admin" ? notifications : myAssignments).length === 0 ? <p className="muted">Nenhuma pendencia de escala.</p> : null}
          {user.role === "admin" && notifications.map((notification) => (
            <p className="report-row" key={notification.id}>
              <span>{notification.date} - {personName(notification.personId)} - {notification.title}</span>
              <strong>{assignmentStatusLabels[notification.status]}</strong>
            </p>
          ))}
          {user.role !== "admin" && myAssignments.map(({ plan, assignment }) => (
            <p className="report-row" key={`${plan.id}-${assignment.id}`}>
              <span>{plan.date} - {plan.title} - {assignment.role}</span>
              <strong>{assignmentStatusLabels[assignment.status]}</strong>
            </p>
          ))}
        </div>
        <div>
          <h3>Confirmacoes</h3>
          <p className="muted">{user.role === "admin" ? "Administradores acompanham pendencias e podem ajustar status na escala." : "Confirme ou recuse suas escalas na lista de escalados."}</p>
        </div>
      </div>

      <div className="people-layout">
        <div className="people-list" aria-label="Lista de escalas">
          {visiblePlans.length === 0 ? <p className="muted">Nenhuma escala visivel para o seu perfil.</p> : visiblePlans.map((plan) => (
            <button className={plan.id === selectedPlanId ? "person-row selected" : "person-row"} key={plan.id} type="button" onClick={() => selectPlan(plan)}>
              <strong>{plan.date} - {plan.title}</strong>
              <span>{groupName(plan.groupId)} - {plan.assignments.length} pessoa(s)</span>
              <div className="serving-plan-summary">
                <span>Confirmados <strong>{confirmedCount(plan)}</strong></span>
                <span>Pendentes <strong>{pendingCount(plan)}</strong></span>
                <span className="declined-count">Recusados <strong>{declinedCount(plan)}</strong></span>
                {plan.eventId && <span className="event-tag generated"> evento</span>}
              </div>
            </button>
          ))}
        </div>

        <form className="person-form" onSubmit={handlePlanSubmit}>
          <label>Data<input disabled={!canEditMeta} type="date" value={planForm.date} onChange={(event) => updatePlanField("date", event.target.value)} /></label>
          <label>Titulo<input disabled={!canEditMeta} value={planForm.title} onChange={(event) => updatePlanField("title", event.target.value)} /></label>
          <label>
            Grupo/ministerio
            <select disabled={!canEditMeta} value={planForm.groupId} onChange={(event) => updatePlanField("groupId", event.target.value)}>
              <option value="">Sem grupo</option>
              {groups.map((group) => (
                <option value={group.id} key={group.id}>{group.name}</option>
              ))}
            </select>
          </label>
          <label className="wide-field">Observacoes<textarea disabled={!canEditAssignments} value={planForm.notes} onChange={(event) => updatePlanField("notes", event.target.value)} /></label>

          <fieldset className="member-picker">
            <legend>Escalados</legend>
            {planForm.assignments.map((assignment, index) => (
              <div className="assignment-row" key={`${assignment.id}-${index}`}>
                <select disabled={!canEditAssignments} value={assignment.personId} onChange={(event) => updateAssignment(index, "personId", event.target.value)}>
                  <option value="">Pessoa</option>
                  {eligiblePeople.map((person) => (
                    <option value={person.id} key={person.id}>{person.firstName} {person.lastName}</option>
                  ))}
                </select>
                <input disabled={!canEditAssignments} placeholder="Funcao" value={assignment.role} onChange={(event) => updateAssignment(index, "role", event.target.value)} />
                <select disabled={!canEditAssignments} value={assignment.status} onChange={(event) => updateAssignment(index, "status", event.target.value)}>
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="declined">Recusado</option>
                </select>
                <input disabled={!canEditAssignments} placeholder="Notas" value={assignment.notes} onChange={(event) => updateAssignment(index, "notes", event.target.value)} />
                {canEditAssignments && <button className="icon-button" type="button" onClick={() => removeAssignment(index)}>Remover</button>}
              </div>
            ))}
            {canEditAssignments && <button className="secondary-button" type="button" onClick={addAssignment}>Adicionar pessoa</button>}
            {!canEditAssignments && planForm.assignments.length === 0 && <p className="muted">Nenhuma pessoa escalada.</p>}
            {!canEditAssignments && planForm.assignments.map((assignment, index) => (
              <div className="response-row" key={`${assignment.personId}-${index}`}>
                <p className="report-row">
                  <span>{personName(assignment.personId)} - {assignment.role}</span>
                  <strong>{assignmentStatusLabels[assignment.status]}</strong>
                </p>
                {assignment.personId === user.personId && (
                  <div className="response-actions">
                    <button className="secondary-button" type="button" onClick={() => respondToAssignment(selectedPlanId || "", assignment.id, "confirmed")}>Confirmar</button>
                    <button className="danger-outline-button" type="button" onClick={() => respondToAssignment(selectedPlanId || "", assignment.id, "declined")}>Recusar</button>
                  </div>
                )}
              </div>
            ))}
          </fieldset>

          <div className="form-footer">
            {(canEditAssignments && (user.role === "admin" || selectedPlanId)) && <button type="submit">{selectedPlanId ? "Salvar escala" : "Criar escala"}</button>}
            {user.role === "admin" && selectedPlanId && <button className="danger-button" type="button" onClick={handleDeletePlan}>Remover</button>}
            <p>{canEditAssignments ? servingStatus : "Apenas admin ou lider da equipe pode alterar esta escala."}</p>
          </div>
        </form>
      </div>
    </section>
  );
};
