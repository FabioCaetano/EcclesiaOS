import { randomUUID } from "node:crypto";
import type { UserInput, UserRole } from "@ecclesiaos/shared";
import { dataFilePath, readData, writeData } from "./dataStore.js";
import type { UserRecord } from "./defaultUsers.js";
import { hashPassword, isPasswordHash, verifyPassword } from "../passwords.js";

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeRole = (role: UserRole): UserRole => (role === "leader" || role === "member" ? role : "admin");

const sanitizeUserInput = (input: UserInput, existing?: UserRecord): UserRecord => ({
  id: existing?.id || `usr_${randomUUID()}`,
  name: input.name.trim(),
  email: normalizeEmail(input.email),
  password: input.password.trim() ? hashPassword(input.password.trim()) : existing?.password || "",
  role: normalizeRole(input.role),
  personId: input.personId.trim()
});

const toPublicUser = (user: UserRecord) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  personId: user.personId
});

export const userRepository = {
  dataFilePath,

  async listUsers() {
    const data = await readData();
    return data.users;
  },

  async listPublicUsers() {
    const users = await this.listUsers();
    return users.map(toPublicUser);
  },

  async findById(id: string) {
    const users = await this.listUsers();
    return users.find((user) => user.id === id) || null;
  },

  async findByCredentials(email: string, password: string) {
    const data = await readData();
    const users = data.users;
    const normalizedEmail = normalizeEmail(email);
    const user = users.find((item) => normalizeEmail(item.email) === normalizedEmail);
    if (!user || !verifyPassword(password, user.password)) return null;

    if (!isPasswordHash(user.password)) {
      user.password = hashPassword(password);
      await writeData(data);
    }

    return user;
  },

  async create(input: UserInput) {
    const data = await readData();
    const normalizedEmail = normalizeEmail(input.email);
    if (data.users.some((user) => normalizeEmail(user.email) === normalizedEmail)) return null;
    if (!input.personId.trim()) return "missing_person";
    if (data.users.some((user) => user.personId && user.personId === input.personId.trim())) return "duplicate_person";

    const user = sanitizeUserInput(input);
    data.users.push(user);
    await writeData(data);
    return toPublicUser(user);
  },

  async update(id: string, input: UserInput) {
    const data = await readData();
    const index = data.users.findIndex((user) => user.id === id);
    if (index === -1) return null;

    const normalizedEmail = normalizeEmail(input.email);
    const duplicate = data.users.some((user) => user.id !== id && normalizeEmail(user.email) === normalizedEmail);
    if (duplicate) return "duplicate";
    if (!input.personId.trim()) return "missing_person";
    if (data.users.some((user) => user.id !== id && user.personId && user.personId === input.personId.trim())) return "duplicate_person";

    const user = sanitizeUserInput(input, data.users[index]);
    data.users[index] = user;
    await writeData(data);
    return toPublicUser(user);
  },

  async remove(id: string) {
    const data = await readData();
    const nextUsers = data.users.filter((user) => user.id !== id);
    if (nextUsers.length === data.users.length) return false;

    data.users = nextUsers;
    await writeData(data);
    return true;
  }
};
