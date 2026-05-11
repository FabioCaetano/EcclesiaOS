import React, { useEffect, useRef, useState } from "react";
import { Download, Heart, Image as ImageIcon, Plus, Printer, QrCode, Tag, Upload, X } from "lucide-react";
import QRCode from "qrcode";
import { MAX_LOGO_DATA_URL_BYTES, validateLogoDataUrl } from "@ecclesiaos/shared";
import type { ChurchProfile, ChurchProfileUpdate, CurrentUser, LabelLayout, LabelTemplate, LabelTemplateInput } from "@ecclesiaos/shared";
import { deleteLabelTemplate, loadChurchProfile, loadLabelTemplates, saveLabelTemplate, updateChurchProfile } from "./api";
import { toChurchUpdate } from "./mappers";
import { Card, EmptyState, PageHeader } from "./ui";

const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(reader.error || new Error("read-error"));
  reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
  reader.readAsDataURL(file);
});

interface Props {
  token: string;
  user: CurrentUser;
}

const layoutLabels: Record<LabelLayout, string> = {
  kids_checkin: "Kids - Check-in",
  visitor: "Visitante"
};

const emptyTemplate = (): LabelTemplateInput => ({
  name: "",
  printerModel: "",
  widthMm: 62,
  heightMm: 100,
  isContinuous: false,
  layout: "kids_checkin",
  isDefault: false
});

const labelPageStyle = (template: LabelTemplate): string => {
  const width = Math.max(10, Number(template.widthMm) || 62);
  if (template.isContinuous) {
    return `@page { size: ${width}mm auto; margin: 0; }`;
  }
  const height = Math.max(10, Number(template.heightMm) || 100);
  return `@page { size: ${width}mm ${height}mm; margin: 0; }`;
};

export const ChurchPage: React.FC<Props> = ({ token, user }) => {
  const [church, setChurch] = useState<ChurchProfile | null>(null);
  const [churchForm, setChurchForm] = useState<ChurchProfileUpdate | null>(null);
  const [churchStatus, setChurchStatus] = useState("");
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [templateForm, setTemplateForm] = useState<LabelTemplateInput>(emptyTemplate());
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateStatus, setTemplateStatus] = useState("");
  const [printingTemplate, setPrintingTemplate] = useState<LabelTemplate | null>(null);
  const [visitorQrSrc, setVisitorQrSrc] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user.role === "admin";
  const visitorUrl = `${window.location.origin}/visitor`;

  useEffect(() => {
    loadChurchProfile(token)
      .then((profile) => {
        setChurch(profile);
        setChurchForm(toChurchUpdate(profile));
      })
      .catch(() => setChurchStatus("Nao foi possivel carregar o cadastro da igreja."));
  }, [token]);

  const refreshTemplates = async () => {
    try {
      const list = await loadLabelTemplates(token);
      setTemplates(list);
    } catch {
      setTemplateStatus("Nao foi possivel carregar templates de etiqueta.");
    }
  };

  useEffect(() => {
    void refreshTemplates();
  }, [token]);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(visitorUrl, { errorCorrectionLevel: "M", margin: 1, width: 320 })
      .then((src) => { if (active) setVisitorQrSrc(src); })
      .catch(() => { if (active) setVisitorQrSrc(""); });
    return () => { active = false; };
  }, [visitorUrl]);

  const downloadVisitorQr = () => {
    if (!visitorQrSrc) return;
    const link = document.createElement("a");
    link.href = visitorQrSrc;
    link.download = "ecclesiaos-qr-visitante.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!printingTemplate) return;
    const onAfterPrint = () => setPrintingTemplate(null);
    window.addEventListener("afterprint", onAfterPrint);
    const timer = window.setTimeout(() => {
      window.print();
    }, 50);
    return () => {
      window.removeEventListener("afterprint", onAfterPrint);
      window.clearTimeout(timer);
    };
  }, [printingTemplate]);

  const updateChurchField = (field: keyof ChurchProfileUpdate, value: string) => {
    setChurchForm((current) => current ? { ...current, [field]: value } : current);
  };

  const handleLogoFile = async (file: File | undefined) => {
    if (!file || !churchForm) return;
    setChurchStatus("Lendo arquivo...");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const check = validateLogoDataUrl(dataUrl);
      if (!check.ok) {
        const message = check.reason === "size"
          ? `Arquivo passa de 100 KB (atual: ${(dataUrl.length / 1024).toFixed(1)} KB). Reduza antes de enviar.`
          : check.reason === "mime"
            ? "Use PNG, JPEG, SVG ou WebP."
            : "Arquivo invalido.";
        setChurchStatus(message);
        return;
      }
      setChurchForm((current) => current ? { ...current, logoDataUrl: dataUrl } : current);
      setChurchStatus("Pre-visualizando. Clique em Salvar cadastro para aplicar.");
    } catch {
      setChurchStatus("Nao foi possivel ler o arquivo.");
    }
  };

  const removeLogo = () => {
    if (!churchForm) return;
    setChurchForm({ ...churchForm, logoDataUrl: "" });
    if (logoInputRef.current) logoInputRef.current.value = "";
    setChurchStatus("Logo removido. Clique em Salvar cadastro para aplicar.");
  };

  const handleChurchSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!churchForm) return;

    setChurchStatus("Salvando...");
    try {
      const profile = await updateChurchProfile(token, churchForm);
      setChurch(profile);
      setChurchForm(toChurchUpdate(profile));
      setChurchStatus("Cadastro salvo.");
    } catch {
      setChurchStatus("Nao foi possivel salvar. Verifique sua permissao.");
    }
  };

  const startNewTemplate = () => {
    setEditingTemplateId(null);
    setTemplateForm(emptyTemplate());
    setTemplateStatus("");
  };

  const editTemplate = (template: LabelTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateForm({
      name: template.name,
      printerModel: template.printerModel,
      widthMm: template.widthMm,
      heightMm: template.heightMm,
      isContinuous: template.isContinuous,
      layout: template.layout,
      isDefault: template.isDefault
    });
    setTemplateStatus("");
  };

  const handleTemplateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin) return;

    setTemplateStatus("Salvando template...");
    try {
      await saveLabelTemplate(token, templateForm, editingTemplateId || undefined);
      await refreshTemplates();
      startNewTemplate();
      setTemplateStatus("Template salvo.");
    } catch {
      setTemplateStatus("Nao foi possivel salvar o template.");
    }
  };

  const handleDeleteTemplate = async (template: LabelTemplate) => {
    if (!isAdmin) return;
    if (!window.confirm(`Remover o template "${template.name}"?`)) return;

    setTemplateStatus("Removendo template...");
    try {
      await deleteLabelTemplate(token, template.id);
      await refreshTemplates();
      if (editingTemplateId === template.id) startNewTemplate();
      setTemplateStatus("Template removido.");
    } catch {
      setTemplateStatus("Nao foi possivel remover o template.");
    }
  };

  const printTestLabel = (template: LabelTemplate) => {
    setPrintingTemplate(template);
  };

  return (
    <>
      <PageHeader
        eyebrow="Cadastro"
        icon={Heart}
        title="Igreja"
        description="Dados gerais da igreja, canal de transmissao e configuracao operacional."
        actions={church && <span className="profile-pill">{church.name}</span>}
      />

      <Card className="church-panel">
      {churchForm ? (
        <form className="church-form" onSubmit={handleChurchSubmit}>
          <label>Nome<input disabled={!isAdmin} value={churchForm.name} onChange={(event) => updateChurchField("name", event.target.value)} /></label>
          <label>Email<input disabled={!isAdmin} value={churchForm.email} onChange={(event) => updateChurchField("email", event.target.value)} /></label>
          <label>Telefone<input disabled={!isAdmin} value={churchForm.phone} onChange={(event) => updateChurchField("phone", event.target.value)} /></label>
          <label>Site<input disabled={!isAdmin} value={churchForm.website} onChange={(event) => updateChurchField("website", event.target.value)} /></label>
          <label className="wide-field">Canal do YouTube<input disabled={!isAdmin} value={churchForm.youtubeChannelUrl} onChange={(event) => updateChurchField("youtubeChannelUrl", event.target.value)} placeholder="https://www.youtube.com/channel/..." /></label>
          <label>Endereco<input disabled={!isAdmin} value={churchForm.addressLine1} onChange={(event) => updateChurchField("addressLine1", event.target.value)} /></label>
          <label>Complemento<input disabled={!isAdmin} value={churchForm.addressLine2} onChange={(event) => updateChurchField("addressLine2", event.target.value)} /></label>
          <label>Cidade<input disabled={!isAdmin} value={churchForm.city} onChange={(event) => updateChurchField("city", event.target.value)} /></label>
          <label>Estado<input disabled={!isAdmin} value={churchForm.state} onChange={(event) => updateChurchField("state", event.target.value)} /></label>
          <label>CEP<input disabled={!isAdmin} value={churchForm.postalCode} onChange={(event) => updateChurchField("postalCode", event.target.value)} /></label>
          <label>Pais<input disabled={!isAdmin} value={churchForm.country} onChange={(event) => updateChurchField("country", event.target.value)} /></label>

          <div className="form-footer">
            {isAdmin && <button type="submit">Salvar cadastro</button>}
            <p>{isAdmin ? churchStatus : "Somente administradores podem editar este cadastro."}</p>
          </div>
        </form>
      ) : (
        <p className="muted">{churchStatus || "Carregando cadastro..."}</p>
      )}
      </Card>

      {churchForm && (
        <Card className="church-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><ImageIcon size={12} />Identidade visual</p>
              <h2>Logo da igreja</h2>
            </div>
          </div>
          <div className="church-logo-block">
            <div className="church-logo-preview">
              {churchForm.logoDataUrl ? (
                <img src={churchForm.logoDataUrl} alt="Logo da igreja" />
              ) : (
                <div className="church-logo-placeholder">Sem logo personalizado.<br /><span className="muted">Usaremos o logo padrao do EcclesiaOS.</span></div>
              )}
            </div>
            <div className="church-logo-info">
              <p className="muted">Formatos aceitos: PNG, JPEG, SVG ou WebP. Limite: 100 KB ({(MAX_LOGO_DATA_URL_BYTES / 1024).toFixed(0)} KB).</p>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                disabled={!isAdmin}
                onChange={(event) => handleLogoFile(event.target.files?.[0])}
                style={{ display: "none" }}
              />
              <div className="response-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload size={14} /> {churchForm.logoDataUrl ? "Trocar logo" : "Subir logo"}
                </button>
                {churchForm.logoDataUrl && (
                  <button
                    className="danger-outline-button"
                    type="button"
                    disabled={!isAdmin}
                    onClick={removeLogo}
                  >
                    <X size={14} /> Remover logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="church-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><QrCode size={12} />Pre-cadastro</p>
          <h2>QR de visitantes</h2>
        </div>
      </div>
      <div className="visitor-qr-block">
        {visitorQrSrc ? (
          <img className="visitor-qr-image" src={visitorQrSrc} alt="QR Code de pre-cadastro de visitantes" />
        ) : (
          <div className="visitor-qr-image placeholder" />
        )}
        <div className="visitor-qr-info">
          <p className="muted">Imprima e deixe na entrada. O visitante escaneia, preenche um formulario rapido e cai em Pessoas com status visitante.</p>
          <p className="muted"><strong>URL:</strong> {visitorUrl}</p>
          <div className="response-actions">
            <button className="secondary-button" type="button" onClick={downloadVisitorQr} disabled={!visitorQrSrc}>
              <Download size={14} /> Baixar PNG
            </button>
            <a className="secondary-button" href={visitorUrl} target="_blank" rel="noopener noreferrer">
              Abrir formulario
            </a>
          </div>
        </div>
      </div>
      </Card>

      <Card className="church-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><Tag size={12} />Etiquetas e impressoras</p>
          <h2>Templates de etiqueta</h2>
        </div>
        {isAdmin && (
          <button className="secondary-button" type="button" onClick={startNewTemplate}>
            <Plus size={16} /> Novo template
          </button>
        )}
      </div>

      <div className="label-templates-grid">
        {templates.length === 0 && (
          <EmptyState
            icon={Tag}
            title="Nenhum template cadastrado"
            description={isAdmin ? "Cadastre o modelo da impressora Brother que voce usa." : "Peça ao admin para cadastrar."}
          />
        )}
        {templates.map((template) => (
          <article key={template.id} className={editingTemplateId === template.id ? "label-template-card selected" : "label-template-card"}>
            <header>
              <strong>{template.name}</strong>
              <span className="muted">{layoutLabels[template.layout]}</span>
            </header>
            <p className="muted">{template.printerModel || "Sem modelo"}</p>
            <p className="muted">{template.isContinuous ? `${template.widthMm}mm continuo` : `${template.widthMm} x ${template.heightMm} mm`}{template.isDefault ? " - padrao" : ""}</p>
            <div className="response-actions">
              <button className="secondary-button" type="button" onClick={() => printTestLabel(template)}>
                <Printer size={14} /> Imprimir teste
              </button>
              {isAdmin && <button className="secondary-button" type="button" onClick={() => editTemplate(template)}>Editar</button>}
              {isAdmin && <button className="danger-outline-button" type="button" onClick={() => handleDeleteTemplate(template)}>Remover</button>}
            </div>
          </article>
        ))}
      </div>

      {isAdmin && (
        <form className="church-form label-template-form" onSubmit={handleTemplateSubmit} style={{ marginTop: "16px" }}>
          <label className="wide-field">Nome<input value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })} placeholder="Ex.: Kids - Brother DK-1202" /></label>
          <label>Modelo da impressora<input value={templateForm.printerModel} onChange={(event) => setTemplateForm({ ...templateForm, printerModel: event.target.value })} placeholder="Brother DK-1202" /></label>
          <label>
            Layout
            <select value={templateForm.layout} onChange={(event) => setTemplateForm({ ...templateForm, layout: event.target.value as LabelLayout })}>
              <option value="kids_checkin">Kids - Check-in</option>
              <option value="visitor">Visitante</option>
            </select>
          </label>
          <label>Largura (mm)<input type="number" min="10" step="1" value={templateForm.widthMm} onChange={(event) => setTemplateForm({ ...templateForm, widthMm: Number(event.target.value) || 0 })} /></label>
          <label>Altura (mm)<input type="number" min="0" step="1" disabled={templateForm.isContinuous} value={templateForm.heightMm} onChange={(event) => setTemplateForm({ ...templateForm, heightMm: Number(event.target.value) || 0 })} /></label>
          <label className="checkbox-inline">
            <input type="checkbox" checked={templateForm.isContinuous} onChange={(event) => setTemplateForm({ ...templateForm, isContinuous: event.target.checked })} />
            Fita continua
          </label>
          <label className="checkbox-inline">
            <input type="checkbox" checked={templateForm.isDefault} onChange={(event) => setTemplateForm({ ...templateForm, isDefault: event.target.checked })} />
            Padrao do layout
          </label>
          <div className="form-footer">
            <button type="submit">{editingTemplateId ? "Salvar template" : "Criar template"}</button>
            {editingTemplateId && <button className="secondary-button" type="button" onClick={startNewTemplate}>Cancelar edicao</button>}
            <p>{templateStatus}</p>
          </div>
        </form>
      )}

      {printingTemplate && (
        <div className="label-test-print">
          <style>{labelPageStyle(printingTemplate)}</style>
          <div className="child-label-card child-label-print-area single-label-print-area">
            <p className="eyebrow">{printingTemplate.layout === "visitor" ? "EcclesiaOS Visitante" : "EcclesiaOS Kids"}</p>
            <h3>{printingTemplate.layout === "visitor" ? "Bem-vindo!" : "Crianca de Teste"}</h3>
            <div className="child-label-code-row">
              <strong>{printingTemplate.layout === "visitor" ? "Visitante" : "1234"}</strong>
            </div>
            <p>Template: {printingTemplate.name}</p>
            <p>Impressora: {printingTemplate.printerModel || "Nao informada"}</p>
            <p>{printingTemplate.isContinuous ? `${printingTemplate.widthMm}mm continuo` : `${printingTemplate.widthMm} x ${printingTemplate.heightMm} mm`}</p>
          </div>
        </div>
      )}
      </Card>
    </>
  );
};
