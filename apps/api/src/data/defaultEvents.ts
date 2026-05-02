import type { ChurchEvent } from "@ecclesiaos/shared";

const now = "2026-04-30T00:00:00.000Z";

export const defaultEvents: ChurchEvent[] = [
  {
    id: "evt_001",
    title: "Culto dominical",
    type: "service",
    date: "2026-05-03",
    startTime: "10:00",
    endTime: "11:30",
    location: "Templo principal",
    groupId: "",
    recurrence: "weekly",
    recurrenceUntil: "",
    recurrenceRule: "",
    parentEventId: "",
    registrationEnabled: false,
    registrationCapacity: 0,
    registrationPrice: 0,
    registrationCurrency: "BRL",
    registrationSlug: "culto-dominical",
    description: "Culto geral da igreja.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "evt_002",
    title: "Encontro do grupo pequeno",
    type: "meeting",
    date: "2026-05-05",
    startTime: "19:30",
    endTime: "21:00",
    location: "Casa do grupo",
    groupId: "grp_001",
    recurrence: "weekly",
    recurrenceUntil: "",
    recurrenceRule: "",
    parentEventId: "",
    registrationEnabled: true,
    registrationCapacity: 20,
    registrationPrice: 0,
    registrationCurrency: "BRL",
    registrationSlug: "grupo-pequeno",
    description: "Encontro semanal do grupo pequeno.",
    createdAt: now,
    updatedAt: now
  }
];
