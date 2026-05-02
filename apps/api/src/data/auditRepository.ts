import { randomUUID } from "node:crypto";
import type { AuditAction, AuditLogEntry } from "@ecclesiaos/shared";
import type { UserRecord } from "./defaultUsers.js";
import { readData, writeData } from "./dataStore.js";

export interface AuditInput {
  action: AuditAction;
  entityType: string;
  entityId: string;
  actor: UserRecord;
  summary: string;
}

export const auditRepository = {
  async list() {
    const data = await readData();
    return [...data.auditLogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(input: AuditInput) {
    const data = await readData();
    const log: AuditLogEntry = {
      id: `aud_${randomUUID()}`,
      action: input.action,
      entityType: input.entityType.trim(),
      entityId: input.entityId.trim(),
      actorUserId: input.actor.id,
      actorName: input.actor.name,
      summary: input.summary.trim(),
      createdAt: new Date().toISOString()
    };

    data.auditLogs.unshift(log);
    await writeData(data);
    return log;
  }
};
