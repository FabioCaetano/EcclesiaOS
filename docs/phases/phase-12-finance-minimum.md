# Fase 12: Financeiro Minimo

## Objetivo

Criar o primeiro modulo financeiro do EcclesiaOS com lancamentos manuais de receitas e despesas.

## Escopo

- Contratos compartilhados para lancamentos financeiros.
- Seed local de receitas e despesas.
- Repositorio JSON para persistencia temporaria.
- Endpoints proprios em `/financial-transactions`.
- Tela Financeiro no frontend.
- Resumo de receitas, despesas, saldo e quantidade de fundos.
- Vinculo opcional do lancamento com uma pessoa.

## Fora De Escopo

- Pagamento online.
- Recibos.
- Exportacao.
- Conciliacao bancaria.
- Plano de contas completo.
- Permissoes financeiras granulares.

## Criterios De Aceite

- Admin consegue criar, editar e remover lancamentos.
- Usuarios autenticados conseguem listar lancamentos.
- A tela mostra totais de receitas, despesas e saldo.
- Os dados seguem a persistencia local atual.

## Verificacao

- `npm.cmd run build --workspace @ecclesiaos/shared`: concluido.
- `npm.cmd run typecheck`: concluido.
- `npm.cmd run build`: concluido com execucao elevada por causa do Vite/esbuild.
- `POST /auth/login` e `GET /financial-transactions`: validados contra a API compilada.

O modo dev da API ainda depende de `tsx/esbuild` e pode exigir execucao fora do sandbox neste ambiente.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos aprofundar Financeiro com recibos/relatorios ou estabilizar com testes automatizados?
