import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, Camera, ClipboardCheck, Download, Printer, RotateCcw, ScanLine, Search } from "lucide-react";
import type { ChildCheckIn, ChurchEvent, CurrentUser, KidsRoom, LabelTemplate, PersonProfile } from "@ecclesiaos/shared";
import { checkOutChild, loadChildCheckIns, loadEvents, loadKidsRooms, loadLabelTemplates, loadPeople } from "./api";
import { useQrScanner } from "./useQrScanner";
import { Avatar, Card, EmptyState, PageHeader, StatusPill } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
  eventId: string;
  onBack: () => void;
}

const FALLBACK_TEMPLATE: LabelTemplate = {
  id: "lbl_kids_dk1202",
  name: "Kids - Brother DK-1202 62x100mm",
  printerModel: "Brother DK-1202",
  widthMm: 62,
  heightMm: 100,
  isContinuous: false,
  layout: "kids_checkin",
  isDefault: true,
  createdAt: "",
  updatedAt: ""
};

const parseChildQrPayload = (value: string) => {
  const parts = value.trim().split(":");
  if (parts.length !== 3 || parts[0] !== "ecclesiaos-child-checkout") return null;
  return { id: parts[1], securityCode: parts[2] };
};

const parseKidsPreCheckInPayload = (value: string) => {
  const parts = value.trim().split(":");
  if (parts.length !== 3 || parts[0] !== "ecclesiaos-kids-precheckin") return null;
  const items = parts[2].split(",")
    .map((item) => {
      const [id, securityCode] = item.split(".");
      return id && securityCode ? { id, securityCode } : null;
    })
    .filter((item): item is { id: string; securityCode: string } => Boolean(item));
  return { eventId: parts[1], items };
};

const labelPageStyle = (template: LabelTemplate): string => {
  const width = Math.max(10, Number(template.widthMm) || 62);
  if (template.isContinuous) return `@page { size: ${width}mm auto; margin: 0; }`;
  const height = Math.max(10, Number(template.heightMm) || 100);
  return `@page { size: ${width}mm ${height}mm; margin: 0; }`;
};

const labelPresetClass = (template: LabelTemplate): string => (
  template.isContinuous ? "brother-62-continuous" : "brother-62x100"
);

const childAgeNumber = (person: PersonProfile | null): number | null => {
  if (!person?.birthDate) return null;
  const birth = new Date(`${person.birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday = now.getMonth() > birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;
  return age >= 0 ? age : null;
};

const childAge = (person: PersonProfile | null): string => {
  const age = childAgeNumber(person);
  return age === null ? "" : `${age} ano(s)`;
};

const childAlertText = (person: PersonProfile | null): string => {
  const notes = person?.notes.trim() || "";
  if (!notes) return "";
  return notes.split("\n").filter((line) => /^(Alergias|Saude|Retirada):/i.test(line)).join(" | ");
};

const ChildQrCode: React.FC<{ value: string }> = ({ value }) => {
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

  return src ? <img className="child-label-qr" src={src} alt="QR Code de retirada infantil" /> : <div className="child-label-qr placeholder" />;
};

const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export const KidsTotemPage: React.FC<Props> = ({ token, user, eventId, onBack }) => {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [rooms, setRooms] = useState<KidsRoom[]>([]);
  const [checkIns, setCheckIns] = useState<ChildCheckIn[]>([]);
  const [templates, setTemplates] = useState<LabelTemplate[]>([FALLBACK_TEMPLATE]);
  const [templateId, setTemplateId] = useState(FALLBACK_TEMPLATE.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanInput, setScanInput] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [printMode, setPrintMode] = useState<"single" | "batch" | null>(null);
  const [scannedBatchIds, setScannedBatchIds] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  const canOperate = user.role === "admin" || user.role === "leader";

  const refresh = async () => {
    const [nextEvents, nextPeople, nextRooms, nextCheckIns, nextTemplates] = await Promise.all([
      loadEvents(token),
      loadPeople(token),
      loadKidsRooms(token),
      loadChildCheckIns(token),
      loadLabelTemplates(token, "kids_checkin").catch(() => [] as LabelTemplate[])
    ]);
    setEvents(nextEvents);
    setPeople(nextPeople);
    setRooms(nextRooms);
    setCheckIns(nextCheckIns);
    if (nextTemplates.length > 0) {
      setTemplates(nextTemplates);
      setTemplateId((nextTemplates.find((template) => template.isDefault) || nextTemplates[0]).id);
    }
  };

  useEffect(() => {
    refresh().catch(() => setStatus("Nao foi possivel carregar o totem kids."));
  }, [token, eventId]);

  useEffect(() => {
    const clearPrintMode = () => setPrintMode(null);
    window.addEventListener("afterprint", clearPrintMode);
    return () => window.removeEventListener("afterprint", clearPrintMode);
  }, []);

  const event = events.find((item) => item.id === eventId) || null;
  const template = templates.find((item) => item.id === templateId) || templates[0] || FALLBACK_TEMPLATE;
  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);
  const activeRooms = rooms.filter((room) => room.isActive);
  const childPersonFor = (item: ChildCheckIn): PersonProfile | null => item.childPersonId ? peopleById.get(item.childPersonId) || null : null;
  const roomFor = (item: ChildCheckIn): string => {
    const age = childAgeNumber(childPersonFor(item));
    if (age === null) return "Sala a definir";
    return activeRooms.find((room) => age >= room.minAge && age <= room.maxAge)?.name || "Sala a definir";
  };
  const eventCheckIns = checkIns.filter((item) => item.eventId === eventId);
  const activeCheckIns = eventCheckIns.filter((item) => !item.checkedOutAt);
  const checkedOutCheckIns = eventCheckIns.filter((item) => item.checkedOutAt);
  const visibleCheckIns = eventCheckIns
    .filter((item) => selectedRoom === "all" || roomFor(item) === selectedRoom)
    .filter((item) => `${item.childName} ${item.guardianName}`.toLowerCase().includes(searchQuery.trim().toLowerCase()));
  const selected = eventCheckIns.find((item) => item.id === selectedId) || activeCheckIns[0] || eventCheckIns[0] || null;
  const scannedBatchLabels = eventCheckIns.filter((item) => scannedBatchIds.includes(item.id) && !item.checkedOutAt);
  const batchLabelsToPrint = scannedBatchLabels.length > 0 ? scannedBatchLabels : activeCheckIns;
  const roomSummary = activeRooms.map((room) => ({
    room,
    count: activeCheckIns.filter((item) => roomFor(item) === room.name).length
  }));
  const alertedCheckIns = eventCheckIns.filter((item) => childAlertText(childPersonFor(item)));
  const reportRows = eventCheckIns.map((item) => ({
    childName: item.childName,
    guardianName: item.guardianName,
    guardianPhone: item.guardianPhone,
    room: roomFor(item),
    age: childAge(childPersonFor(item)),
    status: item.checkedOutAt ? "Saiu" : "Presente",
    checkedInAt: item.checkedInAt ? new Date(item.checkedInAt).toLocaleString("pt-BR") : "",
    checkedOutAt: item.checkedOutAt ? new Date(item.checkedOutAt).toLocaleString("pt-BR") : "",
    alert: childAlertText(childPersonFor(item))
  }));

  const printLabels = (mode: "single" | "batch") => {
    setPrintMode(mode);
    window.setTimeout(() => window.print(), 50);
  };

  const exportReportCsv = () => {
    const headers = ["Crianca", "Responsavel", "Telefone", "Sala", "Idade", "Status", "Entrada", "Saida", "Alertas"];
    const csv = [
      headers.map(csvEscape).join(","),
      ...reportRows.map((row) => [
        row.childName,
        row.guardianName,
        row.guardianPhone,
        row.room,
        row.age,
        row.status,
        row.checkedInAt,
        row.checkedOutAt,
        row.alert
      ].map(csvEscape).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `checkin-kids-${event?.date || "culto"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    setPrintMode(null);
    window.setTimeout(() => window.print(), 50);
  };

  const completeCheckoutFromQr = async (value: string) => {
    const preCheckIn = parseKidsPreCheckInPayload(value);
    if (preCheckIn) {
      if (preCheckIn.eventId !== eventId) {
        setStatus("QR de check-in pertence a outro culto.");
        return;
      }
      const validIds = preCheckIn.items
        .filter((payloadItem) => eventCheckIns.some((checkIn) => checkIn.id === payloadItem.id && checkIn.securityCode === payloadItem.securityCode && !checkIn.checkedOutAt))
        .map((payloadItem) => payloadItem.id);
      if (validIds.length === 0) {
        setStatus("Nenhuma crianca ativa encontrada neste QR.");
        return;
      }
      setScannedBatchIds(validIds);
      setSelectedId(validIds[0]);
      setStatus(`${validIds.length} crianca(s) carregada(s) do QR. Confira e imprima as etiquetas.`);
      return;
    }

    const parsed = parseChildQrPayload(value);
    if (!parsed) {
      setStatus("QR Code invalido para retirada infantil.");
      return;
    }

    const item = eventCheckIns.find((checkIn) => checkIn.id === parsed.id);
    if (!item) {
      setStatus("QR Code nao pertence a este culto.");
      return;
    }
    if (item.checkedOutAt) {
      setStatus("Esta crianca ja teve saida registrada.");
      return;
    }

    try {
      await checkOutChild(token, item.id, { securityCode: parsed.securityCode });
      await refresh();
      setSelectedId(item.id);
      setStatus(`Retirada registrada: ${item.childName}.`);
    } catch {
      setStatus("Nao foi possivel registrar a retirada.");
    }
  };

  const handleQrDecoded = async (rawValue: string) => {
    setScanInput(rawValue);
    await completeCheckoutFromQr(rawValue);
    setScannerActive(false);
  };

  const { videoRef, canvasRef, message: scannerStatus, devices: scannerDevices, selectedDeviceId, setSelectedDeviceId, switchCamera } = useQrScanner({
    active: scannerActive,
    onDecode: handleQrDecoded
  });

  const manualCheckout = async (item: ChildCheckIn) => {
    try {
      await checkOutChild(token, item.id, { securityCode: item.securityCode });
      await refresh();
      setSelectedId(item.id);
      setStatus(`Retirada registrada: ${item.childName}.`);
    } catch {
      setStatus("Nao foi possivel registrar a retirada.");
    }
  };

  if (!canOperate) {
    return (
      <div className="totem-shell">
        <PageHeader eyebrow="Check-in" icon={ClipboardCheck} title="Totem Kids" description="Acesso restrito a lideres e administradores." />
        <Card><EmptyState icon={ClipboardCheck} title="Sem permissao" description="Entre com uma conta de lider ou administrador para operar o totem." /></Card>
      </div>
    );
  }

  return (
    <div className={`totem-shell ${printMode ? `print-mode-${printMode}` : ""}`}>
      <PageHeader
        eyebrow="Check-in"
        icon={ClipboardCheck}
        title="Totem Kids"
        description={event ? `${event.date} ${event.startTime || ""} - ${event.title}` : "Culto nao encontrado"}
        actions={(
          <div className="button-row">
            <button className="secondary-button" type="button" onClick={onBack}>
              <ArrowLeft size={16} /> Voltar
            </button>
            <button className="secondary-button" type="button" onClick={() => printLabels("batch")} disabled={activeCheckIns.length === 0}>
              <Printer size={16} /> Imprimir presentes
            </button>
            {scannedBatchLabels.length > 0 && (
              <button className="secondary-button" type="button" onClick={() => printLabels("batch")}>
                <Printer size={16} /> Imprimir QR lido
              </button>
            )}
            <button className="secondary-button" type="button" onClick={exportReportCsv} disabled={eventCheckIns.length === 0}>
              <Download size={16} /> CSV
            </button>
            <button className="secondary-button" type="button" onClick={printReport} disabled={eventCheckIns.length === 0}>
              <Printer size={16} /> Relatorio
            </button>
          </div>
        )}
      />

      <Card className="totem-panel">
        {status && <p className="form-status">{status}</p>}
        <div className="report-grid">
          <article><span>Presentes</span><strong>{activeCheckIns.length}</strong></article>
          <article><span>Retiradas</span><strong>{checkedOutCheckIns.length}</strong></article>
          <article><span>Total</span><strong>{eventCheckIns.length}</strong></article>
          <article><span>Alertas</span><strong>{alertedCheckIns.length}</strong></article>
        </div>

        <section className="kids-report-panel">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">Relatorio do culto</p>
              <h3>Resumo operacional</h3>
            </div>
          </div>
          <div className="report-columns">
            <div>
              <h4>Por sala</h4>
              {roomSummary.filter((item) => item.count > 0).length === 0 ? <p className="muted">Nenhuma sala em uso.</p> : roomSummary.filter((item) => item.count > 0).map(({ room, count }) => (
                <p className="report-row" key={room.id}><span>{room.name}</span><strong>{count}</strong></p>
              ))}
            </div>
            <div>
              <h4>Alertas importantes</h4>
              {alertedCheckIns.length === 0 ? <p className="muted">Nenhum alerta informado.</p> : alertedCheckIns.slice(0, 6).map((item) => (
                <p className="report-row" key={`alert-${item.id}`}><span>{item.childName}</span><strong>{childAlertText(childPersonFor(item))}</strong></p>
              ))}
            </div>
          </div>
        </section>

        <div className="totem-grid">
          <section className="scanner-panel">
            <div>
              <h3>Leitor de retirada</h3>
            <p className="muted">Leia o QR do responsavel para imprimir etiquetas ou o QR da etiqueta para retirada.</p>
            </div>
            <div className="scanner-actions">
              <button className="secondary-button" type="button" onClick={() => setScannerActive((current) => !current)}>
                <Camera size={16} /> {scannerActive ? "Parar camera" : "Abrir camera"}
              </button>
              {scannerDevices.length > 1 && (
                <>
                  <select value={selectedDeviceId} onChange={(cameraEvent) => setSelectedDeviceId(cameraEvent.target.value)}>
                    {scannerDevices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>
                    ))}
                  </select>
                  <button className="secondary-button" type="button" onClick={switchCamera}>
                    <RotateCcw size={16} /> Virar camera
                  </button>
                </>
              )}
              <input value={scanInput} onChange={(scanEvent) => setScanInput(scanEvent.target.value)} placeholder="ecclesiaos-child-checkout:..." />
              <button className="secondary-button" type="button" onClick={() => completeCheckoutFromQr(scanInput)}>
                <ScanLine size={16} /> Validar
              </button>
            </div>
            {scannerActive && <video className="scanner-video" ref={videoRef} muted playsInline />}
            <canvas className="scanner-canvas" ref={canvasRef} />
            <p className="muted">{scannerStatus}</p>
          </section>

          <aside className="checkin-side">
            <h3>Salas agora</h3>
            <div className="kids-room-dashboard">
              <button className={`kids-room-row ${selectedRoom === "all" ? "active" : ""}`} type="button" onClick={() => setSelectedRoom("all")}>
                <span>Todas</span>
                <strong>{activeCheckIns.length}</strong>
                <small>presentes</small>
              </button>
              {roomSummary.map(({ room, count }) => (
                <button className={`kids-room-row ${selectedRoom === room.name ? "active" : ""}`} key={room.id} type="button" onClick={() => setSelectedRoom(room.name)}>
                  <span>{room.name}</span>
                  <strong>{room.capacity > 0 ? `${count}/${room.capacity}` : count}</strong>
                  <small>{room.minAge}-{room.maxAge} anos</small>
                </button>
              ))}
            </div>
          </aside>
        </div>

        <div className="totem-grid">
          <section>
            <div className="section-heading compact-heading">
              <div>
                <h3>Criancas do culto</h3>
                <p className="muted">{visibleCheckIns.length} registro(s) no filtro atual.</p>
              </div>
              <div className="checkin-search">
                <Search size={16} className="checkin-search-icon" />
                <input value={searchQuery} onChange={(eventSearch) => setSearchQuery(eventSearch.target.value)} placeholder="Buscar crianca ou responsavel..." />
              </div>
            </div>
            {visibleCheckIns.length === 0 ? (
              <EmptyState icon={ClipboardCheck} title="Sem criancas" description="Quando o responsavel gerar check-in pelo app, as criancas aparecem aqui." />
            ) : (
              <div className="checkin-grid">
                {visibleCheckIns.map((item) => (
                  <article className={`checkin-card ${selected?.id === item.id ? "selected" : ""}`} key={item.id}>
                    <Avatar name={item.childName} size="md" tone={item.checkedOutAt ? "muted" : "info"} />
                    <div className="checkin-card-text">
                      <strong>{item.childName}</strong>
                      <span>{roomFor(item)} - codigo {item.securityCode}</span>
                      <small>{item.guardianName} - {item.guardianPhone || "sem telefone"}</small>
                      {childAlertText(childPersonFor(item)) && <small className="child-alert-text">{childAlertText(childPersonFor(item))}</small>}
                    </div>
                    <div className="response-actions">
                      <StatusPill tone={item.checkedOutAt ? "muted" : "success"}>{item.checkedOutAt ? "Saiu" : "Presente"}</StatusPill>
                      <button className="secondary-button btn-sm" type="button" onClick={() => setSelectedId(item.id)}>Etiqueta</button>
                      {!item.checkedOutAt && <button className="secondary-button btn-sm" type="button" onClick={() => manualCheckout(item)}>Checkout</button>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="child-label-preview">
            <div className="section-heading compact-heading">
              <div>
                <p className="eyebrow">Etiqueta</p>
                <h3>{selected?.childName || "Selecione uma crianca"}</h3>
              </div>
              <select value={templateId} onChange={(eventTemplate) => setTemplateId(eventTemplate.target.value)}>
                {templates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            {selected && (
              <>
                {printMode && <style>{labelPageStyle(template)}</style>}
                <div className={`child-label-card child-label-print-area single-label-print-area ${labelPresetClass(template)}`}>
                  <p className="eyebrow">EcclesiaOS Kids</p>
                  <h3>{selected.childName}</h3>
                  <div className="child-label-code-row">
                    <strong>{selected.securityCode}</strong>
                    <ChildQrCode value={`ecclesiaos-child-checkout:${selected.id}:${selected.securityCode}`} />
                  </div>
                  <p>{event?.title || "Culto"}</p>
                  <p>Sala: {roomFor(selected)}</p>
                  <p>Responsavel: {selected.guardianName}</p>
                  {childAge(childPersonFor(selected)) && <p>Idade: {childAge(childPersonFor(selected))}</p>}
                  {childAlertText(childPersonFor(selected)) && <p>Alerta: {childAlertText(childPersonFor(selected))}</p>}
                  <p>Telefone: {selected.guardianPhone || "Nao informado"}</p>
                  {selected.checkedOutAt && <p>Retirado</p>}
                </div>
                <button className="secondary-button" type="button" onClick={() => printLabels("single")}>
                  <Printer size={14} /> Imprimir etiqueta
                </button>
              </>
            )}
          </aside>
        </div>

        {batchLabelsToPrint.length > 0 && (
          <div className="batch-label-preview">
            {printMode === "batch" && <style>{labelPageStyle(template)}</style>}
            {batchLabelsToPrint.map((item) => (
              <div className={`child-label-card child-label-print-area batch-label-print-area ${labelPresetClass(template)}`} key={item.id}>
                <p className="eyebrow">EcclesiaOS Kids</p>
                <h3>{item.childName}</h3>
                <div className="child-label-code-row">
                  <strong>{item.securityCode}</strong>
                  <ChildQrCode value={`ecclesiaos-child-checkout:${item.id}:${item.securityCode}`} />
                </div>
                <p>{event?.title || "Culto"}</p>
                <p>Sala: {roomFor(item)}</p>
                <p>Responsavel: {item.guardianName}</p>
                {childAlertText(childPersonFor(item)) && <p>Alerta: {childAlertText(childPersonFor(item))}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
