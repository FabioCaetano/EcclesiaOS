import type { ServiceChecklist, ServiceChecklistInput, ServiceChecklistItem } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `lit_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const createItemId = () => `lit_item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeItems = (items: ServiceChecklistItem[]): ServiceChecklistItem[] => (
  (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      id: String(item.id || "").trim() || createItemId(),
      title: String(item.title || "").trim(),
      responsiblePersonId: String(item.responsiblePersonId || "").trim(),
      scheduledTime: String(item.scheduledTime || "").trim(),
      notes: String(item.notes || "").trim(),
      completed: Boolean(item.completed),
      order: Math.max(1, Number(item.order) || index + 1)
    }))
    .filter((item) => item.title)
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index + 1 }))
);

const normalizeInput = (input: ServiceChecklistInput): ServiceChecklistInput => ({
  eventId: String(input.eventId || "").trim(),
  title: String(input.title || "").trim(),
  date: String(input.date || "").trim(),
  notes: String(input.notes || "").trim(),
  items: normalizeItems(input.items)
});

export const serviceChecklistRepository = {
  async list(): Promise<ServiceChecklist[]> {
    const data = await readData();
    return [...data.serviceChecklists].sort((a, b) => `${a.date} ${a.title}`.localeCompare(`${b.date} ${b.title}`));
  },

  async create(input: ServiceChecklistInput): Promise<ServiceChecklist> {
    const data = await readData();
    const now = new Date().toISOString();
    const checklist: ServiceChecklist = {
      id: createId(),
      ...normalizeInput(input),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, serviceChecklists: [...data.serviceChecklists, checklist] });
    return checklist;
  },

  async update(id: string, input: ServiceChecklistInput): Promise<ServiceChecklist | null> {
    const data = await readData();
    const existing = data.serviceChecklists.find((checklist) => checklist.id === id);
    if (!existing) return null;

    const updated: ServiceChecklist = {
      ...existing,
      ...normalizeInput(input),
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, serviceChecklists: data.serviceChecklists.map((checklist) => checklist.id === id ? updated : checklist) });
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const nextChecklists = data.serviceChecklists.filter((checklist) => checklist.id !== id);
    if (nextChecklists.length === data.serviceChecklists.length) return false;

    await writeData({ ...data, serviceChecklists: nextChecklists });
    return true;
  }
};
