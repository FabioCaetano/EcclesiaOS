# Registro De Decisoes

Este arquivo lista decisoes permanentes do projeto. Detalhes maiores podem ficar em `docs/decisions`.

## Decisoes Atuais

1. O novo projeto se chama EcclesiaOS.
2. O B1Admin atual sera mantido como referencia, nao substituido diretamente.
3. EcclesiaOS tera APIs proprias.
4. O escopo inicial atende uma igreja especifica.
5. O desenvolvimento sera faseado.
6. Antes de cada fase funcional, o responsavel sera consultado.
7. A documentacao sera usada como fonte de verdade durante o desenvolvimento.
8. A Fase 1 usara monorepo com `apps/web`, `apps/api` e `packages/shared`.
9. A stack inicial sera React + TypeScript + Vite no frontend e Node.js + TypeScript no backend.
10. PostgreSQL e Prisma sao a direcao preferida para banco/ORM, mas entram apenas quando a fase exigir persistencia.
11. Membros tambem terao conta no EcclesiaOS, alem de administradores e lideres.
12. Antes do banco relacional, a API tera persistencia inicial em arquivo JSON via camada de repositorio.
13. O cadastro inicial sera de uma igreja unica simples, sem campus.
14. O cadastro inicial de pessoas tera nome, email, telefone, nascimento opcional, status e observacoes.
15. Grupos e Ministerios entram antes de familias/casas, com escopo minimo de cadastro e membros.
16. Layout e navegacao entram antes de novos dominios para evitar crescimento da tela unica.
17. Presenca inicial sera simples, com registros de culto geral ou grupo e pessoas presentes.
18. Relatorios iniciais de presenca serao calculados no frontend, sem novos endpoints.
19. Escalas e Cultos entram em versao minima, com planos e pessoas escaladas por funcao.
20. Pessoas escaladas passam a ter status de confirmacao: pendente, confirmado ou recusado.
21. Financeiro entra primeiro como lancamentos internos manuais, sem pagamento online.
22. A primeira camada de testes automatizados usara `node:test`, sem nova dependencia.
23. A API passa a expor `createEcclesiaServer()` para testes HTTP em porta dinamica.
24. A ordem oficial apos Fase 14 sera: Banco Real, Aprofundar Escalas, Aprofundar Financeiro, Testes Do Frontend.
25. Banco real sera PostgreSQL com Prisma, mantendo modo JSON durante a transicao.
26. Usuarios passam a ter `personId` para permitir respostas de escalas proprias.
27. Notificacoes de escala comecam como pendencias internas calculadas a partir das atribuicoes.
28. Relatorios financeiros iniciais serao calculados no frontend, sem endpoint novo.
29. Smoke tests do frontend usarao Playwright com API e web em portas isoladas.
30. O `dataStore` JSON deve evitar escritas desnecessarias em leituras para reduzir corrida em acessos paralelos.
31. A verificacao runtime do Prisma sera feita por `npm run db:verify`, rodando codigo compilado com Node.
32. Financeiro passa a ser visivel e acessivel somente por usuarios `admin` nesta primeira regra granular.
33. O ambiente local configurado passa a usar PostgreSQL/Prisma por `.env`, mantendo testes automatizados em JSON isolado.
34. Usuarios passam a ter CRUD administrativo inicial e acesso por modulo fica centralizado em `canAccessModule`.
35. Senhas passam a ser armazenadas com hash `scrypt`, mantendo upgrade automatico de senhas legadas em texto puro.
36. Alteracoes sensiveis em usuarios, pessoas e financeiro passam a gerar registros de auditoria.
37. Agenda/Eventos entra como base simples de eventos, sem inscricoes ou presenca vinculada nesta fase.
38. Presenca passa a poder ser vinculada a eventos, e agenda ganha recorrencia simples e filtro mensal.
39. Check-in por evento e ministerio infantil entram como modulo operacional para admin e lider.
40. A aba Presenca fica oculta da navegacao principal enquanto check-in e eventos concentram os fluxos operacionais.
41. Eventos podem ter inscricoes publicas por slug, com limite de vagas e status manual para pagamento.
42. Reservas de ambientes ficam em modulo proprio, separado da Agenda, para permitir calendario consolidado depois.
43. Reservas confirmadas nao podem sobrepor horario no mesmo ambiente e na mesma data.
44. Calendario nasce como visao consolidada no frontend, sem endpoint agregado nesta fase.
45. Agenda e Ambientes continuam sendo os locais de edicao; Calendario e uma tela de consulta.
46. Calendario passa a ter visao semanal, selecao de dia e filtro por ambiente ainda sem edicao direta.
47. Todo usuario deve estar vinculado a uma pessoa; pessoas podem existir sem usuario.
48. Registro publico cria pessoa e usuario `member`; admin promove papeis depois.
49. Check-in infantil passa a guardar vinculos opcionais de crianca/responsavel e pessoa que realizou a retirada.
50. Etiqueta infantil com codigo de seguranca fica disponivel no frontend antes de QR Code/impressora dedicada.
51. Pessoas passam a poder guardar `guardianPersonIds` para representar responsaveis permanentes de criancas.
52. Check-in infantil deve sugerir responsaveis vinculados quando uma crianca cadastrada for selecionada.
53. Responsavel logado pode retirar apenas criancas vinculadas ao seu `personId` e precisa informar o codigo de seguranca.
54. Etiqueta infantil passa a exibir QR Code gerado no frontend para apoiar retirada.
55. Leitura de QR Code pela camera usa `BarcodeDetector` quando disponivel e fallback manual quando nao houver suporte.
56. Impressao Brother sera feita pelo dialogo do navegador com CSS de etiqueta 62mm, usando o driver instalado no sistema.
57. Inscricoes de eventos passam a ter atualizacao administrativa de status por endpoint proprio.
58. Pagamentos de inscricoes pagas continuam manuais; admin confirma, deixa pendente ou cancela.
59. Recibo/ingresso de inscricao sera imprimivel pelo navegador antes de QR Code de ingresso.
60. Inscricoes passam a ter `ticketCode`, QR Code de ingresso e campos de check-in.
61. Check-in de participante exige inscricao confirmada e codigo correto do ingresso.
62. Etiquetas infantis podem ser impressas em lote pelo frontend usando o mesmo preset Brother 62mm.
63. O frontend controla o modo de impressao para separar etiqueta individual, lote infantil e ingresso de evento.
64. Auditoria passa a ter modulo proprio `audit`, visivel apenas para admin.
65. A primeira tela de auditoria usa filtros client-side sobre `GET /audit-logs`.
66. Check-ins de pessoas por evento passam a consolidar automaticamente registros de presenca.
67. Presenca continua fora do menu principal, mas volta a ser base historica/relatorio.
68. Inicio passa a ser painel operacional, nao mais tela de explicacao do projeto.
69. Canal do YouTube sera configurado no cadastro da igreja.
70. Agenda passa a sugerir Ambientes ativos no campo Local.
71. Eventos passam a guardar expressao cron textual para recorrencias avancadas futuras.
72. Check-in permanece em um unico menu, mas separado internamente entre Eventos, Kids e Administracao kids.
73. Tela Inicio passa a exibir os ultimos videos do canal usando o feed RSS publico do YouTube, sem chave do Google Cloud nesta fase.
74. Expressao cron de eventos passa a gerar ocorrencias reais materializadas como eventos filhos com `parentEventId`; geracao e lazy ao listar e manual por endpoint admin; `recurrenceUntil` define o fim, com teto tecnico de 12 meses quando vazio.
75. Eventos passam a solicitar equipes (`requestedTeamIds`, somente grupos `ministry`/`team`); planos de escala sao sincronizados automaticamente com vinculo `eventId` opcional; lider edita atribuicoes do proprio plano com pessoas da equipe; admin edita qualquer plano; remover evento cascateia para os planos.
76. Camera de QR Code passa a ter fallback `jsqr` quando o navegador nao oferece `BarcodeDetector`; `facingMode` torna-se ideal e nao obrigatorio; mensagens de diagnostico explicam o motivo do erro.
77. Templates de etiqueta viram entidade propria (`LabelTemplate`) com layouts `kids_checkin` e `visitor`; admin cadastra modelo, tamanho e marca padrao por layout; Check-in e Pessoas leem os templates da API.

78. Sistema de design proprio com tokens CSS, primitivos `PageHeader`/`Card`/`EmptyState` e ícones `lucide-react`; `AppLayout` ganha header fixo, sidebar agrupada por dominio e drawer mobile; novo design aplicado em Inicio, Igreja, Pessoas e Agenda; demais telas herdam tokens nas fases 48 e 49.

79. Sistema de design aplicado aos modulos operacionais (Check-in, Calendario, Escalas) com `PageHeader`, `Card`, `EmptyState` e icones lucide; logica e endpoints inalterados; demais telas (Financeiro, Usuarios, Auditoria, Ambientes, Grupos, Presenca) ficam para Fase 49.

80. Sistema de design aplicado aos modulos restantes (Financeiro, Usuarios, Auditoria, Ambientes, Grupos, Presenca); produto inteiro com mesmo padrao visual; sem alteracoes em logica, dados ou endpoints.

81. Polimento mobile e acessibilidade: `100dvh` no shell, lock de scroll quando o drawer abre, areas tocaveis 44px, `font-size: 16px` em inputs no mobile (sem zoom no iOS), `:hover` apenas em `(hover: hover)`, skip link e `aria-current="page"` na sidebar.

82. Troca de senha pelo proprio usuario via `POST /auth/change-password` (autenticado, exige senha atual, minimo 6 caracteres) e reset administrativo via `POST /users/:id/reset-password` (admin only) que retorna senha temporaria em texto puro uma unica vez; ambos auditados; reset por email fica para fase futura.

83. Check-in e Escalas redesenhados em estilo Planning Center: novos primitivos `Avatar` e `StatusPill`, busca proeminente nas abas de Check-in, cards com avatar + horario relativo, sidebar "No momento" na administracao kids, plan view de Escalas com cards de posicao + status pills coloridos; sem drag-drop, fotos reais, email/SMS, real-time ou multi-week view nesta fase.

84. Mensagens em lote para pessoas: novo modulo `messages`, entidade `PeopleMessage` com `recipientPersonIds`/`channel`/`subject`/`body`/`createdByName`; filtros dinamicos (status, email/telefone, grupo, registrado depois); admin e lider enviam (`canManageModule`), todos leem; envio gera `mailto:` ou `wa.me` no dispositivo do operador; sem provedor de email/SMS nesta fase.

85. Bloqueios de data + sugestao de substitutos: nova entidade `PersonBlockOut` (start, end, motivo); pessoa marca os proprios via "Minha conta", admin marca para qualquer um; ServingPage alerta visualmente quando pessoa selecionada esta bloqueada na data; `GET /serving-plans/:planId/substitutes/:assignmentId` retorna candidatos da equipe nao bloqueados ranqueados por carga recente; sem recorrencia de bloqueios, sem notificacao automatica.

86. Provedor de email Resend integrado: nova dependencia `resend`, `apps/api/src/email.ts`, variaveis `RESEND_API_KEY` e `EMAIL_FROM`; `POST /people-messages` envia automaticamente quando canal e `email` e provedor configurado; `GET /system/email-status` expoe estado para o frontend mostrar banner; sem chave o sistema continua com fallback `mailto:` no frontend; reset por email, notificacoes de escala e templates ricos ficam para fases futuras.

87. Reset de senha por email com `POST /auth/request-password-reset` (publico, resposta generica para nao vazar usuarios) e `POST /auth/reset-password` (publico, valida token sha256 com expiracao de 15 min e uso unico); LoginPage ganha link "Esqueci minha senha"; novas paginas publicas `/forgot-password` e `/reset-password`; nova var `WEB_BASE_URL` no backend para gerar o link no email.

## Decisoes Pendentes

1. Hospedagem.
2. Quando e se campus entrara no produto.
3. Papel separado de tesouraria.
4. Matriz completa de permissoes por modulo.
5. Fluxo seguro de troca/recuperacao de senha.
6. Recorrencia real por cron com geracao de ocorrencias.
7. Integracao real com YouTube para buscar ultimas lives.
8. Recorrencia de reservas de ambientes.
9. Visao semanal e edicao rapida no calendario.
10. Escalas por equipes solicitadas na Agenda.
11. Mensagens em lote por filtros de Pessoas.
12. Envio de comprovantes/ingressos.
13. Auditoria avancada.
14. Modelo completo de familias/casas.
