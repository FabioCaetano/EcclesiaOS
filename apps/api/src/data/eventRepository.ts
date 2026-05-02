import type { ChurchEvent, ChurchEventInput, EventRecurrence, EventType } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const createSlug = (title: string, date: string) => `${title}-${date}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `evento-${Date.now()}`;

const normalizeType = (type: EventType): EventType => (
  ["service", "meeting", "class", "outreach", "other"].includes(type) ? type : "other"
);

const normalizeRecurrence = (recurrence: EventRecurrence): EventRecurrence => (
  recurrence === "weekly" || recurrence === "monthly" || recurrence === "cron" ? recurrence : "none"
);

const normalizeInput = (input: ChurchEventInput): ChurchEventInput => ({
  title: String(input.title || "").trim(),
  type: normalizeType(input.type),
  date: String(input.date || "").trim(),
  startTime: String(input.startTime || "").trim(),
  endTime: String(input.endTime || "").trim(),
  location: String(input.location || "").trim(),
  groupId: String(input.groupId || "").trim(),
  recurrence: normalizeRecurrence(input.recurrence),
  recurrenceUntil: input.recurrence === "none" ? "" : String(input.recurrenceUntil || "").trim(),
  recurrenceRule: input.recurrence === "cron" ? String(input.recurrenceRule || "").trim() : "",
  registrationEnabled: Boolean(input.registrationEnabled),
  registrationCapacity: Math.max(0, Number(input.registrationCapacity) || 0),
  registrationPrice: Math.max(0, Number(input.registrationPrice) || 0),
  registrationCurrency: String(input.registrationCurrency || "BRL").trim().toUpperCase() || "BRL",
  registrationSlug: String(input.registrationSlug || "").trim(),
  description: String(input.description || "").trim()
});

export const eventRepository = {
  async list(): Promise<ChurchEvent[]> {
    const data = await readData();
    return [...data.events].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  },

  async create(input: ChurchEventInput): Promise<ChurchEvent> {
    const data = await readData();
    const now = new Date().toISOString();
    const normalized = normalizeInput(input);
    const event: ChurchEvent = {
      id: createId(),
      ...normalized,
      registrationSlug: normalized.registrationSlug || createSlug(normalized.title, normalized.date),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, events: [...data.events, event] });
    return event;
  },

  async update(id: string, input: ChurchEventInput): Promise<ChurchEvent | null> {
    const data = await readData();
    const existing = data.events.find((event) => event.id === id);
    if (!existing) return null;

    const normalized = normalizeInput(input);
    const updated: ChurchEvent = {
      ...existing,
      ...normalized,
      registrationSlug: normalized.registrationSlug || existing.registrationSlug || createSlug(normalized.title, normalized.date),
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, events: data.events.map((event) => event.id === id ? updated : event) });
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const nextEvents = data.events.filter((event) => event.id !== id);
    if (nextEvents.length === data.events.length) return false;

    await writeData({ ...data, events: nextEvents });
    return true;
  }
};
