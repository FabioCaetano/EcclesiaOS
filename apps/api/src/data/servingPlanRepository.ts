import type { ChurchEvent, GroupProfile, ServingAssignment, ServingAssignmentStatus, ServingNotification, ServingPlan, ServingPlanInput } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeStatus = (status: string): ServingAssignmentStatus => (
  status === "confirmed" || status === "declined" ? status : "pending"
);

const normalizeAssignments = (assignments: ServingAssignment[]): ServingAssignment[] => (
  Array.isArray(assignments) ? assignments : []
).map((assignment) => ({
  id: assignment.id || createId("asg"),
  personId: String(assignment.personId || "").trim(),
  role: String(assignment.role || "").trim(),
  status: normalizeStatus(assignment.status),
  notes: String(assignment.notes || "").trim(),
  reminderSentAt: String(assignment.reminderSentAt || "").trim()
})).filter((assignment) => assignment.personId || assignment.role);

const normalizeInput = (input: ServingPlanInput): ServingPlanInput => ({
  date: String(input.date || "").trim(),
  title: String(input.title || "").trim(),
  groupId: String(input.groupId || "").trim(),
  eventId: String(input.eventId || "").trim(),
  notes: String(input.notes || "").trim(),
  assignments: normalizeAssignments(input.assignments)
});

export const servingPlanRepository = {
  async list(): Promise<ServingPlan[]> {
    const data = await readData();
    return [...data.servingPlans].sort((a, b) => b.date.localeCompare(a.date));
  },

  async listByGroupIds(groupIds: string[]): Promise<ServingPlan[]> {
    if (groupIds.length === 0) return [];
    const data = await readData();
    const allowed = new Set(groupIds);
    return data.servingPlans
      .filter((plan) => allowed.has(plan.groupId))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  async create(input: ServingPlanInput): Promise<ServingPlan> {
    const data = await readData();
    const now = new Date().toISOString();
    const plan: ServingPlan = {
      id: createId("srv"),
      ...normalizeInput(input),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, servingPlans: [...data.servingPlans, plan] });
    return plan;
  },

  async update(id: string, input: ServingPlanInput): Promise<ServingPlan | null> {
    const data = await readData();
    const existing = data.servingPlans.find((plan) => plan.id === id);
    if (!existing) return null;

    const updated: ServingPlan = {
      ...existing,
      ...normalizeInput(input),
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, servingPlans: data.servingPlans.map((plan) => plan.id === id ? updated : plan) });
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const nextPlans = data.servingPlans.filter((plan) => plan.id !== id);
    if (nextPlans.length === data.servingPlans.length) return false;

    await writeData({ ...data, servingPlans: nextPlans });
    return true;
  },

  async updateAssignmentStatus(planId: string, assignmentId: string, status: ServingAssignmentStatus, notes: string): Promise<ServingPlan | null> {
    const data = await readData();
    const existing = data.servingPlans.find((plan) => plan.id === planId);
    if (!existing) return null;

    let found = false;
    const updated: ServingPlan = {
      ...existing,
      assignments: existing.assignments.map((assignment) => {
        if (assignment.id !== assignmentId) return assignment;
        found = true;
        return {
          ...assignment,
          status: normalizeStatus(status),
          notes: notes.trim() || assignment.notes
        };
      }),
      updatedAt: new Date().toISOString()
    };

    if (!found) return null;

    await writeData({ ...data, servingPlans: data.servingPlans.map((plan) => plan.id === planId ? updated : plan) });
    return updated;
  },

  async applySubstitute(planId: string, assignmentId: string, personId: string, notes: string): Promise<ServingPlan | null> {
    const data = await readData();
    const existing = data.servingPlans.find((plan) => plan.id === planId);
    if (!existing) return null;

    let found = false;
    const updated: ServingPlan = {
      ...existing,
      assignments: existing.assignments.map((assignment) => {
        if (assignment.id !== assignmentId) return assignment;
        found = true;
        return {
          ...assignment,
          personId: String(personId || "").trim(),
          status: "pending",
          notes: String(notes || "").trim() || assignment.notes,
          reminderSentAt: ""
        };
      }),
      updatedAt: new Date().toISOString()
    };

    if (!found) return null;

    await writeData({ ...data, servingPlans: data.servingPlans.map((plan) => plan.id === planId ? updated : plan) });
    return updated;
  },

  async markRemindersSent(updates: Array<{ planId: string; assignmentId: string; sentAt: string }>): Promise<void> {
    if (updates.length === 0) return;
    const data = await readData();
    const updateByPlan = new Map<string, Map<string, string>>();
    for (const update of updates) {
      if (!updateByPlan.has(update.planId)) updateByPlan.set(update.planId, new Map());
      updateByPlan.get(update.planId)!.set(update.assignmentId, update.sentAt);
    }

    const nextPlans = data.servingPlans.map((plan) => {
      const planUpdates = updateByPlan.get(plan.id);
      if (!planUpdates) return plan;
      return {
        ...plan,
        assignments: plan.assignments.map((assignment) => {
          const sentAt = planUpdates.get(assignment.id);
          return sentAt ? { ...assignment, reminderSentAt: sentAt } : assignment;
        }),
        updatedAt: new Date().toISOString()
      };
    });

    await writeData({ ...data, servingPlans: nextPlans });
  },

  async listNotifications(personId?: string, includeAll = false): Promise<ServingNotification[]> {
    const data = await readData();
    return data.servingPlans.flatMap((plan) => plan.assignments
      .filter((assignment) => includeAll || assignment.personId === personId)
      .filter((assignment) => assignment.status !== "confirmed")
      .map((assignment) => ({
        id: `ntf_${plan.id}_${assignment.id}`,
        planId: plan.id,
        assignmentId: assignment.id,
        personId: assignment.personId,
        title: plan.title,
        message: assignment.status === "declined" ? "Escala recusada e precisa de acompanhamento." : "Escala aguardando confirmacao.",
        status: assignment.status,
        date: plan.date
      })))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
};

export const isTeamGroup = (group: GroupProfile | undefined) => Boolean(group && (group.type === "ministry" || group.type === "team"));

export const buildPlanForEventTeam = (event: ChurchEvent, group: GroupProfile, nowIso: string): ServingPlan => ({
  id: `srv_${event.id}_${group.id}`,
  date: event.date,
  title: `${event.title} - ${group.name}`,
  groupId: group.id,
  eventId: event.id,
  notes: "",
  assignments: [],
  createdAt: nowIso,
  updatedAt: nowIso
});

export const synchronizePlansForEvent = (
  plans: ServingPlan[],
  event: ChurchEvent,
  groups: GroupProfile[]
): ServingPlan[] => {
  const groupById = new Map(groups.map((group) => [group.id, group] as const));
  const requested = (event.requestedTeamIds || []).filter((groupId) => isTeamGroup(groupById.get(groupId)));
  const requestedSet = new Set(requested);
  const nowIso = new Date().toISOString();

  const linkedPlansByGroupId = new Map<string, ServingPlan>();
  for (const plan of plans) {
    if (plan.eventId === event.id) {
      linkedPlansByGroupId.set(plan.groupId, plan);
    }
  }

  const result: ServingPlan[] = [];
  for (const plan of plans) {
    if (plan.eventId !== event.id) {
      result.push(plan);
      continue;
    }
    if (requestedSet.has(plan.groupId)) {
      result.push(plan);
      continue;
    }
    if (plan.assignments.length > 0) {
      result.push({ ...plan, eventId: "", updatedAt: nowIso });
      continue;
    }
  }

  for (const groupId of requested) {
    if (linkedPlansByGroupId.has(groupId)) continue;
    const group = groupById.get(groupId);
    if (!group) continue;
    result.push(buildPlanForEventTeam(event, group, nowIso));
  }

  return result;
};

export const removePlansForEvent = (plans: ServingPlan[], eventId: string): ServingPlan[] => (
  plans.filter((plan) => plan.eventId !== eventId)
);
