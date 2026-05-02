import type { PersonInput, PersonProfile } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `per_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeInput = (input: PersonInput): PersonInput => ({
  firstName: String(input.firstName || "").trim(),
  lastName: String(input.lastName || "").trim(),
  email: String(input.email || "").trim(),
  phone: String(input.phone || "").trim(),
  birthDate: String(input.birthDate || "").trim(),
  status: input.status === "visitor" ? "visitor" : "member",
  guardianPersonIds: Array.isArray(input.guardianPersonIds) ? input.guardianPersonIds.map(String).filter(Boolean) : [],
  notes: String(input.notes || "").trim()
});

export const personRepository = {
  async list(): Promise<PersonProfile[]> {
    const data = await readData();
    return [...data.people].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  },

  async create(input: PersonInput): Promise<PersonProfile> {
    const data = await readData();
    const now = new Date().toISOString();
    const person: PersonProfile = {
      id: createId(),
      ...normalizeInput(input),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, people: [...data.people, person] });
    return person;
  },

  async update(id: string, input: PersonInput): Promise<PersonProfile | null> {
    const data = await readData();
    const existing = data.people.find((person) => person.id === id);
    if (!existing) return null;

    const updated: PersonProfile = {
      ...existing,
      ...normalizeInput(input),
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, people: data.people.map((person) => person.id === id ? updated : person) });
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const nextPeople = data.people.filter((person) => person.id !== id);
    if (nextPeople.length === data.people.length) return false;

    await writeData({ ...data, people: nextPeople });
    return true;
  }
};
