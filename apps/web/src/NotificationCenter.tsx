import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CalendarRange, ClipboardList, FileText, MailWarning } from "lucide-react";
import type { CurrentUser, NotificationItem, NotificationKind } from "@ecclesiaos/shared";
import { loadNotifications } from "./api";
import type { AppView } from "./types";

interface Props {
  token: string;
  user: CurrentUser;
  onNavigate: (view: AppView) => void;
}

const KIND_LABELS: Record<NotificationKind, string> = {
  serving_pending: "Escalas pendentes",
  serving_declined: "Substitutos necessarios",
  event_upcoming: "Eventos proximos",
  registration_email_pending: "Inscricoes aguardando email"
};

const KIND_ICON: Record<NotificationKind, React.ComponentType<{ size?: number }>> = {
  serving_pending: ClipboardList,
  serving_declined: ClipboardList,
  event_upcoming: CalendarRange,
  registration_email_pending: MailWarning
};

const KIND_ORDER: NotificationKind[] = ["serving_pending", "serving_declined", "registration_email_pending", "event_upcoming"];

const storageKey = (userId: string) => `ecclesiaos:notifications:lastReadAt:${userId}`;

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export const NotificationCenter: React.FC<Props> = ({ token, user, onNavigate }) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<string>(() => {
    try {
      return window.localStorage.getItem(storageKey(user.id)) || "";
    } catch {
      return "";
    }
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const refresh = async () => {
    try {
      const data = await loadNotifications(token);
      setItems(data);
    } catch {
      // silencioso: centro de notificacoes nao deve quebrar a UI
    }
  };

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const unreadCount = useMemo(() => {
    if (!lastReadAt) return items.length;
    return items.filter((item) => item.createdAt > lastReadAt).length;
  }, [items, lastReadAt]);

  const grouped = useMemo(() => {
    const map = new Map<NotificationKind, NotificationItem[]>();
    items.forEach((item) => {
      const list = map.get(item.kind) || [];
      list.push(item);
      map.set(item.kind, list);
    });
    return KIND_ORDER
      .map((kind) => ({ kind, items: map.get(kind) || [] }))
      .filter((entry) => entry.items.length > 0);
  }, [items]);

  const togglePanel = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const stamp = new Date().toISOString();
      setLastReadAt(stamp);
      try {
        window.localStorage.setItem(storageKey(user.id), stamp);
      } catch {
        // ignora falha de storage
      }
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    setOpen(false);
    onNavigate(item.link.module as AppView);
  };

  return (
    <div className="notification-center" ref={wrapperRef}>
      <button
        type="button"
        className="notification-bell"
        onClick={togglePanel}
        aria-label={`Notificacoes (${unreadCount} nao lidas)`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-panel" role="dialog" aria-label="Notificacoes">
          <header className="notification-panel-header">
            <strong>Notificacoes</strong>
            <span className="muted">{items.length} item(ns)</span>
          </header>
          {items.length === 0 ? (
            <p className="muted notification-empty">Sem pendencias por enquanto.</p>
          ) : grouped.map(({ kind, items: groupItems }) => {
            const Icon = KIND_ICON[kind] || FileText;
            return (
              <div className="notification-group" key={kind}>
                <div className="notification-group-title">
                  <Icon size={14} />
                  <span>{KIND_LABELS[kind]}</span>
                  <span className="muted">{groupItems.length}</span>
                </div>
                {groupItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="notification-item"
                    onClick={() => handleItemClick(item)}
                  >
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <small className="muted">{formatDateTime(item.createdAt)}</small>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
