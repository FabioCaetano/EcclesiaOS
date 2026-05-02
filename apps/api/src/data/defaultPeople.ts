import type { PersonProfile } from "@ecclesiaos/shared";

const now = "2026-04-30T00:00:00.000Z";

export const defaultPeople: PersonProfile[] = [
  {
    id: "per_admin",
    firstName: "Administrador",
    lastName: "EcclesiaOS",
    email: "admin@ecclesiaos.local",
    phone: "",
    birthDate: "",
    status: "member",
    guardianPersonIds: [],
    notes: "Pessoa vinculada ao usuario administrador.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "per_001",
    firstName: "Ana",
    lastName: "Silva",
    email: "ana.silva@ecclesia.local",
    phone: "(00) 90000-0001",
    birthDate: "1990-05-12",
    status: "member",
    guardianPersonIds: [],
    notes: "Membro ativa.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "per_002",
    firstName: "Carlos",
    lastName: "Oliveira",
    email: "carlos.oliveira@ecclesia.local",
    phone: "(00) 90000-0002",
    birthDate: "",
    status: "visitor",
    guardianPersonIds: [],
    notes: "Visitante recorrente.",
    createdAt: now,
    updatedAt: now
  }
];
