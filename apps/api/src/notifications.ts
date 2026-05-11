import type { CurrentUser, NotificationItem } from "@ecclesiaos/shared";
import { eventRegistrationRepository } from "./data/eventRegistrationRepository.js";
import { eventRepository } from "./data/eventRepository.js";
import { groupRepository } from "./data/groupRepository.js";
import { servingPlanRepository } from "./data/servingPlanRepository.js";

const todayIso = () => new Date().toISOString().slice(0, 10);
const inDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const computeNotifications = async (user: CurrentUser): Promise<NotificationItem[]> => {
  const personId = user.personId || "";
  const items: NotificationItem[] = [];

  const [groups, events, servingPlans, registrations] = await Promise.all([
    groupRepository.list(),
    eventRepository.list(),
    servingPlanRepository.list(),
    user.role === "admin" || user.role === "leader" ? eventRegistrationRepository.list() : Promise.resolve([])
  ]);

  const today = todayIso();
  const horizonDate = inDays(7);

  // 1. serving_pending: assignments minhas pendentes em planos futuros
  if (personId) {
    for (const plan of servingPlans) {
      if (plan.date < today) continue;
      for (const assignment of plan.assignments) {
        if (assignment.personId !== personId) continue;
        if (assignment.status !== "pending") continue;
        items.push({
          id: `serving_pending:${assignment.id}`,
          kind: "serving_pending",
          title: `Confirme sua escala: ${plan.title || "Plano"}`,
          message: `${plan.date} - papel: ${assignment.role || "definir"}`,
          createdAt: plan.updatedAt || plan.createdAt,
          link: { module: "serving", entityId: plan.id }
        });
      }
    }
  }

  // 2. serving_declined: assignments declined em planos onde o usuario lidera o grupo
  if (user.role === "leader" || user.role === "admin") {
    const leaderGroupIds = new Set<string>(
      user.role === "admin"
        ? groups.map((group) => group.id)
        : groups.filter((group) => group.leaderPersonId === personId).map((group) => group.id)
    );
    for (const plan of servingPlans) {
      if (plan.date < today) continue;
      if (!leaderGroupIds.has(plan.groupId)) continue;
      for (const assignment of plan.assignments) {
        if (assignment.status !== "declined") continue;
        if (assignment.personId === personId) continue;
        items.push({
          id: `serving_declined:${assignment.id}`,
          kind: "serving_declined",
          title: `Substituto necessario em ${plan.title || "plano"}`,
          message: `${plan.date} - posicao: ${assignment.role || "definir"}`,
          createdAt: plan.updatedAt || plan.createdAt,
          link: { module: "serving", entityId: plan.id }
        });
      }
    }
  }

  // 3. event_upcoming: eventos nos proximos 7 dias onde a pessoa e operador ou lider responsavel
  if (personId) {
    const leadsGroupId = new Set<string>(groups.filter((group) => group.leaderPersonId === personId).map((group) => group.id));
    for (const event of events) {
      if (event.date < today || event.date > horizonDate) continue;
      const isOperator = event.operatorPersonIds.includes(personId);
      const isResponsibleLeader = user.role !== "member" && (
        (event.groupId && leadsGroupId.has(event.groupId))
        || event.requestedTeamIds.some((teamId) => leadsGroupId.has(teamId))
      );
      if (!isOperator && !isResponsibleLeader) continue;
      items.push({
        id: `event_upcoming:${event.id}`,
        kind: "event_upcoming",
        title: `Proximo evento: ${event.title}`,
        message: `${event.date} ${event.startTime || ""}${event.location ? " - " + event.location : ""}`.trim(),
        createdAt: event.updatedAt || event.createdAt,
        link: { module: "calendar", entityId: event.id }
      });
    }
  }

  // 4. registration_email_pending: inscricoes pending_email para eventos que admin/lider gerencia
  if (user.role === "admin" || user.role === "leader") {
    const leadsGroupId = new Set<string>(groups.filter((group) => group.leaderPersonId === personId).map((group) => group.id));
    const manageableEventIds = new Set<string>();
    for (const event of events) {
      if (event.date < today) continue;
      if (user.role === "admin") {
        manageableEventIds.add(event.id);
        continue;
      }
      const isResponsibleLeader = (event.groupId && leadsGroupId.has(event.groupId))
        || event.requestedTeamIds.some((teamId) => leadsGroupId.has(teamId));
      if (isResponsibleLeader) manageableEventIds.add(event.id);
    }
    for (const registration of registrations) {
      if (registration.status !== "pending_email_confirmation") continue;
      if (!manageableEventIds.has(registration.eventId)) continue;
      const event = events.find((entry) => entry.id === registration.eventId);
      items.push({
        id: `registration_email_pending:${registration.id}`,
        kind: "registration_email_pending",
        title: `Inscricao aguardando email: ${registration.name}`,
        message: `${event?.title || "Evento"} - ${event?.date || ""}`.trim(),
        createdAt: registration.createdAt,
        link: { module: "events", entityId: registration.eventId }
      });
    }
  }

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items;
};
