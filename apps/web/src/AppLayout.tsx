import React from "react";
import { canAccessModule } from "@ecclesiaos/shared";
import type { AppModuleKey, CurrentUser } from "@ecclesiaos/shared";
import { roleLabels } from "./constants";
import type { AppView } from "./types";

interface Props {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  user: CurrentUser;
}

const navItems: Array<{ label: string; module: AppModuleKey; view: AppView }> = [
  { label: "Inicio", module: "home", view: "home" },
  { label: "Igreja", module: "church", view: "church" },
  { label: "Pessoas", module: "people", view: "people" },
  { label: "Grupos", module: "groups", view: "groups" },
  { label: "Agenda", module: "events", view: "events" },
  { label: "Check-in", module: "checkin", view: "checkin" },
  { label: "Ambientes", module: "resources", view: "resources" },
  { label: "Calendario", module: "calendar", view: "calendar" },
  { label: "Escalas", module: "serving", view: "serving" },
  { label: "Financeiro", module: "finance", view: "finance" },
  { label: "Usuarios", module: "users", view: "users" },
  { label: "Auditoria", module: "audit", view: "audit" }
];

export const AppLayout: React.FC<Props> = ({ children, currentView, onNavigate, onLogout, user }) => {
  const visibleNavItems = navItems.filter((item) => canAccessModule(user.role, item.module));

  return (
    <main className="app-frame">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">EcclesiaOS</p>
          <h1>Painel</h1>
        </div>

        <nav className="main-nav" aria-label="Navegacao principal">
          {visibleNavItems.map((item) => (
            <button className={currentView === item.view ? "active" : ""} key={item.view} type="button" onClick={() => onNavigate(item.view)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <strong>{user.name}</strong>
          <span>{roleLabels[user.role]}</span>
          <button type="button" onClick={onLogout}>Sair</button>
        </div>
      </aside>

      <section className="workspace">
        {children}
      </section>
    </main>
  );
};
