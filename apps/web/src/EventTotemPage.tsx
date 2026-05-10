import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Printer, QrCode, RotateCcw, Search, TicketCheck } from "lucide-react";
import type { ChurchEvent, CurrentUser, EventRegistration, EventRegistrationStatus } from "@ecclesiaos/shared";
import { checkInEventRegistration, loadEventRegistrations, loadEvents } from "./api";
import { useQrScanner } from "./useQrScanner";
import { Avatar, EmptyState, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
  eventId: string;
  onBack: () => void;
}

const registrationStatusLabels: Record<EventRegistrationStatus, string> = {
  confirmed: "Confirmada",
  pending_payment: "Pagamento pendente",
  pending_email_confirmation: "Aguardando email",
  cancelled: "Cancelada"
};

const parseTicketPayload = (value: string) => {
  const parts = value.trim().split(":");
  if (parts.length !== 3 || parts[0] !== "ecclesiaos-event-ticket") return null;
  return { id: parts[1], ticketCode: parts[2] };
};

const ticketPayload = (registration: EventRegistration) => `ecclesiaos-event-ticket:${registration.id}:${registration.ticketCode || registration.id}`;

const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const timeLabel = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
};

type ScanFeedback = "idle" | "success" | "warning" | "error";

export const EventTotemPage: React.FC<Props> = ({ token, user, eventId, onBack }) => {
  const lastScanRef = useRef({ value: "", at: 0 });
  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanFeedback, setScanFeedback] = useState<ScanFeedback>("idle");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent" | EventRegistrationStatus>("all");
  const [status, setStatus] = useState("Carregando evento...");

  const refresh = async () => {
    const [nextEvents, nextRegistrations] = await Promise.all([
      loadEvents(token),
      loadEventRegistrations(token)
    ]);
    setEvent(nextEvents.find((item) => item.id === eventId) || null);
    setRegistrations(nextRegistrations.filter((item) => item.eventId === eventId));
  };

  useEffect(() => {
    refresh()
      .then(() => setStatus(""))
      .catch(() => setStatus("Nao foi possivel carregar o totem do evento."));
  }, [token, eventId]);

  const checkedInRegistrations = registrations.filter((item) => item.checkedInAt);
  const confirmedRegistrations = registrations.filter((item) => item.status === "confirmed");
  const expectedQuantity = confirmedRegistrations.reduce((sum, item) => sum + item.quantity, 0);
  const presentQuantity = checkedInRegistrations.reduce((sum, item) => sum + item.quantity, 0);
  const pendingQuantity = registrations.filter((item) => item.status === "pending_payment" || item.status === "pending_email_confirmation").reduce((sum, item) => sum + item.quantity, 0);
  const absentQuantity = Math.max(0, expectedQuantity - presentQuantity);
  const canOperateEventCheckIn = user.role === "admin" || user.role === "leader" || Boolean(user.personId && (event?.operatorPersonIds || []).includes(user.personId));

  const filteredRegistrations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return registrations
      .filter((registration) => {
        if (statusFilter === "present") return Boolean(registration.checkedInAt);
        if (statusFilter === "absent") return registration.status === "confirmed" && !registration.checkedInAt;
        if (statusFilter === "all") return true;
        return registration.status === statusFilter;
      })
      .filter((registration) => {
        if (!normalizedQuery) return true;
        return `${registration.name} ${registration.email} ${registration.phone}`.toLowerCase().includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (a.checkedInAt && !b.checkedInAt) return -1;
        if (!a.checkedInAt && b.checkedInAt) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [registrations, query, statusFilter]);

  const completeTicketCheckIn = async (value: string) => {
    const parsed = parseTicketPayload(value);
    if (!parsed) {
      signalScan("error");
      setStatus("QR Code invalido para ingresso.");
      return;
    }

    setStatus("Validando ingresso...");
    try {
      const updated = await checkInEventRegistration(token, parsed.id, { ticketCode: parsed.ticketCode });
      await refresh();
      signalScan("success");
      setStatus(updated.checkedInAt ? `Entrada confirmada: ${updated.name}` : "Ingresso validado.");
    } catch {
      signalScan("error");
      setStatus("Nao foi possivel validar este ingresso. Confira status e codigo.");
    }
  };

  const handleQrDecoded = async (rawValue: string) => {
    const now = Date.now();
    const normalizedValue = rawValue.trim();
    if (normalizedValue && lastScanRef.current.value === normalizedValue && now - lastScanRef.current.at < 4500) {
      signalScan("warning");
      setStatus("Ingresso ja lido agora. Aguarde um instante para tentar novamente.");
      return;
    }

    lastScanRef.current = { value: normalizedValue, at: now };
    setScanInput(rawValue);
    await completeTicketCheckIn(rawValue);
    setScannerActive(false);
  };

  const signalScan = (kind: Exclude<ScanFeedback, "idle">) => {
    setScanFeedback(kind);
    window.setTimeout(() => setScanFeedback("idle"), 1800);

    if ("vibrate" in navigator) {
      navigator.vibrate(kind === "success" ? [60] : [110, 40, 110]);
    }

    try {
      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return;
      const context = new AudioContextCtor();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = kind === "success" ? 880 : 220;
      gain.gain.value = 0.04;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);
      window.setTimeout(() => context.close(), 250);
    } catch {
      // Audio feedback is best-effort and may be blocked by the browser.
    }
  };

  const { videoRef, canvasRef, message: scannerStatus, devices, selectedDeviceId, setSelectedDeviceId, switchCamera } = useQrScanner({
    active: scannerActive,
    onDecode: handleQrDecoded
  });

  const exportCsv = () => {
    const rows = [
      ["nome", "email", "telefone", "quantidade", "status", "check_in", "codigo", "observacoes"],
      ...registrations.map((registration) => [
        registration.name,
        registration.email,
        registration.phone,
        registration.quantity,
        registration.checkedInAt ? "presente" : registrationStatusLabels[registration.status],
        timeLabel(registration.checkedInAt),
        registration.ticketCode,
        registration.notes
      ])
    ];
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `checkin-evento-${event?.date || eventId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="event-totem-page">
      <PageHeader
        eyebrow="Totem de evento"
        icon={TicketCheck}
        title={event?.title || "Evento"}
        description={event ? `${event.date} ${event.startTime || ""} - ${event.location || "Ambiente nao definido"}` : "Check-in de participantes por QR Code."}
        actions={(
          <div className="button-row event-totem-actions">
            <button className="secondary-button" type="button" onClick={onBack}>
              <ArrowLeft size={16} /> Voltar
            </button>
            <button className="secondary-button event-totem-print-hide" type="button" onClick={exportCsv} disabled={registrations.length === 0}>
              <Download size={16} /> CSV
            </button>
            <button className="secondary-button event-totem-print-hide" type="button" onClick={() => window.print()}>
              <Printer size={16} /> Relatorio
            </button>
          </div>
        )}
      />

      {!canOperateEventCheckIn && (
        <div className="form-status">Somente administradores, lideres ou operadores designados podem operar o totem deste evento.</div>
      )}

      <section className="event-totem-shell">
        <div className="report-grid">
          <article><span>Inscricoes</span><strong>{registrations.length}</strong></article>
          <article><span>Esperados</span><strong>{expectedQuantity}</strong></article>
          <article><span>Presentes</span><strong>{presentQuantity}</strong></article>
          <article><span>Ausentes</span><strong>{absentQuantity}</strong></article>
          <article><span>Pendentes</span><strong>{pendingQuantity}</strong></article>
        </div>

        <div className="scanner-panel event-totem-print-hide">
          <div>
            <h3>Leitura de ingresso</h3>
            <p className="muted">Leia o QR Code do ingresso ou cole o payload manualmente.</p>
          </div>
          <div className="scanner-actions">
            <button className="secondary-button" type="button" onClick={() => setScannerActive((current) => !current)} disabled={!canOperateEventCheckIn}>
              <QrCode size={16} /> {scannerActive ? "Parar camera" : "Abrir camera"}
            </button>
            {devices.length > 1 && (
              <>
                <select value={selectedDeviceId} onChange={(event) => setSelectedDeviceId(event.target.value)}>
                  {devices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>
                  ))}
                </select>
                <button className="secondary-button" type="button" onClick={switchCamera}>
                  <RotateCcw size={16} /> Virar camera
                </button>
              </>
            )}
            <input value={scanInput} onChange={(event) => setScanInput(event.target.value)} placeholder="ecclesiaos-event-ticket:..." />
            <button className="secondary-button" type="button" onClick={() => completeTicketCheckIn(scanInput)} disabled={!canOperateEventCheckIn || !scanInput.trim()}>
              Validar ingresso
            </button>
          </div>
          {scannerActive && <video className="scanner-video" ref={videoRef} muted playsInline />}
          <canvas className="scanner-canvas" ref={canvasRef} />
          {scanFeedback !== "idle" && (
            <div className={`scanner-feedback ${scanFeedback}`} role="status">
              {scanFeedback === "success" && "Ingresso lido com sucesso."}
              {scanFeedback === "warning" && "Leitura repetida ignorada."}
              {scanFeedback === "error" && "Nao foi possivel validar a leitura."}
            </div>
          )}
          <p className="muted">{scannerStatus}</p>
        </div>

        <div className="event-totem-filters event-totem-print-hide">
          <div className="checkin-search">
            <Search size={16} className="checkin-search-icon" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, email ou telefone..." />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
            <option value="all">Todos</option>
            <option value="present">Presentes</option>
            <option value="absent">Ausentes confirmados</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending_payment">Pagamento pendente</option>
            <option value="pending_email_confirmation">Aguardando email</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        {status && <p className="form-status">{status}</p>}

        {filteredRegistrations.length === 0 ? (
          <EmptyState icon={TicketCheck} title="Nenhuma inscricao encontrada" description="Ajuste os filtros ou confirme se o evento possui inscricoes." />
        ) : (
          <div className="event-totem-list">
            {filteredRegistrations.map((registration) => (
              <article className={registration.checkedInAt ? "event-totem-row present" : "event-totem-row"} key={registration.id}>
                <Avatar name={registration.name} size="md" tone={registration.checkedInAt ? "success" : registration.status === "confirmed" ? "info" : "warning"} />
                <div className="event-totem-row-main">
                  <strong>{registration.name}</strong>
                  <span>{registration.email} {registration.phone ? `- ${registration.phone}` : ""}</span>
                  <small>{registration.quantity} vaga(s) - {registration.checkedInAt ? `Presente desde ${timeLabel(registration.checkedInAt)}` : registrationStatusLabels[registration.status]}</small>
                </div>
                <div className="event-totem-row-actions event-totem-print-hide">
                  <code>{registration.ticketCode}</code>
                  <button className="secondary-button btn-sm" type="button" disabled={!canOperateEventCheckIn || registration.status !== "confirmed"} onClick={() => completeTicketCheckIn(ticketPayload(registration))}>
                    {registration.checkedInAt ? "Entrada OK" : "Check-in"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
