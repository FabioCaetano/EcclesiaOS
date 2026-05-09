# Status Do Projeto

## Resumo

O EcclesiaOS esta em desenvolvimento faseado. O projeto ja possui frontend, API propria, autenticacao com senha em hash, registro publico com pessoa vinculada, PostgreSQL/Prisma configurado para teste local, gestao administrativa inicial de usuarios, auditoria consultavel no painel, cadastro da igreja com canal do YouTube, Inicio como painel operacional, pessoas com vinculo responsavel/crianca, grupos/ministerios, navegacao interna, presenca consolidada a partir de check-ins, agenda/eventos com recorrencia simples e expressao cron textual, inscricoes publicas de eventos com participantes, pagamento manual, recibo/ingresso, QR Code e check-in de participantes, reservas de ambientes, calendario visual mensal/semanal, check-in por evento e ministerio infantil com abas internas, etiqueta, QR Code, leitura por camera, impressao Brother em lote e retirada por responsavel logado, escalas/cultos com confirmacao propria, musicas/repertorios, liturgia/checklists, formularios customizados, visao unica operacional do culto, financeiro com filtros/resumos, testes automatizados de API, smoke tests do frontend e permissao granular inicial por modulo.

## Stack Atual

- Monorepo npm.
- Frontend: React + Vite + TypeScript.
- Backend: Node.js + TypeScript.
- Contratos compartilhados: `packages/shared`.
- Persistencia local configurada: PostgreSQL via Prisma com `ECCLESIAOS_DATA_PROVIDER=prisma`.
- Persistencia JSON: mantida para testes automatizados e fallback.

## Feedback Atual

Feedback consolidado em [[feedback-2026-05-07|Feedback De Produto - 2026-05-07]].

Prioridades abertas:

- Agenda ja foi estabilizada na Fase 66 com erros especificos, Ambiente em vez de Local e recorrencias materializadas.
- Estabilizacao aplicada: falha Prisma `P2028` na materializacao lazy de recorrencias em `GET /events` nao deve mais derrubar a API, e novas ocorrencias usam escrita incremental no Prisma.
- Rotas publicas no Vercel ja possuem rewrite SPA na Fase 66.
- Check-in ganhou contexto operacional por evento/culto na Fase 73; ainda pode evoluir para salas infantis por idade e dashboard por sala.
- Escalas foi reorganizada na Fase 68: membro ve proprias escalas, lider ve equipes lideradas, matriz fica para admin/lider e indisponibilidade fica no modulo.
- Grupos/ministerios suportam posicoes operacionais e posicoes por pessoa desde a Fase 72.
- Ambientes teve mensagens e formularios separados na Fase 67; ainda pode receber polimento visual adicional.
- Igreja precisa permitir upload de logo e remover a area de etiquetas para o modulo Check-in.

## Modulos Implementados

| Modulo | Status | Observacoes |
| --- | --- | --- |
| Documentacao base | Concluido | Fonte de verdade do projeto. |
| Fundacao tecnica | Concluido | Monorepo com web, api e shared. |
| Autenticacao | Concluido | Login para admin, lider e membro. |
| Registro Publico | Concluido | Cadastro cria pessoa e usuario `member` vinculado. |
| Persistencia inicial | Concluido | Dados em JSON local. |
| Igreja | Concluido | Igreja unica simples, sem campus, com canal do YouTube configuravel. |
| Pessoas | Concluido | CRUD por admin, leitura por autenticados, responsaveis vinculados, membresia, endereco, batismo, genero e ministerios derivados dos grupos. |
| Grupos e Ministerios | Concluido | CRUD minimo por admin, leitura por autenticados, posicoes de servico e posicoes por pessoa em ministerios/equipes. |
| Layout e Navegacao | Concluido | Inicio, Igreja, Pessoas e Grupos em secoes navegaveis. |
| Presenca | Oculto no menu | Codigo e endpoints mantidos; fluxo operacional migrou para Agenda/Check-in. |
| Relatorios de Presenca | Implementado | Indicadores client-side mantidos na pagina Presenca, hoje fora da navegacao principal. |
| Escalas e Cultos | Implementado | Planos por equipe e posicao; filtra pessoas por posicao habilitada e sugere substitutos por posicao. |
| Confirmacao de Escala | Implementado | Membro/lider responde a propria escala; pendencias aparecem filtradas por perfil. |
| Financeiro | Implementado | Lancamentos, filtros, resumos por fundo/categoria e recibo inicial. |
| Testes Automatizados | Implementado | `node:test` cobrindo repositorios e endpoints HTTP da API. |
| Testes Do Frontend | Implementado | Playwright cobrindo login, navegacao e Financeiro. |
| Banco Real | Concluido | PostgreSQL/Prisma validado em runtime local com Docker. |
| Permissoes Granulares | Implementado | Financeiro restrito a admin na API e na navegacao. |
| Banco Local E Usuarios | Concluido | `.env`, seed Prisma e login real dos tres usuarios validados. |
| Usuarios E Permissoes | Implementado | CRUD admin de usuarios e `canAccessModule` compartilhado. |
| Senha Segura | Concluido | Senhas em hash `scrypt` com upgrade automatico de legado. |
| Auditoria | Implementado | Logs consultaveis no painel com filtros por acao, entidade, usuario, data e busca. |
| Agenda E Eventos | Concluido | CRUD de eventos, inscricoes, Ambiente selecionado a partir de Ambientes ativos, expressao cron textual e recorrencias materializadas. |
| Inscricoes De Eventos | Implementado | Link publico por slug, limite de vagas, participantes, status manual, recibo/ingresso, QR Code, check-in administrativo e self-service por `/event-checkin/<slug>`. |
| Ambientes E Reservas | Concluido | Cadastro de ambientes, reservas por horario, bloqueio de conflito e mensagens separadas por formulario. |
| Calendario | Concluido | Visao mensal/semanal, detalhe do dia e filtro por ambiente. |
| Presenca Por Evento | Concluido | `eventId` em presenca, resumo por evento e consolidacao automatica de check-ins. |
| Check-in | Implementado | Check-in de pessoas por evento com presenca consolidada, Kids separado, contexto operacional por evento/culto, administracao kids interna, aba Etiquetas, preview configuravel, mensagem ao responsavel, etiqueta com QR Code, leitura por camera, impressao Brother individual/lote, saida e retirada por responsavel logado. |
| Inicio | Concluido | Painel operacional com KPIs, proximos eventos e area de transmissoes do YouTube. |
| YouTube | Concluido | Endpoint proprio le feed RSS publico do canal, suporta handle e exibe os ultimos videos na Inicio. |
| Cron Real | Concluido | Expressao cron gera ocorrencias reais materializadas como eventos filhos com `parentEventId`; geracao lazy ao listar e manual por endpoint admin. |
| Equipes Por Evento | Concluido | Evento solicita equipes (`requestedTeamIds`); planos de escala sao sincronizados com `eventId`; lider edita atribuicoes do proprio plano com pessoas da equipe; recusas geram substitutos sugeridos automaticamente. |
| Etiquetas E Camera | Concluido | Camera QR funciona em qualquer navegador via `jsqr` fallback; templates de etiqueta cadastraveis com layouts `kids_checkin` e `visitor`; secao "Etiquetas" no cadastro da igreja. |
| Pre-Cadastro De Visitantes | Concluido | Endpoint publico `POST /public/visitors` cria pessoa visitor; pagina `/visitor` sem login; ChurchPage exibe QR Code com download PNG. |
| Templates De Mensagem | Concluido | Entidade `MessageTemplate` com CRUD em `/message-templates`; variaveis `{{firstName}}`, `{{lastName}}`, `{{fullName}}`, `{{email}}`, `{{phone}}`, `{{churchName}}` substituidas por destinatario no email/whatsapp/mailto. |
| Confirmacao De Email Em Inscricoes | Concluido | Flag opcional por evento `registrationRequiresEmailConfirmation`; status `pending_email_confirmation`; token sha256 + 24h; endpoint publico `POST /public/event-registrations/confirm`; capacidade ignora pendentes expirados; admin pode reenviar/renovar confirmacao por `POST /event-registrations/:id/resend-confirmation`. |
| Musicas | Concluido | Biblioteca de musicas e repertorios vinculados a cultos/eventos. |
| Liturgia | Concluido | Checklists/liturgias por culto/evento, com itens ordenados e status de concluido. |
| Formularios | Concluido | Formularios customizados com campos configuraveis, responsaveis, link publico, respostas, notificacoes por email, exportacao CSV, filtros e relatorios agregados. |
| Culto | Concluido | Visao unica operacional por culto/evento, consolidando Agenda, Escalas, Musicas, Liturgia e Inscricoes, com modo Execucao, modo foco, acoes diretas na liturgia e atalhos para modulos de origem. |

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

### Etiquetas

- `GET /label-templates`
- `GET /label-templates?layout=kids_checkin|visitor`
- `POST /label-templates`
- `PUT /label-templates/:id`
- `DELETE /label-templates/:id`

Qualquer autenticado pode listar templates. Apenas admin cria, edita ou remove. Marcar `isDefault=true` em um template desmarca os outros do mesmo layout.

### YouTube

- `GET /youtube/videos`

A tela Inicio usa esse endpoint para listar os ultimos videos do canal configurado em `youtubeChannelUrl`. O backend resolve `@handle` quando necessario e mantem cache em memoria com TTL de 10 minutos.

### Autenticacao

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `POST /public/visitors`

`POST /public/visitors` e publico, cria `PersonProfile` com status `visitor`, registra audit e dispara email de boas-vindas quando provedor configurado e visitante deu email. Resposta sempre 200 generica.

### Templates De Mensagem

- `GET /message-templates`
- `POST /message-templates`
- `PUT /message-templates/:id`
- `DELETE /message-templates/:id`

Leitura permitida a qualquer autenticado. Escrita restrita a `canManageModule("messages")`. Cada template guarda `name`, `channel`, `subject` e `body` com placeholders Mustache. `POST /people-messages` aplica `substituteMessageVariables` por destinatario antes do envio Resend.

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
- `POST /events/:id/generate-occurrences`

`GET /events` materializa lazyamente ocorrencias dos eventos cron antes de listar. `POST /events/:id/generate-occurrences` regenera ocorrencias futuras de um evento mestre cron e e restrito a admin. Eventos com `parentEventId` nao vazio sao ocorrencias materializadas vinculadas ao mestre.

### Inscricoes De Eventos

- `GET /public/events/:slug`
- `POST /public/events/:slug/registrations`
- `POST /public/event-registrations/confirm`
- `POST /public/event-registrations/checkin`
- `GET /event-registrations`
- `POST /event-registrations/:id/resend-confirmation`
- `PATCH /event-registrations/:id/status`
- `PATCH /event-registrations/:id/checkin`

Admin pode confirmar pagamento, voltar para pendente ou cancelar inscricao. A tela Agenda exibe participantes do evento selecionado, filtros por status e recibo/ingresso imprimivel.
Ingressos possuem `ticketCode` e QR Code. Admin pode validar ingresso por camera ou payload manual na tela Agenda. O link `/event-checkin/<slug>` permite check-in self-service por tablet/celular, validando se o ingresso pertence ao evento. Inscricoes aguardando email podem ter a confirmacao reenviada; o token e renovado por mais 24 horas e o envio e best-effort via Resend.

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
- `GET /serving-plans?groupId=<id>` (filtro por equipe; usado por lideres)
- `POST /serving-plans`
- `PUT /serving-plans/:id`
- `DELETE /serving-plans/:id`
- `PATCH /serving-plans/:planId/assignments/:assignmentId/status`
- `GET /serving-plans/:planId/substitutes/:assignmentId`
- `GET /serving-notifications`

As pessoas escaladas possuem status `pending`, `confirmed` ou `declined`. `PUT /serving-plans/:id` aceita admin ou lider do `groupId` do plano. Lider so pode atribuir pessoas da `memberPersonIds` da equipe; admin escala qualquer pessoa. Ao receber `declined`, o endpoint de status retorna `substituteSuggestions` automaticamente e inclui candidatos no email ao lider quando Resend esta configurado.

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
- Cron Real Com Ocorrencias Materializadas: `npm.cmd run build --workspace @ecclesiaos/shared`, `npm.cmd run db:generate`, `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run build`, `npm.cmd run db:migrate:deploy`, `npm.cmd run reset-dev-data` e `npm.cmd run db:verify` concluidos; 21 testes passando.
- Eventos Solicitam Equipes E Lider Escala A Propria: `npm.cmd run build --workspace @ecclesiaos/shared`, `npm.cmd run db:generate`, `npm.cmd run typecheck`, `npm.cmd run test`, `npm.cmd run build`, `npm.cmd run db:migrate:deploy`, `npm.cmd run reset-dev-data` e `npm.cmd run db:verify` concluidos; 22 testes passando.
- Templates De Etiqueta E Camera QR Universal: `npm.cmd run build --workspace @ecclesiaos/shared`, `npm.cmd run db:generate`, `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; 23 testes passando. Migration `20260502050000_label_templates` deve ser aplicada com `npm.cmd run db:migrate:deploy` quando o Postgres estiver acessivel; em producao roda automaticamente no comando de build do Render.
- Pre-Cadastro De Visitantes Via QR: `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; 28 testes passando.
- Templates De Mensagem Com Variaveis: `npm.cmd run db:generate`, `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; 31 testes passando. Migration `20260507100000_message_templates` deve ser aplicada com `npm.cmd run db:migrate:deploy` quando o Postgres estiver acessivel.
- Confirmacao De Email No Registro Publico De Eventos: `npm.cmd run db:generate`, `npm.cmd run typecheck`, `npm.cmd run test` e `npm.cmd run build` concluidos; 33 testes passando. Migration `20260507110000_event_registration_email_confirmation` deve ser aplicada com `npm.cmd run db:migrate:deploy` quando o Postgres estiver acessivel.

## Riscos E Dividas Tecnicas

- A persistencia em JSON ainda existe como fallback e base de testes isolados.
- O modo Prisma depende do Docker Desktop ativo para teste local.
- Senhas estao em texto puro apenas para desenvolvimento local.
- Ainda nao ha React Router; a navegacao atual e por estado interno do frontend.
- A suite de frontend ainda e smoke test, nao cobertura completa de formularios.
- Banco relacional local depende do Docker Desktop ativo quando for usado.
- A matriz completa de permissoes ainda nao existe; apenas Financeiro foi restringido granularmente.
- Reset de senha por email existe; Fase 66 adicionou rewrite SPA no Vercel para permitir abrir `/forgot-password` e `/reset-password` diretamente.
- Registro publico ainda nao tem confirmacao de email nem aprovacao manual antes do primeiro login.
- Impressao Brother depende do driver instalado e do dialogo do navegador. Tamanhos sao injetados via `@page` na hora da impressao a partir do template selecionado.
- Leitura de QR Code por camera funciona em qualquer navegador moderno: usa `BarcodeDetector` quando disponivel e cai para `jsqr` quando nao; ainda depende de HTTPS/localhost e permissao de camera.
- Auditoria ainda nao guarda diff completo de campos nem exporta relatorios.
- Eventos recorrentes possuem materializacao para `weekly`, `monthly` e `cron`; ainda nao ha worker em background, geracao acontece sob demanda.
- A materializacao sob demanda passou a usar escrita incremental no Prisma para novos eventos filhos e planos de escala; publicacao ainda pendente nesta sessao.
- Em 2026-05-08 foi corrigido deadlock Prisma em escritas concorrentes com fila em memoria e retry para `40P01`; ver [[fixes/2026-05-08-prisma-deadlock-write-queue|Correcao - Deadlock Prisma Em Escritas Concorrentes]].
- A reorganizacao de Escalas da Fase 68 passou em `build:web`, `build:api` e 37 testes da API em 2026-05-07.
- A Fase 69 adicionou `servicePositions` em ministerios/equipes e requer migration Prisma `20260507130000_group_service_positions`.
- A Fase 69 passou em `db:generate`, `build:web`, `build:api` e 37 testes da API em 2026-05-07.
- A Fase 72 adicionou `memberServicePositions` em ministerios/equipes e requer migration Prisma `20260507140000_group_member_service_positions`.
- A Fase 72 passou em `db:generate`, `build:web`, `build:api` e 37 testes da API em 2026-05-07.
- A Fase 73 adicionou contexto operacional por evento/culto no Check-in e passou em `build:web`, `build:api` e 37 testes da API em 2026-05-07.
- A Fase 74 adicionou campos ampliados em Pessoas e passou em `db:generate`, `build:web`, `build:api` e 37 testes da API em 2026-05-07.
- Inscricoes pagas dependem de confirmacao manual; nao ha gateway de pagamento.
- Ingressos ainda nao sao enviados por email automaticamente.
- Calendario ainda nao possui edicao rapida, drag and drop ou endpoint agregado.
- Reservas ainda nao possuem recorrencia, solicitacao ou aprovacao.
- A tela Inicio le o feed RSS publico do YouTube via backend; ainda nao usa a API oficial. Eventuais bloqueios de rate limit do YouTube no IP do servidor podem afetar a listagem; o cache em memoria de 10 minutos reduz o risco.
- A expressao cron passa a gerar ocorrencias materializadas no banco; ainda nao ha worker em background, geracao acontece sob demanda (lazy ao listar e manual via endpoint admin).
- Mensagens para responsaveis ainda abrem WhatsApp/SMS; nao ha envio interno auditavel.

## Proxima Recomendacao

Ordem definida concluida: Banco Real preparado, Escalas aprofundado, Financeiro aprofundado e Testes Do Frontend criados.

Proxima recomendacao: publicar a Fase 74 e depois seguir para **Relatorios 1 - Pessoas**.
# Status Atual - Fase 75

Fase 75 implementada como primeira entrega da area de Relatorios. A aplicacao agora possui uma aba `Relatorios` no grupo Sistema, restrita a administradores, consolidando dados de pessoas e grupos para indicadores iniciais.

## Entregue na fase

- Indicadores gerais de pessoas, membros, visitantes e batizados.
- Aniversariantes dos proximos 7 dias.
- Segmentacao de membros por genero e faixa etaria.
- Resumo de ministerios/equipes.
- Exportacao CSV de pessoas.

## Validacao pendente

A validacao automatizada ficou pendente nesta sessao por bloqueio de execucao de comandos. Rodar:

```powershell
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```
# Status Atual - Fase 76

Fase 76 concluida. O EcclesiaOS agora possui o modulo `Musicas`, com cadastro de musicas e repertorios vinculaveis a cultos/eventos.

## Entregue na fase

- Biblioteca de musicas.
- Repertorios por culto/evento.
- Persistencia local e PostgreSQL/Prisma.
- Rotas de API protegidas.
- Tela operacional no frontend.
- Teste de permissao: lider gerencia, membro visualiza.

## Validacao

- `npm run build:web`: passou.
- `npm run db:generate`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 38 testes.
# Status Atual - Fase 77

Fase 77 concluida. O EcclesiaOS agora possui uma aba propria de Liturgia/checklist por culto/evento, com responsaveis, horarios, notas e marcacao de concluido.

## Entregue na fase

- Entidade `ServiceChecklist`.
- Rotas protegidas de API.
- Persistencia local e PostgreSQL/Prisma.
- UI de planejamento e acompanhamento.
- Liturgia separada da aba Musicas.
- Teste de permissao: lider gerencia, membro visualiza.

## Validacao

- `npm run db:generate`: passou.
- `npm run build:web`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 39 testes.
# Status Atual - Fase 78

Fase 78 concluida. A Agenda agora mostra o preparo do culto no evento selecionado, consolidando equipes solicitadas, escalas, repertorios e liturgias vinculadas.

## Entregue na fase

- Painel `Preparo` dentro da Agenda.
- Resumo de equipes solicitadas.
- Resumo de escalas vinculadas.
- Resumo de repertorios vinculados.
- Resumo de liturgia/checklist vinculada.

## Validacao

- `npm run build:web`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 39 testes.
# Status Atual - Fase 79

Fase 79 concluida. O EcclesiaOS agora possui uma area de Formularios customizados, com criação de campos, responsaveis, link publico e acompanhamento das respostas.

## Entregue na fase

- Modulo `Formularios`.
- Link publico `/forms/:slug`.
- Respostas publicas persistidas.
- Gestão por lider/admin.
- Persistencia local e PostgreSQL/Prisma.

## Validacao

- `npm run db:generate`: passou.
- `npm run build:web`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.

# Status Atual - Fase 88

Fase 88 concluida. Agenda, Ambientes e Escalas receberam ajustes de fluxo para teste local com banco real.

## Entregue na fase

- Agenda gera ocorrencias automaticamente ao salvar evento recorrente.
- Agenda exibe ambiente com linguagem mais clara.
- Ambientes foi separado em abas internas de cadastro e reservas.
- Lider pode criar escala apenas para equipe que lidera.
- Membro segue restrito a responder escala e registrar indisponibilidade.
- Backend reforca permissao de criacao de escala por lider.

## Validacao

- `npm run build:api`: passou.
- `npm run build:web`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.
# Status Atual - Fase 80

Fase 80 concluida. Formularios customizados agora enviam notificacao por email aos responsaveis quando uma resposta publica chega e permitem exportar respostas em CSV.

## Validacao

- `npm run build:web`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.
# Status Atual - Fase 81

Fase 81 concluida. Formularios agora possuem busca e filtros por periodo nas respostas, e a exportacao CSV respeita o recorte visivel.

## Validacao

- `npm run build:web`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.
# Status Atual - Fase 82

Fase 82 concluida. O EcclesiaOS agora possui a aba **Culto**, uma visao unica operacional do culto/evento com resumo de agenda, equipes solicitadas, escala, repertorio, liturgia e inscricoes/check-in.

## Entregue na fase

- Modulo `serviceOps` com permissao para autenticados e gestao por admin/lider.
- Menu **Culto** no grupo Operacao.
- KPIs operacionais do culto/evento selecionado.
- Cards de equipes/escala, repertorio, liturgia e inscricoes.
- Status de escala e inscricoes traduzidos para o usuario.

## Validacao

- `npm run build:web`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.
# Status Atual - Fase 83

Fase 83 concluida. Formularios agora possuem relatorios agregados dentro da propria aba, usando os dados ja existentes de formularios e respostas.

## Entregue na fase

- Ranking de formularios por volume de respostas.
- Card de atividade recente.
- Indicador de respostas dos ultimos 7 dias.
- Relatorio do formulario selecionado por campo.
- Respostas preenchidas, vazias, unicas e mais comuns por campo.
- CSV de relatorio agregado alem do CSV de respostas.

## Validacao

- `npm run build:web`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.
# Status Atual - Fase 84

Fase 84 concluida. A aba **Culto** agora possui uma visao interna **Execucao**, focada no acompanhamento do culto em andamento.

## Entregue na fase

- Alternancia entre **Operacao** e **Execucao**.
- Destaque do item atual da liturgia.
- Proximo item pendente da liturgia.
- Linha do culto com status visual.
- Painel compacto de liturgia, escala, pendencias e check-in.
- Repertorio em lista compacta.
- Pendencias de escala para coordenacao.

## Validacao

- `npm run build:web`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.
# Status Atual - Fase 85

Fase 85 concluida. O modo **Execucao** da aba Culto agora permite atualizar a liturgia diretamente durante o culto.

## Entregue na fase

- Concluir item atual da liturgia.
- Concluir ou reabrir qualquer item da linha do culto.
- Modo foco com fullscreen do navegador quando permitido.
- Alerta para recusas de escala pendentes.
- Reuso do endpoint existente de Liturgia, sem nova API.

## Validacao

- `npm run build:web`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.
# Status Atual - Fase 87

Fase 87 concluida. A aba **Culto** agora possui atalhos para os modulos de origem da operacao.

## Entregue na fase

- Atalho para Agenda.
- Atalho para Escalas.
- Atalho para Musicas.
- Atalho para Liturgia.
- Atalhos filtrados por permissao de acesso do usuario.
- Navegacao usando o estado interno atual do frontend.

## Validacao

- `npm run build:web`: passou.
- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.
