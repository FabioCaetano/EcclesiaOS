import type { ChurchResource, RoomReservation } from "@ecclesiaos/shared";

export const defaultResources: ChurchResource[] = [
  {
    id: "res_main_auditorium",
    name: "Auditorio principal",
    location: "Templo",
    capacity: 300,
    description: "Ambiente principal para cultos e eventos maiores.",
    isActive: true,
    createdAt: "2026-04-30T00:00:00.000Z",
    updatedAt: "2026-04-30T00:00:00.000Z"
  },
  {
    id: "res_children_room",
    name: "Sala infantil",
    location: "Anexo",
    capacity: 40,
    description: "Ambiente para ministerio infantil e classes.",
    isActive: true,
    createdAt: "2026-04-30T00:00:00.000Z",
    updatedAt: "2026-04-30T00:00:00.000Z"
  }
];

export const defaultRoomReservations: RoomReservation[] = [
  {
    id: "rsv_001",
    resourceId: "res_main_auditorium",
    eventId: "evt_001",
    title: "Culto dominical",
    date: "2026-05-03",
    startTime: "09:00",
    endTime: "12:00",
    reservedBy: "Secretaria",
    status: "confirmed",
    notes: "Reserva semente vinculada ao culto principal.",
    createdAt: "2026-04-30T00:00:00.000Z",
    updatedAt: "2026-04-30T00:00:00.000Z"
  }
];
