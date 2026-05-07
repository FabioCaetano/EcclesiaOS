import type { ChurchEvent, ChurchEventInput, CronGenerationResult, EventRecurrence, EventType } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";
import { planCronOccurrences } from "../cron.js";
import { removePlansForEvent, synchronizePlansForEvent } from "./servingPlanRepository.js";
import type { DataFile } from "./dataStore.js";

const createId = () => `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const createSlug = (title: string, date: string) => `${title}-${date}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `evento-${Date.now()}`;

const normalizeType = (type: EventType): EventType => (
  ["service", "meeting", "class", "outreach", "other"].includes(type) ? type : "other"
);

const normalizeRecurrence = (recurrence: EventRecurrence): EventRecurrence => (
  recurrence === "weekly" || recurrence === "monthly" || recurrence === "cron" ? recurrence : "none"
);

const normalizeRequestedTeams = (raw: unknown): string[] => (
  Array.isArray(raw) ? raw.map((value) => String(value || "").trim()).filter(Boolean) : []
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
  parentEventId: String(input.parentEventId || "").trim(),
  requestedTeamIds: normalizeRequestedTeams(input.requestedTeamIds),
  registrationEnabled: Boolean(input.registrationEnabled),
  registrationCapacity: Math.max(0, Number(input.registrationCapacity) || 0),
  registrationPrice: Math.max(0, Number(input.registrationPrice) || 0),
  registrationCurrency: String(input.registrationCurrency || "BRL").trim().toUpperCase() || "BRL",
  registrationSlug: String(input.registrationSlug || "").trim(),
  registrationRequiresEmailConfirmation: Boolean(input.registrationRequiresEmailConfirmation),
  description: String(input.description || "").trim()
});

const todayString = (now: Date = new Date()): string => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const buildChildFromMaster = (master: ChurchEvent, occurrence: { date: string; startTime: string }, nowIso: string, index: number): ChurchEvent => ({
  id: `${master.id}_occ_${occurrence.date.replace(/-/g, "")}_${occurrence.startTime.replace(":", "")}_${index}`,
  title: master.title,
  type: master.type,
  date: occurrence.date,
  startTime: occurrence.startTime,
  endTime: master.endTime,
  location: master.location,
  groupId: master.groupId,
  recurrence: "none",
  recurrenceUntil: "",
  recurrenceRule: "",
  parentEventId: master.id,
  requestedTeamIds: [...master.requestedTeamIds],
  registrationEnabled: false,
  registrationCapacity: 0,
  registrationPrice: 0,
  registrationCurrency: master.registrationCurrency,
  registrationSlug: `${master.registrationSlug || master.id}-${occurrence.date}-${occurrence.startTime.replace(":", "")}`,
  registrationRequiresEmailConfirmation: false,
  description: master.description,
  createdAt: nowIso,
  updatedAt: nowIso
});

const expandSingleMaster = (master: ChurchEvent, allEvents: ChurchEvent[], now: Date): { newChildren: ChurchEvent[]; generated: number; skipped: number; total: number } => {
  const planned = planCronOccurrences(master, now);
  if (planned.length === 0) return { newChildren: [], generated: 0, skipped: 0, total: 0 };

  const existingKeys = new Set(
    allEvents
      .filter((event) => event.parentEventId === master.id)
      .map((event) => `${event.date}T${event.startTime}`)
  );

  const nowIso = now.toISOString();
  const newChildren: ChurchEvent[] = [];
  let generated = 0;
  let skipped = 0;

  planned.forEach((occurrence, index) => {
    const key = `${occurrence.date}T${occurrence.startTime}`;
    if (existingKeys.has(key)) {
      skipped += 1;
      return;
    }
    newChildren.push(buildChildFromMaster(master, occurrence, nowIso, index));
    existingKeys.add(key);
    generated += 1;
  });

  return { newChildren, generated, skipped, total: planned.length };
};

const removeFutureChildrenWithoutEngagement = (events: ChurchEvent[], masterId: string, now: Date, registeredEventIds: Set<string>): ChurchEvent[] => {
  const today = todayString(now);
  return events.filter((event) => {
    if (event.parentEventId !== masterId) return true;
    if (event.date < today) return true;
    if (registeredEventIds.has(event.id)) return true;
    return false;
  });
};

const syncPlansForEvents = (data: DataFile, events: ChurchEvent[]): DataFile["servingPlans"] => {
  let plans = data.servingPlans;
  for (const event of events) {
    plans = synchronizePlansForEvent(plans, event, data.groups);
  }
  return plans;
};

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

    const nextEvents = [...data.events, event];
    const nextPlans = syncPlansForEvents(data, [event]);
    await writeData({ ...data, events: nextEvents, servingPlans: nextPlans });
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

    const nextEvents = data.events.map((event) => event.id === id ? updated : event);
    const nextPlans = syncPlansForEvents(data, [updated]);
    await writeData({ ...data, events: nextEvents, servingPlans: nextPlans });
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const target = data.events.find((event) => event.id === id);
    if (!target) return false;

    const now = new Date();
    const registeredEventIds = new Set<string>([
      ...data.eventRegistrations.map((registration) => registration.eventId),
      ...data.eventCheckIns.map((checkIn) => checkIn.eventId),
      ...data.childCheckIns.map((checkIn) => checkIn.eventId)
    ]);

    const withoutMaster = data.events.filter((event) => event.id !== id);
    const finalEvents = removeFutureChildrenWithoutEngagement(withoutMaster, id, now, registeredEventIds);

    const removedEventIds = new Set(
      data.events
        .filter((event) => !finalEvents.some((kept) => kept.id === event.id))
        .map((event) => event.id)
    );

    let nextPlans = data.servingPlans;
    for (const removedId of removedEventIds) {
      nextPlans = removePlansForEvent(nextPlans, removedId);
    }

    await writeData({ ...data, events: finalEvents, servingPlans: nextPlans });
    return true;
  },

  async materializeCronOccurrences(now: Date = new Date()): Promise<CronGenerationResult> {
    const data = await readData();
    const cronMasters = data.events.filter((event) => event.recurrence === "cron" && event.recurrenceRule && !event.parentEventId);
    if (cronMasters.length === 0) return { generated: 0, skipped: 0, total: 0 };

    let allEvents = [...data.events];
    const allNewChildren: ChurchEvent[] = [];
    let totalGenerated = 0;
    let totalSkipped = 0;
    let totalPlanned = 0;

    for (const master of cronMasters) {
      const result = expandSingleMaster(master, allEvents, now);
      if (result.newChildren.length > 0) {
        allEvents = [...allEvents, ...result.newChildren];
        allNewChildren.push(...result.newChildren);
      }
      totalGenerated += result.generated;
      totalSkipped += result.skipped;
      totalPlanned += result.total;
    }

    if (totalGenerated > 0) {
      const nextPlans = syncPlansForEvents(data, allNewChildren);
      await writeData({ ...data, events: allEvents, servingPlans: nextPlans });
    }

    return { generated: totalGenerated, skipped: totalSkipped, total: totalPlanned };
  },

  async regenerateForMaster(masterId: string, now: Date = new Date()): Promise<CronGenerationResult | null> {
    const data = await readData();
    const master = data.events.find((event) => event.id === masterId);
    if (!master) return null;
    if (master.recurrence !== "cron" || !master.recurrenceRule) {
      return { generated: 0, skipped: 0, total: 0 };
    }

    const result = expandSingleMaster(master, data.events, now);
    if (result.newChildren.length > 0) {
      const nextPlans = syncPlansForEvents(data, result.newChildren);
      await writeData({ ...data, events: [...data.events, ...result.newChildren], servingPlans: nextPlans });
    }
    return { generated: result.generated, skipped: result.skipped, total: result.total };
  }
};
