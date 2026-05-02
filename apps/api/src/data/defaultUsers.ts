import type { CurrentUser } from "@ecclesiaos/shared";

export interface UserRecord extends CurrentUser {
  password: string;
}

export const defaultUsers: UserRecord[] = [
  {
    id: "usr_admin",
    name: "Administrador EcclesiaOS",
    email: "admin@ecclesiaos.local",
    password: "admin123",
    role: "admin",
    personId: "per_admin"
  },
  {
    id: "usr_leader",
    name: "Lider de Ministerio",
    email: "lider@ecclesiaos.local",
    password: "lider123",
    role: "leader",
    personId: "per_002"
  },
  {
    id: "usr_member",
    name: "Membro da Igreja",
    email: "membro@ecclesiaos.local",
    password: "membro123",
    role: "member",
    personId: "per_001"
  }
];
