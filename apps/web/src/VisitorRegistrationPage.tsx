import React, { useState } from "react";
import type { VisitorRegistrationInput } from "@ecclesiaos/shared";
import { registerVisitor } from "./api";

const emptyVisitor: VisitorRegistrationInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: ""
};

export const VisitorRegistrationPage: React.FC = () => {
  const [form, setForm] = useState<VisitorRegistrationInput>(emptyVisitor);
  const [status, setStatus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.firstName.trim()) {
      setStatus("Informe ao menos o primeiro nome.");
      return;
    }

    setStatus("Enviando cadastro...");
    try {
      const result = await registerVisitor(form);
      setStatus(result.message);
      setSubmitted(true);
      setForm(emptyVisitor);
    } catch {
      setStatus("Nao foi possivel enviar o cadastro. Tente novamente.");
    }
  };

  if (submitted) {
    return (
      <main className="auth-shell">
        <section className="login-panel">
          <p className="eyebrow">Bem-vindo</p>
          <h1>Obrigado!</h1>
          <p className="lead">{status}</p>
          <button type="button" onClick={() => { setSubmitted(false); setStatus(""); }}>
            Cadastrar outra pessoa
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="login-panel">
        <p className="eyebrow">Visitante</p>
        <h1>Bem-vindo a igreja</h1>
        <p className="lead">Deixe seus dados que entraremos em contato em breve.</p>

        <form className="login-form" onSubmit={submit}>
          <label>
            Primeiro nome*
            <input value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} required />
          </label>
          <label>
            Sobrenome
            <input value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <label>
            Telefone
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
          </label>
          <label>
            Como conheceu a igreja?
            <input value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </label>
          <button type="submit">Enviar</button>
          {status && <p>{status}</p>}
        </form>
      </section>
    </main>
  );
};
