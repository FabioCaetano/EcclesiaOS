import type { CurrentUser, MessageChannel, PeopleMessage, PeopleMessageInput } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeChannel = (channel: string): MessageChannel => (
  channel === "email" || channel === "whatsapp" ? channel : "manual"
);

const normalizeInput = (input: PeopleMessageInput): PeopleMessageInput => ({
  subject: String(input.subject || "").trim(),
  body: String(input.body || "").trim(),
  channel: normalizeChannel(input.channel),
  recipientPersonIds: Array.isArray(input.recipientPersonIds)
    ? input.recipientPersonIds.map((id) => String(id || "").trim()).filter(Boolean)
    : []
});

export const peopleMessageRepository = {
  async list(): Promise<PeopleMessage[]> {
    const data = await readData();
    return [...data.peopleMessages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listForPerson(personId: string): Promise<PeopleMessage[]> {
    const data = await readData();
    return data.peopleMessages
      .filter((message) => message.recipientPersonIds.includes(personId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(input: PeopleMessageInput, actor: CurrentUser): Promise<PeopleMessage | "invalid"> {
    const normalized = normalizeInput(input);
    if (!normalized.subject) return "invalid";
    if (normalized.recipientPersonIds.length === 0) return "invalid";

    const data = await readData();
    const message: PeopleMessage = {
      id: createId(),
      ...normalized,
      createdAt: new Date().toISOString(),
      createdByUserId: actor.id,
      createdByName: actor.name
    };

    await writeData({ ...data, peopleMessages: [...data.peopleMessages, message] });
    return message;
  }
};
