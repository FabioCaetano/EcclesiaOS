import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Camera, ClipboardCheck, MessageCircle, Printer, ScanLine, Search, Tag, X } from "lucide-react";
import { canManageModule } from "@ecclesiaos/shared";
import type { AttendanceRecord, ChildCheckIn, ChildCheckInInput, ChurchEvent, CurrentUser, EventCheckIn, EventCheckInInput, LabelTemplate, PersonProfile } from "@ecclesiaos/shared";
import { checkOutChild, deleteEventCheckIn, loadAttendance, loadChildCheckIns, loadEventCheckIns, loadEvents, loadLabelTemplates, loadPeople, saveChildCheckIn, saveEventCheckIn } from "./api";
import { useQrScanner } from "./useQrScanner";
import { Avatar, Card, EmptyState, PageHeader, StatusPill } from "./ui";

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
type CheckInView = "events" | "kids" | "admin" | "labels";

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

const relativeTime = (iso: string): string => {
  if (!iso) return "";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `ha ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `ha ${hours} h`;
  return new Date(iso).toLocaleDateString("pt-BR");
};

const matchesQuery = (haystack: string, query: string): boolean => {
  if (!query) return true;
  return haystack.toLowerCase().includes(query.trim().toLowerCase());
};

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
  const [labelFields, setLabelFields] = useState({
    age: true,
    guardianPhone: true,
    notes: false,
    qr: true
  });
  const [printMode, setPrintMode] = useState<PrintMode>(null);
  const [activeView, setActiveView] = useState<CheckInView>("events");
  const [scannerActive, setScannerActive] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
  const selectedLabelPerson = selectedLabel?.childPersonId ? people.find((person) => person.id === selectedLabel.childPersonId) || null : null;
  const consolidatedAttendance = attendance.filter((record) => record.eventId);
  const consolidatedPeopleCount = consolidatedAttendance.reduce((sum, record) => sum + record.presentPersonIds.length, 0);
  const linkedGuardians = childForm.childPersonId
    ? people.filter((person) => people.find((child) => child.id === childForm.childPersonId)?.guardianPersonIds.includes(person.id))
    : [];

  const childAge = (person: PersonProfile | null): string => {
    if (!person?.birthDate) return "";
    const birth = new Date(`${person.birthDate}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return "";
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const hadBirthday = now.getMonth() > birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
    if (!hadBirthday) age -= 1;
    return age >= 0 ? `${age} ano(s)` : "";
  };

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
    <div className={printMode ? `print-mode-${printMode}` : ""}>
      <PageHeader
        eyebrow="Operacao"
        icon={ClipboardCheck}
        title="Check-in"
        description="Eventos, ministerio infantil e administracao kids."
        actions={<span className="profile-pill">{canManage ? "Operacao liberada" : "Somente leitura"}</span>}
      />

      <Card className="checkin-panel">
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
        <button className={activeView === "labels" ? "active" : ""} type="button" onClick={() => setActiveView("labels")}>Etiquetas</button>
      </div>

      {activeView === "admin" && <div className="scanner-panel">
        <div>
          <h3>Leitura de QR Code</h3>
          <p className="muted">Use a camera para ler a etiqueta ou cole o conteudo do QR Code.</p>
        </div>
        <div className="scanner-actions">
          <button className="secondary-button" type="button" onClick={() => setScannerActive((current) => !current)}>
            <Camera size={16} /> {scannerActive ? "Parar camera" : "Abrir camera"}
          </button>
          <input value={scanInput} onChange={(event) => setScanInput(event.target.value)} placeholder="ecclesiaos-child-checkout:..." />
          <button className="secondary-button" type="button" onClick={() => completeCheckoutFromQr(scanInput)}>
            <ScanLine size={16} /> Validar QR
          </button>
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
          <div className="checkin-search">
            <Search size={16} className="checkin-search-icon" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Buscar por nome..." />
          </div>
          {eventCheckIns.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="Sem check-ins" description="Nenhuma pessoa registrada neste evento ainda." />
          ) : (
            <div className="checkin-grid">
              {eventCheckIns
                .filter((item) => matchesQuery(personName(item.personId), searchQuery))
                .map((item) => (
                  <article className="checkin-card" key={item.id}>
                    <Avatar name={personName(item.personId)} size="md" tone="success" />
                    <div className="checkin-card-text">
                      <strong>{personName(item.personId)}</strong>
                      <span>{eventName(item.eventId)} - {relativeTime(item.checkedInAt)}</span>
                    </div>
                    {canManage && (
                      <button className="icon-button" type="button" aria-label="Remover check-in" onClick={() => removeEventCheckIn(item.id)}>
                        <X size={14} />
                      </button>
                    )}
                  </article>
                ))}
            </div>
          )}
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
          {openChildren.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="Sem criancas ativas" description="Nenhuma crianca aguardando retirada agora." />
          ) : (
            <div className="checkin-grid">
              {openChildren.map((item) => (
                <article className="checkin-card" key={item.id}>
                  <Avatar name={item.childName} size="md" tone="info" />
                  <div className="checkin-card-text">
                    <strong>{item.childName}</strong>
                    <span>{eventName(item.eventId)} - codigo {item.securityCode}</span>
                  </div>
                  <button className="secondary-button btn-sm" type="button" onClick={() => setSelectedLabelId(item.id)}>
                    <Tag size={14} /> Etiqueta
                  </button>
                </article>
              ))}
            </div>
          )}
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

      {activeView === "admin" && (
        <div className="checkin-layout">
          <div>
            <h3>Administracao infantil</h3>
            <div className="checkin-search">
              <Search size={16} className="checkin-search-icon" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Buscar crianca ou responsavel..." />
            </div>
            {canManage && (
              <div className="batch-toolbar">
                <button className="secondary-button" type="button" onClick={selectOpenBatchLabels}>Selecionar ativos</button>
                <button className="secondary-button" type="button" onClick={() => setSelectedBatchIds([])}>Limpar</button>
                <button className="secondary-button" type="button" onClick={() => printLabels("batch")} disabled={selectedBatchLabels.length === 0}>
                  <Printer size={14} /> Imprimir lote
                </button>
                <span>{selectedBatchLabels.length} selecionada(s)</span>
              </div>
            )}
            {childCheckIns.length === 0 ? (
              <EmptyState icon={ClipboardCheck} title="Sem check-ins infantis" description="Registre criancas na aba Kids para que elas apareçam aqui." />
            ) : (
              <div className="checkin-grid">
                {childCheckIns
                  .filter((item) => matchesQuery(`${item.childName} ${item.guardianName}`, searchQuery))
                  .map((item) => (
                    <article className="checkin-card" key={item.id}>
                      <Avatar name={item.childName} size="md" tone={item.checkedOutAt ? "muted" : "info"} />
                      <div className="checkin-card-text">
                        <strong>
                          {canManage && (
                            <input
                              className="batch-checkbox"
                              type="checkbox"
                              checked={selectedBatchIds.includes(item.id)}
                              onChange={() => toggleBatchLabel(item.id)}
                              aria-label={`Selecionar ${item.childName}`}
                            />
                          )}
                          {item.childName}
                        </strong>
                        <span>
                          {eventName(item.eventId)} - codigo {item.securityCode}
                          {item.checkedInAt && ` - ${relativeTime(item.checkedInAt)}`}
                        </span>
                      </div>
                      <div className="response-actions">
                        {item.checkedOutAt ? (
                          <StatusPill tone="muted">Saiu</StatusPill>
                        ) : (
                          <StatusPill tone="success">Ativo</StatusPill>
                        )}
                        <button className="secondary-button btn-sm" type="button" onClick={() => setSelectedLabelId(item.id)}>
                          <Tag size={14} /> Etiqueta
                        </button>
                        {!item.checkedOutAt && (
                          <a className="secondary-link" href={guardianMessageLink(item)} target="_blank" rel="noreferrer">
                            <MessageCircle size={14} /> Mensagem
                          </a>
                        )}
                        {!item.checkedOutAt && canManage && (
                          <button className="secondary-button btn-sm" type="button" onClick={() => handleChildCheckout(item.id)}>Saida</button>
                        )}
                        {!item.checkedOutAt && !canManage && isGuardianAllowed(item) && (
                          <button className="secondary-button btn-sm" type="button" onClick={() => handleGuardianChildCheckout(item)}>Retirar</button>
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </div>

          <aside className="checkin-side" aria-label="No momento">
            <h3>No momento</h3>
            {openChildren.length === 0 ? (
              <p className="muted">Nenhuma crianca presente.</p>
            ) : (
              <div className="checkin-side-list">
                {openChildren.slice(0, 12).map((item) => (
                  <div className="checkin-side-item" key={item.id}>
                    <Avatar name={item.childName} size="sm" tone="info" />
                    <div>
                      <strong>{item.childName}</strong>
                      <span>{relativeTime(item.checkedInAt)}</span>
                    </div>
                    <StatusPill tone="success">Aqui</StatusPill>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      {activeView === "labels" && (
        <div className="report-columns">
          <div>
            <h3>Etiquetas do Check-in</h3>
            <p className="muted">Selecione uma crianca ativa ou um check-in infantil para visualizar e imprimir a etiqueta.</p>
            <div className="batch-toolbar">
              <button className="secondary-button" type="button" onClick={selectOpenBatchLabels}>Selecionar criancas ativas</button>
              <button className="secondary-button" type="button" onClick={() => setSelectedBatchIds([])}>Limpar selecao</button>
              <button className="secondary-button" type="button" onClick={() => printLabels("batch")} disabled={selectedBatchLabels.length === 0}>
                <Printer size={14} /> Imprimir lote
              </button>
              <span>{selectedBatchLabels.length} selecionada(s)</span>
            </div>
            <div className="checkin-grid">
              {childCheckIns.map((item) => (
                <article className="checkin-card" key={item.id}>
                  <Avatar name={item.childName} size="md" tone={item.checkedOutAt ? "muted" : "info"} />
                  <div className="checkin-card-text">
                    <strong>{item.childName}</strong>
                    <span>{eventName(item.eventId)} - codigo {item.securityCode}</span>
                  </div>
                  <button className="secondary-button btn-sm" type="button" onClick={() => setSelectedLabelId(item.id)}>
                    <Tag size={14} /> Preview
                  </button>
                </article>
              ))}
            </div>
          </div>
          <aside className="checkin-side">
            <h3>Campos da etiqueta</h3>
            <label className="checkbox-inline"><input type="checkbox" checked={labelFields.age} onChange={(event) => setLabelFields((current) => ({ ...current, age: event.target.checked }))} /> Idade</label>
            <label className="checkbox-inline"><input type="checkbox" checked={labelFields.guardianPhone} onChange={(event) => setLabelFields((current) => ({ ...current, guardianPhone: event.target.checked }))} /> Telefone do responsavel</label>
            <label className="checkbox-inline"><input type="checkbox" checked={labelFields.notes} onChange={(event) => setLabelFields((current) => ({ ...current, notes: event.target.checked }))} /> Observacoes</label>
            <label className="checkbox-inline"><input type="checkbox" checked={labelFields.qr} onChange={(event) => setLabelFields((current) => ({ ...current, qr: event.target.checked }))} /> QR Code</label>
            <p className="muted">Templates e impressora usam os modelos cadastrados no sistema.</p>
          </aside>
        </div>
      )}

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
              <button className="secondary-button" type="button" onClick={() => printLabels("single")}>
                <Printer size={14} /> Imprimir Brother
              </button>
            </div>
          </div>
          {printMode && <style>{labelPageStyle(selectedTemplate)}</style>}
          <div className={`child-label-card child-label-print-area single-label-print-area ${labelPresetClass(selectedTemplate)}`}>
            <p className="eyebrow">EcclesiaOS Kids</p>
            <h3>{selectedLabel.childName}</h3>
            <div className="child-label-code-row">
              <strong>{selectedLabel.securityCode}</strong>
              {labelFields.qr && <ChildQrCode value={selectedLabelQrValue} />}
            </div>
            <p>{eventName(selectedLabel.eventId)}</p>
            <p>Responsavel: {selectedLabel.guardianName}</p>
            {labelFields.age && childAge(selectedLabelPerson) && <p>Idade: {childAge(selectedLabelPerson)}</p>}
            {labelFields.guardianPhone && <p>Telefone: {selectedLabel.guardianPhone || "Nao informado"}</p>}
            {labelFields.notes && selectedLabel.notes && <p>Obs.: {selectedLabel.notes}</p>}
            {labelFields.qr && <p>QR: {selectedLabel.id}</p>}
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
                {labelFields.qr && <ChildQrCode value={`ecclesiaos-child-checkout:${label.id}:${label.securityCode}`} />}
              </div>
              <p>{eventName(label.eventId)}</p>
              <p>Responsavel: {label.guardianName}</p>
              {labelFields.guardianPhone && <p>Telefone: {label.guardianPhone || "Nao informado"}</p>}
              {labelFields.notes && label.notes && <p>Obs.: {label.notes}</p>}
              {labelFields.qr && <p>QR: {label.id}</p>}
            </div>
          ))}
        </div>
      )}
      </Card>
    </div>
  );
};
