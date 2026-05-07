import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileText, Mail, MessageCircle, MessageSquare, Plus, Save, Search, Send, Trash2 } from "lucide-react";
import { canManageModule, messageVariableKeys, substituteMessageVariables } from "@ecclesiaos/shared";
import type { CurrentUser, GroupProfile, MessageChannel, MessageTemplate, MessageVariableContext, PeopleMessage, PersonProfile } from "@ecclesiaos/shared";
import { createMessageTemplate, deleteMessageTemplate, loadChurchProfile, loadEmailStatus, loadGroups, loadMessageTemplates, loadPeople, loadPeopleMessages, sendPeopleMessage, updateMessageTemplate } from "./api";
import { Avatar, Card, EmptyState, PageHeader, StatusPill } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

interface Filters {
  status: "all" | "member" | "visitor";
  email: "any" | "yes" | "no";
  phone: "any" | "yes" | "no";
  groupId: string;
  registeredAfter: string;
  search: string;
}

const emptyFilters: Filters = {
  status: "all",
  email: "any",
  phone: "any",
  groupId: "",
  registeredAfter: "",
  search: ""
};

const channelLabels: Record<MessageChannel, string> = {
  email: "Email (mailto)",
  whatsapp: "WhatsApp",
  manual: "Apenas registrar"
};

const sanitizePhone = (raw: string) => raw.replace(/\D/g, "");

const personContext = (person: PersonProfile, churchName: string): MessageVariableContext => ({
  firstName: person.firstName,
  lastName: person.lastName,
  email: person.email || "",
  phone: person.phone || "",
  churchName
});

const buildLink = (channel: MessageChannel, person: PersonProfile, subject: string, body: string, churchName: string): string | null => {
  const context = personContext(person, churchName);
  const renderedSubject = substituteMessageVariables(subject, context);
  const renderedBody = substituteMessageVariables(body, context);
  if (channel === "email") {
    if (!person.email) return null;
    const params = new URLSearchParams({ subject: renderedSubject, body: renderedBody });
    return `mailto:${person.email}?${params.toString()}`;
  }
  if (channel === "whatsapp") {
    const phone = sanitizePhone(person.phone || "");
    if (!phone) return null;
    const text = encodeURIComponent(`${renderedSubject ? `*${renderedSubject}*\n\n` : ""}${renderedBody}`);
    return `https://wa.me/${phone}?text=${text}`;
  }
  return null;
};

const variableLabels: Record<typeof messageVariableKeys[number], string> = {
  firstName: "Nome",
  lastName: "Sobrenome",
  fullName: "Nome completo",
  email: "Email",
  phone: "Telefone",
  churchName: "Igreja"
};

export const MessagesPage: React.FC<Props> = ({ token, user }) => {
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [messages, setMessages] = useState<PeopleMessage[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<MessageChannel>("whatsapp");
  const [status, setStatus] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<Array<{ name: string; url: string | null }>>([]);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [churchName, setChurchName] = useState("");

  const canSend = canManageModule(user.role, "messages");

  useEffect(() => {
    loadPeople(token).then(setPeople).catch(() => setStatus("Nao foi possivel carregar pessoas."));
    loadGroups(token).then(setGroups).catch(() => setStatus("Nao foi possivel carregar grupos."));
    loadPeopleMessages(token).then(setMessages).catch(() => setStatus("Nao foi possivel carregar mensagens."));
    loadMessageTemplates(token).then(setTemplates).catch(() => undefined);
    loadChurchProfile(token).then((profile) => setChurchName(profile.name || "")).catch(() => undefined);
    loadEmailStatus().then((info) => setEmailConfigured(info.configured)).catch(() => setEmailConfigured(false));
  }, [token]);

  const groupMemberSet = useMemo(() => {
    if (!filters.groupId) return null;
    const group = groups.find((item) => item.id === filters.groupId);
    return group ? new Set(group.memberPersonIds) : new Set<string>();
  }, [groups, filters.groupId]);

  const filteredPeople = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const after = filters.registeredAfter ? new Date(filters.registeredAfter).getTime() : null;
    return people.filter((person) => {
      if (filters.status !== "all" && person.status !== filters.status) return false;
      if (filters.email === "yes" && !person.email) return false;
      if (filters.email === "no" && person.email) return false;
      if (filters.phone === "yes" && !person.phone) return false;
      if (filters.phone === "no" && person.phone) return false;
      if (groupMemberSet && !groupMemberSet.has(person.id)) return false;
      if (after !== null) {
        const ts = new Date(person.createdAt || "").getTime();
        if (Number.isNaN(ts) || ts < after) return false;
      }
      if (search) {
        const haystack = `${person.firstName} ${person.lastName} ${person.email}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [people, filters, groupMemberSet]);

  const togglePerson = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const selectAllFiltered = () => setSelectedIds(filteredPeople.map((person) => person.id));
  const clearSelection = () => setSelectedIds([]);

  const selectedPeople = useMemo(() => people.filter((person) => selectedIds.includes(person.id)), [people, selectedIds]);

  const handleSend = async () => {
    if (!canSend) return;
    if (!subject.trim() || selectedIds.length === 0) {
      setStatus("Preencha o assunto e selecione ao menos uma pessoa.");
      return;
    }

    setStatus("Registrando envio...");
    try {
      const result = await sendPeopleMessage(token, { subject, body, channel, recipientPersonIds: selectedIds });
      setMessages((current) => [result.message, ...current]);
      setSelectedMessageId(result.message.id);

      const sentByProvider = channel === "email" && result.delivery.sent > 0;

      if (sentByProvider) {
        setGeneratedLinks([]);
        setStatus(`Email enviado via Resend para ${result.delivery.sent} pessoa(s) (${result.delivery.skipped} sem email, ${result.delivery.failed} falha(s)).`);
      } else {
        const links = selectedPeople.map((person) => ({
          name: `${person.firstName} ${person.lastName}`.trim(),
          url: buildLink(channel, person, subject, body, churchName)
        }));
        setGeneratedLinks(links);
        const firstLink = links.find((link) => link.url);
        if (firstLink?.url && channel !== "manual") {
          window.open(firstLink.url, "_blank");
        }
        const reasonLabel = result.delivery.reason === "not_configured"
          ? " (provedor de email nao configurado)"
          : "";
        setStatus(`Mensagem registrada para ${selectedIds.length} pessoa(s)${reasonLabel}.`);
      }
    } catch (error) {
      const message = error instanceof Error && error.message === "forbidden"
        ? "Apenas admin ou lider pode enviar mensagens."
        : "Nao foi possivel registrar a mensagem.";
      setStatus(message);
    }
  };

  const selectedMessage = messages.find((message) => message.id === selectedMessageId) || null;
  const personById = (id: string) => people.find((person) => person.id === id);

  const loadTemplate = (id: string) => {
    setSelectedTemplateId(id);
    if (!id) return;
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setSubject(template.subject);
    setBody(template.body);
    setChannel(template.channel);
    setStatus(`Template "${template.name}" carregado.`);
  };

  const handleSaveTemplate = async () => {
    if (!canSend) return;
    const existing = templates.find((template) => template.id === selectedTemplateId);
    const defaultName = existing?.name || subject || "Novo template";
    const name = window.prompt("Nome do template:", defaultName);
    if (!name?.trim()) return;

    setStatus("Salvando template...");
    try {
      const payload = { name: name.trim(), channel, subject, body };
      const result = existing
        ? await updateMessageTemplate(token, existing.id, payload)
        : await createMessageTemplate(token, payload);
      setTemplates((current) => {
        const without = current.filter((template) => template.id !== result.id);
        return [...without, result].sort((a, b) => a.name.localeCompare(b.name));
      });
      setSelectedTemplateId(result.id);
      setStatus(existing ? "Template atualizado." : "Template criado.");
    } catch {
      setStatus("Nao foi possivel salvar o template.");
    }
  };

  const handleDeleteTemplate = async () => {
    if (!canSend || !selectedTemplateId) return;
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (!template) return;
    if (!window.confirm(`Excluir o template "${template.name}"?`)) return;
    setStatus("Removendo template...");
    try {
      await deleteMessageTemplate(token, template.id);
      setTemplates((current) => current.filter((item) => item.id !== template.id));
      setSelectedTemplateId("");
      setStatus("Template removido.");
    } catch {
      setStatus("Nao foi possivel remover o template.");
    }
  };

  const insertVariable = (key: string) => {
    const placeholder = `{{${key}}}`;
    setBody((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${placeholder}`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Operacao"
        icon={MessageSquare}
        title="Mensagens"
        description="Filtre pessoas, componha mensagens em lote e registre o envio. Sem provedor de email, usamos WhatsApp e mailto do dispositivo."
      />

      <div className={`email-status-banner ${emailConfigured ? "configured" : "fallback"}`}>
        {emailConfigured ? (
          <>
            <CheckCircle2 size={16} />
            <span>Provedor de email configurado. Mensagens com canal "Email" sao enviadas via Resend.</span>
          </>
        ) : (
          <>
            <Mail size={16} />
            <span>Sem provedor de email. Canal "Email" abre o cliente padrao do dispositivo via mailto.</span>
          </>
        )}
      </div>

      {status && <p className="muted" style={{ marginBottom: "var(--space-4)" }}>{status}</p>}

      <div className="messages-layout">
        <Card>
          <h3>Filtros</h3>
          <div className="messages-filters">
            <label>
              Status
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as Filters["status"] })}>
                <option value="all">Todos</option>
                <option value="member">Membros</option>
                <option value="visitor">Visitantes</option>
              </select>
            </label>
            <label>
              Email
              <select value={filters.email} onChange={(event) => setFilters({ ...filters, email: event.target.value as Filters["email"] })}>
                <option value="any">Qualquer</option>
                <option value="yes">Tem email</option>
                <option value="no">Sem email</option>
              </select>
            </label>
            <label>
              Telefone
              <select value={filters.phone} onChange={(event) => setFilters({ ...filters, phone: event.target.value as Filters["phone"] })}>
                <option value="any">Qualquer</option>
                <option value="yes">Tem telefone</option>
                <option value="no">Sem telefone</option>
              </select>
            </label>
            <label>
              Grupo
              <select value={filters.groupId} onChange={(event) => setFilters({ ...filters, groupId: event.target.value })}>
                <option value="">Qualquer grupo</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </label>
            <label>
              Cadastrado depois de
              <input type="date" value={filters.registeredAfter} onChange={(event) => setFilters({ ...filters, registeredAfter: event.target.value })} />
            </label>
            <label className="wide-field">
              Busca
              <div className="checkin-search">
                <Search size={16} className="checkin-search-icon" />
                <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Nome ou email..." />
              </div>
            </label>
          </div>

          <div className="messages-toolbar">
            <span>{filteredPeople.length} pessoa(s) com os filtros</span>
            <span>{selectedIds.length} selecionada(s)</span>
            <button className="secondary-button" type="button" onClick={selectAllFiltered}>Selecionar tudo</button>
            <button className="secondary-button" type="button" onClick={clearSelection}>Limpar</button>
            <button className="secondary-button" type="button" onClick={() => setFilters(emptyFilters)}>Resetar filtros</button>
          </div>

          <div className="messages-people">
            {filteredPeople.length === 0 ? (
              <EmptyState icon={MessageSquare} title="Nenhuma pessoa atende aos filtros" description="Ajuste os filtros para ver pessoas." />
            ) : filteredPeople.map((person) => {
              const checked = selectedIds.includes(person.id);
              return (
                <label key={person.id} className={`messages-person ${checked ? "selected" : ""}`}>
                  <input type="checkbox" checked={checked} onChange={() => togglePerson(person.id)} />
                  <Avatar name={`${person.firstName} ${person.lastName}`} size="sm" tone="brand" />
                  <div className="messages-person-text">
                    <strong>{person.firstName} {person.lastName}</strong>
                    <span>{person.email || "Sem email"} - {person.phone || "Sem telefone"}</span>
                  </div>
                  <StatusPill tone={person.status === "member" ? "success" : "info"}>
                    {person.status === "member" ? "Membro" : "Visitante"}
                  </StatusPill>
                </label>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3>Compor mensagem</h3>
          <div className="messages-compose">
            <div className="messages-template-row">
              <label className="wide-field">
                <FileText size={14} /> Modelo
                <select value={selectedTemplateId} onChange={(event) => loadTemplate(event.target.value)}>
                  <option value="">Sem modelo</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>{template.name} ({channelLabels[template.channel]})</option>
                  ))}
                </select>
              </label>
              <div className="response-actions">
                <button className="secondary-button" type="button" onClick={handleSaveTemplate} disabled={!canSend}>
                  <Save size={14} /> {selectedTemplateId ? "Atualizar" : "Salvar como modelo"}
                </button>
                {selectedTemplateId && (
                  <button className="danger-outline-button" type="button" onClick={handleDeleteTemplate} disabled={!canSend}>
                    <Trash2 size={14} /> Excluir
                  </button>
                )}
                {!selectedTemplateId && canSend && (
                  <button className="secondary-button" type="button" onClick={() => { setSubject(""); setBody(""); setStatus(""); }}>
                    <Plus size={14} /> Limpar
                  </button>
                )}
              </div>
            </div>
            <div className="messages-variables">
              <span className="muted">Variaveis:</span>
              {messageVariableKeys.map((key) => (
                <button key={key} type="button" className="secondary-button" onClick={() => insertVariable(key)} disabled={!canSend}>
                  {variableLabels[key]}
                </button>
              ))}
            </div>
            <label>
              Canal
              <select value={channel} onChange={(event) => setChannel(event.target.value as MessageChannel)} disabled={!canSend}>
                {Object.entries(channelLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              Assunto
              <input value={subject} onChange={(event) => setSubject(event.target.value)} disabled={!canSend} placeholder="Ex.: Convite ao culto de domingo" />
            </label>
            <label>
              Mensagem
              <textarea rows={6} value={body} onChange={(event) => setBody(event.target.value)} disabled={!canSend} placeholder="Escreva o corpo da mensagem... use {{firstName}} para personalizar." />
            </label>
            <div className="form-footer">
              <button type="button" onClick={handleSend} disabled={!canSend || selectedIds.length === 0}>
                <Send size={16} /> {channel === "manual" ? "Registrar" : "Enviar"} ({selectedIds.length})
              </button>
              {!canSend && <p className="muted">Apenas admin ou lider pode enviar mensagens.</p>}
            </div>

            {generatedLinks.length > 0 && channel !== "manual" && (
              <div className="messages-links">
                <h4>Links abertos</h4>
                <p className="muted">Clique em cada um para enviar individualmente. O primeiro ja foi aberto numa nova aba.</p>
                {generatedLinks.map((link, index) => (
                  <p className="report-row" key={index}>
                    <span>{link.name}</span>
                    {link.url ? (
                      <a className="secondary-link" href={link.url} target="_blank" rel="noreferrer">
                        {channel === "email" ? <Mail size={14} /> : <MessageCircle size={14} />} Abrir
                      </a>
                    ) : (
                      <span className="muted">Sem dado para o canal escolhido</span>
                    )}
                  </p>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3>Historico</h3>
        {messages.length === 0 ? (
          <EmptyState icon={MessageSquare} title="Nenhuma mensagem registrada" description="As mensagens enviadas aparecerao aqui." />
        ) : (
          <div className="messages-history">
            {messages.map((message) => (
              <button
                key={message.id}
                type="button"
                className={`messages-history-row ${selectedMessageId === message.id ? "selected" : ""}`}
                onClick={() => setSelectedMessageId(message.id)}
              >
                <div>
                  <strong>{message.subject}</strong>
                  <span>{new Date(message.createdAt).toLocaleString("pt-BR")} - {message.createdByName}</span>
                </div>
                <StatusPill tone="info">{message.recipientPersonIds.length} destinatario(s)</StatusPill>
              </button>
            ))}
          </div>
        )}

        {selectedMessage && (
          <div className="messages-detail">
            <h4>{selectedMessage.subject}</h4>
            <p className="muted">{channelLabels[selectedMessage.channel]} - {new Date(selectedMessage.createdAt).toLocaleString("pt-BR")} - {selectedMessage.createdByName}</p>
            <pre className="messages-body">{selectedMessage.body || "(sem corpo)"}</pre>
            <h5>Destinatarios</h5>
            <div className="messages-recipients">
              {selectedMessage.recipientPersonIds.map((id) => {
                const person = personById(id);
                const name = person ? `${person.firstName} ${person.lastName}` : `Pessoa ${id}`;
                return (
                  <span key={id} className="messages-recipient">
                    <Avatar name={name} size="sm" tone="muted" />
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </>
  );
};
