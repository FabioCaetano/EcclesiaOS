import type { GroupProfile } from "@ecclesiaos/shared";

const now = "2026-04-30T00:00:00.000Z";

export const defaultGroups: GroupProfile[] = [
  {
    id: "grp_001",
    name: "Grupo de Comunhao",
    type: "small_group",
    description: "Grupo pequeno semanal para comunhao e estudo.",
    leaderPersonId: "per_001",
    memberPersonIds: ["per_001", "per_002"],
    servicePositions: [],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "grp_002",
    name: "Louvor",
    type: "ministry",
    description: "Ministerio responsavel pela musica dos cultos.",
    leaderPersonId: "per_001",
    memberPersonIds: ["per_001"],
    servicePositions: ["Vocal", "Bateria", "Guitarra", "Teclado", "Baixo"],
    createdAt: now,
    updatedAt: now
  }
];
