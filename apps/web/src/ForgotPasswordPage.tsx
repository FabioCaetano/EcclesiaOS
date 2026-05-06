import React, { useState } from "react";
import { requestPasswordReset } from "./api";

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const response = await requestPasswordReset(email.trim());
      setMessage(response.message);
      setStatus("success");
    } catch {
      setMessage("Nao foi possivel processar o pedido. Tente novamente em instantes.");
      setStatus("error");
    }
  };

  return (
    <div className="auth-shell">
      <section className="login-panel">
        <p className="eyebrow">EcclesiaOS</p>
        <h1>Esqueci minha senha</h1>
        <p className="lead">Informe seu email cadastrado. Vamos enviar um link valido por 15 minutos para voce redefinir a senha.</p>

        {status === "success" ? (
          <div>
            <p>{message}</p>
            <p className="muted" style={{ marginTop: "var(--space-3)" }}>
              Confira sua caixa de entrada e a pasta de spam. Se nao chegar em alguns minutos, peca ajuda ao admin.
            </p>
            <p className="auth-toggle">
              <a className="text-button" href="/">Voltar para o login</a>
            </p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </label>
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Enviando..." : "Enviar link"}
            </button>
            {status === "error" && <p className="error-message">{message}</p>}
            <p className="auth-toggle">
              <a className="text-button" href="/">Voltar para o login</a>
            </p>
          </form>
        )}
      </section>
    </div>
  );
};
