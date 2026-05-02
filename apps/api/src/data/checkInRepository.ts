import { randomInt, randomUUID } from "node:crypto";
import type { ChildCheckIn, ChildCheckInInput, EventCheckIn, EventCheckInInput } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const eventCheckInId = () => `eci_${randomUUID()}`;
const childCheckInId = () => `cci_${randomUUID()}`;
const securityCode = () => randomInt(100000, 999999).toString();

const normalizeEventInput = (input: EventCheckInInput): EventCheckInInput => ({
  eventId: String(input.eventId || "").trim(),
  personId: String(input.personId || "").trim(),
  notes: String(input.notes || "").trim()
});

const normalizeChildInput = (input: ChildCheckInInput): ChildCheckInInput => ({
  eventId: String(input.eventId || "").trim(),
  childPersonId: String(input.childPersonId || "").trim(),
  childName: String(input.childName || "").trim(),
  guardianPersonId: String(input.guardianPersonId || "").trim(),
  guardianName: String(input.guardianName || "").trim(),
  guardianPhone: String(input.guardianPhone || "").trim(),
  notes: String(input.notes || "").trim()
});

export const checkInRepository = {
  async listEventCheckIns(): Promise<EventCheckIn[]> {
    const data = await readData();
    return [...data.eventCheckIns].sort((a, b) => b.checkedInAt.localeCompare(a.checkedInAt));
  },

  async createEventCheckIn(input: EventCheckInInput): Promise<EventCheckIn> {
    const data = await readData();
    const normalized = normalizeEventInput(input);
    const existing = data.eventCheckIns.find((item) => item.eventId === normalized.eventId && item.personId === normalized.personId);
    if (existing) return existing;

    const checkIn: EventCheckIn = {
      id: eventCheckInId(),
      ...normalized,
      checkedInAt: new Date().toISOString()
    };

    await writeData({ ...data, eventCheckIns: [...data.eventCheckIns, checkIn] });
    return checkIn;
  },

  async removeEventCheckIn(id: string): Promise<boolean> {
    const data = await readData();
    const nextCheckIns = data.eventCheckIns.filter((item) => item.id !== id);
    if (nextCheckIns.length === data.eventCheckIns.length) return false;
    await writeData({ ...data, eventCheckIns: nextCheckIns });
    return true;
  },

  async listChildCheckIns(): Promise<ChildCheckIn[]> {
    const data = await readData();
    return [...data.childCheckIns].sort((a, b) => b.checkedInAt.localeCompare(a.checkedInAt));
  },

  async createChildCheckIn(input: ChildCheckInInput): Promise<ChildCheckIn> {
    const data = await readData();
    const checkIn: ChildCheckIn = {
      id: childCheckInId(),
      ...normalizeChildInput(input),
      securityCode: securityCode(),
      checkedInAt: new Date().toISOString(),
      checkedOutAt: "",
      checkedOutByPersonId: ""
    };

    await writeData({ ...data, childCheckIns: [...data.childCheckIns, checkIn] });
    return checkIn;
  },

  async checkOutChild(id: string, checkedOutByPersonId = ""): Promise<ChildCheckIn | null> {
    const data = await readData();
    const existing = data.childCheckIns.find((item) => item.id === id);
    if (!existing) return null;

    const updated: ChildCheckIn = {
      ...existing,
      checkedOutAt: existing.checkedOutAt || new Date().toISOString(),
      checkedOutByPersonId: existing.checkedOutByPersonId || checkedOutByPersonId
    };

    await writeData({ ...data, childCheckIns: data.childCheckIns.map((item) => item.id === id ? updated : item) });
    return updated;
  }
};
