# Fase 38: QR Code De Ingresso E Check-in De Participantes

## Objetivo

Completar o fluxo de inscricoes de eventos com QR Code individual no ingresso e check-in administrativo de participantes.

## Status

Concluida.

## Escopo

- Adicionar `ticketCode` a inscricoes.
- Adicionar `checkedInAt` e `checkedInByUserId` a inscricoes.
- Criar migration `20260501121000_event_registration_ticket_checkin`.
- Criar contrato `EventRegistrationCheckInRequest`.
- Criar endpoint `PATCH /event-registrations/:id/checkin`.
- Validar check-in apenas para inscricoes confirmadas.
- Validar o codigo do ingresso antes de marcar entrada.
- Gerar QR Code no recibo/ingresso administrativo.
- Gerar QR Code no comprovante publico.
- Adicionar leitura de QR Code pela camera na tela Agenda.
- Manter fallback manual para colar o payload do ingresso.
- Marcar ingresso como usado e exibir data de entrada.

## Fora De Escopo

- Gateway de pagamento.
- Envio de ingresso por email.
- Check-in publico anonimo.
- Controle de entrada por lote.
- Cancelamento automatico de ingresso usado.

## Criterios De Aceite

- Inscricao nova recebe `ticketCode`.
- Recibo/ingresso mostra QR Code.
- Admin consegue validar ingresso por QR Code ou payload manual.
- Inscricao pendente ou cancelada nao pode fazer check-in.
- Check-in salva `checkedInAt` e `checkedInByUserId`.

## Verificacao

Concluida:

```powershell
npm.cmd run db:generate
npm.cmd run typecheck
npm.cmd run db:migrate
npm.cmd run reset-dev-data
npm.cmd run db:verify
npm.cmd run test
npm.cmd run build
```

Resultados:

- `db:generate`: Prisma Client atualizado.
- `typecheck`: concluido.
- `db:migrate`: migration aplicada no PostgreSQL local; o comando teve timeout conhecido, mas a migration foi confirmada na tabela `_prisma_migrations`.
- `reset-dev-data`: concluido.
- `db:verify`: concluido.
- `test`: 19 testes API passando.
- `build`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao recomendada sera:

> Queremos impressao em lote de etiquetas infantis ou tela de auditoria?
