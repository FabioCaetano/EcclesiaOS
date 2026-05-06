import React, { useEffect, useState } from "react";
import { resetPasswordWithToken } from "./api";

interface Props {
  token: string;
}

export const ResetPasswordPage: React.FC<Props> = ({ token }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link sem token. Solicite um novo email de recuperacao.");
    }
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    if (newPassword.length < 6) {
      setStatus("error");
      setMessage("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("A confirmacao nao bate com a nova senha.");
      return;
    }

    setStatus("loading");
    try {
      await resetPasswordWithToken(token, newPassword);
      setStatus("success");
      setMessage("Senha atualizada. Faca login com a nova senha.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Nao foi possivel redefinir a senha.";
      setStatus("error");
      setMessage(text);
    }
  };

  return (
    <div className="auth-shell">
      <section className="login-panel">
        <p className="eyebrow">EcclesiaOS</p>
        <h1>Redefinir senha</h1>

        {status === "success" ? (
          <div>
            <p>{message}</p>
            <p className="auth-toggle">
              <a className="text-button" href="/">Ir para o login</a>
            </p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <p className="lead">Defina uma nova senha de pelo menos 6 caracteres.</p>
            <label>
              Nova senha
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
                disabled={!token}
              />
            </label>
            <label>
              Confirmar nova senha
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
                disabled={!token}
              />
            </label>
            <button type="submit" disabled={status === "loading" || !token}>
              {status === "loading" ? "Atualizando..." : "Atualizar senha"}
            </button>
            {message && status === "error" && <p className="error-message">{message}</p>}
            <p className="auth-toggle">
              <a className="text-button" href="/">Voltar para o login</a>
            </p>
          </form>
        )}
      </section>
    </div>
  );
};
