# Decisao 0049: Aplicar Sistema De Design Aos Modulos Operacionais

## Status

Aceita.

## Contexto

A Fase 47 entregou a fundacao (tokens, layout shell, primitivos) e aplicou o novo design em quatro telas criticas (Inicio, Igreja, Pessoas, Agenda). As demais telas herdaram tokens (cores, fontes, botoes, formularios) automaticamente, mas continuam com a estrutura antiga: cabecalho dentro de `.section-heading`, container `.panel` em vez de `Card`, sem `PageHeader` consistente, sem `EmptyState` amigavel e sem icones.

## Decisao

Aplicar o mesmo padrao de layout (`PageHeader` + `Card` + `EmptyState` + icones `lucide-react`) nos modulos operacionais que ainda usam o padrao antigo, comecando pelos mais usados pela equipe da igreja:

- Check-in (eventos, kids, administracao kids)
- Calendario (visao mensal/semanal)
- Escalas (planos por equipe, confirmacoes)

Nao mudar logica, dados ou endpoints. Apenas estruturar a hierarquia visual e usar os primitivos novos.

## Consequencias

- Menos inconsistencias entre as telas.
- `EmptyState` substitui mensagens "sem itens" cinzas e secas.
- Icones em botoes de acao (Plus, Printer, Filter, ChevronLeft/Right, Camera) facilitam reconhecimento.
- O CSS continua limpo porque os novos elementos reutilizam classes existentes.

## Nao Objetivos

- Nao aprofundar componentes de Calendario (drag-and-drop, edicao rapida) nesta fase.
- Nao mudar a logica de check-in ou escalas.
- Nao alterar o fluxo de impressao de etiquetas.
- Nao aplicar nas telas restantes (Financeiro, Usuarios, Auditoria, Ambientes, Grupos, Presenca) — ficam para Fase 49.
