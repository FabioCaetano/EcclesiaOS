import { randomBytes, randomUUID } from "node:crypto";
import type { ChurchEvent, EventRegistration, EventRegistrationInput, EventRegistrationStatus } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `reg_${randomUUID()}`;
const createTicketCode = () => randomBytes(6).toString("hex").toUpperCase();

const normalizeSlug = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const normalizeInput = (input: EventRegistrationInput): EventRegistrationInput => ({
  name: String(input.name || "").trim(),
  email: String(input.email || "").trim().toLowerCase(),
  phone: String(input.phone || "").trim(),
  quantity: Math.max(1, Number(input.quantity) || 1),
  notes: String(input.notes || "").trim()
});

const registrationStatus = (event: ChurchEvent): EventRegistrationStatus => event.registrationPrice > 0 ? "pending_payment" : "confirmed";

export const eventRegistrationRepository = {
  async list(): Promise<EventRegistration[]> {
    const data = await readData();
    return [...data.eventRegistrations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async findPublicEvent(slug: string): Promise<ChurchEvent | null> {
    const data = await readData();
    const normalizedSlug = normalizeSlug(slug);
    return data.events.find((event) => event.registrationEnabled && normalizeSlug(event.registrationSlug) === normalizedSlug) || null;
  },

  async create(event: ChurchEvent, input: EventRegistrationInput): Promise<EventRegistration | "full"> {
    const data = await readData();
    const normalized = normalizeInput(input);
    const currentQuantity = data.eventRegistrations
      .filter((registration) => registration.eventId === event.id && registration.status !== "cancelled")
      .reduce((sum, registration) => sum + registration.quantity, 0);

    if (event.registrationCapacity > 0 && currentQuantity + normalized.quantity > event.registrationCapacity) {
      return "full";
    }

    const registration: EventRegistration = {
      id: createId(),
      eventId: event.id,
      ...normalized,
      amountDue: event.registrationPrice * normalized.quantity,
      status: registrationStatus(event),
      ticketCode: createTicketCode(),
      checkedInAt: "",
      checkedInByUserId: "",
      createdAt: new Date().toISOString()
    };

    await writeData({ ...data, eventRegistrations: [...data.eventRegistrations, registration] });
    return registration;
  },

  async updateStatus(id: string, status: EventRegistrationStatus): Promise<EventRegistration | null> {
    const data = await readData();
    const existing = data.eventRegistrations.find((registration) => registration.id === id);
    if (!existing) return null;

    const normalizedStatus: EventRegistrationStatus = status === "cancelled" || status === "pending_payment" ? status : "confirmed";
    const updated: EventRegistration = {
      ...existing,
      status: normalizedStatus
    };

    await writeData({
      ...data,
      eventRegistrations: data.eventRegistrations.map((registration) => registration.id === id ? updated : registration)
    });
    return updated;
  },

  async checkIn(id: string, ticketCode: string, checkedInByUserId: string): Promise<EventRegistration | "invalid" | "not_confirmed" | null> {
    const data = await readData();
    const existing = data.eventRegistrations.find((registration) => registration.id === id);
    if (!existing) return null;
    if (existing.status !== "confirmed") return "not_confirmed";
    if ((existing.ticketCode || existing.id) !== String(ticketCode || "").trim()) return "invalid";

    const updated: EventRegistration = {
      ...existing,
      ticketCode: existing.ticketCode || existing.id,
      checkedInAt: existing.checkedInAt || new Date().toISOString(),
      checkedInByUserId: existing.checkedInByUserId || checkedInByUserId
    };

    await writeData({
      ...data,
      eventRegistrations: data.eventRegistrations.map((registration) => registration.id === id ? updated : registration)
    });
    return updated;
  }
};
