import type { ServingPlan } from "@ecclesiaos/shared";

const now = "2026-04-30T00:00:00.000Z";

export const defaultServingPlans: ServingPlan[] = [
  {
    id: "srv_001",
    date: "2026-05-03",
    title: "Culto Dominical",
    groupId: "grp_002",
    eventId: "",
    notes: "Escala inicial do culto.",
    assignments: [
      { id: "asg_001", personId: "per_001", role: "Louvor", status: "confirmed", notes: "Vocal" },
      { id: "asg_002", personId: "per_002", role: "Recepcao", status: "pending", notes: "" }
    ],
    createdAt: now,
    updatedAt: now
  }
];
