import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Download, Eye, EyeOff, FileText, Plus, Settings, Trash2, X } from "lucide-react";
import { canManageModule } from "@ecclesiaos/shared";
import type { CurrentUser, CustomForm, CustomFormField, CustomFormInput, CustomFormResponse, PersonProfile } from "@ecclesiaos/shared";
import { deleteCustomForm, loadCustomFormResponses, loadCustomForms, loadPeople, saveCustomForm } from "./api";
import { Card, PageHeader } from "./ui";

const PEOPLE_DATALIST_ID = "forms-people-options";

const personFullName = (person: PersonProfile) => `${person.firstName} ${person.lastName}`.trim();

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

const exportFormSummaryCsv = (form: CustomForm, responses: CustomFormResponse[]) => {
  const rows = form.fields.map((field) => {
    const answers = responses.map((response) => response.answers[field.id] || "").filter(Boolean);
    const uniqueAnswers = new Set(answers);
    const topAnswer = [...answers.reduce((acc, answer) => acc.set(answer, (acc.get(answer) || 0) + 1), new Map<string, number>()).entries()]
      .sort((a, b) => b[1] - a[1])[0];
    return [
      field.label,
      fieldTypeLabels[field.type],
      String(answers.length),
      `${Math.round((answers.length / Math.max(responses.length, 1)) * 100)}%`,
      String(uniqueAnswers.size),
      topAnswer ? `${topAnswer[0]} (${topAnswer[1]})` : ""
    ];
  });
  const csv = [["Campo", "Tipo", "Respostas preenchidas", "Taxa de preenchimento", "Respostas unicas", "Resposta mais comum"], ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ecclesiaos-relatorio-formulario-${form.slug}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const formatPercent = (value: number, total: number) => `${Math.round((value / Math.max(total, 1)) * 100)}%`;

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
  const [responsibleInput, setResponsibleInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
  const responsesByForm = useMemo(() => forms.map((form) => ({
    form,
    responses: responses.filter((response) => response.formId === form.id)
  })).sort((a, b) => b.responses.length - a.responses.length), [forms, responses]);
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const recentResponses = responses.filter((response) => new Date(response.submittedAt) >= sevenDaysAgo);
  const latestResponse = [...responses].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
  const latestResponseForm = latestResponse ? forms.find((form) => form.id === latestResponse.formId) : null;
  const selectedFieldReports = selectedForm ? selectedForm.fields.map((field) => {
    const answers = filteredResponses.map((response) => response.answers[field.id] || "").filter(Boolean);
    const counts = [...answers.reduce((acc, answer) => acc.set(answer, (acc.get(answer) || 0) + 1), new Map<string, number>()).entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return {
      field,
      answered: answers.length,
      skipped: filteredResponses.length - answers.length,
      unique: new Set(answers).size,
      counts
    };
  }) : [];

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

  const peopleByName = useMemo(() => {
    const map = new Map<string, string>();
    people.forEach((person) => {
      const name = personFullName(person);
      if (name) map.set(name.toLowerCase(), person.id);
    });
    return map;
  }, [people]);

  const removeResponsible = (personId: string) => {
    setFormState((current) => ({
      ...current,
      responsiblePersonIds: current.responsiblePersonIds.filter((id) => id !== personId)
    }));
  };

  const submitResponsibleInput = () => {
    const trimmed = responsibleInput.trim();
    if (!trimmed) return;
    const matchedId = peopleByName.get(trimmed.toLowerCase());
    if (!matchedId) {
      setStatus("Pessoa nao encontrada na lista.");
      return;
    }
    setFormState((current) => current.responsiblePersonIds.includes(matchedId)
      ? current
      : { ...current, responsiblePersonIds: [...current.responsiblePersonIds, matchedId] }
    );
    setResponsibleInput("");
    setStatus("");
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

  const moveField = (index: number, direction: -1 | 1) => {
    setFormState((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.fields.length) return current;
      const next = [...current.fields];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return {
        ...current,
        fields: next.map((field, idx) => ({ ...field, order: idx + 1 }))
      };
    });
  };

  const addFieldOption = (index: number) => {
    setFormState((current) => ({
      ...current,
      fields: current.fields.map((item, itemIndex) => itemIndex === index ? { ...item, options: [...item.options, ""] } : item)
    }));
  };

  const updateFieldOption = (fieldIndex: number, optionIndex: number, value: string) => {
    setFormState((current) => ({
      ...current,
      fields: current.fields.map((item, itemIndex) => itemIndex === fieldIndex
        ? { ...item, options: item.options.map((option, optIdx) => optIdx === optionIndex ? value : option) }
        : item)
    }));
  };

  const removeFieldOption = (fieldIndex: number, optionIndex: number) => {
    setFormState((current) => ({
      ...current,
      fields: current.fields.map((item, itemIndex) => itemIndex === fieldIndex
        ? { ...item, options: item.options.filter((_, optIdx) => optIdx !== optionIndex) }
        : item)
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
        <article><span>Ultimos 7 dias</span><strong>{recentResponses.length}</strong></article>
      </div>

      <div className="report-columns">
        <Card>
          <h3>Formularios por volume</h3>
          {responsesByForm.length === 0 ? <p className="muted">Nenhum formulario para analisar.</p> : responsesByForm.slice(0, 5).map(({ form, responses: formResponses }) => (
            <p className="report-row" key={form.id}>
              <span>{form.title}</span>
              <strong>{formResponses.length} resposta(s)</strong>
            </p>
          ))}
        </Card>
        <Card>
          <h3>Atividade recente</h3>
          <p className="report-row"><span>Ultima resposta</span><strong>{latestResponse ? new Date(latestResponse.submittedAt).toLocaleString() : "Nenhuma"}</strong></p>
          <p className="report-row"><span>Formulario</span><strong>{latestResponseForm?.title || "Nenhum"}</strong></p>
          <p className="report-row"><span>Taxa ativa</span><strong>{formatPercent(forms.filter((form) => form.isActive).length, forms.length)}</strong></p>
        </Card>
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

        <form className="person-form forms-builder" onSubmit={handleSubmit}>
          <label className="wide-field forms-builder-title">
            Titulo
            <input disabled={!canManage} placeholder="Titulo visivel para quem responde" value={formState.title} onChange={(event) => setFormState((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label className="wide-field">
            Descricao
            <textarea disabled={!canManage} rows={2} placeholder="Resumo opcional acima do formulario..." value={formState.description} onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))} />
          </label>
          <label className="checkbox-inline wide-field">
            <input disabled={!canManage} type="checkbox" checked={formState.isActive} onChange={(event) => setFormState((current) => ({ ...current, isActive: event.target.checked }))} />
            Formulario ativo
          </label>

          <datalist id={PEOPLE_DATALIST_ID}>
            {people.map((person) => <option key={person.id} value={personFullName(person)} />)}
          </datalist>

          <fieldset className="wide-field forms-responsibles">
            <legend>Responsaveis</legend>
            <div className="forms-people-chips">
              {formState.responsiblePersonIds.length === 0 ? <span className="muted">Nenhum responsavel selecionado.</span> : formState.responsiblePersonIds.map((personId) => (
                <span className="forms-chip" key={personId}>
                  {peopleById.get(personId) || "Pessoa removida"}
                  {canManage && <button className="forms-chip-remove" type="button" aria-label="Remover responsavel" onClick={() => removeResponsible(personId)}><X size={12} /></button>}
                </span>
              ))}
            </div>
            {canManage && (
              <div className="forms-people-input">
                <input
                  list={PEOPLE_DATALIST_ID}
                  placeholder="Buscar pessoa..."
                  value={responsibleInput}
                  onChange={(event) => setResponsibleInput(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); submitResponsibleInput(); } }}
                />
                <button className="secondary-button" type="button" onClick={submitResponsibleInput} disabled={!responsibleInput.trim()}>
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            )}
          </fieldset>

          <div className="wide-field">
            <div className="section-title-row">
              <h3>Campos</h3>
              {canManage && <button className="secondary-button" type="button" onClick={addField}><Plus size={16} /> Campo</button>}
            </div>
            {formState.fields.length === 0 ? <p className="muted">Adicione campos para publicar este formulario.</p> : (
              <div className="forms-fields-list">
                <div className="forms-fields-header">
                  <span>Campo</span>
                  <span>Tipo</span>
                  <span>Obrigatorio</span>
                  <span aria-label="Ordem" />
                  <span aria-label="Acoes" />
                </div>
                {formState.fields.map((field, index) => (
                  <div className="forms-field-block" key={`${field.id}-${index}`}>
                    <div className="forms-field-row">
                      <input className="forms-field-cell" disabled={!canManage} placeholder="Pergunta..." value={field.label} onChange={(event) => updateField(index, "label", event.target.value)} />
                      <select className="forms-field-cell" disabled={!canManage} value={field.type} onChange={(event) => {
                        const nextType = event.target.value as CustomFormField["type"];
                        updateField(index, "type", nextType);
                        if (nextType !== "select") {
                          updateField(index, "options", []);
                        }
                      }}>
                        {Object.entries(fieldTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <label className="checkbox-inline forms-field-required">
                        <input disabled={!canManage} type="checkbox" checked={field.required} onChange={(event) => updateField(index, "required", event.target.checked)} />
                        <span>Obrigatorio</span>
                      </label>
                      <div className="forms-field-order">
                        <button type="button" className="icon-button" aria-label="Mover para cima" disabled={!canManage || index === 0} onClick={() => moveField(index, -1)} title="Mover para cima"><ChevronUp size={14} /></button>
                        <button type="button" className="icon-button" aria-label="Mover para baixo" disabled={!canManage || index === formState.fields.length - 1} onClick={() => moveField(index, 1)} title="Mover para baixo"><ChevronDown size={14} /></button>
                      </div>
                      {canManage ? (
                        <button type="button" className="icon-button danger" aria-label="Remover campo" onClick={() => removeField(index)} title="Remover campo"><Trash2 size={14} /></button>
                      ) : <span />}
                    </div>
                    {field.type === "select" && (
                      <div className="forms-field-options">
                        <span className="muted">Opcoes</span>
                        {field.options.length === 0 && <span className="muted">Adicione ao menos uma opcao.</span>}
                        {field.options.map((option, optionIndex) => (
                          <span className="forms-option-chip" key={optionIndex}>
                            <input disabled={!canManage} value={option} placeholder="Texto da opcao" onChange={(event) => updateFieldOption(index, optionIndex, event.target.value)} />
                            {canManage && <button type="button" className="forms-chip-remove" aria-label="Remover opcao" onClick={() => removeFieldOption(index, optionIndex)}><X size={12} /></button>}
                          </span>
                        ))}
                        {canManage && <button type="button" className="secondary-button" onClick={() => addFieldOption(index)}><Plus size={14} /> Opcao</button>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="wide-field collapsible-card">
            <button type="button" className="collapsible-toggle" onClick={() => setShowPreview((current) => !current)}>
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>Preview do publico</span>
              {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showPreview && (
              <div className="forms-preview">
                <h3>{formState.title || "Sem titulo"}</h3>
                {formState.description && <p className="muted">{formState.description}</p>}
                {formState.fields.length === 0 ? <p className="muted">Sem campos.</p> : formState.fields.map((field) => (
                  <label className="forms-preview-field" key={`preview-${field.id}-${field.order}`}>
                    <span>{field.label || "Sem rotulo"}{field.required ? " *" : ""}</span>
                    {field.type === "textarea" ? <textarea disabled rows={2} placeholder="Resposta..." /> :
                      field.type === "select" ? (
                        <select disabled>
                          <option value="">Selecione</option>
                          {field.options.map((option, idx) => <option key={idx} value={option}>{option}</option>)}
                        </select>
                      ) :
                      field.type === "checkbox" ? <input type="checkbox" disabled /> :
                      <input
                        type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                        disabled
                        placeholder="Resposta..."
                      />
                    }
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="wide-field collapsible-card">
            <button type="button" className="collapsible-toggle" onClick={() => setShowSettings((current) => !current)}>
              <Settings size={14} />
              <span>Configuracoes</span>
              {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showSettings && (
              <div className="collapsible-body">
                <label>Slug<input disabled={!canManage} value={formState.slug} onChange={(event) => setFormState((current) => ({ ...current, slug: event.target.value }))} /></label>
                {publicLink && (
                  <div className="receipt-preview">
                    <h3>Link publico</h3>
                    <p><span>URL</span><strong>{publicLink}</strong></p>
                    <p><span>Responsaveis</span><strong>{formState.responsiblePersonIds.map((id) => peopleById.get(id)).filter(Boolean).join(", ") || "Nenhum"}</strong></p>
                  </div>
                )}
              </div>
            )}
          </div>

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
            <div className="button-row">
              <button className="secondary-button" type="button" onClick={() => exportFormSummaryCsv(selectedForm, filteredResponses)} disabled={filteredResponses.length === 0}>
                <Download size={16} /> Relatorio CSV
              </button>
              <button className="secondary-button" type="button" onClick={() => exportResponsesCsv(selectedForm, filteredResponses)} disabled={filteredResponses.length === 0}>
                <Download size={16} /> Respostas CSV
              </button>
            </div>
          </div>
          <div className="filter-bar">
            <label>Buscar<input value={responseSearch} onChange={(event) => setResponseSearch(event.target.value)} placeholder="Texto da resposta" /></label>
            <label>Inicio<input type="date" value={responseStartDate} onChange={(event) => setResponseStartDate(event.target.value)} /></label>
            <label>Fim<input type="date" value={responseEndDate} onChange={(event) => setResponseEndDate(event.target.value)} /></label>
            <button className="secondary-button" type="button" onClick={clearResponseFilters}>Limpar</button>
          </div>
          <p className="muted">{filteredResponses.length} de {selectedResponses.length} resposta(s) exibida(s).</p>
          <div className="report-grid">
            <article><span>Filtradas</span><strong>{filteredResponses.length}</strong></article>
            <article><span>Total</span><strong>{selectedResponses.length}</strong></article>
            <article><span>Campos</span><strong>{selectedForm.fields.length}</strong></article>
            <article><span>Preenchimento medio</span><strong>{formatPercent(selectedFieldReports.reduce((sum, report) => sum + report.answered, 0), selectedFieldReports.length * filteredResponses.length)}</strong></article>
          </div>
          {selectedFieldReports.length > 0 && (
            <div className="report-columns">
              {selectedFieldReports.map((report) => (
                <section className="receipt-preview" key={report.field.id}>
                  <p className="eyebrow">{fieldTypeLabels[report.field.type]}</p>
                  <h3>{report.field.label}</h3>
                  <p><span>Preenchidas</span><strong>{report.answered} ({formatPercent(report.answered, filteredResponses.length)})</strong></p>
                  <p><span>Vazias</span><strong>{report.skipped}</strong></p>
                  <p><span>Respostas unicas</span><strong>{report.unique}</strong></p>
                  {report.counts.length > 0 && (
                    <div>
                      <p className="muted">Mais comuns</p>
                      {report.counts.map(([answer, count]) => (
                        <p className="report-row" key={answer}><span>{answer}</span><strong>{count}</strong></p>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
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
