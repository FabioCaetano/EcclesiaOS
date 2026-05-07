import { createHash, randomBytes, randomUUID } from "node:crypto";
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

const finalRegistrationStatus = (event: ChurchEvent): EventRegistrationStatus => (
  event.registrationPrice > 0 ? "pending_payment" : "confirmed"
);

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const isPendingExpired = (registration: EventRegistration): boolean => (
  registration.status === "pending_email_confirmation"
  && registration.emailConfirmationExpiresAt !== ""
  && registration.emailConfirmationExpiresAt < new Date().toISOString()
);

export const reservedQuantityFor = (event: ChurchEvent, registrations: EventRegistration[]): number => (
  registrations
    .filter((registration) => registration.eventId === event.id && registration.status !== "cancelled" && !isPendingExpired(registration))
    .reduce((sum, registration) => sum + registration.quantity, 0)
);

export interface PublicCreateOptions {
  emailConfirmationRequired: boolean;
}

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

  async create(event: ChurchEvent, input: EventRegistrationInput, options: PublicCreateOptions = { emailConfirmationRequired: false }): Promise<{ registration: EventRegistration; confirmationToken: string } | "full"> {
    const data = await readData();
    const normalized = normalizeInput(input);
    const currentQuantity = reservedQuantityFor(event, data.eventRegistrations);

    if (event.registrationCapacity > 0 && currentQuantity + normalized.quantity > event.registrationCapacity) {
      return "full";
    }

    const requiresConfirmation = options.emailConfirmationRequired && Boolean(normalized.email);
    const confirmationToken = requiresConfirmation ? randomBytes(32).toString("base64url") : "";
    const expiresAt = requiresConfirmation ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : "";

    const registration: EventRegistration = {
      id: createId(),
      eventId: event.id,
      ...normalized,
      amountDue: event.registrationPrice * normalized.quantity,
      status: requiresConfirmation ? "pending_email_confirmation" : finalRegistrationStatus(event),
      ticketCode: createTicketCode(),
      checkedInAt: "",
      checkedInByUserId: "",
      emailConfirmationTokenHash: requiresConfirmation ? hashToken(confirmationToken) : "",
      emailConfirmationExpiresAt: expiresAt,
      createdAt: new Date().toISOString()
    };

    await writeData({ ...data, eventRegistrations: [...data.eventRegistrations, registration] });
    return { registration, confirmationToken };
  },

  async confirmEmail(token: string): Promise<EventRegistration | "invalid" | "expired"> {
    if (!token) return "invalid";
    const data = await readData();
    const tokenHash = hashToken(token);
    const existing = data.eventRegistrations.find((registration) => (
      registration.emailConfirmationTokenHash === tokenHash
      && registration.status === "pending_email_confirmation"
    ));
    if (!existing) return "invalid";
    if (existing.emailConfirmationExpiresAt && existing.emailConfirmationExpiresAt < new Date().toISOString()) {
      return "expired";
    }

    const event = data.events.find((entry) => entry.id === existing.eventId);
    const newStatus: EventRegistrationStatus = event && event.registrationPrice > 0 ? "pending_payment" : "confirmed";

    const updated: EventRegistration = {
      ...existing,
      status: newStatus,
      emailConfirmationTokenHash: "",
      emailConfirmationExpiresAt: ""
    };

    await writeData({
      ...data,
      eventRegistrations: data.eventRegistrations.map((registration) => registration.id === existing.id ? updated : registration)
    });
    return updated;
  },

  async resendEmailConfirmation(id: string): Promise<{ registration: EventRegistration; confirmationToken: string } | "not_found" | "not_pending" | "missing_email"> {
    const data = await readData();
    const existing = data.eventRegistrations.find((registration) => registration.id === id);
    if (!existing) return "not_found";
    if (existing.status !== "pending_email_confirmation") return "not_pending";
    if (!existing.email) return "missing_email";

    const confirmationToken = randomBytes(32).toString("base64url");
    const updated: EventRegistration = {
      ...existing,
      emailConfirmationTokenHash: hashToken(confirmationToken),
      emailConfirmationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    await writeData({
      ...data,
      eventRegistrations: data.eventRegistrations.map((registration) => registration.id === id ? updated : registration)
    });

    return { registration: updated, confirmationToken };
  },

  async updateStatus(id: string, status: EventRegistrationStatus): Promise<EventRegistration | null> {
    const data = await readData();
    const existing = data.eventRegistrations.find((registration) => registration.id === id);
    if (!existing) return null;

    const normalizedStatus: EventRegistrationStatus = (
      status === "cancelled" || status === "pending_payment" || status === "pending_email_confirmation"
        ? status
        : "confirmed"
    );
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
