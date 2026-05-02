import type { FinancialPaymentMethod, FinancialTransaction, FinancialTransactionInput, FinancialTransactionType } from "@ecclesiaos/shared";
import { readData, writeData } from "./dataStore.js";

const createId = () => `fin_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeType = (type: string): FinancialTransactionType => type === "expense" ? "expense" : "income";

const normalizePaymentMethod = (method: string): FinancialPaymentMethod => {
  if (["cash", "card", "transfer", "check", "other"].includes(method)) return method as FinancialPaymentMethod;
  return "other";
};

const normalizeInput = (input: FinancialTransactionInput): FinancialTransactionInput => ({
  date: String(input.date || "").trim(),
  type: normalizeType(input.type),
  amount: Math.max(0, Number(input.amount) || 0),
  fund: String(input.fund || "").trim(),
  category: String(input.category || "").trim(),
  paymentMethod: normalizePaymentMethod(input.paymentMethod),
  personId: String(input.personId || "").trim(),
  description: String(input.description || "").trim()
});

export const financialTransactionRepository = {
  async list(): Promise<FinancialTransaction[]> {
    const data = await readData();
    return [...data.financialTransactions].sort((a, b) => b.date.localeCompare(a.date));
  },

  async create(input: FinancialTransactionInput): Promise<FinancialTransaction> {
    const data = await readData();
    const now = new Date().toISOString();
    const transaction: FinancialTransaction = {
      id: createId(),
      ...normalizeInput(input),
      createdAt: now,
      updatedAt: now
    };

    await writeData({ ...data, financialTransactions: [...data.financialTransactions, transaction] });
    return transaction;
  },

  async update(id: string, input: FinancialTransactionInput): Promise<FinancialTransaction | null> {
    const data = await readData();
    const existing = data.financialTransactions.find((transaction) => transaction.id === id);
    if (!existing) return null;

    const updated: FinancialTransaction = {
      ...existing,
      ...normalizeInput(input),
      updatedAt: new Date().toISOString()
    };

    await writeData({
      ...data,
      financialTransactions: data.financialTransactions.map((transaction) => transaction.id === id ? updated : transaction)
    });
    return updated;
  },

  async remove(id: string): Promise<boolean> {
    const data = await readData();
    const nextTransactions = data.financialTransactions.filter((transaction) => transaction.id !== id);
    if (nextTransactions.length === data.financialTransactions.length) return false;

    await writeData({ ...data, financialTransactions: nextTransactions });
    return true;
  }
};
