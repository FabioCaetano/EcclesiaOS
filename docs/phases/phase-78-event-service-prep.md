# Fase 78 - Agenda com preparo do culto

## Objetivo

Conectar a aba Agenda com as areas que preparam o culto: equipes solicitadas, escalas, repertorio e liturgia/checklist.

## Implementado

- Painel `Preparo` dentro do evento selecionado na Agenda.
- Resumo de equipes solicitadas no culto/evento.
- Resumo das escalas vinculadas ao evento:
  - total de escalados;
  - confirmados;
  - pendentes;
  - recusados.
- Resumo dos repertorios vinculados ao evento.
- Resumo das liturgias/checklists vinculadas ao evento:
  - total de itens;
  - itens concluidos.
- Integração usando dados já existentes:
  - `ServingPlan.eventId`;
  - `WorshipSet.eventId`;
  - `ServiceChecklist.eventId`;
  - `ChurchEvent.requestedTeamIds`.

## Arquivos principais

- `apps/web/src/EventsPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-78-event-service-prep.md`
- `docs/decisions/0078-event-service-prep-summary.md`

## Validacao

Executado com sucesso:

```powershell
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado dos testes:

- 39 testes passaram.

## Proximos passos

- Permitir navegar da Agenda diretamente para a edição de Escalas, Músicas ou Liturgia do culto.
- Criar uma visão única de culto com agenda, repertório, liturgia e escala em uma página operacional.
- Iniciar Fase 79 - Formularios customizados.
