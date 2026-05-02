# Status Do Projeto

## Resumo

O EcclesiaOS esta em desenvolvimento faseado. O projeto ja possui frontend, API propria, autenticacao com senha em hash, registro publico com pessoa vinculada, PostgreSQL/Prisma configurado para teste local, gestao administrativa inicial de usuarios, auditoria consultavel no painel, cadastro da igreja com canal do YouTube, Inicio como painel operacional, pessoas com vinculo responsavel/crianca, grupos/ministerios, navegacao interna, presenca consolidada a partir de check-ins, agenda/eventos com recorrencia simples e expressao cron textual, inscricoes publicas de eventos com participantes, pagamento manual, recibo/ingresso, QR Code e check-in de participantes, reservas de ambientes, calendario visual mensal/semanal, check-in por evento e ministerio infantil com abas internas, etiqueta, QR Code, leitura por camera, impressao Brother em lote e retirada por responsavel logado, escalas/cultos com confirmacao propria, financeiro com filtros/resumos, testes automatizados de API, smoke tests do frontend e permissao granular inicial por modulo.

## Stack Atual

- Monorepo npm.
- Frontend: React + Vite + TypeScript.
- Backend: Node.js + TypeScript.
- Contratos compartilhados: `packages/shared`.
- Persistencia local configurada: PostgreSQL via Prisma com `ECCLESIAOS_DATA_PROVIDER=prisma`.
- Persistencia JSON: mantida para testes automatizados e fallback.

## Modulos Implementados

| Modulo | Status | Observacoes |
| --- | --- | --- |
| Documentacao base | Concluido | Fonte de verdade do projeto. |
| Fundacao tecnica | Concluido | Monorepo com web, api e shared. |
| Autenticacao | Concluido | Login para admin, lider e membro. |
| Registro Publico | Concluido | Cadastro cria pessoa e usuario `member` vinculado. |
| Persistencia inicial | Concluido | Dados em JSON local. |
| Igreja | Concluido | Igreja unica simples, sem campus, com canal do YouTube configuravel. |
| Pessoas | Concluido | CRUD minimo por admin, leitura por autenticados e responsaveis vinculados. |
| Grupos e Ministerios | Concluido | CRUD minimo por admin, leitura por autenticados. |
| Layout e Navegacao | Concluido | Inicio, Igreja, Pessoas e Grupos em secoes navegaveis. |
| Presenca | Oculto no menu | Codigo e endpoints mantidos; fluxo operacional migrou para Agenda/Check-in. |
| Relatorios de Presenca | Implementado | Indicadores client-side mantidos na pagina Presenca, hoje fora da navegacao principal. |
| Escalas e Cultos | Implementado | Planos simples com pessoas escaladas por funcao; typecheck concluido. |
| Confirmacao de Escala | Implementado | Admin ajusta status; membro/lider responde a propria escala. |
| Financeiro | Implementado | Lancamentos, filtros, resumos por fundo/categoria e recibo inicial. |
| Testes Automatizados | Implementado | `node:test` cobrindo repositorios e endpoints HTTP da API. |
| Testes Do Frontend | Implementado | Playwright cobrindo login, navegacao e Financeiro. |
| Banco Real | Concluido | PostgreSQL/Prisma validado em runtime local com Docker. |
| Permissoes Granulares | Implementado | Financeiro restrito a admin na API e na navegacao. |
| Banco Local E Usuarios | Concluido | `.env`, seed Prisma e login real dos tres usuarios validados. |
| Usuarios E Permissoes | Implementado | CRUD admin de usuarios e `canAccessModule` compartilhado. |
| Senha Segura | Concluido | Senhas em hash `scrypt` com upgrade automatico de legado. |
| Auditoria | Implementado | Logs consultaveis no painel com filtros por acao, entidade, usuario, data e busca. |
| Agenda E Eventos | Concluido | CRUD de eventos, inscricoes, locais sugeridos por Ambientes e expressao cron textual. |
| Inscricoes De Eventos | Implementado | Link publico por slug, limite de vagas, participantes, status manual, recibo/ingresso, QR Code e check-in. |
| Ambientes E Reservas | Concluido | Cadastro de ambientes, reservas por horario e bloqueio de conflito. |
| Calendario | Concluido | Visao mensal/semanal, detalhe do dia e filtro por ambiente. |
| Presenca Por Evento | Concluido | `eventId` em presenca, resumo por evento e consolidacao automatica de check-ins. |
| Check-in | Implementado | Check-in de pessoas por evento com presenca consolidada, Kids separado, administracao kids interna, mensagem ao responsavel, etiqueta com QR Code, leitura por camera, impressao Brother individual/lote, saida e retirada por responsavel logado. |
| Inicio | Concluido | Painel operacional com KPIs, proximos eventos e area de transmissoes do YouTube. |
| YouTube | Concluido | Endpoint proprio le feed RSS publico do canal, suporta handle e exibe os ultimos videos na Inicio. |

## Usuarios De Desenvolvimento

| Papel | Email | Senha |
| --- | --- | --- |
| Admin | admin@ecclesiaos.local | admin123 |
| Lider | lider@ecclesiaos.local | lider123 |
| Membro | membro@ecclesiaos.local | membro123 |

## Permissoes Atuais

- Admin: cria, edita e remove igreja, pessoas, grupos e usuarios; acessa e gerencia Financeiro.
- Lider: visualiza dados e responde propria escala quando vinculado a uma pessoa.
- Membro: visualiza dados e responde propria escala quando vinculado a uma pessoa.

Permissoes por modulo comecam em `canAccessModule`: `finance` e `users` sao somente `admin`.

## Endpoints Atuais

### Sistema

- `GET /health`

### YouTube

- `GET /youtube/videos`

A tela Inicio usa esse endpoint para listar os ultimos videos do canal configurado em `youtubeChannelUrl`. O backend resolve `@handle` quando necessario e mantem cache em memoria com TTL de 10 minutos.

### Autenticacao

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`

### Usuarios

- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### Auditoria

- `GET /audit-logs`

A tela Auditoria usa esse endpoint e filtros client-side. Somente `admin` pode acessar.

### Igreja

- `GET /church/profile`
- `PUT /church/profile`

### Pessoas

- `GET /people`
- `POST /people`
- `PUT /people/:id`
- `DELETE /people/:id`

Pessoas podem possuir `guardianPersonIds`, usado para vincular criancas a responsaveis permanentes e sugerir responsaveis no check-in infantil.

### Grupos

- `GET /groups`
- `POST /groups`
- `PUT /groups/:id`
- `DELETE /groups/:id`

### Presenca

- `GET /attendance`
- `POST /attendance`
- `PUT /attendance/:id`
- `DELETE /attendance/:id`

### Agenda E Eventos

- `GET /events`
- `POST /events`
- `PUT /events/:id`
- `DELETE /events/:id`

### Inscricoes De Eventos

- `GET /public/events/:slug`
- `POST /public/events/:slug/registrations`
- `GET /event-registrations`
- `PATCH /event-registrations/:id/status`
- `PATCH /event-registrations/:id/checkin`

Admin pode confirmar pagamento, voltar para pendente ou cancelar inscricao. A tela Agenda exibe participantes do evento selecionado, filtros por status e recibo/ingresso imprimivel.
Ingressos possuem `ticketCode` e QR Code. Admin pode validar ingresso por camera ou payload manual na tela Agenda.

### Ambientes E Reservas

- `GET /resources`
- `POST /resources`
- `PUT /resources/:id`
- `DELETE /resources/:id`
- `GET /room-reservations`
- `POST /room-reservations`
- `PUT /room-reservations/:id`
- `DELETE /room-reservations/:id`

### Check-in

- `GET /event-checkins`
- `POST /event-checkins`
- `DELETE /event-checkins/:id`
- `GET /child-checkins`
- `POST /child-checkins`
- `PATCH /child-checkins/:id/checkout`

Admin e lider podem registrar saida infantil diretamente. Membro autenticado pode retirar apenas criancas vinculadas ao seu `personId` e precisa enviar `securityCode`.

### Escalas

- `GET /serving-plans`
- `POST /serving-plans`
- `PUT /serving-plans/:id`
- `DELETE /serving-plans/:id`
- `PATCH /serving-plans/:planId/assignments/:assignmentId/status`
- `GET /serving-notifications`

As pessoas escaladas possuem status `pending`, `confirmed` ou `declined`.

### Financeiro

- `GET /financial-transactions`
- `POST /financial-transactions`
- `PUT /financial-transactions/:id`
- `DELETE /financial-transactions/:id`

Os lancamentos financeiros possuem tipo `income` ou `expense`. Todas as rotas financeiras exigem `admin`.

## Ultimas Validacoes

Comandos validados ao longo das fases:

```powershell
npm.cmd run reset-dev-data
npm.cmd run test
npm.cmd run test:web
npm.cmd run typecheck
npm.cmd run build
```

Fluxos validados:

- login de admin, lider e membro;
- leitura de usuario atual;
- edicao de igreja por admin;
- bloqueio de edicao de igreja para membro;
- CRUD de pessoas por admin;
- bloqueio de alteracao de pessoas para membro;
- CRUD de grupos por admin;
- bloqueio de alteracao de grupos para membro.
- Presenca: codigo e endpoints mantidos; aba oculta da navegacao principal.
- Relatorios de Presenca: calculos no frontend mantidos na pagina Presenca, hoje fora da navegacao principal.
- Escalas e Financeiro: codigo implementado, typecheck concluido e build completo concluido; endpoint financeiro validado contra a API compilada.
- Testes Automatizados: 8 testes de repositorios e endpoints HTTP passando com arquivo temporario.
- Banco Real: Prisma Client gerado; schema/migrations aplicados; seed e `db:verify` concluidos em PostgreSQL local.
- Aprofundar Escalas: typecheck e build da API concluidos; testes automatizados pendentes por bloqueio de execucao elevada.
- Aprofundar Financeiro: filtros e resumos no frontend; typecheck concluido.
- Testes Do Frontend: `npm.cmd run test:web` concluido com 2 testes Playwright passando.
- Banco Real runtime: API compilada validada em modo Prisma com login admin e financeiro.
- Permissoes Granulares: Financeiro restrito a admin em backend e menu lateral; `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run test:web` e `npm.cmd run build` concluidos.
- Banco Local E Usuarios: `docker compose up -d postgres`, `npm.cmd run db:migrate`, `npm.cmd run reset-dev-data`, `npm.cmd run db:verify`, login HTTP real dos tres usuarios, browser, typecheck, testes, smoke tests e build concluidos.
- Usuarios E Permissoes: `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run build` concluidos; `/users` validado contra API local.
- Senha Segura: `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run build`, `npm.cmd run reset-dev-data` e `npm.cmd run db:verify` concluidos com senhas semente em hash.
- Auditoria: `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run db:migrate`, `npm.cmd run build`, `npm.cmd run reset-dev-data` e `npm.cmd run db:verify` concluidos.
- Agenda E Eventos: `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run db:migrate`, `npm.cmd run build`, `npm.cmd run reset-dev-data` e `npm.cmd run db:verify` concluidos com `Events: 2`.
- Presenca Por Evento: `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run db:migrate`, `npm.cmd run build`, `npm.cmd run reset-dev-data` e `npm.cmd run db:verify` concluidos com `Attendance linked to events: 2`.
- Check-in: `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run db:migrate`, `npm.cmd run build`, `npm.cmd run reset-dev-data` e `npm.cmd run db:verify` concluidos com tabelas de check-in.
- Inscricoes De Eventos: `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run build`, `npm.cmd run reset-dev-data` e `npm.cmd run db:verify` concluidos com `Event registrations: 0`; migration aplicada apos reset do schema local de desenvolvimento.
- Ambientes E Reservas: `npm.cmd run db:generate`, `npm.cmd run typecheck`, `npm.cmd run db:migrate`, `npm.cmd run reset-dev-data`, `npm.cmd run db:verify`, `npm.cmd run test` e `npm.cmd run build` concluidos com `Resources: 2`, `Room reservations: 1` e 16 testes passando.
- Calendario: `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; calendario consolidado criado no frontend.
- Calendario Semanal: `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; detalhe de dia e filtro por ambiente adicionados.
- Registro Publico: `npm.cmd run typecheck`, `npm.cmd run reset-dev-data`, `npm.cmd run db:verify`, `npm.cmd run test` e `npm.cmd run build` concluidos; 17 testes passando.
- Etiquetas Infantis: `npm.cmd run db:generate`, `npm.cmd run typecheck`, `npm.cmd run db:migrate`, `npm.cmd run reset-dev-data`, `npm.cmd run db:verify`, `npm.cmd run test` e `npm.cmd run build` concluidos; 17 testes passando.
- Responsaveis E Criancas: `npm.cmd run db:generate`, `npm.cmd run typecheck`, `npm.cmd run db:migrate`, `npm.cmd run reset-dev-data`, `npm.cmd run db:verify`, `npm.cmd run test` e `npm.cmd run build` concluidos; 18 testes passando.
- Retirada Infantil Por Responsavel Logado E QR Code: `npm.cmd run build --workspace @ecclesiaos/shared`, `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; 19 testes passando.
- Leitura De QR Code E Etiquetas Brother: `npm.cmd run typecheck` concluido na fase; `npm.cmd run test` e `npm.cmd run build` validados posteriormente com 19 testes passando.
- Aprofundar Inscricoes De Eventos: `npm.cmd run build --workspace @ecclesiaos/shared` e `npm.cmd run typecheck` concluidos na fase; `npm.cmd run test` e `npm.cmd run build` validados posteriormente com 19 testes passando.
- QR Code De Ingresso: `npm.cmd run db:generate`, `npm.cmd run typecheck`, `npm.cmd run db:migrate`, `npm.cmd run reset-dev-data`, `npm.cmd run db:verify`, `npm.cmd run test` e `npm.cmd run build` concluidos; migration confirmada no PostgreSQL local e 19 testes passando.
- Impressao Em Lote De Etiquetas Infantis: `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; 19 testes passando.
- Tela De Auditoria: `npm.cmd run build --workspace @ecclesiaos/shared`, `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; 19 testes passando.
- Consolidar Check-in Em Presenca: `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; 19 testes passando.
- UX Inicial, Inicio Operacional, Agenda E Check-in: `npm.cmd run build --workspace @ecclesiaos/shared`, `npm.cmd run db:generate`, `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run build`, migration Prisma e `npm.cmd run db:verify` concluidos; 19 testes passando.
- YouTube Real Sem Chave Oficial: `npm.cmd run build --workspace @ecclesiaos/shared`, `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; 19 testes passando; endpoint `GET /youtube/videos` integrado a tela Inicio.

## Riscos E Dividas Tecnicas

- A persistencia em JSON ainda existe como fallback e base de testes isolados.
- O modo Prisma depende do Docker Desktop ativo para teste local.
- Senhas estao em texto puro apenas para desenvolvimento local.
- Ainda nao ha React Router; a navegacao atual e por estado interno do frontend.
- A suite de frontend ainda e smoke test, nao cobertura completa de formularios.
- Banco relacional local depende do Docker Desktop ativo quando for usado.
- A matriz completa de permissoes ainda nao existe; apenas Financeiro foi restringido granularmente.
- Ainda nao existe troca propria ou reset de senha por email.
- Registro publico ainda nao tem confirmacao de email nem aprovacao manual antes do primeiro login.
- Impressao Brother depende do driver instalado e do dialogo do navegador.
- Leitura de QR Code por camera depende de suporte do navegador a `BarcodeDetector`; ha fallback manual.
- Auditoria ainda nao guarda diff completo de campos nem exporta relatorios.
- Eventos ainda nao geram ocorrencias recorrentes automaticamente.
- Inscricoes pagas dependem de confirmacao manual; nao ha gateway de pagamento.
- Ingressos ainda nao sao enviados por email automaticamente.
- Calendario ainda nao possui edicao rapida, drag and drop ou endpoint agregado.
- Reservas ainda nao possuem recorrencia, solicitacao ou aprovacao.
- A tela Inicio le o feed RSS publico do YouTube via backend; ainda nao usa a API oficial. Eventuais bloqueios de rate limit do YouTube no IP do servidor podem afetar a listagem; o cache em memoria de 10 minutos reduz o risco.
- A expressao cron ainda nao gera ocorrencias automaticamente.
- Mensagens para responsaveis ainda abrem WhatsApp/SMS; nao ha envio interno auditavel.

## Proxima Recomendacao

Ordem definida concluida: Banco Real preparado, Escalas aprofundado, Financeiro aprofundado e Testes Do Frontend criados.

Proxima recomendacao: seguir para Fase 44 (Cron Real com ocorrencias materializadas) ou nova arquitetura de Escalas por equipes solicitadas.
