import React, { useEffect, useMemo, useState } from "react";
import { Download, FileText, Plus, Trash2 } from "lucide-react";
import { canManageModule } from "@ecclesiaos/shared";
import type { CurrentUser, CustomForm, CustomFormField, CustomFormInput, CustomFormResponse, PersonProfile } from "@ecclesiaos/shared";
import { deleteCustomForm, loadCustomFormResponses, loadCustomForms, loadPeople, saveCustomForm } from "./api";
import { Card, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

const emptyForm: CustomFormInput = {
  title: "",
  description: "",
  slug: "",
  responsiblePersonIds: [],
  fields: [],
  isActive: true
};

const fieldTypeLabels: Record<CustomFormField["type"], string> = {
  text: "Texto curto",
  textarea: "Texto longo",
  email: "Email",
  phone: "Telefone",
  number: "Numero",
  date: "Data",
  select: "Lista",
  checkbox: "Confirmacao"
};

const emptyField = (order: number): CustomFormField => ({
  id: "",
  label: "",
  type: "text",
  required: false,
  options: [],
  order
});

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

const exportResponsesCsv = (form: CustomForm, responses: CustomFormResponse[]) => {
  const headers = ["Enviado em", ...form.fields.map((field) => field.label)];
  const rows = responses.map((response) => [
    new Date(response.submittedAt).toLocaleString(),
    ...form.fields.map((field) => response.answers[field.id] || "")
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ecclesiaos-formulario-${form.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const FormsPage: React.FC<Props> = ({ token, user }) => {
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [responses, setResponses] = useState<CustomFormResponse[]>([]);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [formState, setFormState] = useState<CustomFormInput>(emptyForm);
  const [responseSearch, setResponseSearch] = useState("");
  const [responseStartDate, setResponseStartDate] = useState("");
  const [responseEndDate, setResponseEndDate] = useState("");
  const [status, setStatus] = useState("");

  const canManage = canManageModule(user.role, "forms");

  const refresh = async () => {
    const [formData, responseData, peopleData] = await Promise.all([loadCustomForms(token), loadCustomFormResponses(token), loadPeople(token)]);
    setForms(formData);
    setResponses(responseData);
    setPeople(peopleData);
  };

  useEffect(() => {
    refresh().catch(() => setStatus("Nao foi possivel carregar formularios."));
  }, [token]);

  const selectedForm = forms.find((form) => form.id === selectedFormId) || null;
  const selectedResponses = responses.filter((response) => response.formId === selectedFormId);
  const filteredResponses = selectedResponses.filter((response) => {
    const responseDate = response.submittedAt.slice(0, 10);
    const matchesStart = !responseStartDate || responseDate >= responseStartDate;
    const matchesEnd = !responseEndDate || responseDate <= responseEndDate;
    const search = responseSearch.trim().toLowerCase();
    const matchesSearch = !search || Object.values(response.answers).some((answer) => answer.toLowerCase().includes(search));
    return matchesStart && matchesEnd && matchesSearch;
  });
  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, `${person.firstName} ${person.lastName}`.trim()])), [people]);

  const publicLink = selectedForm ? `${window.location.origin}/forms/${selectedForm.slug}` : "";

  const selectForm = (form: CustomForm) => {
    setSelectedFormId(form.id);
    setFormState({
      title: form.title,
      description: form.description,
      slug: form.slug,
      responsiblePersonIds: form.responsiblePersonIds,
      fields: form.fields,
      isActive: form.isActive
    });
    setStatus("");
  };

  const startNewForm = () => {
    setSelectedFormId(null);
    setFormState(emptyForm);
    setStatus("");
  };

  const clearResponseFilters = () => {
    setResponseSearch("");
    setResponseStartDate("");
    setResponseEndDate("");
  };

  const toggleResponsible = (personId: string) => {
    setFormState((current) => ({
      ...current,
      responsiblePersonIds: current.responsiblePersonIds.includes(personId)
        ? current.responsiblePersonIds.filter((id) => id !== personId)
        : [...current.responsiblePersonIds, personId]
    }));
  };

  const addField = () => {
    setFormState((current) => ({ ...current, fields: [...current.fields, emptyField(current.fields.length + 1)] }));
  };

  const updateField = (index: number, field: keyof CustomFormField, value: string | boolean | string[]) => {
    setFormState((current) => ({
      ...current,
      fields: current.fields.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    }));
  };

  const removeField = (index: number) => {
    setFormState((current) => ({
      ...current,
      fields: current.fields.filter((_, itemIndex) => itemIndex !== index).map((field, itemIndex) => ({ ...field, order: itemIndex + 1 }))
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage) return;
    setStatus("Salvando formulario...");
    try {
      const saved = await saveCustomForm(token, formState, selectedFormId || undefined);
      await refresh();
      selectForm(saved);
      setStatus("Formulario salvo.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel salvar o formulario.");
    }
  };

  const handleDelete = async () => {
    if (!canManage || !selectedFormId || !window.confirm("Remover este formulario e suas respostas?")) return;
    await deleteCustomForm(token, selectedFormId);
    await refresh();
    startNewForm();
    setStatus("Formulario removido.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Operacao"
        icon={FileText}
        title="Formularios"
        description="Crie formularios publicos, defina responsaveis e acompanhe respostas."
        actions={canManage && <button className="secondary-button" type="button" onClick={startNewForm}><Plus size={16} /> Formulario</button>}
      />

      {status && <p className="form-status">{status}</p>}

      <div className="report-grid">
        <article><span>Formularios</span><strong>{forms.length}</strong></article>
        <article><span>Ativos</span><strong>{forms.filter((form) => form.isActive).length}</strong></article>
        <article><span>Respostas</span><strong>{responses.length}</strong></article>
        <article><span>Selecionado</span><strong>{selectedResponses.length}</strong></article>
      </div>

      <div className="people-layout">
        <Card className="people-list" aria-label="Lista de formularios">
          <h3>Formularios</h3>
          {forms.length === 0 ? <p className="muted">Nenhum formulario criado.</p> : forms.map((form) => (
            <button className={selectedFormId === form.id ? "person-row selected" : "person-row"} key={form.id} type="button" onClick={() => selectForm(form)}>
              <strong>{form.title}</strong>
              <span>{form.isActive ? "Ativo" : "Inativo"} - {responses.filter((response) => response.formId === form.id).length} resposta(s)</span>
            </button>
          ))}
        </Card>

        <form className="person-form" onSubmit={handleSubmit}>
          <label>Titulo<input disabled={!canManage} value={formState.title} onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))} /></label>
          <label>Slug<input disabled={!canManage} value={formState.slug} onChange={(event) => setFormState((current) => ({ ...current, slug: event.target.value }))} /></label>
          <label className="wide-field">Descricao<textarea disabled={!canManage} value={formState.description} onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} /></label>
          <label className="checkbox-inline wide-field">
            <input disabled={!canManage} type="checkbox" checked={formState.isActive} onChange={(event) => setFormState((current) => ({ ...current, isActive: event.target.checked }))} />
            Formulario ativo
          </label>

          <fieldset className="wide-field requested-teams">
            <legend>Responsaveis</legend>
            <div className="checkbox-grid">
              {people.map((person) => (
                <label key={person.id}>
                  <input disabled={!canManage} type="checkbox" checked={formState.responsiblePersonIds.includes(person.id)} onChange={() => toggleResponsible(person.id)} />
                  {person.firstName} {person.lastName}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="wide-field">
            <div className="section-title-row">
              <h3>Campos</h3>
              {canManage && <button className="secondary-button" type="button" onClick={addField}><Plus size={16} /> Campo</button>}
            </div>
            {formState.fields.length === 0 ? <p className="muted">Adicione campos para publicar este formulario.</p> : formState.fields.map((field, index) => (
              <div className="checklist-editor-row" key={`${field.id}-${index}`}>
                <label>Campo<input disabled={!canManage} value={field.label} onChange={(event) => updateField(index, "label", event.target.value)} /></label>
                <label>
                  Tipo
                  <select disabled={!canManage} value={field.type} onChange={(event) => updateField(index, "type", event.target.value)}>
                    {Object.entries(fieldTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="checkbox-inline">
                  <input disabled={!canManage} type="checkbox" checked={field.required} onChange={(event) => updateField(index, "required", event.target.checked)} />
                  Obrigatorio
                </label>
                <label>Opcoes<input disabled={!canManage || field.type !== "select"} value={field.options.join(", ")} onChange={(event) => updateField(index, "options", event.target.value.split(",").map((option) => option.trim()).filter(Boolean))} /></label>
                {canManage && <button className="danger-button wide-field" type="button" onClick={() => removeField(index)}><Trash2 size={16} /> Remover campo</button>}
              </div>
            ))}
          </div>

          {publicLink && (
            <div className="receipt-preview wide-field">
              <h3>Link publico</h3>
              <p><span>URL</span><strong>{publicLink}</strong></p>
              <p><span>Responsaveis</span><strong>{formState.responsiblePersonIds.map((id) => peopleById.get(id)).filter(Boolean).join(", ") || "Nenhum"}</strong></p>
            </div>
          )}

          <div className="form-footer">
            {canManage && <button type="submit">{selectedForm ? "Salvar formulario" : "Criar formulario"}</button>}
            {canManage && selectedForm && <button className="danger-button" type="button" onClick={handleDelete}><Trash2 size={16} /> Remover</button>}
          </div>
        </form>
      </div>

      {selectedForm && (
        <Card>
          <div className="section-title-row">
            <h3>Respostas de {selectedForm.title}</h3>
            <button className="secondary-button" type="button" onClick={() => exportResponsesCsv(selectedForm, filteredResponses)} disabled={filteredResponses.length === 0}>
              <Download size={16} /> Exportar CSV
            </button>
          </div>
          <div className="filter-bar">
            <label>Buscar<input value={responseSearch} onChange={(event) => setResponseSearch(event.target.value)} placeholder="Texto da resposta" /></label>
            <label>Inicio<input type="date" value={responseStartDate} onChange={(event) => setResponseStartDate(event.target.value)} /></label>
            <label>Fim<input type="date" value={responseEndDate} onChange={(event) => setResponseEndDate(event.target.value)} /></label>
            <button className="secondary-button" type="button" onClick={clearResponseFilters}>Limpar</button>
          </div>
          <p className="muted">{filteredResponses.length} de {selectedResponses.length} resposta(s) exibida(s).</p>
          {filteredResponses.length === 0 ? <p className="muted">Nenhuma resposta encontrada.</p> : filteredResponses.map((response) => (
            <article className="registration-row" key={response.id}>
              <button type="button">
                <strong>{new Date(response.submittedAt).toLocaleString()}</strong>
                {selectedForm.fields.map((field) => (
                  <span key={field.id}>{field.label}: {response.answers[field.id] || "-"}</span>
                ))}
              </button>
            </article>
          ))}
        </Card>
      )}
    </>
  );
};
