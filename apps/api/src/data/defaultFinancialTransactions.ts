import type { FinancialTransaction } from "@ecclesiaos/shared";

const now = "2026-04-30T00:00:00.000Z";

export const defaultFinancialTransactions: FinancialTransaction[] = [
  {
    id: "fin_001",
    date: "2026-04-26",
    type: "income",
    amount: 850,
    fund: "Geral",
    category: "Dizimos e ofertas",
    paymentMethod: "cash",
    personId: "per_001",
    description: "Oferta do culto dominical.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "fin_002",
    date: "2026-04-27",
    type: "expense",
    amount: 120,
    fund: "Geral",
    category: "Manutencao",
    paymentMethod: "transfer",
    personId: "",
    description: "Compra de materiais para manutencao.",
    createdAt: now,
    updatedAt: now
  }
];
