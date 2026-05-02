import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const prefix = "scrypt";
const keyLength = 64;

export const isPasswordHash = (password: string) => password.startsWith(`${prefix}$`);

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, keyLength).toString("base64url");
  return `${prefix}$${salt}$${hash}`;
};

export const verifyPassword = (password: string, storedPassword: string) => {
  if (!isPasswordHash(storedPassword)) return password === storedPassword;

  const [, salt, hash] = storedPassword.split("$");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
