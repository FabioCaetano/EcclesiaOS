import React, { useEffect, useRef, useState } from "react";
import { Download, Heart, Image as ImageIcon, QrCode, Upload, X } from "lucide-react";
import QRCode from "qrcode";
import { MAX_LOGO_DATA_URL_BYTES, validateLogoDataUrl } from "@ecclesiaos/shared";
import type { ChurchProfile, ChurchProfileUpdate, CurrentUser } from "@ecclesiaos/shared";
import { loadChurchProfile, updateChurchProfile } from "./api";
import { toChurchUpdate } from "./mappers";
import { Card, PageHeader } from "./ui";

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

export const ChurchPage: React.FC<Props> = ({ token, user }) => {
  const [church, setChurch] = useState<ChurchProfile | null>(null);
  const [churchForm, setChurchForm] = useState<ChurchProfileUpdate | null>(null);
  const [churchStatus, setChurchStatus] = useState("");
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

    </>
  );
};
