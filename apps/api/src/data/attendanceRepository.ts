import type { AttendanceInput, AttendanceRecord } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `att_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeInput = (input: AttendanceInput): AttendanceInput => ({
  date: String(input.date || "").trim(),
  type: input.type === "group" ? "group" : "service",
  eventId: String(input.eventId || "").trim(),
  groupId: input.type === "group" ? String(input.groupId || "").trim() : "",
  presentPersonIds: Array.isArray(input.presentPersonIds) ? [...new Set(input.presentPersonIds.filter(Boolean).map(String))] : [],
  notes: String(input.notes || "").trim()
});

export const attendanceRepository = {
  async list(): Promise<AttendanceRecord[]> {
    const data = await readData();
    return [...data.attendance].sort((a, b) => b.date.localeCompare(a.date));
  },

  async create(input: AttendanceInput): Promise<AttendanceRecord> {
    const data = await readData();
    const now = new Date().toISOString();
    const record: AttendanceRecord = {
      id: createId(),
      ...normalizeInput(input),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, attendance: [...data.attendance, record] });
    return record;
  },

  async update(id: string, input: AttendanceInput): Promise<AttendanceRecord | null> {
    const data = await readData();
    const existing = data.attendance.find((record) => record.id === id);
    if (!existing) return null;

    const updated: AttendanceRecord = {
      ...existing,
      ...normalizeInput(input),
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, attendance: data.attendance.map((record) => record.id === id ? updated : record) });
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const nextAttendance = data.attendance.filter((record) => record.id !== id);
    if (nextAttendance.length === data.attendance.length) return false;

    await writeData({ ...data, attendance: nextAttendance });
    return true;
  },

  async syncFromEventCheckIns(eventId: string): Promise<AttendanceRecord | null> {
    const data = await readData();
    const event = data.events.find((item) => item.id === eventId);
    if (!event) return null;

    const now = new Date().toISOString();
    const presentPersonIds = [...new Set(data.eventCheckIns
      .filter((checkIn) => checkIn.eventId === eventId)
      .map((checkIn) => checkIn.personId)
      .filter(Boolean))];
    const existing = data.attendance.find((record) => record.eventId === eventId);
    const input: AttendanceInput = {
      date: event.date,
      type: event.groupId ? "group" : "service",
      eventId,
      groupId: event.groupId || "",
      presentPersonIds,
      notes: "Gerado automaticamente a partir dos check-ins do evento."
    };

    const record: AttendanceRecord = existing
      ? { ...existing, ...normalizeInput(input), updatedAt: now }
      : { id: createId(), ...normalizeInput(input), createdAt: now, updatedAt: now };

    await writeData({
      ...data,
      attendance: existing
        ? data.attendance.map((item) => item.id === existing.id ? record : item)
        : [...data.attendance, record]
    });
    return record;
  }
};
