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
- Check-in ganhou contexto operacional por evento/culto na Fase 73 e salas infantis configuraveis na Fase 90.
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
| Check-in | Implementado | Check-in de pessoas por evento com presenca consolidada, Kids separado, contexto operacional por evento/culto, administracao kids interna, filtros por sala, alerta de lotacao, aba Salas com faixa etaria/capacidade/responsaveis, aba Etiquetas, preview configuravel, mensagem ao responsavel, etiqueta com QR Code, leitura por camera, impressao Brother individual/lote, saida e retirada por responsavel logado. |
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

# Status Atual - Fase 89

Fase 89 concluida. O Check-in Kids agora possui sala sugerida por idade, dashboard por sala e impressao da sala nas etiquetas.

## Entregue na fase

- Regras iniciais de salas infantis por idade.
- Sala sugerida no formulario de check-in infantil.
- Dashboard lateral por sala na administracao kids.
- Sala exibida nos cards de criancas ativas.
- Campo opcional de sala na etiqueta infantil.

## Validacao

- `npm run build:web`: passou.
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

# Status Atual - Fase 92

Fase 92 concluida. A aba **Escalas** recebeu o primeiro polimento operacional do Passo 5, reduzindo ruido na lista e deixando recusas mais faceis de tratar.

## Entregue na fase

- Filtro de escalas por acoes pendentes, todas, pendentes, recusadas e confirmadas.
- Filtro de escalas por equipe/ministerio.
- Acoes pendentes respeitam o perfil:
  - membro ve principalmente escalas pendentes dele;
  - lider/admin ve planos com pendencias ou recusas.
- Sugestao de substituto com botao **Aplicar e salvar**.
- Substituto aplicado volta a atribuicao para status pendente e registra nota de substituicao.

## Validacao

- `npm run build:web`: passou.

# Status Atual - Fase 93

Fase 93 concluida. O detalhe da escala agora separa os escalados por status, deixando recusas e pendencias mais visiveis para o lider.

## Entregue na fase

- Resumo por status no detalhe do plano.
- Agrupamento visual de escalados em recusadas, pendentes e confirmadas.
- Recusas priorizadas no topo da lista.
- Edicao e substituicao preservadas sobre os mesmos registros.

## Validacao

- `npm run build:web`: passou.

# Status Atual - Fase 94

Fase 94 concluida. A aplicacao de substituto em Escalas agora possui uma rota propria no backend, com validacoes, auditoria e notificacao best-effort.

## Entregue na fase

- Contrato compartilhado para aplicar substituto.
- Endpoint dedicado `PATCH /serving-plans/:planId/assignments/:assignmentId/substitute`.
- Validacao de permissao por admin/lider da equipe.
- Validacao de membro da equipe, posicao ministerial, duplicidade na escala e indisponibilidade.
- Auditoria da substituicao.
- Frontend usando a nova API no botao **Aplicar e salvar**.

## Validacao

- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.
- `npm run build:web`: passou.

# Status Atual - Fase 95

Fase 95 concluida. Lideres e administradores agora possuem uma visao mensal de escalas por equipe, com carga por voluntario e status por culto/plano.

## Entregue na fase

- Aba **Mensal** em Escalas.
- Filtro por equipe e mes.
- Indicadores mensais de planos, confirmadas, pendentes e recusadas.
- Carga mensal por voluntario.
- Grade pessoa x plano do mes.
- Abertura direta do plano ao clicar em uma celula escalada.

## Validacao

- `npm run build:web`: passou.

# Status Atual - Fase 96

Fase 96 implementada. O Passo 5 - Escalas recebeu polimento final com sobrecarga mensal, exportacao, impressao e feedback de notificacao ao aplicar substituto.

## Entregue na fase

- Alerta de alta carga por voluntario na visao mensal.
- Exportacao CSV da escala mensal.
- Impressao da visao mensal.
- Feedback quando substituto e aplicado com ou sem notificacao enviada.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 97

Fase 97 implementada. A UX Operacional 2.0 comecou pela navegacao e pelo Calendario: Agenda saiu do menu lateral e o Calendario passou a ser o ponto de entrada para criar e acionar eventos/agendas.

## Entregue na fase

- Agenda removida do menu lateral.
- Botao **Novo evento/agenda** no Calendario para administradores.
- Acoes rapidas no detalhe do dia: abrir, editar e excluir evento.
- Reservas continuam abrindo o modulo Ambientes.
- Modulos operacionais sensiveis foram ocultados para usuarios `member`.
- Lista do detalhe do Calendario ajustada para desktop e mobile.

## Pendencias da consolidacao

- Edicao contextual com formulario ja preenchido pelo evento clicado.
- Abrir Culto ja filtrado pelo evento clicado.
- Lista completa de eventos/agendas abaixo do Calendario.
- Remocao final da Agenda como tela interna depois da transicao.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 98

Fase 98 implementada. O Calendario agora abre as telas internas no contexto do evento clicado, reduzindo a navegacao solta entre Calendario, Agenda e Culto.

## Entregue na fase

- Evento clicado no Calendario pode abrir Agenda interna com formulario preenchido.
- Evento clicado no Calendario pode abrir Culto operacional ja selecionado.
- Novo evento/agenda limpa o contexto antes de abrir o formulario.
- Agenda interna ganhou retorno para Calendario.
- Culto operacional respeita o evento recebido da navegacao contextual.
- Atalho do Culto agora aponta para Calendario, nao para Agenda.

## Pendencias da consolidacao

- Transformar Agenda em formulario contextual dentro do proprio Calendario.
- Mover lista completa de eventos/agendas para baixo do Calendario.
- Passar o mesmo contexto para Escalas, Musicas e Liturgia.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 99

Fase 99 implementada. O Check-in 2.0 foi iniciado pelo fluxo do responsavel logado, mantendo lider/admin com a operacao atual e dando ao membro comum uma entrada mais simples para Kids.

## Entregue na fase

- Membro comum abre Check-in direto em Kids.
- Abas administrativas de Check-in ficam ocultas para membro.
- Responsavel ve criancas vinculadas a sua pessoa.
- Responsavel seleciona criancas e gera check-in infantil para o culto selecionado.
- Criancas ja ativas no culto ficam bloqueadas na selecao.
- Backend valida vinculo familiar antes de permitir check-in por membro.
- Backend força dados do responsavel logado no registro criado.

## Pendencias da consolidacao

- Criar tela de totem por culto.
- Gerar/ler QR de pre-check-in no totem.
- Imprimir etiqueta pelo totem.
- Cadastro rapido de crianca pelo responsavel.
- Cadastro rapido de visitante.
- Alternar camera frontal/traseira.

## Validacao

- `npm run build:api`: pendente por bloqueio do ambiente nesta execucao.
- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 100

Fase 100 implementada. O Check-in Kids agora possui uma tela de totem autenticada por culto, voltada para operacao no balcao.

## Entregue na fase

- Rota `/kids-totem/:eventId`.
- Botao **Totem Kids** no Check-in para o evento selecionado.
- Dashboard de presentes, retiradas, total e salas em uso.
- Lista operacional de criancas por culto.
- Filtro por sala e busca por crianca/responsavel.
- Preview e impressao de etiqueta individual.
- Impressao em lote das criancas presentes.
- Checkout manual pelo operador.
- Checkout por leitura de QR da etiqueta.

## Pendencias da consolidacao

- QR de pre-check-in gerado pelo responsavel.
- Leitura do pre-check-in no totem para imprimir etiquetas.
- Cadastro rapido de visitante e crianca.
- Alternancia de camera frontal/traseira.
- Relatorio final do culto.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 101

Fase 101 implementada. O fluxo do responsavel agora conversa com o Totem Kids por QR de lote.

## Entregue na fase

- Responsavel ve QR das criancas ativas no culto.
- Totem Kids reconhece QR de pre-check-in do responsavel.
- Totem Kids valida culto, check-in e codigo de seguranca.
- Lote lido fica selecionado no totem.
- Operador pode imprimir somente o QR lido.
- QR da etiqueta continua registrando retirada.

## Pendencias da consolidacao

- Cadastro de crianca pelo responsavel.
- Cadastro rapido de visitante.
- Alternancia de camera frontal/traseira.
- Expiracao ou renovacao do QR.
- Relatorios de Check-in.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 102

Fase 102 implementada. O responsavel agora pode cadastrar uma crianca diretamente no Check-in Kids, com vinculo automatico.

## Entregue na fase

- Contrato `GuardianChildInput`.
- Rota `POST /people/my-children`.
- Backend exige usuario com pessoa vinculada.
- Backend cria crianca com o responsavel logado em `guardianPersonIds`.
- Frontend permite cadastrar crianca com nome, sobrenome, nascimento e observacoes.
- Crianca cadastrada fica selecionada para o check-in.

## Pendencias da consolidacao

- Edicao de crianca pelo responsavel.
- Autorizados adicionais para retirada.
- Dados medicos/alertas.
- Foto da crianca.
- Alternancia de camera.

## Validacao

- `npm run build:api`: pendente por bloqueio do ambiente nesta execucao.
- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 103

Fase 103 implementada. O leitor de QR agora permite selecionar e alternar cameras nos fluxos operacionais.

## Entregue na fase

- `useQrScanner` lista cameras disponiveis.
- Scanner permite selecionar `deviceId`.
- Scanner permite alternar para a proxima camera.
- Check-in Kids/Admin ganhou seletor e botao de virar camera.
- Totem Kids ganhou seletor e botao de virar camera.
- Leitor de ingresso em Eventos ganhou seletor e botao de virar camera.

## Pendencias da consolidacao

- Persistir camera preferida.
- Feedback visual apos leitura.
- Overlay/mira no video.
- Som/vibracao apos sucesso.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 104

Fase 104 implementada. O Check-in Kids agora destaca alertas importantes da crianca no fluxo do responsavel, no Totem e nas etiquetas.

## Entregue na fase

- Campos de alergias, saude e retirada no cadastro reduzido da crianca.
- Backend salva esses campos como notas estruturadas.
- Check-in Kids exibe alerta na lista do responsavel.
- Totem Kids exibe alerta na lista operacional.
- Etiquetas imprimem alerta quando existir.

## Pendencias da consolidacao

- Normalizar alertas em colunas futuras.
- Permitir edicao pelo responsavel.
- Autorizados adicionais estruturados.
- Foto da crianca.
- Relatorios de Check-in.

## Validacao

- `npm run build:api`: pendente por bloqueio do ambiente nesta execucao.
- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 105

Fase 105 implementada. O Totem Kids agora possui relatorio operacional por culto com exportacao CSV e impressao.

## Entregue na fase

- Acoes **CSV** e **Relatorio** no Totem Kids.
- Exportacao CSV com crianca, responsavel, telefone, sala, idade, status, entrada, saida e alertas.
- Painel de relatorio com distribuicao por sala.
- Painel de alertas importantes.
- Impressao de relatorio com elementos operacionais ocultos.

## Pendencias da consolidacao

- Relatorios historicos na aba Relatorios.
- PDF dedicado.
- Filtros entre cultos.
- Relatorios de eventos nao infantis.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 106

Fase 106 implementada. O fluxo de visitante no Check-in Kids agora esta mais explicito na entrada do app.

## Entregue na fase

- Botao **Visitante com crianca** na tela de login.
- Cadastro de visitante inicia com status `visitor`.
- Texto do cadastro explica o acesso limitado ao Check-in Kids.
- Apos cadastro visitante, o app abre diretamente a aba Check-in.
- Check-in Kids exibe aviso de acesso visitante para pessoa com status `visitor`.
- Fluxo usa o cadastro de crianca ja existente, mantendo vinculo ao responsavel logado.

## Pendencias da consolidacao

- Cadastro publico unificado de responsavel + criancas.
- Link compartilhavel dedicado para visitante Kids.
- Edicao de crianca pelo responsavel.
- Autorizados adicionais estruturados.
- Envio de QR por email/WhatsApp.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 107

Fase 107 implementada. Eventos com inscricao agora possuem um totem operacional autenticado para check-in de participantes.

## Entregue na fase

- Rota `/event-totem/:eventId`.
- Botao **Totem evento** na area de inscricoes da Agenda.
- Leitor de QR Code do ingresso com seletor/alternancia de camera.
- Validacao manual do payload do ingresso.
- Check-in manual na lista de participantes.
- Dashboard de inscricoes, esperados, presentes, ausentes e pendentes.
- Busca e filtros por status operacional.
- Exportacao CSV do evento.
- Impressao de relatorio do evento.

## Pendencias da consolidacao

- Permitir operadores/lideres autorizados sem liberar toda Agenda.
- Relatorios historicos na aba Relatorios.
- Totem publico por token operacional.
- Melhor feedback visual/sonoro apos leitura.
- Lista separada de ausentes ao final do evento.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.

# Status Atual - Fase 108

Fase 108 implementada. O Totem Evento agora possui permissao operacional para lideres, sem liberar a administracao completa da Agenda.

## Entregue na fase

- Guarda `requireEventOperator` no backend.
- Listagem de inscricoes liberada para `admin` e `leader`.
- Check-in de ingresso liberado para `admin` e `leader`.
- Atualizacao de status/reenvio/edicao de evento permanecem administrativas.
- Totem Evento habilita scanner e check-in manual para lideres.
- Check-in ganhou atalho **Totem evento** para eventos com inscricoes.

## Pendencias da consolidacao

- Operadores designados por evento.
- Permissao por grupo/ministerio responsavel pelo evento.
- Token publico temporario para totem sem login.
- Feedback visual/sonoro apos leitura.

## Validacao

- `npm run db:generate`: concluido.
- `npm run build:api`: concluido.
- `npm run build:web`: concluido.

# Status Atual - Fase 109

Fase 109 implementada. O scanner do Totem Evento agora possui feedback operacional e evita dupla leitura imediata do mesmo ingresso.

## Entregue na fase

- Feedback visual para sucesso, erro e leitura repetida.
- Vibracao best-effort em dispositivos compativeis.
- Sinal sonoro best-effort quando permitido pelo navegador.
- Janela curta de deduplicacao por payload lido.
- Mensagem clara quando a leitura repetida e ignorada.

## Pendencias da consolidacao

- Overlay/mira visual na camera.
- Preferencia persistida de camera.
- Configuracao de som/vibracao por usuario.
- Aplicar padrao semelhante ao Totem Kids.

## Validacao

- `npm run build:web`: pendente por bloqueio/limite do ambiente nesta execucao.

# Status Atual - Fase 110

Fase 110 implementada. O Totem Kids agora possui o mesmo padrao de feedback e deduplicacao do scanner do Totem Evento.

## Entregue na fase

- Feedback visual para sucesso, erro e leitura repetida.
- Vibracao best-effort em dispositivos compativeis.
- Sinal sonoro best-effort quando permitido pelo navegador.
- Janela curta de deduplicacao por QR lido.
- Mensagem clara quando o QR repetido e ignorado.

## Pendencias da consolidacao

- Overlay/mira visual na camera.
- Preferencia persistida de camera.
- Configuracao de som/vibracao por usuario.
- Historico de leituras recusadas.

## Validacao

- `npm run build:web`: pendente por bloqueio/limite do ambiente nesta execucao.

# Status Atual - Fase 111

Fase 111 implementada. A aba Relatorios agora inclui historico de inscricoes e check-ins de eventos.

## Entregue na fase

- Carregamento de eventos e inscricoes na aba Relatorios.
- Filtros por periodo, evento, status da inscricao e presenca.
- Indicadores de eventos, confirmados, presentes, ausentes, pendentes e receita confirmada.
- Previa das inscricoes filtradas.
- Exportacao CSV respeitando os filtros aplicados.

## Pendencias da consolidacao

- PDF dedicado.
- Graficos de evolucao por periodo.
- Relatorio por operador que fez check-in.
- Endpoint agregado caso o volume cresca.

## Validacao

- `npm run build:web`: pendente por bloqueio/limite do ambiente nesta execucao.

# Status Atual - Fase 112

Fase 112 implementada. O Totem Evento agora pode ser operado por pessoas designadas diretamente no evento, sem dar permissao completa de Agenda.

## Entregue na fase

- Campo `operatorPersonIds` no contrato compartilhado de eventos.
- Migration Prisma para `EventRecord.operatorPersonIds`.
- Formulario de Agenda com selecao de operadores do totem.
- API filtrando inscricoes para operadores designados.
- Check-in de ingresso validando operador por evento.
- Totem Evento liberado para admin, lider ou operador designado.
- Eventos recorrentes herdando operadores do evento mestre.

## Pendencias da consolidacao

- Rodar migrations/builds no ambiente local ou deploy.
- Permissao por grupo/ministerio responsavel.
- Token temporario de totem sem login.
- Relatorio por operador.

## Validacao

- `npm run build:api`: pendente por bloqueio/limite do ambiente nesta execucao.
- `npm run build:web`: pendente por bloqueio/limite do ambiente nesta execucao.

# Status Atual - Fase 113

Fase 113 implementada. A Liturgia agora usa linhas compactas, responsavel pesquisavel via `<datalist>`, sem "Concluido" no editor e notas gerais em destaque acima da lista.

## Entregue na fase

- `LiturgyPage` reescrita com grid `Hora | Item | Responsavel | Notas | acoes`.
- Cabecalho unico das colunas em vez de label por campo.
- Checkbox "Concluido" removido do editor; itens novos nascem `completed: false`.
- Responsavel pesquisavel com `<input list>` + `<datalist>` populado por `personRepository`.
- Botao de lixeira por linha substituindo o antigo "Remover item" full-width.
- Notas da liturgia repositorias acima da ordem do culto.
- CSS novo (`liturgy-items-grid`, `liturgy-item-row`, `icon-button`) com fallback responsivo abaixo de 900px.

## Pendencias da consolidacao

- Modo execucao da liturgia com cronometro e check de concluido em tempo real.
- Templates de liturgia reaproveitaveis.
- Drag-and-drop para reordenar itens.

## Validacao

- `npm run typecheck`: passou.
- `npm run build:web`: passou.

# Status Atual - Fase 115

Fase 115 implementada. Formularios ganhou builder estilo Google Forms: campos em linhas compactas com reordenacao, chips para opcoes de `select`, responsaveis pesquisaveis via `<datalist>` e preview do publico colapsavel. Sem mudancas em backend, banco ou contrato compartilhado.

## Entregue na fase

- `FormsPage` reescrita com `forms-fields-list` em grid horizontal `[label] [tipo] [obrigatorio] [↑↓] [X]`.
- Botoes ↑/↓ trocam posicao com o vizinho e renumeram `order`.
- Mudar tipo para algo diferente de `select` zera as opcoes para evitar inconsistencia.
- Opcoes de `select` viram chips editaveis com input por opcao, `+ Opcao` e X.
- Responsaveis pesquisaveis via `<input list>` + `<datalist>` populado por `personRepository`; chips removiveis exibem os selecionados; mensagem de erro se a pessoa digitada nao existe.
- Card colapsavel `Preview do publico` renderiza cada campo com o input apropriado (texto, textarea, email, telefone, numero, data, select, checkbox).
- Bloco `Configuracoes` colapsavel agrupa slug e link publico, limpando o topo da pagina.
- CSS novo (`forms-builder`, `forms-fields-list`, `forms-field-row`, `forms-field-options`, `forms-chip`, `collapsible-card`, `forms-preview`).
- Modo compacto abaixo de 900px com cabecalho oculto e linhas em coluna.

## Pendencias da consolidacao

- Drag-and-drop para reordenar campos.
- Tipos de campo novos (radio, escala, arquivo).
- Logica condicional ("se A entao mostre B").
- Templates de formulario reaproveitaveis.

## Validacao

- `npm run typecheck`: passou.
- `npm run build:web`: passou.

# Status Atual - Fase 114

Fase 114 implementada. Ambientes ganhou uma aba **Calendario** como entrada principal: grid mensal real com pills coloridas por ambiente, atalho de criacao por dia clicado e abertura direta do editor ao clicar numa reserva. Permissao foi alinhada ao backend (lider + admin).

## Entregue na fase

- Nova aba `Calendario` virou a primeira da pagina Ambientes.
- Grid mensal 7 colunas (Dom a Sab) com buffer cinza dos meses adjacentes.
- Pills de reserva com ate 3 visiveis por dia e `+N` quando ha mais; cancelled em opacidade reduzida.
- Cor de cada pill derivada de hash deterministico do `resourceId` (paleta de 10).
- Clicar em pill leva para a aba Reservas com o editor preenchido.
- Clicar em dia vazio inicia nova reserva pre-preenchendo `date` e `resourceId` filtrado.
- Filtro de ambiente no proprio cabecalho do calendario.
- Substituicao de `user.role !== "admin"` por `canManageModule(user.role, "resources")` em todo o `ResourcesPage`.
- CSS novo (`resources-calendar-grid`, `resources-calendar-day`, `resources-calendar-pill`) com modo compacto em <720px.

## Pendencias da consolidacao

- Visao semanal/diaria com linha do tempo por hora.
- Drag-and-drop para reagendar reservas.
- Export iCal/Google Calendar.

## Validacao

- `npm run typecheck`: passou.
- `npm run build:web`: passou.
