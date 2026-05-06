import React, { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import type { CurrentUser } from "@ecclesiaos/shared";
import { changeOwnPassword } from "./api";
import { Card, PageHeader } from "./ui";
import { roleLabels } from "./constants";

interface Props {
  token: string;
  user: CurrentUser;
}

export const AccountPage: React.FC<Props> = ({ token, user }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "error"; message: string }>({
    kind: "idle",
    message: ""
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword || !newPassword) {
      setStatus({ kind: "error", message: "Preencha a senha atual e a nova senha." });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ kind: "error", message: "A nova senha precisa ter pelo menos 6 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ kind: "error", message: "A confirmacao nao bate com a nova senha." });
      return;
    }
    if (newPassword === currentPassword) {
      setStatus({ kind: "error", message: "A nova senha precisa ser diferente da atual." });
      return;
    }

    setStatus({ kind: "saving", message: "Salvando..." });
    try {
      await changeOwnPassword(token, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus({ kind: "ok", message: "Senha atualizada. Use a nova senha no proximo login." });
    } catch (error) {
      const errorMessage = error instanceof Error && error.message === "invalid-current-password"
        ? "Senha atual incorreta."
        : error instanceof Error && error.message === "invalid-new-password"
          ? "Nova senha invalida ou igual a atual."
          : "Nao foi possivel alterar a senha.";
      setStatus({ kind: "error", message: errorMessage });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        icon={ShieldCheck}
        title="Minha conta"
        description="Atualize sua senha de acesso. Tudo o mais e gerenciado pelo administrador."
      />

      <Card>
        <div className="account-summary">
          <div className="account-avatar">{user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}</div>
          <div>
            <h2>{user.name}</h2>
            <p className="muted">{roleLabels[user.role]} - {user.email}</p>
          </div>
        </div>

        <form className="church-form" onSubmit={handleSubmit} style={{ marginTop: "var(--space-5)" }}>
          <label className="wide-field">
            Senha atual
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          <label>
            Nova senha
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
            />
          </label>
          <label>
            Confirmar nova senha
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
            />
          </label>

          <div className="form-footer">
            <button type="submit" disabled={status.kind === "saving"}>
              <KeyRound size={16} /> {status.kind === "saving" ? "Salvando..." : "Atualizar senha"}
            </button>
            {status.message && (
              <p className={status.kind === "error" ? "error-message" : "muted"}>{status.message}</p>
            )}
          </div>
        </form>
      </Card>
    </>
  );
};
