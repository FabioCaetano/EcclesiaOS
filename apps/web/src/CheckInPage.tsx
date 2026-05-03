import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { canManageModule } from "@ecclesiaos/shared";
import type { AttendanceRecord, ChildCheckIn, ChildCheckInInput, ChurchEvent, CurrentUser, EventCheckIn, EventCheckInInput, LabelTemplate, PersonProfile } from "@ecclesiaos/shared";
import { checkOutChild, deleteEventCheckIn, loadAttendance, loadChildCheckIns, loadEventCheckIns, loadEvents, loadLabelTemplates, loadPeople, saveChildCheckIn, saveEventCheckIn } from "./api";
import { useQrScanner } from "./useQrScanner";

interface Props {
  token: string;
  user: CurrentUser;
}

const emptyEventCheckIn: EventCheckInInput = {
  eventId: "",
  personId: "",
  notes: ""
};

const emptyChildCheckIn: ChildCheckInInput = {
  eventId: "",
  childPersonId: "",
  childName: "",
  guardianPersonId: "",
  guardianName: "",
  guardianPhone: "",
  notes: ""
};

type PrintMode = "single" | "batch" | null;
type CheckInView = "events" | "kids" | "admin";

const FALLBACK_TEMPLATES: LabelTemplate[] = [
  {
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
  },
  {
    id: "lbl_kids_continuous",
    name: "Kids - Brother 62mm continuo",
    printerModel: "Brother QL serie",
    widthMm: 62,
    heightMm: 0,
    isContinuous: true,
    layout: "kids_checkin",
    isDefault: false,
    createdAt: "",
    updatedAt: ""
  }
];

const labelPresetClass = (template: LabelTemplate): string => (
  template.isContinuous ? "brother-62-continuous" : "brother-62x100"
);

const labelPageStyle = (template: LabelTemplate): string => {
  const width = Math.max(10, Number(template.widthMm) || 62);
  if (template.isContinuous) {
    return `@page { size: ${width}mm auto; margin: 0; }`;
  }
  const height = Math.max(10, Number(template.heightMm) || 100);
  return `@page { size: ${width}mm ${height}mm; margin: 0; }`;
};

const parseChildQrPayload = (value: string) => {
  const parts = value.trim().split(":");
  if (parts.length !== 3 || parts[0] !== "ecclesiaos-child-checkout") return null;
  return { id: parts[1], securityCode: parts[2] };
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

export const CheckInPage: React.FC<Props> = ({ token, user }) => {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [eventCheckIns, setEventCheckIns] = useState<EventCheckIn[]>([]);
  const [childCheckIns, setChildCheckIns] = useState<ChildCheckIn[]>([]);
  const [eventForm, setEventForm] = useState<EventCheckInInput>(emptyEventCheckIn);
  const [childForm, setChildForm] = useState<ChildCheckInInput>(emptyChildCheckIn);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [kidsTemplates, setKidsTemplates] = useState<LabelTemplate[]>(FALLBACK_TEMPLATES);
  const [labelTemplateId, setLabelTemplateId] = useState<string>(FALLBACK_TEMPLATES[0]!.id);
  const [printMode, setPrintMode] = useState<PrintMode>(null);
  const [activeView, setActiveView] = useState<CheckInView>("events");
  const [scannerActive, setScannerActive] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [status, setStatus] = useState("");

  const canManage = canManageModule(user.role, "checkin");
  const serviceEvents = useMemo(() => events.filter((event) => event.type === "service"), [events]);
  const openChildren = childCheckIns.filter((item) => !item.checkedOutAt);

  const refresh = async () => {
    const [nextEvents, nextPeople, nextAttendance, nextEventCheckIns, nextChildCheckIns] = await Promise.all([
      loadEvents(token),
      loadPeople(token),
      loadAttendance(token),
      loadEventCheckIns(token),
      loadChildCheckIns(token)
    ]);
    setEvents(nextEvents);
    setPeople(nextPeople);
    setAttendance(nextAttendance);
    setEventCheckIns(nextEventCheckIns);
    setChildCheckIns(nextChildCheckIns);
  };

  useEffect(() => {
    refresh().catch(() => setStatus("Nao foi possivel carregar check-ins."));
  }, [token]);

  useEffect(() => {
    loadLabelTemplates(token, "kids_checkin")
      .then((templates) => {
        if (templates.length === 0) return;
        setKidsTemplates(templates);
        const preferred = templates.find((template) => template.isDefault) || templates[0];
        if (preferred) setLabelTemplateId(preferred.id);
      })
      .catch(() => {
        // mantem fallback fixo
      });
  }, [token]);

  useEffect(() => {
    const clearPrintMode = () => setPrintMode(null);
    window.addEventListener("afterprint", clearPrintMode);
    return () => window.removeEventListener("afterprint", clearPrintMode);
  }, []);

  const handleQrDecoded = async (rawValue: string) => {
    setScanInput(rawValue);
    await completeCheckoutFromQr(rawValue);
    setScannerActive(false);
  };

  const { videoRef, canvasRef, status: scannerCameraStatus, message: scannerStatus } = useQrScanner({
    active: scannerActive,
    onDecode: handleQrDecoded
  });

  const eventName = (eventId: string) => events.find((event) => event.id === eventId)?.title || "Evento nao encontrado";
  const personName = (personId: string) => {
    const person = people.find((item) => item.id === personId);
    return person ? `${person.firstName} ${person.lastName}`.trim() : "Pessoa nao encontrada";
  };
  const selectedLabel = childCheckIns.find((item) => item.id === selectedLabelId) || null;
  const selectedLabelQrValue = selectedLabel ? `ecclesiaos-child-checkout:${selectedLabel.id}:${selectedLabel.securityCode}` : "";
  const selectedBatchLabels = childCheckIns.filter((item) => selectedBatchIds.includes(item.id));
  const selectedTemplate = kidsTemplates.find((template) => template.id === labelTemplateId) || kidsTemplates[0] || null;
  const consolidatedAttendance = attendance.filter((record) => record.eventId);
  const consolidatedPeopleCount = consolidatedAttendance.reduce((sum, record) => sum + record.presentPersonIds.length, 0);
  const linkedGuardians = childForm.childPersonId
    ? people.filter((person) => people.find((child) => child.id === childForm.childPersonId)?.guardianPersonIds.includes(person.id))
    : [];

  const updateChildPerson = (personId: string) => {
    const person = people.find((item) => item.id === personId);
    const firstGuardian = person?.guardianPersonIds[0] ? people.find((item) => item.id === person.guardianPersonIds[0]) : null;
    setChildForm((current) => ({
      ...current,
      childPersonId: personId,
      childName: person ? `${person.firstName} ${person.lastName}`.trim() : current.childName,
      guardianPersonId: firstGuardian?.id || current.guardianPersonId,
      guardianName: firstGuardian ? `${firstGuardian.firstName} ${firstGuardian.lastName}`.trim() : current.guardianName,
      guardianPhone: firstGuardian?.phone || current.guardianPhone
    }));
  };

  const updateGuardianPerson = (personId: string) => {
    const person = people.find((item) => item.id === personId);
    setChildForm((current) => ({
      ...current,
      guardianPersonId: personId,
      guardianName: person ? `${person.firstName} ${person.lastName}`.trim() : current.guardianName,
      guardianPhone: person?.phone || current.guardianPhone
    }));
  };

  const submitEventCheckIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;

    setStatus("Registrando check-in...");
    try {
      await saveEventCheckIn(token, eventForm);
      await refresh();
      setEventForm(emptyEventCheckIn);
      setStatus("Check-in registrado.");
    } catch {
      setStatus("Nao foi possivel registrar check-in.");
    }
  };

  const submitChildCheckIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;

    setStatus("Registrando crianca...");
    try {
      await saveChildCheckIn(token, childForm);
      await refresh();
      setChildForm(emptyChildCheckIn);
      setStatus("Check-in infantil registrado.");
      setSelectedLabelId((await loadChildCheckIns(token))[0]?.id || null);
    } catch {
      setStatus("Nao foi possivel registrar check-in infantil.");
    }
  };

  const removeEventCheckIn = async (id: string) => {
    if (!canManage) return;
    await deleteEventCheckIn(token, id);
    await refresh();
  };

  const handleChildCheckout = async (id: string) => {
    if (!canManage) return;
    await checkOutChild(token, id);
    await refresh();
  };

  const handleGuardianChildCheckout = async (item: ChildCheckIn) => {
    setStatus("Validando responsavel...");
    try {
      await checkOutChild(token, item.id, { securityCode: item.securityCode });
      await refresh();
      setStatus("Retirada infantil registrada.");
    } catch {
      setStatus("Nao foi possivel registrar a retirada.");
    }
  };

  const toggleBatchLabel = (id: string) => {
    setSelectedBatchIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const selectOpenBatchLabels = () => {
    setSelectedBatchIds(openChildren.map((item) => item.id));
  };

  const printLabels = (mode: Exclude<PrintMode, null>) => {
    setPrintMode(mode);
    window.setTimeout(() => window.print(), 50);
  };

  const completeCheckoutFromQr = async (value: string) => {
    const parsed = parseChildQrPayload(value);
    if (!parsed) {
      setStatus("QR Code invalido para retirada infantil.");
      return;
    }

    const item = childCheckIns.find((checkIn) => checkIn.id === parsed.id);
    if (!item) {
      setStatus("Check-in infantil nao encontrado nesta sessao.");
      return;
    }
    if (item.checkedOutAt) {
      setStatus("Esta crianca ja teve saida registrada.");
      return;
    }
    if (!canManage && !isGuardianAllowed(item)) {
      setStatus("Usuario logado nao e responsavel desta crianca.");
      return;
    }

    try {
      await checkOutChild(token, item.id, { securityCode: parsed.securityCode });
      await refresh();
      setStatus("Retirada registrada pelo QR Code.");
    } catch {
      setStatus("Nao foi possivel registrar a retirada pelo QR Code.");
    }
  };

  const isGuardianAllowed = (item: ChildCheckIn) => {
    if (!user.personId) return false;
    if (item.guardianPersonId === user.personId) return true;
    const child = people.find((person) => person.id === item.childPersonId);
    return Boolean(child?.guardianPersonIds.includes(user.personId));
  };

  const guardianMessageLink = (item: ChildCheckIn) => {
    const phone = item.guardianPhone.replace(/\D/g, "");
    const message = encodeURIComponent(`Ola, ${item.guardianName}. A crianca ${item.childName} ainda esta aguardando retirada no ministerio infantil. Codigo: ${item.securityCode}.`);
    return phone ? `https://wa.me/${phone}?text=${message}` : `sms:?&body=${message}`;
  };

  return (
    <section className={`panel checkin-panel ${printMode ? `print-mode-${printMode}` : ""}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Check-in</p>
          <h2>Eventos e ministerio infantil</h2>
        </div>
        <span className="profile-pill">{canManage ? "Operacao liberada" : "Somente leitura"}</span>
      </div>

      <div className="report-grid">
        <article><span>Check-ins evento</span><strong>{eventCheckIns.length}</strong></article>
        <article><span>Criancas no culto</span><strong>{openChildren.length}</strong></article>
        <article><span>Eventos culto</span><strong>{serviceEvents.length}</strong></article>
        <article><span>Presenca consolidada</span><strong>{consolidatedPeopleCount}</strong></article>
      </div>

      <div className="tab-bar" role="tablist" aria-label="Areas de check-in">
        <button className={activeView === "events" ? "active" : ""} type="button" onClick={() => setActiveView("events")}>Eventos</button>
        <button className={activeView === "kids" ? "active" : ""} type="button" onClick={() => setActiveView("kids")}>Kids</button>
        <button className={activeView === "admin" ? "active" : ""} type="button" onClick={() => setActiveView("admin")}>Administracao kids</button>
      </div>

      {activeView === "admin" && <div className="scanner-panel">
        <div>
          <h3>Leitura de QR Code</h3>
          <p className="muted">Use a camera para ler a etiqueta ou cole o conteudo do QR Code.</p>
        </div>
        <div className="scanner-actions">
          <button className="secondary-button" type="button" onClick={() => setScannerActive((current) => !current)}>{scannerActive ? "Parar camera" : "Abrir camera"}</button>
          <input value={scanInput} onChange={(event) => setScanInput(event.target.value)} placeholder="ecclesiaos-child-checkout:..." />
          <button className="secondary-button" type="button" onClick={() => completeCheckoutFromQr(scanInput)}>Validar QR</button>
        </div>
        {scannerActive && <video className="scanner-video" ref={videoRef} muted playsInline />}
        <canvas className="scanner-canvas" ref={canvasRef} />
        <p className="muted">{scannerStatus}</p>
      </div>}

      {activeView === "events" && <div className="report-columns">
        <form className="person-form" onSubmit={submitEventCheckIn}>
          <h3 className="wide-field">Check-in por evento</h3>
          <label>
            Evento
            <select disabled={!canManage} value={eventForm.eventId} onChange={(event) => setEventForm((current) => ({ ...current, eventId: event.target.value }))}>
              <option value="">Selecione</option>
              {events.map((event) => <option key={event.id} value={event.id}>{event.date} - {event.title}</option>)}
            </select>
          </label>
          <label>
            Pessoa
            <select disabled={!canManage} value={eventForm.personId} onChange={(event) => setEventForm((current) => ({ ...current, personId: event.target.value }))}>
              <option value="">Selecione</option>
              {people.map((person) => <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>)}
            </select>
          </label>
          <label className="wide-field">Notas<input disabled={!canManage} value={eventForm.notes} onChange={(event) => setEventForm((current) => ({ ...current, notes: event.target.value }))} /></label>
          <div className="form-footer">
            {canManage && <button type="submit">Registrar pessoa</button>}
          </div>
        </form>
        <div>
          <h3>Pessoas no evento</h3>
          {eventCheckIns.length === 0 ? <p className="muted">Sem check-ins de pessoas.</p> : eventCheckIns.map((item) => (
            <p className="report-row" key={item.id}>
              <span>{personName(item.personId)} - {eventName(item.eventId)}</span>
              {canManage ? <button className="icon-button" type="button" onClick={() => removeEventCheckIn(item.id)}>Remover</button> : <strong>OK</strong>}
            </p>
          ))}
        </div>
      </div>}

      {activeView === "kids" && <div className="report-columns">
        <form className="person-form" onSubmit={submitChildCheckIn}>
          <h3 className="wide-field">Ministerio infantil</h3>
          <label>
            Culto
            <select disabled={!canManage} value={childForm.eventId} onChange={(event) => setChildForm((current) => ({ ...current, eventId: event.target.value }))}>
              <option value="">Selecione</option>
              {serviceEvents.map((event) => <option key={event.id} value={event.id}>{event.date} - {event.title}</option>)}
            </select>
          </label>
          <label>
            Pessoa da crianca
            <select disabled={!canManage} value={childForm.childPersonId} onChange={(event) => updateChildPerson(event.target.value)}>
              <option value="">Sem vinculo</option>
              {people.map((person) => <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>)}
            </select>
          </label>
          <label>Crianca<input disabled={!canManage} value={childForm.childName} onChange={(event) => setChildForm((current) => ({ ...current, childName: event.target.value }))} /></label>
          <label>
            Pessoa responsavel
            <select disabled={!canManage} value={childForm.guardianPersonId} onChange={(event) => updateGuardianPerson(event.target.value)}>
              <option value="">Sem vinculo</option>
              {linkedGuardians.length > 0 && <optgroup label="Responsaveis da crianca">
                {linkedGuardians.map((person) => <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>)}
              </optgroup>}
              <optgroup label="Todas as pessoas">
              {people.map((person) => <option key={person.id} value={person.id}>{person.firstName} {person.lastName}</option>)}
              </optgroup>
            </select>
          </label>
          <label>Responsavel<input disabled={!canManage} value={childForm.guardianName} onChange={(event) => setChildForm((current) => ({ ...current, guardianName: event.target.value }))} /></label>
          <label>Telefone<input disabled={!canManage} value={childForm.guardianPhone} onChange={(event) => setChildForm((current) => ({ ...current, guardianPhone: event.target.value }))} /></label>
          <label className="wide-field">Notas<input disabled={!canManage} value={childForm.notes} onChange={(event) => setChildForm((current) => ({ ...current, notes: event.target.value }))} /></label>
          <div className="form-footer">
            {canManage && <button type="submit">Registrar crianca</button>}
            <p>{status}</p>
          </div>
        </form>
        <div>
          <h3>Criancas ativas</h3>
          {openChildren.length === 0 ? <p className="muted">Nenhuma crianca aguardando retirada.</p> : openChildren.map((item) => (
            <p className="report-row" key={item.id}>
              <span>{item.childName} - {eventName(item.eventId)}</span>
              <button className="secondary-button" type="button" onClick={() => setSelectedLabelId(item.id)}>Etiqueta</button>
            </p>
          ))}
        </div>
      </div>}

      {activeView === "events" && <div className="report-columns">
        <div>
          <h3>Presenca consolidada</h3>
          {consolidatedAttendance.length === 0 ? <p className="muted">Sem presenca consolidada por evento.</p> : consolidatedAttendance.slice(0, 6).map((record) => (
            <p className="report-row" key={record.id}>
              <span>{eventName(record.eventId)} - {record.date}</span>
              <strong>{record.presentPersonIds.length}</strong>
            </p>
          ))}
        </div>
      </div>}

      {activeView === "admin" && <div className="report-columns">
        <div>
          <h3>Administracao infantil</h3>
          {canManage && (
            <div className="batch-toolbar">
              <button className="secondary-button" type="button" onClick={selectOpenBatchLabels}>Selecionar ativos</button>
              <button className="secondary-button" type="button" onClick={() => setSelectedBatchIds([])}>Limpar</button>
              <button className="secondary-button" type="button" onClick={() => printLabels("batch")} disabled={selectedBatchLabels.length === 0}>Imprimir lote</button>
              <span>{selectedBatchLabels.length} selecionada(s)</span>
            </div>
          )}
          {childCheckIns.length === 0 ? <p className="muted">Sem check-ins infantis.</p> : childCheckIns.map((item) => (
            <p className="report-row" key={item.id}>
              <span>
                {canManage && <input className="batch-checkbox" type="checkbox" checked={selectedBatchIds.includes(item.id)} onChange={() => toggleBatchLabel(item.id)} />}
                {item.childName} - {eventName(item.eventId)} - codigo {item.securityCode}
              </span>
              <span className="response-actions">
                <button className="secondary-button" type="button" onClick={() => setSelectedLabelId(item.id)}>Etiqueta</button>
                {!item.checkedOutAt && <a className="secondary-link" href={guardianMessageLink(item)} target="_blank" rel="noreferrer">Mensagem</a>}
                {item.checkedOutAt ? <strong>Saiu</strong> : canManage ? <button className="secondary-button" type="button" onClick={() => handleChildCheckout(item.id)}>Saida</button> : isGuardianAllowed(item) ? <button className="secondary-button" type="button" onClick={() => handleGuardianChildCheckout(item)}>Retirar</button> : <strong>Ativo</strong>}
              </span>
            </p>
          ))}
        </div>
      </div>}

      {selectedLabel && selectedTemplate && (
        <div className="child-label-preview">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Etiqueta infantil</p>
              <h2>{selectedLabel.childName}</h2>
            </div>
            <div className="response-actions">
              <select value={labelTemplateId} onChange={(event) => setLabelTemplateId(event.target.value)}>
                {kidsTemplates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
              <button className="secondary-button" type="button" onClick={() => printLabels("single")}>Imprimir Brother</button>
            </div>
          </div>
          {printMode && <style>{labelPageStyle(selectedTemplate)}</style>}
          <div className={`child-label-card child-label-print-area single-label-print-area ${labelPresetClass(selectedTemplate)}`}>
            <p className="eyebrow">EcclesiaOS Kids</p>
            <h3>{selectedLabel.childName}</h3>
            <div className="child-label-code-row">
              <strong>{selectedLabel.securityCode}</strong>
              <ChildQrCode value={selectedLabelQrValue} />
            </div>
            <p>{eventName(selectedLabel.eventId)}</p>
            <p>Responsavel: {selectedLabel.guardianName}</p>
            <p>Telefone: {selectedLabel.guardianPhone || "Nao informado"}</p>
            <p>QR: {selectedLabel.id}</p>
            {selectedLabel.checkedOutAt && <p>Retirado por: {personName(selectedLabel.checkedOutByPersonId)}</p>}
          </div>
        </div>
      )}

      {selectedBatchLabels.length > 0 && selectedTemplate && (
        <div className="batch-label-preview">
          {printMode === "batch" && <style>{labelPageStyle(selectedTemplate)}</style>}
          {selectedBatchLabels.map((label) => (
            <div className={`child-label-card child-label-print-area batch-label-print-area ${labelPresetClass(selectedTemplate)}`} key={label.id}>
              <p className="eyebrow">EcclesiaOS Kids</p>
              <h3>{label.childName}</h3>
              <div className="child-label-code-row">
                <strong>{label.securityCode}</strong>
                <ChildQrCode value={`ecclesiaos-child-checkout:${label.id}:${label.securityCode}`} />
              </div>
              <p>{eventName(label.eventId)}</p>
              <p>Responsavel: {label.guardianName}</p>
              <p>Telefone: {label.guardianPhone || "Nao informado"}</p>
              <p>QR: {label.id}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
