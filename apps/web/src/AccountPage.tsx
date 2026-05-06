import React, { useEffect, useState } from "react";
import { CalendarOff, KeyRound, Plus, ShieldCheck, Trash2 } from "lucide-react";
import type { CurrentUser, PersonBlockOut } from "@ecclesiaos/shared";
import { changeOwnPassword, createBlockOut, deleteBlockOut, loadBlockOuts } from "./api";
import { Card, EmptyState, PageHeader } from "./ui";
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

  const [blockOuts, setBlockOuts] = useState<PersonBlockOut[]>([]);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockStatus, setBlockStatus] = useState("");

  useEffect(() => {
    if (!user.personId) return;
    loadBlockOuts(token, user.personId)
      .then(setBlockOuts)
      .catch(() => setBlockStatus("Nao foi possivel carregar bloqueios."));
  }, [token, user.personId]);

  const handleAddBlockOut = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user.personId) {
      setBlockStatus("Sem pessoa vinculada ao seu usuario.");
      return;
    }
    if (!blockStart) {
      setBlockStatus("Informe a data inicial.");
      return;
    }

    setBlockStatus("Salvando...");
    try {
      const created = await createBlockOut(token, {
        personId: user.personId,
        startDate: blockStart,
        endDate: blockEnd || blockStart,
        reason: blockReason
      });
      setBlockOuts((current) => [created, ...current]);
      setBlockStart("");
      setBlockEnd("");
      setBlockReason("");
      setBlockStatus("Bloqueio registrado.");
    } catch {
      setBlockStatus("Nao foi possivel registrar o bloqueio.");
    }
  };

  const handleRemoveBlockOut = async (id: string) => {
    if (!window.confirm("Remover este bloqueio?")) return;
    setBlockStatus("Removendo...");
    try {
      await deleteBlockOut(token, id);
      setBlockOuts((current) => current.filter((item) => item.id !== id));
      setBlockStatus("Bloqueio removido.");
    } catch {
      setBlockStatus("Nao foi possivel remover.");
    }
  };

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

      <Card>
        <div className="section-heading">
          <div>
            <p className="eyebrow"><CalendarOff size={12} />Indisponibilidade</p>
            <h2>Datas que voce nao pode servir</h2>
          </div>
        </div>

        {!user.personId ? (
          <EmptyState
            icon={CalendarOff}
            title="Sem pessoa vinculada"
            description="O admin precisa vincular voce a uma pessoa para que voce possa registrar bloqueios."
          />
        ) : (
          <>
            <form className="church-form" onSubmit={handleAddBlockOut}>
              <label>Data inicial<input type="date" value={blockStart} onChange={(event) => setBlockStart(event.target.value)} required /></label>
              <label>Data final<input type="date" value={blockEnd} onChange={(event) => setBlockEnd(event.target.value)} placeholder="Igual a inicial se nao preencher" /></label>
              <label className="wide-field">Motivo (opcional)<input value={blockReason} onChange={(event) => setBlockReason(event.target.value)} placeholder="Ex.: viagem em familia" /></label>
              <div className="form-footer">
                <button type="submit"><Plus size={16} /> Adicionar bloqueio</button>
                {blockStatus && <p className="muted">{blockStatus}</p>}
              </div>
            </form>

            {blockOuts.length === 0 ? (
              <EmptyState icon={CalendarOff} title="Nenhum bloqueio registrado" description="Marque suas indisponibilidades para que os lideres saibam." />
            ) : (
              <div className="block-out-list" style={{ marginTop: "var(--space-4)" }}>
                {blockOuts.map((blockOut) => (
                  <article className="block-out-row" key={blockOut.id}>
                    <div>
                      <strong>{blockOut.startDate === blockOut.endDate ? blockOut.startDate : `${blockOut.startDate} - ${blockOut.endDate}`}</strong>
                      {blockOut.reason && <span className="muted"> - {blockOut.reason}</span>}
                    </div>
                    <button className="icon-button" type="button" aria-label="Remover bloqueio" onClick={() => handleRemoveBlockOut(blockOut.id)}>
                      <Trash2 size={14} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
};
