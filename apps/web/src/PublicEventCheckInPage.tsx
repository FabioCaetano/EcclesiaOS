import React, { useEffect, useState } from "react";
import { CheckCircle2, QrCode } from "lucide-react";
import type { ChurchEvent, EventRegistration } from "@ecclesiaos/shared";
import { loadPublicEvent, selfCheckInEventRegistration } from "./api";
import { useQrScanner } from "./useQrScanner";

interface Props {
  slug: string;
}

export const PublicEventCheckInPage: React.FC<Props> = ({ slug }) => {
  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [ticketPayload, setTicketPayload] = useState("");
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [status, setStatus] = useState("Carregando evento...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPublicEvent(slug)
      .then((payload) => {
        setEvent(payload.event);
        setStatus("Leia o QR Code do ingresso ou cole o codigo manualmente.");
      })
      .catch(() => setStatus("Evento nao encontrado ou check-in indisponivel."));
  }, [slug]);

  const completeCheckIn = async (payload: string) => {
    const nextPayload = payload.trim();
    if (!nextPayload) {
      setStatus("Informe o QR Code do ingresso.");
      return;
    }

    setStatus("Validando ingresso...");
    try {
      const nextRegistration = await selfCheckInEventRegistration({ ticketPayload: nextPayload, eventSlug: slug });
      setRegistration(nextRegistration);
      setTicketPayload("");
      setScannerActive(false);
      setSuccess(true);
      setStatus(nextRegistration.checkedInAt ? "Check-in confirmado. Bem-vindo!" : "Ingresso validado.");
    } catch (error) {
      setSuccess(false);
      setStatus(error instanceof Error ? error.message : "Nao foi possivel validar este ingresso.");
    }
  };

  const { videoRef, canvasRef, message: scannerMessage } = useQrScanner({
    active: scannerActive,
    onDecode: completeCheckIn
  });

  return (
    <main className="auth-shell self-checkin-shell">
      <section className="login-panel self-checkin-panel">
        <p className="eyebrow">Check-in</p>
        <h1>{event?.title || "Evento"}</h1>
        {event && <p className="lead">{event.date} {event.startTime} - {event.location || "Local a confirmar"}</p>}

        <div className={success ? "self-checkin-result success" : "self-checkin-result"}>
          {success ? <CheckCircle2 size={42} /> : <QrCode size={42} />}
          <p>{status}</p>
          {registration && (
            <strong>{registration.name} - {registration.quantity} vaga(s)</strong>
          )}
        </div>

        <div className="scanner-panel public-scanner">
          <div className="scanner-actions">
            <button className="secondary-button" type="button" onClick={() => setScannerActive((current) => !current)} disabled={!event}>
              {scannerActive ? "Parar camera" : "Abrir camera"}
            </button>
            <input value={ticketPayload} onChange={(inputEvent) => setTicketPayload(inputEvent.target.value)} placeholder="ecclesiaos-event-ticket:..." />
            <button type="button" onClick={() => completeCheckIn(ticketPayload)} disabled={!event}>Validar</button>
          </div>
          {scannerActive && <video className="scanner-video" ref={videoRef} muted playsInline />}
          <canvas className="scanner-canvas" ref={canvasRef} />
          {scannerMessage && <p className="muted">{scannerMessage}</p>}
        </div>
      </section>
    </main>
  );
};
