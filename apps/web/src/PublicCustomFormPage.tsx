import React, { useEffect, useState } from "react";
import type { CustomForm } from "@ecclesiaos/shared";
import { loadPublicCustomForm, submitPublicCustomForm } from "./api";

interface Props {
  slug: string;
}

export const PublicCustomFormPage: React.FC<Props> = ({ slug }) => {
  const [form, setForm] = useState<CustomForm | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("Carregando...");

  useEffect(() => {
    loadPublicCustomForm(slug)
      .then((nextForm) => {
        setForm(nextForm);
        setStatus("");
      })
      .catch(() => setStatus("Formulario nao encontrado."));
  }, [slug]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Enviando...");
    try {
      await submitPublicCustomForm(slug, { answers });
      setAnswers({});
      setStatus("Formulario enviado com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel enviar o formulario.");
    }
  };

  if (!form) return <main className="public-page"><section className="public-card"><p>{status}</p></section></main>;

  return (
    <main className="public-page">
      <section className="public-card">
        <p className="eyebrow">EcclesiaOS</p>
        <h1>{form.title}</h1>
        {form.description && <p>{form.description}</p>}
        <form className="public-form" onSubmit={submit}>
          {form.fields.map((field) => (
            <label key={field.id}>
              {field.label}{field.required ? " *" : ""}
              {field.type === "textarea" ? (
                <textarea required={field.required} value={answers[field.id] || ""} onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))} />
              ) : field.type === "select" ? (
                <select required={field.required} value={answers[field.id] || ""} onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))}>
                  <option value="">Selecione</option>
                  {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : field.type === "checkbox" ? (
                <select required={field.required} value={answers[field.id] || ""} onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))}>
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Nao">Nao</option>
                </select>
              ) : (
                <input required={field.required} type={field.type === "phone" ? "tel" : field.type} value={answers[field.id] || ""} onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))} />
              )}
            </label>
          ))}
          <button type="submit">Enviar</button>
          {status && <p>{status}</p>}
        </form>
      </section>
    </main>
  );
};
