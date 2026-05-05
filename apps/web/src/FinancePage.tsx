import React, { useEffect, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import type { CurrentUser, FinancialTransaction, FinancialTransactionInput, PersonProfile } from "@ecclesiaos/shared";
import { deleteFinancialTransaction, loadFinancialTransactions, loadPeople, saveFinancialTransaction } from "./api";
import { emptyFinancialTransactionInput, financialTypeLabels, paymentMethodLabels } from "./constants";
import { toFinancialTransactionInput } from "./mappers";
import { Card, PageHeader } from "./ui";

interface Props {
  token: string;
  user: CurrentUser;
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

const emptyFilters = {
  startDate: "",
  endDate: "",
  type: "all",
  fund: "all",
  category: "all"
};

const sumTransactions = (items: FinancialTransaction[], type: FinancialTransaction["type"]) => (
  items.filter((transaction) => transaction.type === type).reduce((sum, transaction) => sum + transaction.amount, 0)
);

export const FinancePage: React.FC<Props> = ({ token, user }) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [transactionForm, setTransactionForm] = useState<FinancialTransactionInput>(emptyFinancialTransactionInput);
  const [filters, setFilters] = useState(emptyFilters);
  const [financeStatus, setFinanceStatus] = useState("");

  const refreshTransactions = async () => setTransactions(await loadFinancialTransactions(token));

  useEffect(() => {
    loadPeople(token).then(setPeople).catch(() => setFinanceStatus("Nao foi possivel carregar pessoas."));
    refreshTransactions().catch(() => setFinanceStatus("Nao foi possivel carregar lancamentos."));
  }, [token]);

  const selectTransaction = (transaction: FinancialTransaction) => {
    setSelectedTransactionId(transaction.id);
    setTransactionForm(toFinancialTransactionInput(transaction));
    setFinanceStatus("");
  };

  const startNewTransaction = () => {
    setSelectedTransactionId(null);
    setTransactionForm(emptyFinancialTransactionInput);
    setFinanceStatus("");
  };

  const updateTransactionField = (field: keyof FinancialTransactionInput, value: string) => {
    setTransactionForm((current) => ({
      ...current,
      [field]: field === "amount" ? Number(value) : value
    }));
  };

  const handleTransactionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user.role !== "admin") return;

    setFinanceStatus("Salvando...");
    try {
      const saved = await saveFinancialTransaction(token, transactionForm, selectedTransactionId || undefined);
      await refreshTransactions();
      selectTransaction(saved);
      setFinanceStatus("Lancamento salvo.");
    } catch {
      setFinanceStatus("Nao foi possivel salvar o lancamento.");
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransactionId || user.role !== "admin") return;
    if (!window.confirm("Remover este lancamento financeiro?")) return;

    setFinanceStatus("Removendo...");
    try {
      await deleteFinancialTransaction(token, selectedTransactionId);
      await refreshTransactions();
      startNewTransaction();
      setFinanceStatus("Lancamento removido.");
    } catch {
      setFinanceStatus("Nao foi possivel remover o lancamento.");
    }
  };

  const personName = (personId: string) => {
    const person = people.find((item) => item.id === personId);
    return person ? `${person.firstName} ${person.lastName}`.trim() : "Sem pessoa vinculada";
  };

  const funds = [...new Set(transactions.map((transaction) => transaction.fund).filter(Boolean))].sort();
  const categories = [...new Set(transactions.map((transaction) => transaction.category).filter(Boolean))].sort();
  const filteredTransactions = transactions.filter((transaction) => {
    const afterStart = !filters.startDate || transaction.date >= filters.startDate;
    const beforeEnd = !filters.endDate || transaction.date <= filters.endDate;
    const matchesType = filters.type === "all" || transaction.type === filters.type;
    const matchesFund = filters.fund === "all" || transaction.fund === filters.fund;
    const matchesCategory = filters.category === "all" || transaction.category === filters.category;
    return afterStart && beforeEnd && matchesType && matchesFund && matchesCategory;
  });
  const totalIncome = sumTransactions(filteredTransactions, "income");
  const totalExpense = sumTransactions(filteredTransactions, "expense");
  const balance = totalIncome - totalExpense;
  const selectedTransaction = transactions.find((transaction) => transaction.id === selectedTransactionId) || null;
  const fundSummary = funds
    .map((fund) => {
      const items = filteredTransactions.filter((transaction) => transaction.fund === fund);
      return { fund, income: sumTransactions(items, "income"), expense: sumTransactions(items, "expense") };
    })
    .filter((item) => item.income > 0 || item.expense > 0);
  const categorySummary = categories
    .map((category) => {
      const items = filteredTransactions.filter((transaction) => transaction.category === category);
      return { category, income: sumTransactions(items, "income"), expense: sumTransactions(items, "expense") };
    })
    .filter((item) => item.income > 0 || item.expense > 0);

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        icon={Wallet}
        title="Financeiro"
        description="Receitas, despesas, fundos e relatorios consolidados."
        actions={user.role === "admin" && (
          <button className="secondary-button" type="button" onClick={startNewTransaction}>
            <Plus size={16} /> Novo lancamento
          </button>
        )}
      />

      <Card className="finance-panel">
      <div className="filter-bar">
        <label>Inicio<input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} /></label>
        <label>Fim<input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} /></label>
        <label>
          Tipo
          <select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}>
            <option value="all">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </label>
        <label>
          Fundo
          <select value={filters.fund} onChange={(event) => setFilters((current) => ({ ...current, fund: event.target.value }))}>
            <option value="all">Todos</option>
            {funds.map((fund) => <option value={fund} key={fund}>{fund}</option>)}
          </select>
        </label>
        <label>
          Categoria
          <select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
            <option value="all">Todas</option>
            {categories.map((category) => <option value={category} key={category}>{category}</option>)}
          </select>
        </label>
        <button className="secondary-button" type="button" onClick={() => setFilters(emptyFilters)}>Limpar</button>
      </div>

      <div className="report-grid">
        <article>
          <span>Receitas</span>
          <strong>{currency.format(totalIncome)}</strong>
        </article>
        <article>
          <span>Despesas</span>
          <strong>{currency.format(totalExpense)}</strong>
        </article>
        <article>
          <span>Saldo</span>
          <strong>{currency.format(balance)}</strong>
        </article>
        <article>
          <span>Filtrados</span>
          <strong>{filteredTransactions.length}</strong>
        </article>
      </div>

      <div className="report-columns">
        <div>
          <h3>Resumo por fundo</h3>
          {fundSummary.length === 0 ? <p className="muted">Sem lancamentos no filtro.</p> : fundSummary.map((item) => (
            <p className="report-row" key={item.fund}>
              <span>{item.fund}</span>
              <strong>{currency.format(item.income - item.expense)}</strong>
            </p>
          ))}
        </div>
        <div>
          <h3>Resumo por categoria</h3>
          {categorySummary.length === 0 ? <p className="muted">Sem categorias no filtro.</p> : categorySummary.map((item) => (
            <p className="report-row" key={item.category}>
              <span>{item.category}</span>
              <strong>{currency.format(item.income - item.expense)}</strong>
            </p>
          ))}
        </div>
      </div>

      <div className="people-layout">
        <div className="people-list" aria-label="Lista de lancamentos financeiros">
          {filteredTransactions.map((transaction) => (
            <button className={transaction.id === selectedTransactionId ? "person-row selected" : "person-row"} key={transaction.id} type="button" onClick={() => selectTransaction(transaction)}>
              <strong>{transaction.date} - {currency.format(transaction.amount)}</strong>
              <span>{financialTypeLabels[transaction.type]} - {transaction.category || "Sem categoria"} - {transaction.fund || "Sem fundo"}</span>
            </button>
          ))}
        </div>

        <form className="person-form" onSubmit={handleTransactionSubmit}>
          <label>Data<input disabled={user.role !== "admin"} type="date" value={transactionForm.date} onChange={(event) => updateTransactionField("date", event.target.value)} /></label>
          <label>
            Tipo
            <select disabled={user.role !== "admin"} value={transactionForm.type} onChange={(event) => updateTransactionField("type", event.target.value)}>
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </label>
          <label>Valor<input disabled={user.role !== "admin"} min="0" step="0.01" type="number" value={transactionForm.amount} onChange={(event) => updateTransactionField("amount", event.target.value)} /></label>
          <label>Fundo<input disabled={user.role !== "admin"} value={transactionForm.fund} onChange={(event) => updateTransactionField("fund", event.target.value)} /></label>
          <label>Categoria<input disabled={user.role !== "admin"} value={transactionForm.category} onChange={(event) => updateTransactionField("category", event.target.value)} /></label>
          <label>
            Forma
            <select disabled={user.role !== "admin"} value={transactionForm.paymentMethod} onChange={(event) => updateTransactionField("paymentMethod", event.target.value)}>
              <option value="cash">Dinheiro</option>
              <option value="card">Cartao</option>
              <option value="transfer">Transferencia</option>
              <option value="check">Cheque</option>
              <option value="other">Outro</option>
            </select>
          </label>
          <label className="wide-field">
            Pessoa vinculada
            <select disabled={user.role !== "admin"} value={transactionForm.personId} onChange={(event) => updateTransactionField("personId", event.target.value)}>
              <option value="">Sem pessoa</option>
              {people.map((person) => (
                <option value={person.id} key={person.id}>{person.firstName} {person.lastName}</option>
              ))}
            </select>
          </label>
          <label className="wide-field">Descricao<textarea disabled={user.role !== "admin"} value={transactionForm.description} onChange={(event) => updateTransactionField("description", event.target.value)} /></label>

          <div className="finance-detail wide-field">
            <p><span>Forma</span><strong>{paymentMethodLabels[transactionForm.paymentMethod]}</strong></p>
            <p><span>Pessoa</span><strong>{personName(transactionForm.personId)}</strong></p>
          </div>

          {selectedTransaction && (
            <section className="receipt-preview wide-field" aria-label="Recibo financeiro">
              <div>
                <p className="eyebrow">Recibo</p>
                <h3>{financialTypeLabels[selectedTransaction.type]} - {currency.format(selectedTransaction.amount)}</h3>
              </div>
              <p><span>Data</span><strong>{selectedTransaction.date}</strong></p>
              <p><span>Fundo</span><strong>{selectedTransaction.fund || "Sem fundo"}</strong></p>
              <p><span>Categoria</span><strong>{selectedTransaction.category || "Sem categoria"}</strong></p>
              <p><span>Pessoa</span><strong>{personName(selectedTransaction.personId)}</strong></p>
              <p><span>Forma</span><strong>{paymentMethodLabels[selectedTransaction.paymentMethod]}</strong></p>
              <p className="receipt-description"><span>Descricao</span><strong>{selectedTransaction.description || "Sem descricao"}</strong></p>
            </section>
          )}

          <div className="form-footer">
            {user.role === "admin" && <button type="submit">{selectedTransactionId ? "Salvar lancamento" : "Criar lancamento"}</button>}
            {user.role === "admin" && selectedTransactionId && <button className="danger-button" type="button" onClick={handleDeleteTransaction}>Remover</button>}
            <p>{user.role === "admin" ? financeStatus : "Somente administradores podem alterar o financeiro."}</p>
          </div>
        </form>
      </div>
      </Card>
    </>
  );
};
