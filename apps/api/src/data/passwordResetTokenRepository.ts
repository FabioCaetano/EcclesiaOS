import { createHash, randomBytes } from "node:crypto";
import { readData, writeData } from "./dataStore.js";
import type { PasswordResetTokenRecord } from "./dataStore.js";

const tokenTtlMs = 15 * 60 * 1000;

const createId = () => `prt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const generateRawToken = (): string => randomBytes(32).toString("base64url");

export const hashToken = (raw: string): string => createHash("sha256").update(raw).digest("hex");

export const passwordResetTokenRepository = {
  async create(userId: string): Promise<{ token: string; record: PasswordResetTokenRecord }> {
    const data = await readData();
    const token = generateRawToken();
    const tokenHash = hashToken(token);
    const now = new Date();
    const record: PasswordResetTokenRecord = {
      id: createId(),
      userId,
      tokenHash,
      expiresAt: new Date(now.getTime() + tokenTtlMs).toISOString(),
      usedAt: null,
      createdAt: now.toISOString()
    };

    await writeData({ ...data, passwordResetTokens: [...data.passwordResetTokens, record] });
    return { token, record };
  },

  async findActive(token: string): Promise<PasswordResetTokenRecord | null> {
    const data = await readData();
    const tokenHash = hashToken(token);
    const now = Date.now();
    const record = data.passwordResetTokens.find((item) =>
      item.tokenHash === tokenHash &&
      !item.usedAt &&
      new Date(item.expiresAt).getTime() > now
    );
    return record || null;
  },

  async markUsed(id: string): Promise<void> {
    const data = await readData();
    const updated = data.passwordResetTokens.map((item) =>
      item.id === id ? { ...item, usedAt: new Date().toISOString() } : item
    );
    await writeData({ ...data, passwordResetTokens: updated });
  }
};
