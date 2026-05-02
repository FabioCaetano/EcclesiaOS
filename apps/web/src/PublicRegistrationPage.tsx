import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { ChurchEvent, EventRegistration, EventRegistrationInput } from "@ecclesiaos/shared";
import { loadPublicEvent, registerForPublicEvent } from "./api";

const emptyRegistration: EventRegistrationInput = {
  name: "",
  email: "",
  phone: "",
  quantity: 1,
  notes: ""
};

const ticketPayload = (registration: EventRegistration) => `ecclesiaos-event-ticket:${registration.id}:${registration.ticketCode || registration.id}`;

const TicketQrCode: React.FC<{ value: string }> = ({ value }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, { errorCorrectionLevel: "M", margin: 1, width: 164 })
      .then((nextSrc) => {
        if (active) setSrc(nextSrc);
      })
      .catch(() => {
        if (active) setSrc("");
      });
    return () => {
      active = false;
    };
  }, [value]);

  return src ? <img className="ticket-qr" src={src} alt="QR Code do ingresso" /> : <div className="ticket-qr placeholder" />;
};

interface Props {
  slug: string;
}

export const PublicRegistrationPage: React.FC<Props> = ({ slug }) => {
  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [availableQuantity, setAvailableQuantity] = useState<number | null>(null);
  const [form, setForm] = useState<EventRegistrationInput>(emptyRegistration);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [status, setStatus] = useState("");

  const refresh = async () => {
    const payload = await loadPublicEvent(slug);
    setEvent(payload.event);
    setAvailableQuantity(payload.availableQuantity);
  };

  useEffect(() => {
    refresh().catch(() => setStatus("Evento nao encontrado ou inscricoes fechadas."));
  }, [slug]);

  const submit = async (submitEvent: React.FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setStatus("Enviando inscricao...");
    try {
      const registration = await registerForPublicEvent(slug, form);
      setRegistration(registration);
      setForm(emptyRegistration);
      setStatus(registration.status === "pending_payment" ? "Inscricao recebida. Pagamento pendente." : "Inscricao confirmada.");
      await refresh();
    } catch {
      setStatus("Nao foi possivel concluir a inscricao.");
    }
  };

  if (!event) {
    return (
      <main className="auth-shell">
        <section className="login-panel">
          <p className="eyebrow">EcclesiaOS</p>
          <h1>Inscricao</h1>
          <p>{status || "Carregando evento..."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <section className="login-panel">
        <p className="eyebrow">Inscricao</p>
        <h1>{event.title}</h1>
        <p className="lead">{event.date} {event.startTime} - {event.location || "Local a confirmar"}</p>
        <p>{event.registrationPrice > 0 ? `Valor: ${event.registrationCurrency} ${event.registrationPrice.toFixed(2)}` : "Evento gratuito"}</p>
        <p>{availableQuantity === null ? "Vagas sem limite definido" : `${availableQuantity} vaga(s) disponiveis`}</p>

        <form className="login-form" onSubmit={submit}>
          <label>Nome<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
          <label>Telefone<input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
          <label>Quantidade<input type="number" min="1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) || 1 }))} /></label>
          <label>Observacoes<input value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></label>
          <button type="submit">Confirmar inscricao</button>
          {status && <p>{status}</p>}
        </form>

        {registration && (
          <div className="event-ticket-print public-ticket">
            <p className="eyebrow">Comprovante</p>
            <h3>{event.title}</h3>
            <p>Participante: {registration.name}</p>
            <p>Quantidade: {registration.quantity}</p>
            <p>Status: {registration.status === "pending_payment" ? "Pagamento pendente" : registration.status === "cancelled" ? "Cancelada" : "Confirmada"}</p>
            <p>Valor: {event.registrationCurrency} {registration.amountDue.toFixed(2)}</p>
            <TicketQrCode value={ticketPayload(registration)} />
            <strong>{registration.id}</strong>
            <button type="button" onClick={() => window.print()}>Imprimir comprovante</button>
          </div>
        )}
      </section>
    </main>
  );
};
