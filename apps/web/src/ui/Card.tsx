import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <section className={className ? `card ${className}` : "card"}>{children}</section>
);

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, description, actions }) => (
  <header className="card-header">
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    {actions && <div className="response-actions">{actions}</div>}
  </header>
);
