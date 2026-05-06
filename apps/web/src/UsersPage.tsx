import React, { useEffect, useMemo, useState } from "react";
import { KeyRound, Plus, UsersRound } from "lucide-react";
import type { CurrentUser, PersonProfile, ResetPasswordResponse, UserInput } from "@ecclesiaos/shared";
import { adminResetUserPassword, deleteUser, loadPeople, loadUsers, saveUser } from "./api";
import { emptyUserInput, roleLabels } from "./constants";
import { Card, EmptyState, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

const toUserInput = (user: CurrentUser): UserInput => ({
  name: user.name,
  email: user.email,
  password: "",
  role: user.role,
  personId: user.personId
});

const personName = (people: PersonProfile[], personId: string) => {
  const person = people.find((item) => item.id === personId);
  return person ? `${person.firstName} ${person.lastName}`.trim() : "Sem pessoa vinculada";
};

export const UsersPage: React.FC<Props> = ({ token, user }) => {
  const [users, setUsers] = useState<CurrentUser[]>([]);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserInput>(emptyUserInput);
  const [status, setStatus] = useState("");
  const [resetResult, setResetResult] = useState<ResetPasswordResponse | null>(null);

  const selectedUser = useMemo(() => users.find((item) => item.id === selectedUserId) || null, [selectedUserId, users]);

  const refresh = async () => {
    const [nextUsers, nextPeople] = await Promise.all([loadUsers(token), loadPeople(token)]);
    setUsers(nextUsers);
    setPeople(nextPeople);
  };

  useEffect(() => {
    refresh().catch(() => setStatus("Nao foi possivel carregar usuarios."));
  }, [token]);

  const selectUser = (nextUser: CurrentUser) => {
    setSelectedUserId(nextUser.id);
    setUserForm(toUserInput(nextUser));
    setStatus("");
  };

  const startNewUser = () => {
    setSelectedUserId(null);
    setUserForm(emptyUserInput);
    setStatus("");
  };

  const updateField = (field: keyof UserInput, value: string) => {
    setUserForm((current) => ({ ...current, [field]: field === "role" && (value === "admin" || value === "leader") ? value : field === "role" ? "member" : value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Salvando...");

    try {
      const saved = await saveUser(token, userForm, selectedUserId || undefined);
      await refresh();
      selectUser(saved);
      setStatus("Usuario salvo.");
    } catch {
      setStatus("Nao foi possivel salvar o usuario.");
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId || selectedUserId === user.id) return;
    if (!window.confirm("Remover este usuario?")) return;

    setStatus("Removendo...");
    try {
      await deleteUser(token, selectedUserId);
      await refresh();
      startNewUser();
      setStatus("Usuario removido.");
    } catch {
      setStatus("Nao foi possivel remover o usuario.");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserId) return;
    if (!window.confirm("Gerar uma senha temporaria para este usuario? A senha aparecera apenas uma vez.")) return;

    setStatus("Gerando senha temporaria...");
    setResetResult(null);
    try {
      const response = await adminResetUserPassword(token, selectedUserId);
      setResetResult(response);
      setStatus("Senha temporaria gerada. Compartilhe com o usuario por canal seguro.");
    } catch {
      setStatus("Nao foi possivel gerar a senha.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        icon={UsersRound}
        title="Usuarios"
        description="Gestao de contas administrativas, lideres e membros."
        actions={(
          <button className="secondary-button" type="button" onClick={startNewUser}>
            <Plus size={16} /> Novo usuario
          </button>
        )}
      />

      <Card className="users-panel">
      <div className="people-layout">
        <div className="people-list" aria-label="Lista de usuarios">
          {users.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="Nenhum usuario cadastrado"
              description="Use o botao Novo usuario para comecar."
            />
          ) : users.map((item) => (
            <button className={item.id === selectedUserId ? "person-row selected" : "person-row"} key={item.id} type="button" onClick={() => selectUser(item)}>
              <strong>{item.name}</strong>
              <span>{roleLabels[item.role]} - {item.email}</span>
              <span>{personName(people, item.personId)}</span>
            </button>
          ))}
        </div>

        <form className="person-form" onSubmit={handleSubmit}>
          <label>Nome<input value={userForm.name} onChange={(event) => updateField("name", event.target.value)} /></label>
          <label>Email<input type="email" value={userForm.email} onChange={(event) => updateField("email", event.target.value)} /></label>
          <label>
            Perfil
            <select value={userForm.role} onChange={(event) => updateField("role", event.target.value)}>
              <option value="admin">Administrador</option>
              <option value="leader">Lider</option>
              <option value="member">Membro</option>
            </select>
          </label>
          <label>
            Pessoa vinculada
            <select value={userForm.personId} onChange={(event) => updateField("personId", event.target.value)}>
              <option value="">Sem vinculo</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            {selectedUser ? "Nova senha" : "Senha inicial"}
            <input type="password" value={userForm.password} onChange={(event) => updateField("password", event.target.value)} />
          </label>

          {resetResult && resetResult.userId === selectedUserId && (
            <div className="password-reset-banner wide-field">
              <p>Senha temporaria de <em>{resetResult.email}</em>:</p>
              <strong>{resetResult.temporaryPassword}</strong>
              <p>Copie agora e oriente o usuario a trocar pela conta dele apos o login.</p>
            </div>
          )}

          <div className="form-footer">
            <button type="submit">{selectedUserId ? "Salvar usuario" : "Criar usuario"}</button>
            {selectedUserId && (
              <button className="secondary-button" type="button" onClick={handleResetPassword}>
                <KeyRound size={14} /> Resetar senha
              </button>
            )}
            {selectedUserId && selectedUserId !== user.id && <button className="danger-button" type="button" onClick={handleDelete}>Remover</button>}
            <p>{status || "Financeiro e usuarios sao restritos a administradores."}</p>
          </div>
        </form>
      </div>
      </Card>
    </>
  );
};
