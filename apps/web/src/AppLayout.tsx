import React, { useEffect, useState } from "react";
import { canAccessModule } from "@ecclesiaos/shared";
import type { AppModuleKey, CurrentUser } from "@ecclesiaos/shared";
import {
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  BarChart3,
  FileText,
  Headphones,
  Heart,
  Home,
  KeyRound,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  Music,
  ScrollText,
  Sparkles,
  Users,
  UsersRound,
  Wallet,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { roleLabels } from "./constants";
import type { AppView } from "./types";

interface Props {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  user: CurrentUser;
  churchName?: string;
}

interface NavItem {
  label: string;
  module: AppModuleKey;
  view: AppView;
  icon: LucideIcon;
  group: "Operacao" | "Cadastros" | "Sistema";
}

const navItems: NavItem[] = [
  { label: "Inicio", module: "home", view: "home", icon: Home, group: "Operacao" },
  { label: "Calendario", module: "calendar", view: "calendar", icon: CalendarRange, group: "Operacao" },
  { label: "Check-in", module: "checkin", view: "checkin", icon: ClipboardCheck, group: "Operacao" },
  { label: "Escalas", module: "serving", view: "serving", icon: ClipboardList, group: "Operacao" },
  { label: "Culto", module: "serviceOps", view: "serviceOps", icon: Headphones, group: "Operacao" },
  { label: "Musicas", module: "music", view: "music", icon: Music, group: "Operacao" },
  { label: "Liturgia", module: "liturgy", view: "liturgy", icon: ListChecks, group: "Operacao" },
  { label: "Formularios", module: "forms", view: "forms", icon: FileText, group: "Operacao" },
  { label: "Mensagens", module: "messages", view: "messages", icon: MessageSquare, group: "Operacao" },
  { label: "Pessoas", module: "people", view: "people", icon: Users, group: "Cadastros" },
  { label: "Grupos", module: "groups", view: "groups", icon: UsersRound, group: "Cadastros" },
  { label: "Ambientes", module: "resources", view: "resources", icon: Sparkles, group: "Cadastros" },
  { label: "Igreja", module: "church", view: "church", icon: Heart, group: "Cadastros" },
  { label: "Financeiro", module: "finance", view: "finance", icon: Wallet, group: "Sistema" },
  { label: "Relatorios", module: "reports", view: "reports", icon: BarChart3, group: "Sistema" },
  { label: "Usuarios", module: "users", view: "users", icon: UsersRound, group: "Sistema" },
  { label: "Auditoria", module: "audit", view: "audit", icon: ScrollText, group: "Sistema" },
  { label: "Minha conta", module: "account", view: "account", icon: KeyRound, group: "Sistema" }
];

const groupOrder: NavItem["group"][] = ["Operacao", "Cadastros", "Sistema"];

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
};

export const AppLayout: React.FC<Props> = ({ children, currentView, onNavigate, onLogout, user, churchName }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNavItems = navItems.filter((item) => canAccessModule(user.role, item.module));
  const grouped = groupOrder
    .map((group) => ({ group, items: visibleNavItems.filter((item) => item.group === group) }))
    .filter((entry) => entry.items.length > 0);

  useEffect(() => {
    setSidebarOpen(false);
  }, [currentView]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("no-scroll");
      return () => document.body.classList.remove("no-scroll");
    }
    document.body.classList.remove("no-scroll");
    return undefined;
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Pular para o conteudo</a>
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} aria-label="Navegacao">
        <div className="sidebar-brand">
          <img className="sidebar-brand-logo" src="/ecclesia-os-logo-cropped.png" alt="EcclesiaOS" />
          <div className="sidebar-brand-text">
            <strong>EcclesiaOS</strong>
            <span>{churchName || "Painel"}</span>
          </div>
        </div>
        <div className="sidebar-scroll">
          {grouped.map(({ group, items }) => (
            <div className="nav-group" key={group}>
              <span className="nav-group-label">{group}</span>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    type="button"
                    className={`nav-item ${currentView === item.view ? "active" : ""}`}
                    aria-current={currentView === item.view ? "page" : undefined}
                    onClick={() => {
                      onNavigate(item.view);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon strokeWidth={2} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <button type="button" className="secondary-button" onClick={onLogout}>
            <LogOut /> Sair
          </button>
        </div>
      </aside>

      <header className="app-header">
        <div className="app-header-brand">
          <button
            type="button"
            className="menu-toggle"
            onClick={() => setSidebarOpen((current) => !current)}
            aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <img className="app-header-brand-logo" src="/ecclesia-os-logo-cropped.png" alt="" aria-hidden="true" />
          <div className="app-header-brand-text">
            <strong>{churchName || "EcclesiaOS"}</strong>
            <small>Painel administrativo</small>
          </div>
        </div>
        <div className="app-header-actions">
          <button
            type="button"
            className="app-header-user"
            onClick={() => onNavigate("account")}
            aria-label="Abrir minha conta"
          >
            <div className="app-header-user-avatar">{initials(user.name)}</div>
            <div className="app-header-user-text">
              <strong>{user.name}</strong>
              <span>{roleLabels[user.role]}</span>
            </div>
          </button>
        </div>
      </header>

      <main className="workspace" id="main-content">{children}</main>
    </div>
  );
};
