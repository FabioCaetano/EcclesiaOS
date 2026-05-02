# Fase 24: Auditoria Inicial

## Objetivo

Registrar alteracoes sensiveis feitas por usuarios autenticados.

## Status

Concluida.

## Escopo

- Criar modelo `AuditLogRecord` no Prisma.
- Criar migration `20260430200000_audit_logs`.
- Adicionar `auditLogs` ao provider JSON.
- Criar `auditRepository`.
- Criar endpoint administrativo:

```text
GET /audit-logs
```

- Registrar auditoria em:
  - usuarios;
  - pessoas;
  - lancamentos financeiros.
- Cobrir a regra em testes HTTP.

## Fora De Escopo

- Tela de auditoria.
- Diff detalhado de campos.
- Auditoria de leitura.
- Auditoria de todos os modulos.

## Criterios De Aceite

- Admin lista auditoria.
- Membro recebe `403` ao listar auditoria.
- Criacao de usuario gera evento.
- Criacao/edicao/remocao de pessoas e financeiro geram eventos.
- Migration aplica no PostgreSQL local.

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
- `test`: 11 testes API passando.
- `db:migrate`: migration `20260430200000_audit_logs` aplicada.
- `build`: concluido.
- `reset-dev-data`: concluido.
- `db:verify`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos criar uma tela de auditoria, troca/reset de senha, ou agenda/eventos?
