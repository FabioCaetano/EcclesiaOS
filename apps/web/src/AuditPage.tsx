import React, { useEffect, useMemo, useState } from "react";
import type { AuditAction, AuditLogEntry, CurrentUser } from "@ecclesiaos/shared";
import { loadAuditLogs } from "./api";

interface Props {
  token: string;
  user: CurrentUser;
}

const actionLabels: Record<AuditAction, string> = {
  create: "Criacao",
  update: "Atualizacao",
  delete: "Remocao"
};

export const AuditPage: React.FC<Props> = ({ token, user }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actorFilter, setActorFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadAuditLogs(token)
      .then(setLogs)
      .catch(() => setStatus("Nao foi possivel carregar auditoria."));
  }, [token]);

  const entityTypes = useMemo(() => [...new Set(logs.map((log) => log.entityType))].sort(), [logs]);
  const actors = useMemo(() => [...new Set(logs.map((log) => log.actorName))].sort(), [logs]);
  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entityType === entityFilter;
    const matchesActor = actorFilter === "all" || log.actorName === actorFilter;
    const matchesDate = !dateFilter || log.createdAt.startsWith(dateFilter);
    const haystack = `${log.summary} ${log.entityType} ${log.entityId} ${log.actorName}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    return matchesAction && matchesEntity && matchesActor && matchesDate && matchesSearch;
  });

  const todayCount = logs.filter((log) => log.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length;
  const updateCount = logs.filter((log) => log.action === "update").length;
  const deleteCount = logs.filter((log) => log.action === "delete").length;

  if (user.role !== "admin") {
    return (
      <section className="panel">
        <p className="eyebrow">Auditoria</p>
        <h2>Acesso restrito</h2>
        <p>Somente administradores podem consultar auditoria.</p>
      </section>
    );
  }

  return (
    <section className="panel audit-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Auditoria</p>
          <h2>Historico de alteracoes</h2>
        </div>
        <span className="profile-pill">{filteredLogs.length} registro(s)</span>
      </div>

      <div className="report-grid">
        <article><span>Total</span><strong>{logs.length}</strong></article>
        <article><span>Hoje</span><strong>{todayCount}</strong></article>
        <article><span>Atualizacoes</span><strong>{updateCount}</strong></article>
        <article><span>Remocoes</span><strong>{deleteCount}</strong></article>
      </div>

      <div className="filter-bar audit-filter-bar">
        <label>
          Acao
          <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value as AuditAction | "all")}>
            <option value="all">Todas</option>
            <option value="create">Criacao</option>
            <option value="update">Atualizacao</option>
            <option value="delete">Remocao</option>
          </select>
        </label>
        <label>
          Entidade
          <select value={entityFilter} onChange={(event) => setEntityFilter(event.target.value)}>
            <option value="all">Todas</option>
            {entityTypes.map((entity) => <option key={entity} value={entity}>{entity}</option>)}
          </select>
        </label>
        <label>
          Usuario
          <select value={actorFilter} onChange={(event) => setActorFilter(event.target.value)}>
            <option value="all">Todos</option>
            {actors.map((actor) => <option key={actor} value={actor}>{actor}</option>)}
          </select>
        </label>
        <label>Data<input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /></label>
        <label>Busca<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Resumo, entidade ou id" /></label>
        <button className="secondary-button" type="button" onClick={() => {
          setActionFilter("all");
          setEntityFilter("all");
          setActorFilter("all");
          setDateFilter("");
          setSearch("");
        }}>Limpar</button>
      </div>

      {status && <p className="muted">{status}</p>}

      <div className="audit-list">
        {filteredLogs.length === 0 ? <p className="muted">Sem registros para os filtros atuais.</p> : filteredLogs.map((log) => (
          <article className={`audit-row ${log.action}`} key={log.id}>
            <div>
              <strong>{actionLabels[log.action]} - {log.entityType}</strong>
              <span>{log.summary}</span>
              <small>{log.entityId}</small>
            </div>
            <div>
              <strong>{log.actorName}</strong>
              <span>{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
