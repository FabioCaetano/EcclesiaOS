import { randomUUID } from "node:crypto";
import type { KidsRoom, KidsRoomInput } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const sortRooms = (rooms: KidsRoom[]) => [...rooms].sort((a, b) => a.minAge - b.minAge || a.name.localeCompare(b.name));

const normalizeRoomInput = (input: KidsRoomInput): KidsRoomInput => {
  const minAge = Math.max(0, Number(input.minAge) || 0);
  const maxAge = Math.max(minAge, Number(input.maxAge) || minAge);

  return {
    name: String(input.name || "").trim(),
    minAge,
    maxAge,
    capacity: Math.max(0, Number(input.capacity) || 0),
    responsiblePersonIds: Array.isArray(input.responsiblePersonIds)
      ? input.responsiblePersonIds.map(String).filter(Boolean)
      : [],
    isActive: input.isActive !== false
  };
};

export const kidsRoomRepository = {
  async list() {
    const data = await readData();
    return sortRooms(data.kidsRooms);
  },

  async create(input: KidsRoomInput) {
    const data = await readData();
    const now = new Date().toISOString();
    const room: KidsRoom = {
      id: `kids_room_${randomUUID()}`,
      ...normalizeRoomInput(input),
      createdAt: now,
      updatedAt: now
    };

    data.kidsRooms = sortRooms([...data.kidsRooms, room]);
    await writeData(data);
    return room;
  },

  async update(id: string, input: KidsRoomInput) {
    const data = await readData();
    const existing = data.kidsRooms.find((room) => room.id === id);
    if (!existing) return null;

    const room: KidsRoom = {
      ...existing,
      ...normalizeRoomInput(input),
      updatedAt: new Date().toISOString()
    };

    data.kidsRooms = sortRooms(data.kidsRooms.map((item) => item.id === id ? room : item));
    await writeData(data);
    return room;
  },

  async remove(id: string) {
    const data = await readData();
    const nextRooms = data.kidsRooms.filter((room) => room.id !== id);
    if (nextRooms.length === data.kidsRooms.length) return false;

    data.kidsRooms = nextRooms;
    await writeData(data);
    return true;
  }
};
