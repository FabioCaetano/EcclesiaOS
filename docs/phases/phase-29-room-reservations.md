# Fase 29: Reservas De Ambientes

## Objetivo

Criar uma area para cadastrar ambientes compartilhados da igreja e reservar esses ambientes por data e horario.

## Status

Concluida.

## Escopo

- Criar modulo `Ambientes` na navegacao principal.
- Criar tipos:
  - `ChurchResource`;
  - `ChurchResourceInput`;
  - `RoomReservation`;
  - `RoomReservationInput`;
  - `RoomReservationStatus`.
- Criar migration `20260430250000_room_reservations`.
- Criar tabelas:
  - `ChurchResourceRecord`;
  - `RoomReservationRecord`.
- Criar seed de ambientes iniciais:
  - Auditorio principal;
  - Sala infantil.
- Criar reserva semente vinculada ao culto dominical.
- Criar `resourceRepository`.
- Criar endpoints:

```text
GET    /resources
POST   /resources
PUT    /resources/:id
DELETE /resources/:id
GET    /room-reservations
POST   /room-reservations
PUT    /room-reservations/:id
DELETE /room-reservations/:id
```

- Criar tela `Ambientes`.
- Permitir cadastro, edicao e remocao de ambientes por admin.
- Permitir cadastro, edicao e remocao de reservas por admin.
- Permitir leitura de ambientes e reservas por usuarios autenticados.
- Bloquear conflito de reserva quando houver sobreposicao de horario no mesmo ambiente e na mesma data.
- Permitir vinculo opcional de reserva com evento da Agenda.
- Registrar auditoria para criacao, edicao e remocao de ambientes e reservas.

## Fora De Escopo

- Calendario visual consolidado.
- Aprovacao de reservas por fluxo de solicitacao.
- Reserva publica sem login.
- Recorrencia de reservas.
- Equipamentos e inventario.
- Notificacoes de reserva.

## Regra De Conflito

Uma reserva confirmada conflita quando:

- usa o mesmo `resourceId`;
- esta na mesma `date`;
- o horario novo sobrepoe o intervalo existente;
- a reserva existente nao esta cancelada;
- a nova reserva nao esta cancelada.

Reservas canceladas nao bloqueiam novos horarios.

## Criterios De Aceite

- Admin consegue criar ambiente.
- Admin consegue criar reserva.
- Membro consegue visualizar, mas nao criar reserva.
- Reserva com horario sobreposto no mesmo ambiente retorna conflito.
- Reservas podem ser vinculadas opcionalmente a eventos.
- Banco real possui tabelas de ambientes e reservas.
- Seed cria ambientes iniciais para teste.

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
- `db:migrate`: migration aplicada no PostgreSQL local.
- `reset-dev-data`: concluido.
- `db:verify`: `Resources: 2` e `Room reservations: 1`.
- `test`: 16 testes API passando.
- `build`: concluido.

Observacao: `prisma migrate dev` aplicou a migration, mas ficou preso em uma sessao ociosa depois da aplicacao. A sessao foi encerrada no PostgreSQL local e a migration apareceu como concluida em `_prisma_migrations`.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Vamos criar uma visao de calendario consolidada da igreja?
