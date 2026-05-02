import type { ChurchResource, ChurchResourceInput, RoomReservation, RoomReservationInput, RoomReservationStatus } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createResourceId = () => `res_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const createReservationId = () => `rsv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeResourceInput = (input: ChurchResourceInput): ChurchResourceInput => ({
  name: String(input.name || "").trim(),
  location: String(input.location || "").trim(),
  capacity: Math.max(0, Number(input.capacity) || 0),
  description: String(input.description || "").trim(),
  isActive: Boolean(input.isActive)
});

const normalizeReservationStatus = (status: RoomReservationStatus): RoomReservationStatus => (
  status === "cancelled" ? "cancelled" : "confirmed"
);

const normalizeReservationInput = (input: RoomReservationInput): RoomReservationInput => ({
  resourceId: String(input.resourceId || "").trim(),
  eventId: String(input.eventId || "").trim(),
  title: String(input.title || "").trim(),
  date: String(input.date || "").trim(),
  startTime: String(input.startTime || "").trim(),
  endTime: String(input.endTime || "").trim(),
  reservedBy: String(input.reservedBy || "").trim(),
  status: normalizeReservationStatus(input.status),
  notes: String(input.notes || "").trim()
});

const overlaps = (a: Pick<RoomReservation, "date" | "startTime" | "endTime">, b: Pick<RoomReservation, "date" | "startTime" | "endTime">) => (
  a.date === b.date && a.startTime < b.endTime && a.endTime > b.startTime
);

const hasConflict = (reservations: RoomReservation[], input: RoomReservationInput, currentId = "") => reservations.some((reservation) => (
  reservation.id !== currentId
    && reservation.resourceId === input.resourceId
    && reservation.status !== "cancelled"
    && input.status !== "cancelled"
    && overlaps(reservation, input)
));

export const resourceRepository = {
  async listResources(): Promise<ChurchResource[]> {
    const data = await readData();
    return [...data.resources].sort((a, b) => a.name.localeCompare(b.name));
  },

  async createResource(input: ChurchResourceInput): Promise<ChurchResource> {
    const data = await readData();
    const now = new Date().toISOString();
    const resource: ChurchResource = {
      id: createResourceId(),
      ...normalizeResourceInput(input),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, resources: [...data.resources, resource] });
    return resource;
  },

  async updateResource(id: string, input: ChurchResourceInput): Promise<ChurchResource | null> {
    const data = await readData();
    const existing = data.resources.find((resource) => resource.id === id);
    if (!existing) return null;

    const updated: ChurchResource = {
      ...existing,
      ...normalizeResourceInput(input),
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, resources: data.resources.map((resource) => resource.id === id ? updated : resource) });
    return updated;
  },

  async removeResource(id: string): Promise<boolean | "in_use"> {
    const data = await readData();
    if (data.roomReservations.some((reservation) => reservation.resourceId === id)) return "in_use";
    const nextResources = data.resources.filter((resource) => resource.id !== id);
    if (nextResources.length === data.resources.length) return false;

    await writeData({ ...data, resources: nextResources });
    return true;
  },

  async listReservations(): Promise<RoomReservation[]> {
    const data = await readData();
    return [...data.roomReservations].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  },

  async createReservation(input: RoomReservationInput): Promise<RoomReservation | "conflict"> {
    const data = await readData();
    const normalized = normalizeReservationInput(input);
    if (hasConflict(data.roomReservations, normalized)) return "conflict";

    const now = new Date().toISOString();
    const reservation: RoomReservation = {
      id: createReservationId(),
      ...normalized,
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, roomReservations: [...data.roomReservations, reservation] });
    return reservation;
  },

  async updateReservation(id: string, input: RoomReservationInput): Promise<RoomReservation | "conflict" | null> {
    const data = await readData();
    const existing = data.roomReservations.find((reservation) => reservation.id === id);
    if (!existing) return null;

    const normalized = normalizeReservationInput(input);
    if (hasConflict(data.roomReservations, normalized, id)) return "conflict";

    const updated: RoomReservation = {
      ...existing,
      ...normalized,
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, roomReservations: data.roomReservations.map((reservation) => reservation.id === id ? updated : reservation) });
    return updated;
  },

  async removeReservation(id: string): Promise<boolean> {
    const data = await readData();
    const nextReservations = data.roomReservations.filter((reservation) => reservation.id !== id);
    if (nextReservations.length === data.roomReservations.length) return false;

    await writeData({ ...data, roomReservations: nextReservations });
    return true;
  }
};
