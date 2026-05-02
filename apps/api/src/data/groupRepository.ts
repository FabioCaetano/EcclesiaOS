import type { GroupInput, GroupProfile } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `grp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeInput = (input: GroupInput): GroupInput => {
  const memberPersonIds = Array.isArray(input.memberPersonIds) ? [...new Set(input.memberPersonIds.filter(Boolean))] : [];
  const leaderPersonId = String(input.leaderPersonId || "").trim();

  return {
    name: String(input.name || "").trim(),
    type: ["small_group", "ministry", "class", "team"].includes(input.type) ? input.type : "small_group",
    description: String(input.description || "").trim(),
    leaderPersonId,
    memberPersonIds: leaderPersonId && !memberPersonIds.includes(leaderPersonId) ? [leaderPersonId, ...memberPersonIds] : memberPersonIds
  };
};

export const groupRepository = {
  async list(): Promise<GroupProfile[]> {
    const data = await readData();
    return [...data.groups].sort((a, b) => a.name.localeCompare(b.name));
  },

  async create(input: GroupInput): Promise<GroupProfile> {
    const data = await readData();
    const now = new Date().toISOString();
    const group: GroupProfile = {
      id: createId(),
      ...normalizeInput(input),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, groups: [...data.groups, group] });
    return group;
  },

  async update(id: string, input: GroupInput): Promise<GroupProfile | null> {
    const data = await readData();
    const existing = data.groups.find((group) => group.id === id);
    if (!existing) return null;

    const updated: GroupProfile = {
      ...existing,
      ...normalizeInput(input),
      updatedAt: new Date().toISOString()
    };

    await writeData({ ...data, groups: data.groups.map((group) => group.id === id ? updated : group) });
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const nextGroups = data.groups.filter((group) => group.id !== id);
    if (nextGroups.length === data.groups.length) return false;

    await writeData({ ...data, groups: nextGroups });
    return true;
  }
};
