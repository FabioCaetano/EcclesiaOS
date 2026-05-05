import React from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  eyebrow?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ eyebrow, icon: Icon, title, description, actions }) => (
  <div className="page-header">
    <div className="page-header-text">
      {eyebrow && (
        <span className="page-header-eyebrow">
          {Icon && <Icon size={14} />}
          {eyebrow}
        </span>
      )}
      <h1>{title}</h1>
      {description && <p className="page-header-description">{description}</p>}
    </div>
    {actions && <div className="page-header-actions">{actions}</div>}
  </div>
);
