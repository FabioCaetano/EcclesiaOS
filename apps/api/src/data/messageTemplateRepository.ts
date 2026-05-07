import type { MessageChannel, MessageTemplate, MessageTemplateInput } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `mtpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeChannel = (channel: MessageChannel): MessageChannel => (
  channel === "email" || channel === "whatsapp" ? channel : "manual"
);

const normalizeInput = (input: MessageTemplateInput): MessageTemplateInput => ({
  name: String(input.name || "").trim() || "Template sem nome",
  channel: normalizeChannel(input.channel),
  subject: String(input.subject || "").trim(),
  body: String(input.body || "")
});

export const messageTemplateRepository = {
  async list(): Promise<MessageTemplate[]> {
    const data = await readData();
    return [...data.messageTemplates].sort((a, b) => a.name.localeCompare(b.name));
  },

  async findById(id: string): Promise<MessageTemplate | null> {
    const data = await readData();
    return data.messageTemplates.find((template) => template.id === id) || null;
  },

  async create(input: MessageTemplateInput): Promise<MessageTemplate> {
    const data = await readData();
    const now = new Date().toISOString();
    const template: MessageTemplate = {
      id: createId(),
      ...normalizeInput(input),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, messageTemplates: [...data.messageTemplates, template] });
    return template;
  },

  async update(id: string, input: MessageTemplateInput): Promise<MessageTemplate | null> {
    const data = await readData();
    const existing = data.messageTemplates.find((template) => template.id === id);
    if (!existing) return null;

    const updated: MessageTemplate = {
      ...existing,
      ...normalizeInput(input),
      updatedAt: new Date().toISOString()
    };

    await writeData({
      ...data,
      messageTemplates: data.messageTemplates.map((template) => template.id === id ? updated : template)
    });
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const next = data.messageTemplates.filter((template) => template.id !== id);
    if (next.length === data.messageTemplates.length) return false;

    await writeData({ ...data, messageTemplates: next });
    return true;
  }
};
