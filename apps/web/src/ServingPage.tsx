import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, ClipboardList, Grid3x3, List, Plus, UserPlus, X } from "lucide-react";
import type { CurrentUser, GroupProfile, PersonBlockOut, PersonProfile, ServingAssignment, ServingNotification, ServingPlan, ServingPlanInput, SubstituteSuggestion } from "@ecclesiaos/shared";
import { createBlockOut, deleteBlockOut, deleteServingPlan, loadBlockOuts, loadGroups, loadPeople, loadServingNotifications, loadServingPlans, loadSubstituteSuggestions, saveServingPlan, updateServingAssignmentStatus } from "./api";
import { emptyServingPlanInput } from "./constants";
import { toServingPlanInput } from "./mappers";
import { Avatar, Card, EmptyState, PageHeader, StatusPill } from "./ui";
import type { StatusTone } from "./ui";

const statusToneFor = (status: ServingAssignment["status"]): StatusTone => {
  if (status === "confirmed") return "success";
  if (status === "declined") return "danger";
  return "muted";
};

interface Props {
  token: string;
  user: CurrentUser;
}

const emptyAssignment = (): ServingAssignment => ({
  id: "",
  personId: "",
  role: "",
  status: "pending",
  notes: "",
  reminderSentAt: ""
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
  const [blockOuts, setBlockOuts] = useState<PersonBlockOut[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<ServingPlanInput>(emptyServingPlanInput);
  const [servingStatus, setServingStatus] = useState("");
  const [substitutesByAssignment, setSubstitutesByAssignment] = useState<Record<string, SubstituteSuggestion[]>>({});
  const [viewMode, setViewMode] = useState<"list" | "matrix" | "availability">("list");
  const [matrixGroupId, setMatrixGroupId] = useState<string>("");
  const [matrixWeeks, setMatrixWeeks] = useState<number>(8);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockStatus, setBlockStatus] = useState("");

  const refreshPlans = async () => setPlans(await loadServingPlans(token));
  const refreshNotifications = async () => setNotifications(await loadServingNotifications(token));
  const refreshBlockOuts = async () => setBlockOuts(await loadBlockOuts(token));

  useEffect(() => {
    loadPeople(token).then(setPeople).catch(() => setServingStatus("Nao foi possivel carregar pessoas."));
    loadGroups(token).then(setGroups).catch(() => setServingStatus("Nao foi possivel carregar grupos."));
    refreshBlockOuts().catch(() => setServingStatus("Nao foi possivel carregar bloqueios."));
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

  const handleAddBlockOut = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user.personId) {
      setBlockStatus("Seu usuario nao esta vinculado a uma pessoa.");
      return;
    }
    if (!blockStart) {
      setBlockStatus("Informe a data inicial.");
      return;
    }

    setBlockStatus("Salvando indisponibilidade...");
    try {
      await createBlockOut(token, {
        personId: user.personId,
        startDate: blockStart,
        endDate: blockEnd || blockStart,
        reason: blockReason
      });
      await refreshBlockOuts();
      setBlockStart("");
      setBlockEnd("");
      setBlockReason("");
      setBlockStatus("Indisponibilidade registrada.");
    } catch {
      setBlockStatus("Nao foi possivel registrar a indisponibilidade.");
    }
  };

  const handleRemoveBlockOut = async (id: string) => {
    if (!window.confirm("Remover esta indisponibilidade?")) return;
    setBlockStatus("Removendo indisponibilidade...");
    try {
      await deleteBlockOut(token, id);
      await refreshBlockOuts();
      setBlockStatus("Indisponibilidade removida.");
    } catch {
      setBlockStatus("Nao foi possivel remover a indisponibilidade.");
    }
  };

  const personName = (personId: string) => people.find((person) => person.id === personId)?.firstName || "Pessoa";
  const groupName = (groupId: string) => groups.find((group) => group.id === groupId)?.name || "Sem grupo";

  const isBlockedOnDate = (personId: string, date: string) => {
    if (!personId || !date) return false;
    return blockOuts.some((blockOut) =>
      blockOut.personId === personId && date >= blockOut.startDate && date <= blockOut.endDate
    );
  };

  const fetchSubstitutes = async (assignmentId: string) => {
    if (!selectedPlanId) return;
    setServingStatus("Buscando substitutos...");
    try {
      const list = await loadSubstituteSuggestions(token, selectedPlanId, assignmentId);
      setSubstitutesByAssignment((current) => ({ ...current, [assignmentId]: list }));
      setServingStatus(list.length === 0 ? "Sem candidatos disponiveis." : `${list.length} candidato(s).`);
    } catch {
      setServingStatus("Nao foi possivel buscar substitutos.");
    }
  };

  const applySubstitute = (index: number, substitute: SubstituteSuggestion) => {
    setPlanForm((current) => ({
      ...current,
      assignments: current.assignments.map((assignment, itemIndex) =>
        itemIndex === index
          ? { ...assignment, personId: substitute.personId, status: "pending" }
          : assignment
      )
    }));
    const assignmentId = planForm.assignments[index]?.id;
    if (assignmentId) {
      setSubstitutesByAssignment((current) => {
        const next = { ...current };
        delete next[assignmentId];
        return next;
      });
    }
    setServingStatus(`Substituto aplicado: ${substitute.name}. Salve a escala para confirmar.`);
  };

  const myLeadingGroupIds = useMemo(() => {
    if (!user.personId) return [] as string[];
    return groups.filter((group) => group.leaderPersonId === user.personId).map((group) => group.id);
  }, [groups, user.personId]);

  const isLeaderOfGroup = (groupId: string) => myLeadingGroupIds.includes(groupId);
  const visiblePlans = useMemo(() => {
    if (user.role === "admin") return plans;
    if (user.role === "leader") {
      if (myLeadingGroupIds.length === 0) return [];
      return plans.filter((plan) => myLeadingGroupIds.includes(plan.groupId));
    }
    if (!user.personId) return [];
    return plans.filter((plan) => plan.assignments.some((assignment) => assignment.personId === user.personId));
  }, [plans, user.role, myLeadingGroupIds, user.personId]);

  const teamGroups = useMemo(() => {
    const operationalGroups = groups.filter((group) => group.type === "ministry" || group.type === "team");
    if (user.role === "admin") return operationalGroups;
    if (user.role === "leader") return operationalGroups.filter((group) => myLeadingGroupIds.includes(group.id));
    return [];
  }, [groups, user.role, myLeadingGroupIds]);

  const matrixGroup = teamGroups.find((group) => group.id === matrixGroupId) || null;
  const matrixPlans = useMemo(() => {
    if (!matrixGroup) return [];
    const today = new Date().toISOString().slice(0, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + matrixWeeks * 7);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return plans
      .filter((plan) => plan.groupId === matrixGroup.id && plan.date >= today && plan.date <= cutoffStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [plans, matrixGroup, matrixWeeks]);

  const matrixMembers = useMemo(() => {
    if (!matrixGroup) return [];
    return matrixGroup.memberPersonIds
      .map((id) => people.find((person) => person.id === id))
      .filter((person): person is PersonProfile => Boolean(person))
      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  }, [matrixGroup, people]);

  const findAssignmentInPlan = (plan: ServingPlan, personId: string): ServingAssignment | null =>
    plan.assignments.find((assignment) => assignment.personId === personId) || null;

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || null;
  const selectedPlanGroup = groups.find((group) => group.id === (selectedPlan?.groupId || planForm.groupId)) || null;
  const selectedGroupPositions = selectedPlanGroup && (selectedPlanGroup.type === "ministry" || selectedPlanGroup.type === "team")
    ? selectedPlanGroup.servicePositions || []
    : [];
  const personCanServePosition = (personId: string, position: string) => {
    if (!personId || !position || selectedGroupPositions.length === 0) return true;
    if (!selectedGroupPositions.includes(position)) return true;
    return (selectedPlanGroup?.memberServicePositions?.[personId] || []).includes(position);
  };
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
  const relevantPendingAssignments = user.role === "admin"
    ? pendingAssignments
    : user.role === "leader"
      ? pendingAssignments.filter(({ plan }) => isLeaderOfGroup(plan.groupId))
      : myAssignments.filter(({ assignment }) => assignment.status === "pending");
  const myBlockOuts = user.personId ? blockOuts.filter((blockOut) => blockOut.personId === user.personId) : [];

  const respondToAssignment = async (planId: string, assignmentId: string, status: ServingAssignment["status"]) => {
    setServingStatus("Atualizando resposta...");
    try {
      const updated = await updateServingAssignmentStatus(token, planId, assignmentId, { status, notes: "" });
      await refreshPlans();
      await refreshNotifications();
      if (selectedPlanId === updated.id) selectPlan(updated);
      if (updated.substituteSuggestions.length > 0) {
        setSubstitutesByAssignment((current) => ({ ...current, [assignmentId]: updated.substituteSuggestions }));
      }
      setServingStatus(status === "confirmed"
        ? "Escala confirmada."
        : updated.substituteSuggestions.length > 0
          ? `Escala recusada. ${updated.substituteSuggestions.length} substituto(s) sugerido(s) automaticamente.`
          : "Escala recusada. Nenhum substituto disponivel automaticamente.");
    } catch {
      setServingStatus("Nao foi possivel responder a escala.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Operacao"
        icon={ClipboardList}
        title="Escalas"
        description="Pendencias de escala, resposta dos voluntarios e indisponibilidades."
        actions={user.role === "admin" && (
          <button className="secondary-button" type="button" onClick={startNewPlan}>
            <Plus size={16} /> Nova escala
          </button>
        )}
      />

      <div className="tab-bar" role="tablist" aria-label="Visao das escalas">
        <button className={viewMode === "list" ? "active" : ""} type="button" onClick={() => setViewMode("list")}>
          <List size={14} /> Lista
        </button>
        {user.role !== "member" && (
          <button className={viewMode === "matrix" ? "active" : ""} type="button" onClick={() => setViewMode("matrix")}>
            <Grid3x3 size={14} /> Matriz
          </button>
        )}
        <button className={viewMode === "availability" ? "active" : ""} type="button" onClick={() => setViewMode("availability")}>
          <AlertTriangle size={14} /> Indisponibilidade
        </button>
      </div>

      {viewMode === "matrix" && (
        <Card className="serving-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><Grid3x3 size={12} />Visao panoramica</p>
              <h2>{matrixGroup ? matrixGroup.name : "Selecione uma equipe"}</h2>
            </div>
          </div>

          <div className="filter-bar">
            <label>
              Equipe
              <select value={matrixGroupId} onChange={(event) => setMatrixGroupId(event.target.value)}>
                <option value="">Selecione</option>
                {teamGroups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </label>
            <label>
              Janela
              <select value={matrixWeeks} onChange={(event) => setMatrixWeeks(Number(event.target.value))}>
                <option value={4}>4 semanas</option>
                <option value={8}>8 semanas</option>
                <option value={12}>12 semanas</option>
              </select>
            </label>
          </div>

          {!matrixGroup ? (
            <EmptyState
              icon={Grid3x3}
              title="Escolha uma equipe"
              description={teamGroups.length === 0 ? "Cadastre grupos do tipo ministerio ou equipe primeiro." : "Use o filtro acima para selecionar uma equipe."}
            />
          ) : matrixPlans.length === 0 ? (
            <EmptyState
              icon={Grid3x3}
              title="Sem escalas no periodo"
              description="Nao ha planos para essa equipe na janela selecionada."
            />
          ) : matrixMembers.length === 0 ? (
            <EmptyState
              icon={Grid3x3}
              title="Equipe sem membros"
              description="Adicione pessoas a equipe na pagina de Grupos."
            />
          ) : (
            <div className="serving-matrix-scroll">
              <table className="serving-matrix">
                <thead>
                  <tr>
                    <th className="serving-matrix-name">Pessoa</th>
                    {matrixPlans.map((plan) => (
                      <th key={plan.id}>
                        <div>{plan.date}</div>
                        <small>{plan.title}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixMembers.map((person) => (
                    <tr key={person.id}>
                      <th className="serving-matrix-name">
                        <Avatar name={`${person.firstName} ${person.lastName}`} size="sm" tone="brand" />
                        <span>{person.firstName} {person.lastName}</span>
                      </th>
                      {matrixPlans.map((plan) => {
                        const assignment = findAssignmentInPlan(plan, person.id);
                        return (
                          <td key={plan.id}>
                            {assignment ? (
                              <div className="serving-matrix-cell">
                                <StatusPill tone={statusToneFor(assignment.status)}>
                                  {assignmentStatusLabels[assignment.status]}
                                </StatusPill>
                                {assignment.role && <small>{assignment.role}</small>}
                              </div>
                            ) : (
                              <span className="muted serving-matrix-empty">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {viewMode === "list" && (
      <Card className="serving-panel">
      <div className="report-grid">
        <article>
          <span>Escalas</span>
          <strong>{plans.length}</strong>
        </article>
        <article>
          <span>Pendentes</span>
          <strong>{relevantPendingAssignments.length}</strong>
        </article>
        <article>
          <span>Minhas escalas</span>
          <strong>{myAssignments.length}</strong>
        </article>
        <article>
          <span>Recusadas</span>
          <strong>{declinedAssignments.length}</strong>
        </article>
      </div>

      <div className="report-columns">
        <div>
          <h3>{user.role === "member" ? "Minhas pendencias" : "Pendencias da equipe"}</h3>
          {relevantPendingAssignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Nenhuma pendencia"
              description={user.role === "member" ? "Voce nao possui escalas pendentes no momento." : "Toda a equipe ja respondeu suas escalas."}
            />
          ) : null}
          {relevantPendingAssignments.slice(0, 8).map(({ plan, assignment }) => (
            <p className="report-row" key={`${plan.id}-${assignment.id}`}>
              <span>{plan.date} - {plan.title} - {personName(assignment.personId)} - {assignment.role || "sem funcao"}</span>
              <strong>{assignmentStatusLabels[assignment.status]}</strong>
            </p>
          ))}
        </div>
        <div>
          <h3>Operacao</h3>
          <p className="muted">{user.role === "admin" ? "Administradores criam escalas manuais e acompanham todas as equipes." : user.role === "leader" ? "Lideres editam apenas escalas das equipes que lideram." : "Membros respondem suas escalas e registram indisponibilidade."}</p>
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
          {!selectedPlan && user.role !== "admin" && (
            <div className="wide-field">
              <EmptyState
                icon={ClipboardList}
                title="Selecione uma escala"
                description={user.role === "leader" ? "Escolha uma escala da sua equipe para adicionar ou ajustar voluntarios." : "Escolha uma das suas escalas para confirmar ou recusar."}
              />
            </div>
          )}
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

          <fieldset className="member-picker plan-detail wide-field">
            <legend>Escalados</legend>
            <div className="plan-detail-header">
              <h2>{selectedPlan?.title || "Nova escala"}</h2>
              <span>{selectedPlan ? `${selectedPlan.date} - ${groupName(selectedPlan.groupId)}` : "Defina os campos acima e adicione pessoas"}</span>
            </div>

            {planForm.assignments.length === 0 && (
              <div className="plan-position-empty">Nenhuma pessoa escalada ainda.</div>
            )}

            <div className="plan-positions">
              {planForm.assignments.map((assignment, index) => {
                const blocked = selectedPlan ? isBlockedOnDate(assignment.personId, selectedPlan.date) : false;
                const positionMismatch = Boolean(assignment.personId && assignment.role && !personCanServePosition(assignment.personId, assignment.role));
                const assignmentPeople = assignment.role
                  ? eligiblePeople.filter((person) => personCanServePosition(person.id, assignment.role) || person.id === assignment.personId)
                  : eligiblePeople;
                const suggestions = substitutesByAssignment[assignment.id];
                return (
                  <div key={`${assignment.id || "new"}-${index}`}>
                    {canEditAssignments ? (
                      <div className="plan-position">
                        <span className="pp-avatar"><Avatar name={personName(assignment.personId) || "?"} size="md" tone={statusToneFor(assignment.status) === "success" ? "success" : "brand"} /></span>
                        <select className="pp-name" value={assignment.personId} onChange={(event) => updateAssignment(index, "personId", event.target.value)}>
                          <option value="">Selecionar pessoa</option>
                          {assignmentPeople.map((person) => (
                            <option value={person.id} key={person.id}>{person.firstName} {person.lastName}</option>
                          ))}
                        </select>
                        {selectedGroupPositions.length > 0 ? (
                          <select className="pp-role" value={assignment.role} onChange={(event) => updateAssignment(index, "role", event.target.value)}>
                            <option value="">Posicao</option>
                            {assignment.role && !selectedGroupPositions.includes(assignment.role) && (
                              <option value={assignment.role}>{assignment.role}</option>
                            )}
                            {selectedGroupPositions.map((position) => (
                              <option value={position} key={position}>{position}</option>
                            ))}
                          </select>
                        ) : (
                          <input className="pp-role" placeholder="Funcao" value={assignment.role} onChange={(event) => updateAssignment(index, "role", event.target.value)} />
                        )}
                        <select className="pp-status" value={assignment.status} onChange={(event) => updateAssignment(index, "status", event.target.value)}>
                          <option value="pending">Pendente</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="declined">Recusado</option>
                        </select>
                        <input className="pp-notes" placeholder="Notas" value={assignment.notes} onChange={(event) => updateAssignment(index, "notes", event.target.value)} />
                        <button className="icon-button pp-remove" type="button" aria-label="Remover" onClick={() => removeAssignment(index)}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="plan-position">
                        <span className="pp-avatar"><Avatar name={personName(assignment.personId) || "?"} size="md" tone="brand" /></span>
                        <strong className="pp-name">{personName(assignment.personId) || "Sem pessoa"}</strong>
                        <span className="pp-role">{assignment.role || "Sem funcao"}</span>
                        <span className="pp-status"><StatusPill tone={statusToneFor(assignment.status)}>{assignmentStatusLabels[assignment.status]}</StatusPill></span>
                        <span className="pp-notes muted">{assignment.notes}</span>
                        {assignment.personId === user.personId && (
                          <div className="response-actions pp-remove">
                            <button className="secondary-button btn-sm" type="button" onClick={() => respondToAssignment(selectedPlanId || "", assignment.id, "confirmed")}>
                              <Check size={14} /> Confirmar
                            </button>
                            <button className="danger-outline-button btn-sm" type="button" onClick={() => respondToAssignment(selectedPlanId || "", assignment.id, "declined")}>
                              <X size={14} /> Recusar
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {blocked && (
                      <p className="plan-position-warning">
                        <AlertTriangle size={14} /> Esta pessoa marcou indisponibilidade em {selectedPlan?.date}.
                      </p>
                    )}

                    {positionMismatch && (
                      <p className="plan-position-warning">
                        <AlertTriangle size={14} /> Esta pessoa nao esta habilitada para {assignment.role} neste ministerio.
                      </p>
                    )}

                    {canEditAssignments && assignment.status === "declined" && assignment.id && (
                      <div className="substitute-panel">
                        <div className="response-actions" style={{ justifyContent: "space-between" }}>
                          <h4>Substitutos sugeridos</h4>
                          <button className="secondary-button btn-sm" type="button" onClick={() => fetchSubstitutes(assignment.id)}>
                            <UserPlus size={14} /> Buscar candidatos
                          </button>
                        </div>
                        {suggestions && suggestions.length === 0 && <p className="muted">Sem candidatos disponiveis na equipe.</p>}
                        {suggestions && suggestions.length > 0 && (
                          <div className="substitute-list">
                            {suggestions.map((suggestion) => (
                              <div className="substitute-row" key={suggestion.personId}>
                                <Avatar name={suggestion.name} size="sm" tone="muted" />
                                <strong>{suggestion.name}</strong>
                                <span>{suggestion.recentLoad} escala(s) recentes</span>
                                <button className="secondary-button btn-sm" type="button" onClick={() => applySubstitute(index, suggestion)}>
                                  Escalar
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {canEditAssignments && (
              <button className="plan-position-add" type="button" onClick={addAssignment}>
                <Plus size={16} /> Adicionar pessoa
              </button>
            )}
          </fieldset>

          <div className="form-footer">
            {(canEditAssignments && (user.role === "admin" || selectedPlanId)) && <button type="submit">{selectedPlanId ? "Salvar escala" : "Criar escala"}</button>}
            {user.role === "admin" && selectedPlanId && <button className="danger-button" type="button" onClick={handleDeletePlan}>Remover</button>}
            <p>{canEditAssignments ? servingStatus : "Apenas admin ou lider da equipe pode alterar esta escala."}</p>
          </div>
        </form>
      </div>
      </Card>
      )}

      {viewMode === "availability" && (
        <Card className="serving-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><AlertTriangle size={12} />Indisponibilidade</p>
              <h2>Minhas datas bloqueadas</h2>
            </div>
          </div>

          <div className="report-columns">
            <form className="person-form" onSubmit={handleAddBlockOut}>
              <label>Inicio<input type="date" value={blockStart} onChange={(event) => setBlockStart(event.target.value)} /></label>
              <label>Fim<input type="date" value={blockEnd} onChange={(event) => setBlockEnd(event.target.value)} /></label>
              <label className="wide-field">Motivo<input value={blockReason} onChange={(event) => setBlockReason(event.target.value)} placeholder="Ex.: viagem, trabalho, compromisso familiar" /></label>
              <div className="form-footer">
                <button type="submit">Registrar indisponibilidade</button>
                <p>{blockStatus}</p>
              </div>
            </form>

            <div>
              <h3>Registros</h3>
              {myBlockOuts.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="Sem indisponibilidade" description="Registre datas em que voce nao pode servir." />
              ) : myBlockOuts.map((blockOut) => (
                <p className="report-row" key={blockOut.id}>
                  <span>{blockOut.startDate}{blockOut.endDate !== blockOut.startDate ? ` ate ${blockOut.endDate}` : ""} - {blockOut.reason || "sem motivo informado"}</span>
                  <button className="danger-outline-button btn-sm" type="button" onClick={() => handleRemoveBlockOut(blockOut.id)}>Remover</button>
                </p>
              ))}
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
