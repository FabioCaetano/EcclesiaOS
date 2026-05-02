# Decisao 0013: Financeiro Interno Minimo

## Status

Aceita para a Fase 12.

## Contexto

O EcclesiaOS ja possui pessoas, grupos, presenca e escalas. O proximo dominio importante para uma igreja especifica e registrar movimentacoes financeiras basicas sem depender de gateways externos.

## Decisao

Criar um financeiro interno minimo com lancamentos manuais de receitas e despesas.

Campos iniciais:

- data;
- tipo: receita ou despesa;
- valor;
- fundo;
- categoria;
- forma de pagamento;
- pessoa vinculada opcional;
- descricao.

## Consequencias

- A igreja pode acompanhar entradas, saidas e saldo dentro do EcclesiaOS.
- Admin gerencia os lancamentos.
- Lider e membro visualizam por enquanto, seguindo o modelo de permissao simples atual.
- Pagamento online, recibos e reconciliacao ficam para fases futuras.

## Nao Objetivos

- Nao integrar gateway de pagamento.
- Nao emitir recibos fiscais.
- Nao fazer contabilidade completa.
- Nao criar permissoes financeiras granulares ainda.
