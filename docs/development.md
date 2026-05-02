# Desenvolvimento Local

## Requisitos

- Node.js 20 ou superior.
- npm com suporte a workspaces.
- Docker Desktop opcional para PostgreSQL local.

No ambiente local configurado, o projeto roda com PostgreSQL/Prisma. O provider JSON continua disponivel para testes automatizados e fallback.

## Instalar Dependencias

Na pasta do novo projeto:

```powershell
cd C:\Users\fabio\Documents\Projetos\EclesiaOS\EcclesiaOS
npm install
```

## Executar Frontend

```powershell
npm run dev:web
```

URL padrao:

```text
http://localhost:5173
```

## Executar API

Em outro terminal:

```powershell
npm run dev:api
```

URL do health check:

```text
http://localhost:4000/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "app": "EcclesiaOS",
  "version": "0.1.0",
  "timestamp": "..."
}
```

## Usuarios De Desenvolvimento

No modo JSON, a API possui usuarios semente em arquivo local:

```text
apps/api/data/dev-db.json
```

Esse arquivo e criado automaticamente ao iniciar a API ou ao rodar o reset.

| Papel | Email | Senha |
| --- | --- | --- |
| Admin | admin@ecclesiaos.local | admin123 |
| Lider | lider@ecclesiaos.local | lider123 |
| Membro | membro@ecclesiaos.local | membro123 |

Para resetar os dados de desenvolvimento:

```powershell
npm run reset-dev-data
```

## PostgreSQL E Prisma

O workspace local ja possui `.env` configurado para Prisma/PostgreSQL:

```text
ECCLESIAOS_DATA_PROVIDER=prisma
DATABASE_URL=postgresql://ecclesiaos:ecclesiaos@localhost:5432/ecclesiaos?schema=public
```

O arquivo `apps/api/.env` tambem existe para o Prisma CLI encontrar `DATABASE_URL` ao rodar comandos no workspace da API.

Subir Postgres local:

```powershell
docker compose up -d postgres
```

Gerar Prisma Client:

```powershell
npm run db:generate
```

Aplicar migrations:

```powershell
npm run db:migrate
```

Aplicar migrations em ambiente publicado:

```powershell
npm run db:migrate:deploy
```

Use `db:migrate:deploy` para Neon/Render/producao. O comando `db:migrate` usa `prisma migrate dev` e deve ficar restrito ao desenvolvimento local.

Popular dados semente no provider ativo:

```powershell
npm run reset-dev-data
```

Verificar leitura via Prisma:

```powershell
npm run db:verify
```

Esse comando exige `ECCLESIAOS_DATA_PROVIDER=prisma`, `DATABASE_URL` configurado e Postgres ativo.

O `db:verify` tambem valida as credenciais semente:

```text
admin@ecclesiaos.local / admin123
lider@ecclesiaos.local / lider123
membro@ecclesiaos.local / membro123
```

O comando tambem confirma que as senhas semente estao armazenadas em hash.
O comando tambem confirma que os usuarios semente possuem pessoa vinculada.

Endpoints de autenticacao:

```text
POST http://localhost:4000/auth/login
POST http://localhost:4000/auth/register
GET  http://localhost:4000/auth/me
```

O registro publico cria uma pessoa e um usuario vinculado. O usuario sempre entra como `member`; o admin pode alterar o papel depois.

Endpoints de usuarios:

```text
GET    http://localhost:4000/users
POST   http://localhost:4000/users
PUT    http://localhost:4000/users/:id
DELETE http://localhost:4000/users/:id
```

Somente `admin` pode acessar usuarios. A API nao retorna senhas. Ao editar usuario, senha vazia preserva a senha atual.

As senhas sao armazenadas com hash `scrypt`. Senhas antigas em texto puro ainda sao aceitas apenas para upgrade automatico no login bem-sucedido.

Endpoint de auditoria:

```text
GET http://localhost:4000/audit-logs
```

Somente `admin` pode listar auditoria. A tela Auditoria no painel lista logs e filtra por acao, entidade, usuario, data e busca textual.

Endpoint do cadastro da igreja:

```text
GET http://localhost:4000/church/profile
PUT http://localhost:4000/church/profile
```

Somente `admin` pode atualizar o cadastro da igreja nesta fase.

O cadastro da igreja tambem possui `youtubeChannelUrl`. A tela Inicio chama o endpoint `GET /youtube/videos` para listar os ultimos videos do canal. O backend resolve URLs `/channel/UC...`, `/@handle`, `/c/handle` e `/user/handle`, le o feed RSS publico e mantem cache em memoria com TTL de 10 minutos. Integracao por API oficial do YouTube fica para fase futura.

Endpoint do YouTube:

```text
GET http://localhost:4000/youtube/videos
```

Resposta com sucesso retorna `channelId`, `channelTitle`, `channelUrl` e `videos[]`. Em caso de erro o endpoint responde `200 OK` com `{ error, message }` para o frontend exibir mensagem amigavel sem quebrar o painel.

Endpoints de pessoas:

```text
GET    http://localhost:4000/people
POST   http://localhost:4000/people
PUT    http://localhost:4000/people/:id
DELETE http://localhost:4000/people/:id
```

Todos os usuarios autenticados podem listar pessoas. Somente `admin` pode criar, editar e remover.

Pessoas podem guardar `guardianPersonIds` para vincular criancas a responsaveis cadastrados. O check-in infantil usa esse vinculo para sugerir responsaveis.

Endpoints de grupos:

```text
GET    http://localhost:4000/groups
POST   http://localhost:4000/groups
PUT    http://localhost:4000/groups/:id
DELETE http://localhost:4000/groups/:id
```

Todos os usuarios autenticados podem listar grupos. Somente `admin` pode criar, editar e remover.

Endpoints de presenca:

```text
GET    http://localhost:4000/attendance
POST   http://localhost:4000/attendance
PUT    http://localhost:4000/attendance/:id
DELETE http://localhost:4000/attendance/:id
```

Todos os usuarios autenticados podem listar presencas. Somente `admin` pode criar, editar e remover.

Presencas podem ser vinculadas a eventos pelo campo `eventId`.

Check-ins de pessoas por evento consolidam automaticamente `presentPersonIds` no registro de presenca do evento. A aba Presenca continua fora da navegacao principal, mas os dados ficam disponiveis para historico e relatorios.

Endpoints de agenda/eventos:

```text
GET    http://localhost:4000/events
POST   http://localhost:4000/events
PUT    http://localhost:4000/events/:id
DELETE http://localhost:4000/events/:id
```

Todos os usuarios autenticados podem listar eventos. Somente `admin` pode criar, editar e remover.

Eventos possuem recorrencia pelo campo `recurrence`: `none`, `weekly`, `monthly` ou `cron`.

Quando `recurrence` for `cron`, o campo `recurrenceRule` armazena a expressao textual. Nesta fase a regra fica registrada no evento, mas a geracao automatica de ocorrencias ainda nao foi implementada.

A tela Agenda sugere Ambientes ativos no campo `Local`, usando os recursos cadastrados em Ambientes.

Eventos tambem podem habilitar inscricoes publicas com os campos:

```text
registrationEnabled
registrationCapacity
registrationPrice
registrationCurrency
registrationSlug
```

Endpoints publicos de inscricao:

```text
GET  http://localhost:4000/public/events/:slug
POST http://localhost:4000/public/events/:slug/registrations
```

Pagina publica no frontend:

```text
http://localhost:5173/register/:slug
```

Endpoint administrativo de inscricoes:

```text
GET http://localhost:4000/event-registrations
PATCH http://localhost:4000/event-registrations/:id/status
PATCH http://localhost:4000/event-registrations/:id/checkin
```

Inscricoes gratuitas entram como `confirmed`. Inscricoes pagas entram como `pending_payment` e dependem de controle manual nesta fase. Admin pode alterar o status para `confirmed`, `pending_payment` ou `cancelled` na tela Agenda.

A tela Agenda lista participantes do evento selecionado, filtra por status, resume vagas confirmadas/pendentes/canceladas e gera recibo/ingresso imprimivel.

Cada inscricao possui `ticketCode`. O recibo/ingresso exibe QR Code com payload `ecclesiaos-event-ticket:<registrationId>:<ticketCode>`. Admin pode validar o ingresso por camera ou campo manual na tela Agenda; apenas inscricoes confirmadas podem fazer check-in.

Endpoints de ambientes:

```text
GET    http://localhost:4000/resources
POST   http://localhost:4000/resources
PUT    http://localhost:4000/resources/:id
DELETE http://localhost:4000/resources/:id
```

Endpoints de reservas de ambientes:

```text
GET    http://localhost:4000/room-reservations
POST   http://localhost:4000/room-reservations
PUT    http://localhost:4000/room-reservations/:id
DELETE http://localhost:4000/room-reservations/:id
```

Usuarios autenticados podem listar ambientes e reservas. Somente `admin` pode criar, editar e remover. Reservas confirmadas bloqueiam conflito de horario no mesmo ambiente.

Tela de calendario:

```text
http://localhost:5173
```

Depois do login, abrir o modulo `Calendario`.

O calendario consolida eventos e reservas usando as rotas existentes. Ele nao possui endpoint proprio nesta fase.

Recursos atuais do calendario:

- visao mensal;
- visao semanal;
- filtro por tipo;
- filtro por ambiente;
- detalhe do dia selecionado.

Endpoints de check-in:

```text
GET    http://localhost:4000/event-checkins
POST   http://localhost:4000/event-checkins
DELETE http://localhost:4000/event-checkins/:id
GET    http://localhost:4000/child-checkins
POST   http://localhost:4000/child-checkins
PATCH  http://localhost:4000/child-checkins/:id/checkout
```

Admin e lider podem operar check-in. Membro pode visualizar, mas nao criar/remover/registrar saida.

Check-in infantil pode vincular `childPersonId` e `guardianPersonId` a pessoas cadastradas. A saida registra `checkedOutByPersonId` com a pessoa do usuario que realizou a retirada.

Quando a crianca selecionada possui `guardianPersonIds`, o formulario destaca os responsaveis vinculados e sugere o primeiro responsavel cadastrado.

Admin e lider podem registrar saida infantil diretamente. Membro autenticado pode retirar apenas criancas vinculadas ao proprio `personId`; nesse caso a API exige o `securityCode` da etiqueta. A etiqueta infantil exibe QR Code gerado pelo frontend com identificador do check-in e codigo de seguranca.

A tela Check-in possui abas internas para Eventos, Kids e Administracao kids, sem novo item no menu lateral.

A tela Check-in possui painel de leitura de QR Code por camera usando `BarcodeDetector` quando o navegador oferece suporte. Se a camera ou o recurso nativo nao estiver disponivel, o operador pode colar manualmente o payload do QR Code.

Para impressora Brother, a etiqueta possui presets `Brother DK-1202 62x100mm` e `Brother 62mm continuo`. A impressao usa o dialogo do navegador; selecione a impressora Brother e o papel correspondente no driver.

A tela Check-in tambem permite selecionar varias criancas e imprimir etiquetas infantis em lote. Use `Selecionar ativos` para marcar todas as criancas ainda sem saida registrada e `Imprimir lote` para gerar as etiquetas sequenciais.

A administracao kids possui acao de mensagem para o responsavel da crianca ainda nao retirada. Nesta fase a acao abre WhatsApp ou SMS no dispositivo do operador.

Endpoints de escalas:

```text
GET    http://localhost:4000/serving-plans
POST   http://localhost:4000/serving-plans
PUT    http://localhost:4000/serving-plans/:id
DELETE http://localhost:4000/serving-plans/:id
PATCH  http://localhost:4000/serving-plans/:planId/assignments/:assignmentId/status
GET    http://localhost:4000/serving-notifications
```

Todos os usuarios autenticados podem listar escalas. Somente `admin` pode criar, editar e remover planos. Admin pode alterar qualquer status de pessoa escalada; lider/membro pode responder somente escalas vinculadas ao proprio `personId`.

Endpoints financeiros:

```text
GET    http://localhost:4000/financial-transactions
POST   http://localhost:4000/financial-transactions
PUT    http://localhost:4000/financial-transactions/:id
DELETE http://localhost:4000/financial-transactions/:id
```

Somente `admin` pode listar, criar, editar e remover lancamentos financeiros.

## Build

```powershell
npm run build
```

Build apenas do frontend, incluindo contratos compartilhados:

```powershell
npm run build:web
```

## Typecheck

```powershell
npm run typecheck
```

## Testes

```powershell
npm run test
```

A suite atual usa `node:test` no workspace da API e cria um arquivo temporario via `ECCLESIAOS_DATA_FILE`, sem alterar `apps/api/data/dev-db.json`.

## Smoke Tests Do Frontend

```powershell
npm run test:web
```

A suite usa Playwright, sobe a API em `http://127.0.0.1:4100`, o frontend em `http://127.0.0.1:5174` e usa banco E2E isolado em:

```text
apps/api/data/e2e-db.json
```

## Observacoes

- O frontend e a API ainda rodam separados.
- O modo PostgreSQL/Prisma e o modo local configurado para teste manual.
- O modo JSON local continua disponivel para testes automatizados e fallback.
- O pacote `packages/shared` guarda contratos usados entre web e API.
- A aba Presenca esta oculta da navegacao principal, mas endpoints e codigo foram mantidos para reaproveitamento futuro.
