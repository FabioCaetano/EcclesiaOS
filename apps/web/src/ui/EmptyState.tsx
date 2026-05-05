import React from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    {Icon && (
      <div className="empty-state-icon">
        <Icon size={22} />
      </div>
    )}
    <strong className="empty-state-title">{title}</strong>
    {description && <p>{description}</p>}
    {action && <div>{action}</div>}
  </div>
);
