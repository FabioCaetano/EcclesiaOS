# EcclesiaOS - Indice Geral

Esta e a nota central para acompanhar o desenvolvimento do EcclesiaOS no Obsidian.

## Estado Atual

Fase atual concluida: **Fase 83 - Relatorios Agregados De Formularios**.

Ultimo modulo entregue:

- Formularios ganhou relatorios agregados;
- a tela mostra volume por formulario, atividade recente e respostas dos ultimos 7 dias;
- o formulario selecionado mostra preenchimento medio, respostas por campo e respostas mais comuns;
- exportacao CSV de relatorio agregado foi adicionada;
- sem nova migration, pois a fase usa `CustomForm` e `CustomFormResponse` existentes;
- builds e testes passaram apos a mudanca.

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
5. [[feedback-2026-05-07|Feedback De Produto - 2026-05-07]]
6. [[feedback-2026-05-07-new-modules|Feedback De Produto - Novos Modulos - 2026-05-07]]
7. [[decision-log|Registro De Decisoes]]
8. [[development|Desenvolvimento Local]]
9. [[deploy|Publicacao Gratuita]]
10. [[project-structure|Estrutura Do Projeto]]
11. [[next-steps|Proximos Passos]]
12. [[questions|Backlog De Perguntas]]

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
- [[phases/phase-45-event-team-requests-leader-scheduling|Fase 45 - Eventos Solicitam Equipes E Lider Escala A Propria]]
- [[phases/phase-46-label-templates-camera|Fase 46 - Templates De Etiqueta E Camera QR Universal]]
- [[phases/phase-47-design-system-and-layout|Fase 47 - Sistema De Design E Redesenho Do Layout]]
- [[phases/phase-48-design-system-operational|Fase 48 - Aplicar Sistema De Design Aos Modulos Operacionais]]
- [[phases/phase-49-design-system-remaining|Fase 49 - Aplicar Sistema De Design Aos Modulos Restantes]]
- [[phases/phase-50-mobile-polish-and-accessibility|Fase 50 - Polimento Mobile E Acessibilidade]]
- [[phases/phase-51-password-self-service|Fase 51 - Troca De Senha Pelo Usuario E Reset Administrativo]]
- [[phases/phase-52-checkin-and-serving-planning-center|Fase 52 - Check-in E Escalas Estilo Planning Center]]
- [[phases/phase-53-bulk-people-messages|Fase 53 - Mensagens Em Lote Para Pessoas]]
- [[phases/phase-54-block-out-dates-and-substitutes|Fase 54 - Bloqueios De Data E Sugestao De Substitutos]]
- [[phases/phase-55-email-provider|Fase 55 - Provedor De Email Com Resend]]
- [[phases/phase-56-forgot-password|Fase 56 - Reset De Senha Por Email]]
- [[phases/phase-57-serving-notifications|Fase 57 - Notificacoes De Escala Por Email]]
- [[phases/phase-58-serving-matrix-view|Fase 58 - Matrix View De Equipes Em Escalas]]
- [[phases/phase-59-serving-reminder-emails|Fase 59 - Lembretes Automaticos De Escala Por Email]]
- [[phases/phase-60-visitor-qr-registration|Fase 60 - Pre-Cadastro De Visitantes Via QR Code]]
- [[phases/phase-61-message-templates-variables|Fase 61 - Templates De Mensagem Com Variaveis]]
- [[phases/phase-62-event-registration-email-confirmation|Fase 62 - Confirmacao De Email No Registro Publico De Eventos]]
- [[phases/phase-63-event-registration-confirmation-resend|Fase 63 - Reenvio De Confirmacao De Inscricao Em Eventos]]
- [[phases/phase-64-event-self-service-checkin|Fase 64 - Check-in Self-Service De Eventos]]
- [[phases/phase-65-serving-auto-substitutes|Fase 65 - Substituto Automatico Para Recusas Em Escala]]
- [[phases/phase-66-agenda-recurrence-public-routes|Fase 66 - Estabilizacao De Agenda, Recorrencia E Rotas Publicas]]
- [[phases/phase-67-resources-checkin-ux|Fase 67 - UX De Ambientes E Check-in]]
- [[phases/phase-68-serving-operations-availability|Fase 68 - Escalas Operacionais E Indisponibilidade]]
- [[phases/phase-69-ministry-service-positions|Fase 69 - Posicoes Em Ministerios]]
- [[phases/phase-72-member-service-positions-substitutes|Fase 72 - Posicoes Por Pessoa E Substitutos Mais Precisos]]
- [[phases/phase-73-checkin-ux-2|Fase 73 - Check-in UX 2]]
- [[phases/phase-74-people-extended-fields|Fase 74 - Pessoas 2 - Campos Ampliados]]
- [[phases/phase-75-people-reports|Fase 75 - Relatorios 1 - Pessoas]]
- [[phases/phase-76-music-repertoire|Fase 76 - Musicas E Repertorio]]
- [[phases/phase-77-service-liturgy-checklist|Fase 77 - Liturgia E Checklist Do Culto]]
- [[phases/phase-78-event-service-prep|Fase 78 - Agenda Com Preparo Do Culto]]
- [[phases/phase-79-custom-forms|Fase 79 - Formularios Customizados]]
- [[phases/phase-80-form-notifications-export|Fase 80 - Formularios: Notificacoes E Exportacao]]
- [[phases/phase-81-form-response-filters|Fase 81 - Formularios: Filtros De Respostas]]
- [[phases/phase-82-service-ops-view|Fase 82 - Visao Unica Operacional Do Culto]]
- [[phases/phase-83-form-aggregate-reports|Fase 83 - Relatorios Agregados De Formularios]]

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
- [[decisions/0046-event-team-requests-and-leader-scheduling|0046 - Eventos Solicitam Equipes E Lider Escala A Propria]]
- [[decisions/0047-label-templates-and-universal-qr-camera|0047 - Templates De Etiqueta E Camera QR Universal]]
- [[decisions/0048-design-system-and-layout-redesign|0048 - Sistema De Design E Redesenho Do Layout]]
- [[decisions/0049-design-system-applied-to-operational-modules|0049 - Aplicar Sistema De Design Aos Modulos Operacionais]]
- [[decisions/0050-design-system-applied-to-remaining-modules|0050 - Aplicar Sistema De Design Aos Modulos Restantes]]
- [[decisions/0051-mobile-polish-and-accessibility|0051 - Polimento Mobile E Acessibilidade]]
- [[decisions/0052-self-service-password-and-admin-reset|0052 - Troca De Senha Pelo Usuario E Reset Administrativo]]
- [[decisions/0053-checkin-and-serving-planning-center-style|0053 - Check-in E Escalas Estilo Planning Center]]
- [[decisions/0054-bulk-people-messages|0054 - Mensagens Em Lote Para Pessoas]]
- [[decisions/0055-block-out-dates-and-substitute-suggestions|0055 - Bloqueios De Data E Sugestao De Substitutos]]
- [[decisions/0056-email-provider-resend|0056 - Provedor De Email Com Resend]]
- [[decisions/0057-forgot-password-by-email|0057 - Reset De Senha Por Email]]
- [[decisions/0058-serving-notifications-email|0058 - Notificacoes De Escala Por Email]]
- [[decisions/0059-serving-matrix-view|0059 - Matrix View De Equipes Em Escalas]]
- [[decisions/0060-serving-reminder-emails|0060 - Lembretes Automaticos De Escala Por Email]]
- [[decisions/0061-visitor-self-checkin-qr|0061 - Pre-Cadastro De Visitantes Via QR Code]]
- [[decisions/0062-message-templates-with-variables|0062 - Templates De Mensagem Com Variaveis]]
- [[decisions/0063-event-registration-email-confirmation|0063 - Confirmacao De Email No Registro Publico De Eventos]]
- [[decisions/0064-event-registration-confirmation-resend|0064 - Reenvio De Confirmacao De Inscricao Em Eventos]]
- [[decisions/0065-event-self-service-checkin|0065 - Check-in Self-Service De Eventos]]
- [[decisions/0066-serving-auto-substitutes|0066 - Substituto Automatico Para Recusas Em Escala]]
- [[decisions/0067-agenda-recurrence-public-routes|0067 - Estabilizacao De Agenda, Recorrencia E Rotas Publicas]]
- [[decisions/0068-resources-checkin-ux|0068 - UX De Ambientes E Check-in]]
- [[decisions/0069-incremental-prisma-event-occurrences|0069 - Escrita Incremental De Ocorrencias No Prisma]]
- [[decisions/0070-serving-operations-availability|0070 - Escalas Por Perfil E Indisponibilidade No Modulo]]
- [[decisions/0071-ministry-service-positions|0071 - Posicoes Configuraveis Em Ministerios]]
- [[decisions/0072-member-service-positions-substitutes|0072 - Posicoes Por Pessoa E Substitutos Por Posicao]]
- [[decisions/0073-checkin-operational-context|0073 - Contexto Operacional No Check-in]]
- [[decisions/0074-people-extended-fields|0074 - Campos Ampliados Em Pessoas]]
- [[decisions/0075-people-reports-client-side|0075 - Relatorios De Pessoas No Frontend]]
- [[decisions/0076-music-repertoire-foundation|0076 - Musicas E Repertorio]]
- [[decisions/0077-service-liturgy-checklist|0077 - Liturgia E Checklist Do Culto]]
- [[decisions/0078-event-service-prep-summary|0078 - Resumo De Preparo Do Culto Na Agenda]]
- [[decisions/0079-custom-forms|0079 - Formularios Customizados]]
- [[decisions/0080-form-notifications-export|0080 - Formularios: Notificacoes E Exportacao]]
- [[decisions/0081-form-response-filters|0081 - Formularios: Filtros De Respostas]]
- [[decisions/0082-service-ops-view|0082 - Visao Unica Operacional Do Culto]]
- [[decisions/0083-form-aggregate-reports|0083 - Relatorios Agregados De Formularios]]

## Proximos Caminhos

Opcoes recomendadas para a proxima fase:

1. **Publicar Fase 83**: subir para GitHub e redeployar Render/Vercel.
2. **Modo Execucao Do Culto**: tela limpa para acompanhar liturgia, musicas, escala e check-in durante o culto.
3. **Construtor De Formularios 2**: reordenacao visual de campos e melhor UX de edicao.
4. **Check-in Salas Infantis**: salas por idade, dashboard por sala e fila de retirada.
5. **Atalhos Entre Modulos**: abrir edicao de Agenda, Escalas, Musicas e Liturgia direto da aba Culto.

Recomendacao atual: publicar a Fase 83 e seguir para **Modo Execucao Do Culto**.
# Atualizacao - Fase 75

- `docs/phases/phase-75-people-reports.md`: primeira versao da aba Relatorios com indicadores de pessoas, aniversariantes, perfil de membros, ministerios/equipes e exportacao CSV.
- `docs/decisions/0075-people-reports-client-side.md`: decisao de iniciar os relatorios no frontend usando dados ja existentes de Pessoas e Grupos.
# Atualizacao - Fase 76

- `docs/phases/phase-76-music-repertoire.md`: modulo inicial de Musicas e Repertorio com biblioteca de musicas e playlists por culto/evento.
- `docs/decisions/0076-music-repertoire-foundation.md`: decisao de separar biblioteca (`Song`) de repertorios por culto (`WorshipSet`).
# Atualizacao - Fase 77

- `docs/phases/phase-77-service-liturgy-checklist.md`: liturgia/checklist por culto/evento com itens ordenados e marcacao de concluido.
- `docs/decisions/0077-service-liturgy-checklist.md`: decisao de separar liturgia em entidade propria vinculada ao culto.
# Atualizacao - Fase 78

- `docs/phases/phase-78-event-service-prep.md`: Agenda agora exibe resumo de preparo do culto com equipes, escalas, repertorio e liturgia.
- `docs/decisions/0078-event-service-prep-summary.md`: decisao de integrar por resumo usando os vinculos existentes por `eventId`.
# Atualizacao - Fase 79

- `docs/phases/phase-79-custom-forms.md`: modulo de formularios customizados com campos, responsaveis, link publico e respostas.
- `docs/decisions/0079-custom-forms.md`: decisao de separar configuração do formulario e respostas publicas.
# Atualizacao - Fase 80

- `docs/phases/phase-80-form-notifications-export.md`: Formularios agora notificam responsaveis por email e exportam respostas em CSV.
- `docs/decisions/0080-form-notifications-export.md`: decisao de usar email best-effort e CSV no frontend.
# Atualizacao - Fase 81

- `docs/phases/phase-81-form-response-filters.md`: filtros e busca nas respostas dos formularios.
- `docs/decisions/0081-form-response-filters.md`: decisao de aplicar filtros localmente no frontend nesta etapa.
# Atualizacao - Fase 82

- `docs/phases/phase-82-service-ops-view.md`: nova aba Culto como visao unica operacional do culto/evento.
- `docs/decisions/0082-service-ops-view.md`: decisao de agregar dados existentes por `eventId`, sem criar nova fonte de dados.
# Atualizacao - Fase 83

- `docs/phases/phase-83-form-aggregate-reports.md`: relatorios agregados de formularios com volume, atividade recente, preenchimento por campo e CSV de resumo.
- `docs/decisions/0083-form-aggregate-reports.md`: decisao de calcular agregados no frontend usando os dados existentes.
