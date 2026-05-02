# Fase 25: Agenda E Eventos

## Objetivo

Criar a primeira base de agenda para cultos, reunioes, classes, acoes externas e outros eventos.

## Status

Concluida.

## Escopo

- Criar tipos `ChurchEvent`, `ChurchEventInput` e `EventType`.
- Criar modelo Prisma `EventRecord`.
- Criar migration `20260430210000_events`.
- Criar seed local de eventos.
- Adicionar `events` ao provider JSON.
- Adicionar leitura/escrita de eventos ao provider Prisma.
- Criar `eventRepository`.
- Criar endpoints:

```text
GET    /events
POST   /events
PUT    /events/:id
DELETE /events/:id
```

- Criar tela `Agenda` no frontend.
- Registrar auditoria em criacao, edicao e remocao de eventos.
- Ajustar `reset-dev-data` para rodar compilado com Node.

## Fora De Escopo

- Inscricoes.
- Check-in/presenca por evento.
- Recorrencia.
- Calendario mensal visual.
- Notificacoes de evento.

## Criterios De Aceite

- Usuarios autenticados listam eventos.
- Admin cria, edita e remove eventos.
- Membro nao cria evento.
- Eventos seed aparecem no PostgreSQL apos reset.
- Alteracao de evento gera auditoria.
- Tela Agenda aparece no menu autenticado.

## Verificacao

Concluida:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run db:migrate
npm.cmd run build
npm.cmd run reset-dev-data
npm.cmd run db:verify
```

Resultados:

- `typecheck`: concluido.
- `test`: 12 testes API passando.
- `db:migrate`: migration `20260430210000_events` aplicada.
- `build`: concluido.
- `reset-dev-data`: eventos seed populados no PostgreSQL.
- `db:verify`: `Events: 2`.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos ligar presenca a eventos, criar tela de auditoria, ou implementar troca/reset de senha?
