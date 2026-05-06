import React from "react";

export type StatusTone = "success" | "info" | "warning" | "danger" | "muted";

interface Props {
  tone: StatusTone;
  children: React.ReactNode;
}

export const StatusPill: React.FC<Props> = ({ tone, children }) => (
  <span className={`status-pill status-pill-${tone}`}>{children}</span>
);
