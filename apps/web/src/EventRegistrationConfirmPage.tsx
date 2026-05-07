import React, { useEffect, useState } from "react";
import { confirmEventRegistrationEmail } from "./api";

interface Props {
  token: string;
}

export const EventRegistrationConfirmPage: React.FC<Props> = ({ token }) => {
  const [status, setStatus] = useState("Confirmando inscricao...");
  const [success, setSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    if (!token) {
      setStatus("Link invalido. Token nao encontrado.");
      setSuccess(false);
      return () => undefined;
    }

    confirmEventRegistrationEmail(token)
      .then((result) => {
        if (!active) return;
        const message = result.status === "pending_payment"
          ? "Email confirmado. Pagamento pendente — siga as instrucoes que recebeu."
          : "Email confirmado. Sua inscricao esta confirmada.";
        setStatus(message);
        setSuccess(true);
      })
      .catch((error) => {
        if (!active) return;
        setStatus(error instanceof Error ? error.message : "Nao foi possivel confirmar.");
        setSuccess(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <main className="auth-shell">
      <section className="login-panel">
        <p className="eyebrow">Inscricao</p>
        <h1>{success === true ? "Tudo certo!" : success === false ? "Algo deu errado" : "Confirmando..."}</h1>
        <p className="lead">{status}</p>
      </section>
    </main>
  );
};
