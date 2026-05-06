import React from "react";

interface Props {
  name: string;
  size?: "sm" | "md" | "lg";
  tone?: "brand" | "info" | "warning" | "success" | "muted";
}

const initials = (name: string): string => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
};

export const Avatar: React.FC<Props> = ({ name, size = "md", tone = "brand" }) => (
  <span className={`avatar avatar-${size} avatar-${tone}`} aria-hidden="true">
    {initials(name)}
  </span>
);
