# Fase 58: Matrix View De Equipes Em Escalas

## Objetivo

Dar ao lider uma visao panoramica de quem esta escalado em sua equipe nas proximas 4-12 semanas, sem ter que abrir cada plano.

## Status

Concluida.

## Escopo

### Frontend (apenas)

- ServingPage ganha tab bar `Lista` / `Matriz` no topo.
- Aba `Matriz`:
  - Seletor de equipe (so grupos `ministry`/`team`).
  - Seletor de janela (4, 8 ou 12 semanas).
  - Tabela com primeira coluna = membros da equipe e demais colunas = planos no periodo.
  - Cada celula renderiza `StatusPill` quando ha atribuicao, vazio quando nao.
  - Header sticky horizontal; nome da pessoa sticky a esquerda em telas largas.
- Sem mudanca em backend, endpoints, dados ou permissoes.

## Fora De Escopo

- Edicao inline.
- Comparar varias equipes simultaneamente.
- Heatmap, carga total, drag and drop, exportacao.

## Criterios De Aceite

- Selecionar equipe e janela exibe a tabela.
- Sem planos no periodo: mensagem amigavel.
- Pessoa nao escalada em uma data: celula vazia.
- StatusPill mostra cor correta por status.
- Mobile: tabela rolavel horizontalmente sem quebrar layout.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Manual: abrir Escalas, trocar para aba Matriz, escolher equipe com pessoas escaladas, validar visualmente.

## Proxima Pergunta

Depois desta fase:

> Confirmacao de email no registro publico, templates de mensagem com variaveis, ou lembretes automaticos de escala?
