import type { CurrentUser, PersonBlockOut, PersonBlockOutInput } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `blk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeDate = (value: string): string => {
  const trimmed = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "";
  return trimmed;
};

const normalizeInput = (input: PersonBlockOutInput): PersonBlockOutInput | "invalid" => {
  const personId = String(input.personId || "").trim();
  const startDate = normalizeDate(input.startDate);
  const endDateRaw = normalizeDate(input.endDate);
  const endDate = endDateRaw || startDate;

  if (!personId || !startDate) return "invalid";
  if (endDate < startDate) return "invalid";

  return {
    personId,
    startDate,
    endDate,
    reason: String(input.reason || "").trim()
  };
};

export const isPersonBlockedOnDate = (blockOuts: PersonBlockOut[], personId: string, date: string): boolean => {
  if (!personId || !date) return false;
  return blockOuts.some((blockOut) =>
    blockOut.personId === personId && date >= blockOut.startDate && date <= blockOut.endDate
  );
};

export const blockOutRepository = {
  async list(): Promise<PersonBlockOut[]> {
    const data = await readData();
    return [...data.personBlockOuts].sort((a, b) => b.startDate.localeCompare(a.startDate));
  },

  async listForPerson(personId: string): Promise<PersonBlockOut[]> {
    const data = await readData();
    return data.personBlockOuts
      .filter((blockOut) => blockOut.personId === personId)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  },

  async findById(id: string): Promise<PersonBlockOut | null> {
    const data = await readData();
    return data.personBlockOuts.find((blockOut) => blockOut.id === id) || null;
  },

  async create(input: PersonBlockOutInput, actor: CurrentUser): Promise<PersonBlockOut | "invalid"> {
    const normalized = normalizeInput(input);
    if (normalized === "invalid") return "invalid";

    const data = await readData();
    const blockOut: PersonBlockOut = {
      id: createId(),
      ...normalized,
      createdAt: new Date().toISOString(),
      createdByUserId: actor.id
    };

    await writeData({ ...data, personBlockOuts: [...data.personBlockOuts, blockOut] });
    return blockOut;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const next = data.personBlockOuts.filter((blockOut) => blockOut.id !== id);
    if (next.length === data.personBlockOuts.length) return false;

    await writeData({ ...data, personBlockOuts: next });
    return true;
  }
};
