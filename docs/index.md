# EcclesiaOS - Indice Geral

Esta e a nota central para acompanhar o desenvolvimento do EcclesiaOS no Obsidian.

## Estado Atual

Fase atual concluida: **Fase 44 - Cron Real Com Ocorrencias Materializadas**.

Ultimo modulo entregue:

- migration Prisma adicionando `parentEventId` em `ChurchEvent` com indice;
- modulo `cron` no backend usando `cron-parser` para expandir expressoes;
- geracao lazy ao listar `/events` materializa ocorrencias dentro da janela;
- endpoint `POST /events/:id/generate-occurrences` regenera ocorrencias futuras;
- `recurrenceUntil` define o fim; teto tecnico de 12 meses quando vazio;
- remocao do mestre cascateia para filhos futuros sem inscricoes/check-in;
- tela Agenda mostra badges `cron`/`ocorrencia` e botao `Gerar ocorrencias`.

Ambiente atual:

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`
- Health check: `http://localhost:4000/health`
- Persistencia local configurada: PostgreSQL/Prisma com `ECCLESIAOS_DATA_PROVIDER=prisma`
- Persistencia JSON: mantida para testes e fallback

## Leitura Recomendada

1. [[product-vision|Visao do Produto]]
2. [[architecture|Arquitetura Atual]]
3. [[project-status|Status Do Projeto]]
4. [[roadmap|Roadmap Faseado]]
5. [[decision-log|Registro De Decisoes]]
6. [[development|Desenvolvimento Local]]
7. [[deploy|Publicacao Gratuita]]
8. [[project-structure|Estrutura Do Projeto]]
9. [[next-steps|Proximos Passos]]
10. [[questions|Backlog De Perguntas]]

## Fases

- [[phases/phase-00-documentation|Fase 0 - Documentacao Base]]
- [[phases/phase-01-technical-foundation|Fase 1 - Fundacao Tecnica]]
- [[phases/phase-02-auth-users|Fase 2 - Autenticacao E Usuarios]]
- [[phases/phase-03-initial-persistence|Fase 3 - Persistencia Inicial]]
- [[phases/phase-04-church-profile|Fase 4 - Cadastro Da Igreja]]
- [[phases/phase-05-people|Fase 5 - Pessoas]]
- [[phases/phase-06-groups-ministries|Fase 6 - Grupos E Ministerios]]
- [[phases/phase-07-layout-navigation|Fase 7 - Layout E Navegacao]]
- [[phases/phase-08-attendance|Fase 8 - Presenca]]
- [[phases/phase-09-attendance-reports|Fase 9 - Relatorios De Presenca]]
- [[phases/phase-10-serving-plans|Fase 10 - Escalas E Cultos]]
- [[phases/phase-11-serving-confirmations|Fase 11 - Confirmacao De Escala]]
- [[phases/phase-12-finance-minimum|Fase 12 - Financeiro Minimo]]
- [[phases/phase-13-automated-tests|Fase 13 - Testes Automatizados]]
- [[phases/phase-14-http-api-tests|Fase 14 - Testes HTTP Da API]]
- [[phases/phase-15-postgresql-prisma|Fase 15 - Banco Real Com PostgreSQL E Prisma]]
- [[phases/phase-16-serving-self-confirmation|Fase 16 - Aprofundar Escalas]]
- [[phases/phase-17-finance-reports|Fase 17 - Aprofundar Financeiro]]
- [[phases/phase-18-frontend-smoke-tests|Fase 18 - Testes Do Frontend]]
- [[phases/phase-19-prisma-runtime|Fase 19 - Estabilizar Banco Real]]
- [[phases/phase-20-granular-finance-permissions|Fase 20 - Permissoes Granulares Iniciais]]
- [[phases/phase-21-database-local-auth-finalization|Fase 21 - Finalizar Banco Local E Usuarios De Teste]]
- [[phases/phase-22-users-permission-matrix|Fase 22 - Usuarios E Matriz Inicial De Permissoes]]
- [[phases/phase-23-password-hashing|Fase 23 - Senha Segura]]
- [[phases/phase-24-audit-logs|Fase 24 - Auditoria Inicial]]
- [[phases/phase-25-events-calendar|Fase 25 - Agenda E Eventos]]
- [[phases/phase-26-attendance-events-advanced-calendar|Fase 26 - Presenca Por Evento E Agenda Avancada Inicial]]
- [[phases/phase-27-event-and-children-checkin|Fase 27 - Check-in Por Evento E Ministerio Infantil]]
- [[phases/phase-28-event-registrations-and-presence-hidden|Fase 28 - Inscricoes De Eventos E Presenca Oculta]]
- [[phases/phase-29-room-reservations|Fase 29 - Reservas De Ambientes]]
- [[phases/phase-30-church-calendar|Fase 30 - Calendario Visual Da Igreja]]
- [[phases/phase-31-calendar-week-detail|Fase 31 - Calendario Semanal E Detalhe Do Dia]]
- [[phases/phase-32-public-registration-user-person|Fase 32 - Registro Publico E Vinculo Usuario/Pessoa]]
- [[phases/phase-33-child-labels-guardian-checkout|Fase 33 - Etiquetas Infantis E Retirada Por Responsavel]]
- [[phases/phase-34-guardian-child-relationships|Fase 34 - Responsaveis E Criancas]]
- [[phases/phase-35-guardian-checkout-qr-code|Fase 35 - Retirada Infantil Por Responsavel Logado E QR Code]]
- [[phases/phase-36-qr-camera-brother-labels|Fase 36 - Leitura De QR Code E Etiquetas Brother]]
- [[phases/phase-37-event-registrations-advanced|Fase 37 - Aprofundar Inscricoes De Eventos]]
- [[phases/phase-38-event-ticket-qr-checkin|Fase 38 - QR Code De Ingresso E Check-in De Participantes]]
- [[phases/phase-39-child-label-batch-printing|Fase 39 - Impressao Em Lote De Etiquetas Infantis]]
- [[phases/phase-40-audit-screen|Fase 40 - Tela De Auditoria]]
- [[phases/phase-41-checkin-to-attendance|Fase 41 - Consolidar Check-in Em Presenca]]
- [[phases/phase-42-ux-home-agenda-checkin|Fase 42 - UX Inicial, Inicio Operacional, Agenda E Check-in]]
- [[phases/phase-43-youtube-real|Fase 43 - YouTube Real Sem Chave Oficial]]
- [[phases/phase-44-cron-real|Fase 44 - Cron Real Com Ocorrencias Materializadas]]

## Decisoes

- [[decisions/0001-project-direction|0001 - Direcao Inicial Do EcclesiaOS]]
- [[decisions/0002-technical-foundation|0002 - Fundacao Tecnica Inicial]]
- [[decisions/0003-auth-users-members|0003 - Usuarios Administrativos E Membros]]
- [[decisions/0004-initial-persistence|0004 - Persistencia Inicial]]
- [[decisions/0005-single-church|0005 - Igreja Unica Sem Campus Inicial]]
- [[decisions/0006-people-minimum-profile|0006 - Cadastro Minimo De Pessoas]]
- [[decisions/0007-groups-and-ministries|0007 - Grupos E Ministerios]]
- [[decisions/0008-layout-navigation-before-more-domain|0008 - Layout E Navegacao Antes De Mais Dominios]]
- [[decisions/0009-attendance-minimum|0009 - Presenca Minima]]
- [[decisions/0010-attendance-reports-client-side|0010 - Relatorios De Presenca No Frontend]]
- [[decisions/0011-serving-plans-minimum|0011 - Escalas E Cultos Minimos]]
- [[decisions/0012-serving-assignment-status|0012 - Status De Confirmacao Na Escala]]
- [[decisions/0013-finance-minimum|0013 - Financeiro Interno Minimo]]
- [[decisions/0014-native-node-tests|0014 - Testes Nativos Com Node Test]]
- [[decisions/0015-http-api-tests|0015 - Testes HTTP Da API]]
- [[decisions/0016-postgresql-prisma|0016 - PostgreSQL Com Prisma]]
- [[decisions/0017-serving-self-confirmation|0017 - Confirmacao Propria De Escalas]]
- [[decisions/0018-finance-client-reports|0018 - Relatorios Financeiros No Frontend]]
- [[decisions/0019-frontend-smoke-tests|0019 - Smoke Tests Do Frontend Com Playwright]]
- [[decisions/0020-prisma-runtime-verification|0020 - Verificacao Runtime Do Prisma]]
- [[decisions/0021-granular-finance-permissions|0021 - Permissao Granular Inicial Do Financeiro]]
- [[decisions/0022-local-prisma-env|0022 - Ambiente Local Prisma Como Padrao De Teste]]
- [[decisions/0023-users-permission-matrix|0023 - Usuarios E Matriz Inicial De Permissoes]]
- [[decisions/0024-password-hashing|0024 - Senhas Com Hash]]
- [[decisions/0025-audit-logs|0025 - Auditoria Inicial]]
- [[decisions/0026-events-calendar|0026 - Agenda E Eventos]]
- [[decisions/0027-attendance-events-advanced-calendar|0027 - Presenca Por Evento E Agenda Avancada Inicial]]
- [[decisions/0028-event-and-children-checkin|0028 - Check-in Por Evento E Ministerio Infantil]]
- [[decisions/0029-event-registrations-and-presence-hidden|0029 - Inscricoes De Eventos E Presenca Oculta]]
- [[decisions/0030-room-reservations|0030 - Reservas De Ambientes]]
- [[decisions/0031-church-calendar|0031 - Calendario Visual Da Igreja]]
- [[decisions/0032-calendar-week-detail|0032 - Calendario Semanal E Detalhe Do Dia]]
- [[decisions/0033-public-registration-user-person|0033 - Registro Publico E Vinculo Usuario/Pessoa]]
- [[decisions/0034-child-labels-guardian-checkout|0034 - Etiquetas Infantis E Retirada Por Responsavel]]
- [[decisions/0035-guardian-child-relationships|0035 - Responsaveis E Criancas]]
- [[decisions/0036-guardian-checkout-qr-code|0036 - Retirada Infantil Por Responsavel Logado E QR Code]]
- [[decisions/0037-qr-camera-brother-labels|0037 - Leitura De QR Code E Etiquetas Brother]]
- [[decisions/0038-event-registrations-advanced|0038 - Aprofundar Inscricoes De Eventos]]
- [[decisions/0039-event-ticket-qr-checkin|0039 - QR Code De Ingresso E Check-in De Participantes]]
- [[decisions/0040-child-label-batch-printing|0040 - Impressao Em Lote De Etiquetas Infantis]]
- [[decisions/0041-audit-screen|0041 - Tela De Auditoria]]
- [[decisions/0042-checkin-to-attendance|0042 - Consolidar Check-in Em Presenca]]
- [[decisions/0043-ux-home-agenda-checkin|0043 - UX Inicial, Inicio, Agenda E Check-in]]
- [[decisions/0044-youtube-real-no-key|0044 - YouTube Real Sem Chave Oficial]]
- [[decisions/0045-cron-real-occurrences|0045 - Cron Real Com Ocorrencias Materializadas]]

## Proximos Caminhos

Opcoes recomendadas para a proxima fase:

1. **Escalas Por Equipe Solicitada**: evento pede equipes, lider escala pessoas e equipe confirma.
2. **Mensagens Em Lote**: filtros dinamicos em Pessoas e registro de envio.
3. **Check-in Kids Avancado**: painel de atraso, historico e envio auditavel.
4. **Troca/Reset De Senha**: fluxo proprio de troca e reset administrativo.

Recomendacao atual: nova arquitetura de Escalas por equipes solicitadas.
