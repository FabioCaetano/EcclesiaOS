import type { AttendanceRecord } from "@ecclesiaos/shared";

const now = "2026-04-30T00:00:00.000Z";

export const defaultAttendance: AttendanceRecord[] = [
  {
    id: "att_001",
    date: "2026-04-26",
    type: "service",
    eventId: "evt_001",
    groupId: "",
    presentPersonIds: ["per_001", "per_002"],
    notes: "Culto dominical.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "att_002",
    date: "2026-04-28",
    type: "group",
    eventId: "evt_002",
    groupId: "grp_001",
    presentPersonIds: ["per_001"],
    notes: "Encontro do grupo pequeno.",
    createdAt: now,
    updatedAt: now
  }
];
