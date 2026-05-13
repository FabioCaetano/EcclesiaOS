import React, { useEffect, useState } from "react";
import { Plus, Printer, Tag } from "lucide-react";
import type { CurrentUser, LabelLayout, LabelTemplate, LabelTemplateInput } from "@ecclesiaos/shared";
import { deleteLabelTemplate, loadLabelTemplates, saveLabelTemplate } from "./api";
import { Card, EmptyState, PageHeader } from "./ui";

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

export const LabelsPage: React.FC<Props> = ({ token, user }) => {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [templateForm, setTemplateForm] = useState<LabelTemplateInput>(emptyTemplate());
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateStatus, setTemplateStatus] = useState("");
  const [printingTemplate, setPrintingTemplate] = useState<LabelTemplate | null>(null);

  const isAdmin = user.role === "admin";

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
        eyebrow="Sistema"
        icon={Tag}
        title="Etiquetas"
        description="Templates de etiqueta e configuracao de impressoras Brother (Kids, Visitante)."
        actions={isAdmin && (
          <button className="secondary-button" type="button" onClick={startNewTemplate}>
            <Plus size={16} /> Novo template
          </button>
        )}
      />

      <Card className="church-panel">
        <div className="label-templates-grid">
          {templates.length === 0 && (
            <EmptyState
              icon={Tag}
              title="Nenhum template cadastrado"
              description={isAdmin ? "Cadastre o modelo da impressora Brother que voce usa." : "Peca ao admin para cadastrar."}
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
