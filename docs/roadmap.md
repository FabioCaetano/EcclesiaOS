# Roadmap Faseado

Este roadmap existe para impedir escopo solto. Cada fase exige confirmacao antes de desenvolvimento.

## Fase 0: Base Documental

Objetivo: criar a documentacao inicial, principios, arquitetura proposta e perguntas pendentes.

Status atual: concluida.

Criterios de aceite:

- nome EcclesiaOS definido;
- decisao de nao depender das APIs B1/ChurchApps registrada;
- decisao de atender primeiro uma igreja especifica registrada;
- roadmap inicial criado.

## Fase 1: Fundacao Tecnica

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos iniciar a fundacao tecnica agora? Qual stack vamos usar?

Possivel escopo:

- criar frontend;
- criar backend;
- configurar banco;
- configurar lint/testes;
- criar tela inicial simples;
- criar health check da API;
- criar primeiro teste E2E.

Fora de escopo:

- pessoas;
- grupos;
- financeiro;
- permissoes avancadas;
- multi-campus;
- app mobile.

## Fase 2: Autenticacao E Usuarios

Status atual: concluida.

Antes de desenvolver, perguntar:

> O sistema tera apenas usuarios administrativos internos ou membros da igreja tambem farao login?

Decisao: membros tambem terao login.

Possivel escopo:

- login;
- logout;
- sessao;
- usuario atual;
- recuperacao de senha;
- papeis simples.

## Fase 3: Persistencia Inicial

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos persistir usuarios antes de modelar o cadastro da igreja?

Decisao: sim, criar persistencia inicial local para tirar usuarios da memoria.

Possivel escopo:

- arquivo local de dados;
- repositorio de usuarios;
- seed/reset de desenvolvimento;
- login usando dados persistidos.

Fora de escopo:

- PostgreSQL;
- Prisma;
- cadastro real de usuarios;
- cadastro da igreja.

## Fase 4: Dados Da Igreja

Status atual: concluida.

Antes de desenvolver, perguntar:

> O EcclesiaOS atendera uma igreja unica ou precisa preparar multi-campus desde ja?

Decisao: igreja unica simples, sem campus nesta fase.

Possivel escopo:

- cadastro da igreja;
- endereco;
- contatos;
- horarios principais;
- configuracoes basicas.

## Fase 5: Pessoas

Status atual: concluida.

Antes de desenvolver, perguntar:

> Quais dados de pessoas sao realmente necessarios para a igreja agora?

Decisao: cadastro minimo com nome obrigatorio, email, telefone, nascimento opcional, status e observacoes.

Possivel escopo:

- cadastro de pessoas;
- busca;
- detalhes;
- contatos;
- familia/casa;
- notas internas;
- importacao futura.

## Fase 6: Grupos E Ministerios

Status atual: concluida.

Antes de desenvolver, perguntar:

> A igreja usa grupos pequenos, ministerios, classes, equipes ou todos esses conceitos?

Decisao: suportar inicialmente grupos pequenos, ministerios, classes e equipes.

Possivel escopo:

- grupos;
- lideres;
- membros;
- categorias;
- comunicacao basica;
- exportacao.

## Fase 7: Layout E Navegacao

Status atual: concluida.

Antes de desenvolver, perguntar:

> A tela unica atual deve ser separada antes de adicionar mais dominios?

Decisao: sim, criar layout e navegacao antes de seguir com Presenca ou Financeiro.

Possivel escopo:

- layout autenticado;
- navegacao principal;
- paginas/secoes Inicio, Igreja, Pessoas e Grupos;
- componentes menores para formularios existentes.

Fora de escopo:

- novo dominio;
- redesign completo;
- React Router.

## Fase 8: Presenca

Status atual: concluida.

Antes de desenvolver, perguntar:

> A presenca sera registrada em cultos, grupos, criancas/check-in, ou tudo isso?

Decisao: registrar inicialmente presenca simples em culto geral ou grupo.

Possivel escopo:

- eventos de presenca;
- listas;
- historico por pessoa;
- relatorios simples.

## Fase 9: Relatorios De Presenca

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos transformar registros de presenca em indicadores simples?

Decisao: calcular relatorios iniciais no frontend, sem novos endpoints.

Possivel escopo:

- totais de presenca;
- media por registro;
- ranking de pessoas;
- registros por grupo.

## Fase 10: Escalas E Cultos

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos apenas escala de voluntarios ou tambem plano completo de culto?

Decisao: criar planos de servico simples com pessoas escaladas por funcao.

Possivel escopo:

- ministerios de escala;
- equipes;
- cargos;
- planos de culto;
- voluntarios;
- confirmacao de escala.

## Fase 11: Confirmacao De Escala

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos criar testes automatizados ou seguir para Financeiro?

Decisao: adicionar status por pessoa escalada antes de notificacoes.

Possivel escopo:

- pendente;
- confirmado;
- recusado.

## Fase 12: Financeiro

Status atual: implementada.

Antes de desenvolver, perguntar:

> O financeiro sera apenas registro interno de contribuicoes ou tera pagamento online?

Decisao: financeiro minimo sera interno e manual, sem pagamento online.

Possivel escopo:

- fundos;
- contribuicoes;
- despesas;
- lotes;
- recibos;
- relatorios.

## Fase 13: Testes Automatizados

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos estabilizar os fluxos existentes com testes automatizados?

Decisao: iniciar com `node:test` na API, sem novas dependencias.

Possivel escopo:

- testes de repositorios;
- testes de autenticacao;
- testes de permissoes;
- smoke tests HTTP.

## Fase 14: Testes HTTP Da API

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos testar endpoints reais da API antes de aprofundar novos dominios?

Decisao: testar a API em memoria com porta dinamica e arquivo temporario.

Possivel escopo:

- health check;
- login;
- usuario atual;
- rotas protegidas;
- permissoes admin versus membro.

## Fase 15: Banco Real Com PostgreSQL E Prisma

Status atual: implementada parcialmente.

Antes de desenvolver, perguntar:

> Queremos trocar `dev-db.json` por PostgreSQL/Prisma agora?

Decisao: sim, preparar PostgreSQL/Prisma mantendo JSON como modo de transicao.

Possivel escopo:

- schema Prisma;
- migration inicial;
- Docker Compose para Postgres;
- provider configuravel;
- reset de dados semente no banco.

## Fase 16: Aprofundar Escalas

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos aprofundar escalas com confirmacao de voluntarios e notificacoes?

Possivel escopo:

- confirmacao pelo proprio membro;
- painel de pendencias;
- notificacoes internas;
- preparacao para email/WhatsApp.

Decisao: criar resposta propria por `personId` e notificacoes internas calculadas.

## Fase 17: Aprofundar Financeiro

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos filtros, recibos e relatorios financeiros agora?

Possivel escopo:

- filtros por periodo;
- filtros por fundo/categoria;
- relatorios;
- recibos.

Decisao: criar filtros, resumos e recibo inicial no frontend, sem endpoint novo.

## Fase 18: Testes Do Frontend

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos smoke tests da interface autenticada?

Possivel escopo:

- login na interface;
- navegacao basica;
- leitura de telas principais;
- fluxos principais de admin.

Decisao: usar Playwright para smoke tests autenticados em API/web isolados.

## Fase 19: Estabilizar Banco Real

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos validar PostgreSQL/Prisma em runtime com Docker/Postgres ativo?

Possivel escopo:

- migrations em banco local;
- seed Prisma;
- API em modo Prisma;
- testes contra provider Prisma.

Decisao: adicionar `db:verify` e validar runtime Prisma com PostgreSQL local via Docker.

## Fase 20: Permissoes Granulares Iniciais

Status atual: implementada.

Antes de desenvolver, perguntar:

> Queremos novo modulo, permissoes granulares, auditoria ou agenda/eventos?

Decisao: iniciar permissoes granulares pelo Financeiro, restringindo listagem e navegacao a `admin`.

Possivel escopo:

- Financeiro visivel somente para admin;
- API financeira bloqueando membros/lideres;
- teste HTTP da regra de permissao.

## Fase 21: Finalizar Banco Local E Usuarios De Teste

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos finalizar banco de dados antes de seguir?

Decisao: sim, fechar PostgreSQL/Prisma local e validar logins admin, lider e membro.

Possivel escopo:

- `.env` local;
- carregamento automatico de ambiente;
- seed Prisma;
- validacao de credenciais;
- teste real de login.

## Fase 22: Usuarios E Matriz Inicial De Permissoes

Status atual: implementada.

Antes de desenvolver, perguntar:

> Podemos seguir com gestao real de usuarios e matriz de permissoes?

Decisao: sim, criar CRUD admin de usuarios e centralizar `canAccessModule`.

Possivel escopo:

- listar usuarios;
- criar usuario;
- editar perfil e pessoa vinculada;
- alterar senha quando preenchida;
- remover usuario;
- ocultar modulos por permissao.

## Fase 23: Senha Segura

Status atual: concluida.

Antes de desenvolver, perguntar:

> Podemos seguir com senha segura antes de auditoria/producao?

Decisao: sim, armazenar senhas com hash `scrypt` e manter upgrade automatico para senhas legadas.

Possivel escopo:

- hash de senha;
- verificacao de senha;
- upgrade de senha legada;
- seeds com hash;
- verificacao no `db:verify`.

## Fase 24: Auditoria Inicial

Status atual: concluida.

Antes de desenvolver, perguntar:

> Podemos seguir com auditoria de alteracoes sensiveis?

Decisao: sim, registrar eventos de usuarios, pessoas e financeiro.

Possivel escopo:

- tabela de auditoria;
- repositorio de auditoria;
- endpoint administrativo;
- eventos de criacao, edicao e remocao.

## Fase 25: Agenda E Eventos

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos seguir para Agenda e Eventos?

Decisao: sim, criar cadastro inicial de eventos sem inscricoes nesta fase.

Possivel escopo:

- tabela de eventos;
- endpoints CRUD;
- tela Agenda;
- seed de eventos;
- auditoria de alteracoes.

## Fase 26: Presenca Por Evento E Agenda Avancada Inicial

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos seguir com presenca por evento e agenda avancada?

Decisao: sim, vincular presenca a evento e adicionar recorrencia simples/filtro mensal.

Possivel escopo:

- `eventId` em presenca;
- recorrencia simples em eventos;
- filtro mensal;
- resumo por evento;
- seed vinculado.

## Fase 27: Check-in Por Evento E Ministerio Infantil

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos seguir com check-in por evento e ministerio infantil?

Decisao: sim, criar fluxo operacional para eventos e criancas em cultos.

Possivel escopo:

- check-in de pessoa;
- check-in infantil;
- codigo de seguranca;
- saida infantil;
- permissao para admin e lider.

## Fase 28: Inscricoes De Eventos E Presenca Oculta

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos ocultar Presenca e criar inscricoes publicas para eventos?

Possivel escopo:

- inscricoes;
- link publico;
- limite de vagas;
- evento gratuito ou pago;
- status manual de pagamento;
- Presenca fora do menu principal.

Decisao: ocultar Presenca da navegacao e criar inscricoes publicas por evento, sem gateway de pagamento.

## Fase 29: Reservas De Ambientes

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos seguir com reserva de ambientes compartilhados da igreja?

Possivel escopo:

- cadastro de ambientes;
- reservas por data e horario;
- bloqueio/alerta de conflito;
- visualizacao por ambiente;
- vinculo opcional com evento.

Decisao: criar modulo Ambientes separado da Agenda, com bloqueio de conflito de horario no mesmo ambiente.

## Fase 30: Calendario Visual Da Igreja

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos criar uma visao de calendario consolidada da igreja?

Possivel escopo:

- calendario mensal;
- calendario semanal;
- eventos;
- inscricoes;
- reservas de ambientes;
- filtros por tipo.

Decisao: criar primeiro a visao mensal consolidada no frontend, usando rotas existentes, sem endpoint agregado.

## Fase 31: Calendario Semanal E Detalhe Do Dia

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos aprofundar calendario com visao semanal e detalhe do dia?

Possivel escopo:

- visao semanal;
- detalhe do dia;
- filtro por ambiente;
- destaque do dia selecionado;
- resumo do periodo.

Decisao: aprofundar consulta do calendario sem edicao direta nesta fase.

## Fase 32: Registro Publico E Vinculo Usuario/Pessoa

Status atual: concluida.

Antes de desenvolver, perguntar:

> Devemos garantir que todo usuario esteja vinculado a uma pessoa antes de aprofundar check-in infantil?

Possivel escopo:

- registro publico;
- criacao automatica de pessoa;
- usuario sempre vinculado a pessoa;
- visitante tambem pode se cadastrar;
- admin promove papel depois.

Decisao: criar registro publico e tornar vinculo usuario/pessoa obrigatorio.

## Fase 33: Etiquetas Infantis E Retirada Por Responsavel

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos seguir com etiquetas infantis e retirada por responsavel?

Possivel escopo:

- etiqueta infantil;
- codigo de seguranca;
- responsavel vinculado;
- retirada por responsavel;
- preparo para relacao responsavel/crianca.

Decisao: criar etiqueta simples e registrar vinculos opcionais de crianca/responsavel com pessoas.

## Fase 34: Responsaveis E Criancas

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos criar relacao permanente entre criancas e responsaveis?

Possivel escopo:

- vincular pessoas criancas a responsaveis;
- listar criancas por responsavel;
- facilitar check-in a partir do responsavel;
- preparar retirada por responsavel logado.

Decisao: armazenar `guardianPersonIds` no cadastro de pessoas e usar o vinculo para sugerir responsavel no check-in infantil.

## Fase 35: Retirada Infantil Por Responsavel Logado E QR Code

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos permitir retirada infantil por responsavel logado e QR Code?

Possivel escopo:

- retirada por responsavel autenticado;
- validacao de responsavel vinculado;
- validacao do codigo de seguranca;
- QR Code na etiqueta infantil;
- teste HTTP do fluxo.

Decisao: responsavel logado pode retirar apenas criancas vinculadas ao seu `personId`, com `securityCode`; etiqueta passa a exibir QR Code.

## Fase 36: Leitura De QR Code E Etiquetas Brother

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos ler QR Code pela camera e imprimir etiquetas na Brother?

Possivel escopo:

- scanner por camera;
- fallback manual;
- validacao pelo payload do QR Code;
- preset de etiqueta Brother;
- CSS de impressao dedicado.

Decisao: usar `BarcodeDetector` no navegador com fallback manual e imprimir via driver Brother pelo dialogo do navegador.

## Fase 37: Aprofundar Inscricoes De Eventos

Status atual: concluida.

Antes de desenvolver, perguntar:

> Queremos aprofundar inscricoes de eventos com participantes, pagamento manual e ingresso?

Possivel escopo:

- lista de participantes por evento;
- confirmacao manual de pagamento;
- recibo/ingresso;
- preparacao para QR Code.

Decisao: criar controle administrativo de participantes, status manual de inscricao e recibo/ingresso imprimivel.

## Fase 38: QR Code De Ingresso E Check-in De Participantes

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos gerar QR Code de ingresso e controlar entrada de participantes?

Possivel escopo:

- ticketCode por inscricao;
- QR Code no ingresso;
- check-in de participante;
- leitura por camera;
- validacao manual por payload;
- migration Prisma.

Decisao: cada inscricao confirmada pode ser validada na entrada por QR Code ou payload manual, salvando data e usuario do check-in.

## Fase 39: Impressao Em Lote De Etiquetas Infantis

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos imprimir etiquetas infantis em lote para Brother?

Possivel escopo:

- selecao de criancas;
- selecionar check-ins ativos;
- limpar selecao;
- impressao sequencial;
- manter QR Code e codigo de seguranca;
- preservar impressao individual.

Decisao: criar selecao em lote no frontend e reaproveitar o formato Brother existente, sem alterar API ou banco.

## Fase 40: Tela De Auditoria

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos criar uma tela administrativa para consultar auditoria?

Possivel escopo:

- item de menu Auditoria;
- modulo `audit`;
- filtro por acao;
- filtro por entidade;
- filtro por usuario;
- filtro por data;
- busca textual.

Decisao: criar tela client-side usando o endpoint existente `GET /audit-logs`, restrita a admin.

## Fase 41: Consolidar Check-in Em Presenca

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos consolidar check-ins de pessoas em presenca por evento?

Possivel escopo:

- sincronizar check-in de pessoa com presenca;
- recalcular presenca ao remover check-in;
- preservar Check-in como fluxo operacional;
- manter Presenca como base historica;
- exibir resumo consolidado na tela Check-in.

Decisao: atualizar `AttendanceRecord` automaticamente a partir dos check-ins de pessoas por evento, sem reativar Presenca no menu principal.

## Fase 42: UX Inicial, Inicio Operacional, Agenda E Check-in

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos melhorar a UI/UX das telas mais usadas antes de aprofundar novos dominios?

Possivel escopo:

- Inicio como painel operacional;
- canal do YouTube configuravel pela igreja;
- ultimas transmissoes exibidas na Inicio;
- Agenda usando Ambientes no campo Local;
- expressao cron textual em Eventos;
- Check-in separado em Eventos, Kids e Administracao kids;
- mensagem para responsavel de crianca ainda nao retirada.

Decisao: entregar uma primeira rodada de UX sem criar novo menu lateral e sem integrar API externa do YouTube nesta fase.

## Fase 43: YouTube Real Sem Chave Oficial

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos buscar os ultimos videos do canal pelo backend, sem depender de chave do Google Cloud?

Possivel escopo:

- endpoint proprio que le `youtubeChannelUrl` do cadastro da igreja;
- suporte a `/channel/UC...`, `/@handle`, `/c/handle` e `/user/handle`;
- consulta ao feed RSS publico do canal;
- cache em memoria por URL;
- tela Inicio renderizando cards reais (thumbnail + titulo + data + link).

Decisao: usar feed RSS publico do YouTube e resolver handle pela pagina publica do canal; sem chave do Google Cloud nesta fase.

## Fase 44: Cron Real Com Ocorrencias Materializadas

Status atual: concluida.

## Fase 45: Eventos Solicitam Equipes E Lider Escala A Propria

Status atual: concluida.

## Fase 46: Templates De Etiqueta E Camera QR Universal

Status atual: concluida.

## Fase 47: Sistema De Design E Redesenho Do Layout

Status atual: concluida.

## Fase 48: Aplicar Sistema De Design Aos Modulos Operacionais

Status atual: concluida.

## Fase 49: Aplicar Sistema De Design Aos Modulos Restantes

Status atual: concluida.

## Fase 50: Polimento Mobile E Acessibilidade

Status atual: concluida.

## Fase 51: Troca De Senha Pelo Usuario E Reset Administrativo

Status atual: concluida.

## Fase 52: Check-in E Escalas Estilo Planning Center

Status atual: concluida.

## Fase 53: Mensagens Em Lote Para Pessoas

Status atual: concluida.

## Fase 54: Bloqueios De Data E Sugestao De Substitutos

Status atual: concluida.

## Fase 55: Provedor De Email Com Resend

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos integrar Resend para envio real de email a partir de Mensagens em lote?

Decisao: provedor unico (Resend); fallback automatico para `mailto:` quando sem chave; reset por email fica para Fase 56.

## Fase 56: Reset De Senha Por Email

Status atual: concluida.

## Fase 57: Notificacoes De Escala Por Email

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos avisar pessoa por email quando for escalada e o lider quando alguem responder?

Decisao: emails best-effort no PUT do plano (novas atribuicoes) e no PATCH de status (resposta); silencioso quando provedor ausente; sem tokens de confirmacao via link.

## Fase 58: Matrix View De Equipes Em Escalas

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos adicionar uma visao panoramica em grade da equipe nas proximas semanas?

Decisao: tab bar Lista/Matriz no ServingPage; janela 4/8/12 semanas; sem edicao inline; reaproveita endpoints existentes.

## Fase 59: Lembretes Automaticos De Escala Por Email

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos enviar lembrete automatico de escala uns dias antes do servico?

Decisao: lazy no GET `/serving-notifications`; campo `reminderSentAt` na atribuicao garante uma vez so; janela em `REMINDER_DAYS_BEFORE` (default 2); sem cron job dedicado.

## Fase 60: Pre-Cadastro De Visitantes Via QR Code

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos liberar QR Code na entrada para visitantes deixarem nome e contato sem criar conta?

Decisao: novo `POST /public/visitors`, sem usuario nem senha; nova rota publica `/visitor`; ChurchPage gera QR; email de boas-vindas via Resend quando configurado.

## Fase 61: Templates De Mensagem Com Variaveis

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos guardar modelos de mensagem com variaveis para reuso?

Decisao: nova entidade `MessageTemplate`; variaveis Mustache simples (`{{firstName}}`, `{{lastName}}`, `{{fullName}}`, `{{email}}`, `{{phone}}`, `{{churchName}}`); substituicao por destinatario no backend (Resend) e no frontend (mailto/WhatsApp); CRUD restrito a admin/lider; leitura para todos autenticados; sem versionamento, sem condicionais, sem editor rico.

## Fase 62: Confirmacao De Email No Registro Publico De Eventos

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos exigir confirmacao por email em inscricoes publicas para reduzir spam?

Decisao: flag opcional por evento (`registrationRequiresEmailConfirmation`); novo status `pending_email_confirmation`; token hash sha256 + expiracao 24h gravados no proprio `EventRegistration`; endpoint publico `POST /public/event-registrations/confirm`; capacidade ignora registros pendentes ja expirados; flag desabilitada quando Resend nao esta configurado.

Antes de desenvolver, perguntar:

> Vamos liberar o "esqueci minha senha" agora que temos provedor de email?

Decisao: token sha256 com expiracao de 15 min e uso unico; resposta generica para nao vazar usuarios; sem 2FA, sem rate limit explicito.

Antes de desenvolver, perguntar:

> Vamos permitir que pessoas marquem indisponibilidade e o lider receba sugestao de substitutos?

Decisao: nova entidade `PersonBlockOut`; algoritmo de substituto ranqueia por carga recente; sem recorrencia, sem notificacao automatica.

Antes de desenvolver, perguntar:

> Vamos criar mensagens em lote com filtros dinamicos e registro de envio?

Decisao: novo modulo `messages` (admin/lider envia, autenticado le); filtros + selecao + composicao + historico; sem provedor de email/SMS nesta fase (usa `mailto:` e `wa.me`).

Antes de desenvolver, perguntar:

> Vamos aproximar Check-in e Escalas visualmente do Planning Center?

Decisao: avatares + status pills + busca + cards; sem drag-drop, fotos ou real-time.

Antes de desenvolver, perguntar:

> Vamos liberar o usuario para trocar a propria senha e dar ao admin um botao de reset com senha temporaria?

Decisao: dois endpoints (self-service e admin reset), nova tela "Minha conta", botao na UsersPage; sem fluxo de email nesta fase.

Antes de desenvolver, perguntar:

> Vamos polir os atritos de iOS Safari, areas tocaveis e navegacao por teclado?

Decisao: ajustes CSS-first + pequena mudanca no `AppLayout`; sem features novas.

Antes de desenvolver, perguntar:

> Vamos fechar a consistencia aplicando o novo design em Financeiro, Usuarios, Auditoria, Ambientes, Grupos e Presenca?

Decisao: aplicar PageHeader + Card + EmptyState + icones; sem mudar logica.

Antes de desenvolver, perguntar:

> Vamos estender o novo design para Check-in, Calendario e Escalas?

Possivel escopo:

- PageHeader nas tres telas;
- Card substituindo `.panel`;
- EmptyState para listas vazias;
- icones lucide em botoes de acao;
- preservar logica e endpoints.

Decisao: aplicar so estrutura visual; sem mudar regras; outras telas em Fase 49.

Antes de desenvolver, perguntar:

> Vamos resolver o "muito confuso" trazido pela igreja com sistema de design e layout estilo Planning Center?

Possivel escopo:

- tokens CSS (cores, espacamento, tipografia, sombras, bordas);
- header + sidebar no desktop, bottom nav no mobile;
- primitivos `PageHeader`, `Card`, `EmptyState`, `Button`;
- adicionar `lucide-react` para icones;
- aplicar nas 4 telas criticas: Inicio, Igreja, Pessoas, Agenda;
- demais telas herdam tokens, refinadas em 48 e 49.

Decisao: redesenho completo de tokens + layout, sem trocar por lib de UI; aplicar em 4 telas; preservar funcionalidade existente.

Antes de desenvolver, perguntar:

> Vamos consertar a camera de QR Code em todos os navegadores e permitir cadastrar a impressora Brother da igreja?

Possivel escopo:

- jsqr como fallback quando o navegador nao tem `BarcodeDetector`;
- `facingMode: { ideal: "environment" }` para laptops sem camera traseira;
- mensagens de diagnostico amigaveis;
- entidade `LabelTemplate` com nome, modelo de impressora, tamanho, layout e padrao por layout;
- secao "Etiquetas" no cadastro da igreja com CRUD e teste de impressao;
- Check-in usando templates da API com fallback fixo;
- tela Pessoas com etiqueta de visitante.

Decisao: layouts iniciais limitados a `kids_checkin` e `visitor`; impressao continua via dialogo do navegador; sem designer visual nesta fase.

Antes de desenvolver, perguntar:

> Vamos conectar Agenda e Escalas para que o evento solicite equipes e o lider escale a propria?

Possivel escopo:

- evento com `requestedTeamIds`;
- plano vinculado a evento por `eventId`;
- sincronizacao automatica de planos no `eventRepository`;
- filtro por `groupId` em `GET /serving-plans`;
- lider edita atribuicoes do proprio plano com pessoas da equipe;
- UI Agenda com multi-select de equipes;
- UI Escalas com filtro automatico para lideres e contagem de recusas.

Decisao: limitar equipes a tipos `ministry`/`team`; cascatear delete do evento; remover plano vazio quando equipe e desmarcada; manter plano com atribuicoes; lider valida pertencimento de pessoas a equipe; admin sem essa restricao.

Antes de desenvolver, perguntar:

> Vamos transformar a expressao cron textual em ocorrencias reais materializadas no banco?

Possivel escopo:

- migration adicionando `parentEventId` em `ChurchEvent`;
- modulo de expansao de cron com `cron-parser`;
- geracao lazy ao listar eventos;
- geracao manual por endpoint admin;
- `recurrenceUntil` controla o fim; teto tecnico de 12 meses quando vazio;
- idempotencia por `(parentEventId, date, startTime)`;
- remocao do mestre remove filhos futuros sem inscricoes/check-in.

Decisao: materializar ocorrencias como eventos filhos com `parentEventId`, com geracao lazy + manual; deixar o evento (via `recurrenceUntil`) controlar o fim da recorrencia.

## Fase 63: Reenvio De Confirmacao De Inscricao Em Eventos

Status atual: concluida.

## Fase 64: Check-in Self-Service De Eventos

Status atual: concluida.

## Fase 65: Substituto Automatico Para Recusas Em Escala

Status atual: concluida.

## Fase 66: Estabilizacao De Agenda, Recorrencia E Rotas Publicas

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos corrigir primeiro Agenda, recorrencia e rotas publicas quebradas em producao para liberar novos testes reais?

Possivel escopo:

- trocar "Local" por "Ambiente" na Agenda;
- selecionar ambiente a partir dos ambientes cadastrados;
- validar campos obrigatorios no frontend e na API;
- retornar erro especifico por campo, sem vazar erro bruto do Prisma;
- corrigir materializacao de recorrencias para gerar as proximas ocorrencias esperadas;
- revisar fallback/rewrite das rotas publicas no deploy, incluindo `/visitor`, confirmacao de inscricao, check-in publico e esqueci minha senha.

Fora de escopo:

- redesign completo de Check-in;
- posicoes de ministerios;
- historico avancado de mensagens.

## Fase 67: UX De Ambientes E Check-in

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos reorganizar Ambientes e Check-in para reduzir confusao operacional?

Possivel escopo:

- separar criacao de ambiente e criacao de reserva;
- exibir erros no formulario correto;
- mover configuracao de etiquetas/impressoras da Igreja para Check-in;
- criar preview de etiqueta com campos configuraveis;
- permitir campos como idade, sala, responsavel, codigo de seguranca e observacoes;
- separar administracao de Kids e Eventos dentro do proprio Check-in;
- dashboard do dia para culto/evento.

## Fase 68: Escalas Operacionais E Indisponibilidade

Status atual: implementada; validacao automatica pendente por bloqueio de execucao local.

Antes de desenvolver, perguntar:

> Vamos amadurecer Escalas para refletir melhor o fluxo real de lider, membro e admin?

Possivel escopo:

- impedir membro de criar ou editar escala;
- permitir membro responder escalas e registrar indisponibilidade;
- mostrar ao lider somente cultos/eventos em que sua equipe foi solicitada;
- simplificar a visualizacao para pendencias e escala mensal;
- manter sugestoes de substituto para recusas;
- preparar o modelo para posicoes de ministerio.

Entregue:

- membro visualiza apenas escalas em que foi incluido;
- lider visualiza planos das equipes que lidera;
- matriz de escala fica restrita a admin/lider;
- pendencias sao filtradas por perfil;
- indisponibilidade foi movida para dentro de Escalas.

## Fase 69: Posicoes Em Ministerios

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos diferenciar grupos comuns de ministerios/equipes com posicoes de servico?

Possivel escopo:

- adicionar posicoes configuraveis em ministerios/equipes;
- exemplos: vocal, bateria, guitarra, teclado, camera, transmissao, slides;
- usar posicoes na montagem da escala;
- manter grupos comuns sem obrigatoriedade de posicoes.

Entregue:

- `servicePositions` em ministerios/equipes;
- UI em Grupos para editar posicoes por linha ou virgula;
- Escalas usa seletor de posicao quando o grupo possui posicoes;
- migration Prisma para persistir posicoes.

## Fase 70: Marca Da Igreja E Refinos De Conta

Status atual: pulada temporariamente por decisao do usuario.

Antes de desenvolver, perguntar:

> Vamos adicionar identidade visual da igreja e notificacao de seguranca da conta?

Possivel escopo:

- upload de logo da igreja;
- usar logo no app e paginas publicas;
- email quando senha for alterada;
- revisar onde indisponibilidade aparece entre Minha Conta e Escalas.

## Fase 71: Auditoria, Relatorios E Mensagens Avancadas

Status atual: pulada temporariamente por decisao do usuario.

Antes de desenvolver, perguntar:

> Depois de estabilizar os fluxos operacionais, vamos aprofundar auditoria, relatorios e mensagens?

Possivel escopo:

- diff de campos na auditoria;
- filtros backend e exportacao CSV;
- campanhas de mensagem com historico;
- enviados, pulados, falhas e reenvio;
- relatorios de eventos, visitantes e follow-up.

## Fase 72: Posicoes Por Pessoa E Substitutos Mais Precisos

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos completar posicoes por pessoa para melhorar escalas e substitutos?

Possivel escopo:

- vincular pessoas a posicoes especificas dentro de ministerios/equipes;
- filtrar candidatos por posicao na escala;
- sugerir substitutos considerando a posicao recusada;
- manter alerta para excecoes manuais.

Entregue:

- `memberServicePositions` em ministerios/equipes;
- UI em Grupos para marcar posicoes por membro;
- Escalas filtra pessoas por posicao;
- substitutos automaticos respeitam a posicao da recusa;
- migration Prisma para persistir posicoes por pessoa.

## Fase 73: Check-in UX 2

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos melhorar Check-in com um contexto operacional claro por evento/culto?

Possivel escopo:

- painel do dia por evento/culto;
- contadores filtrados pelo contexto;
- listas de evento, Kids, administracao e etiquetas usando o mesmo contexto;
- manter tudo dentro do modulo Check-in sem novo menu lateral.

Entregue:

- painel operacional por evento/culto selecionado;
- contadores e listas filtrados pelo contexto;
- botao para aplicar evento selecionado aos formularios;
- administracao kids e etiquetas seguindo o mesmo contexto.

## Fase 74: Pessoas 2 - Campos Ampliados

Status atual: concluida.

Antes de desenvolver, perguntar:

> Vamos ampliar o cadastro de pessoas antes de criar relatorios?

Possivel escopo:

- data de nascimento;
- data de membresia;
- endereco;
- batismo;
- ministerios que serve;
- notas;
- preparar categorias para relatorios.

Entregue:

- `membershipDate`, `address`, `baptized` e `gender` em Pessoas;
- ministerios que serve derivados de Grupos/Ministerios;
- UI de Pessoas ampliada;
- migration Prisma para persistir os novos campos.

## Fase 75: Relatorios 1 - Pessoas

Status atual: planejada.

Antes de desenvolver, perguntar:

> Vamos criar a primeira aba de Relatorios focada em Pessoas?

Possivel escopo:

- aniversariantes da semana;
- total de membros;
- membros por faixa/categoria;
- filtros por status, idade e ministerio;
- exportacao CSV.

## Fase 76: Musicas E Playlists Por Culto

Status atual: planejada.

Antes de desenvolver, perguntar:

> Vamos criar repertorio musical e playlists vinculadas aos cultos?

Possivel escopo:

- cadastro de musicas;
- tons por musica;
- tags/observacoes/link de cifra;
- playlist por culto/evento;
- visualizacao das musicas relacionadas ao culto.

## Fase 77: Checklist E Liturgia Do Culto

Status atual: planejada.

Antes de desenvolver, perguntar:

> Vamos adicionar checklist/liturgia dentro de cada culto?

Possivel escopo:

- itens ordenados da liturgia;
- responsavel por item;
- horario/duracao estimada;
- status pendente/concluido;
- observacoes internas.

## Fase 78: Formularios

Status atual: planejada.

Antes de desenvolver, perguntar:

> Vamos criar uma area de formularios administraveis?

Possivel escopo:

- criacao de formularios por admin;
- campos configuraveis;
- responsaveis por formulario;
- notificacoes/email para responsaveis;
- respostas e relatorios/exportacao.
# Roadmap - Atualizacao Fase 75

## Concluido

- Fase 75 - Relatorios 1: Pessoas.

## Proxima fase sugerida

- Fase 76 - Musicas e Repertorio.

## Depois

- Liturgia e checklist por culto.
- Formularios customizados.
- Relatorios avancados com filtros e endpoints dedicados.
# Roadmap - Atualizacao Fase 76

## Concluido

- Fase 76 - Musicas e Repertorio.

## Proxima fase sugerida

- Fase 77 - Liturgia e Checklist do Culto.

## Depois

- Exibir repertorio dentro da Agenda.
- Formularios customizados.
- Relatorios avancados.
# Roadmap - Atualizacao Fase 77

## Concluido

- Fase 77 - Liturgia e Checklist do Culto.

## Proxima fase sugerida

- Integracao da Agenda com repertorio/liturgia ou Fase 78 - Formularios customizados.
# Roadmap - Atualizacao Fase 78

## Concluido

- Fase 78 - Agenda com preparo do culto.

## Proxima fase sugerida

- Fase 79 - Formularios customizados.

## Alternativa antes dos formularios

- Visao unica operacional do culto com Agenda, Escalas, Repertorio e Liturgia.
# Roadmap - Atualizacao Fase 79

## Concluido

- Fase 79 - Formularios customizados.

## Proxima fase sugerida

- Notificacoes e exportacao de respostas dos formularios.

## Depois

- Relatorios avancados.
- Visao unica operacional do culto.
# Roadmap - Atualizacao Fase 80

## Concluido

- Fase 80 - Formularios: notificacoes e exportacao.

## Proxima fase sugerida

- Relatorios de formularios ou visão unica operacional do culto.
# Roadmap - Atualizacao Fase 81

## Concluido

- Fase 81 - Formularios: filtros de respostas.

## Proxima fase sugerida

- Relatorios agregados de formularios ou visão unica operacional do culto.
# Roadmap - Atualizacao Fase 82

## Concluido

- Fase 82 - Visao unica operacional do culto.

## Proxima fase sugerida

- Relatorios agregados de formularios.

## Alternativa

- Modo execucao do culto, com tela limpa para uso durante o servico.

## Depois

- Check-in com salas infantis por idade.
- Atalhos de edicao entre Culto, Agenda, Escalas, Musicas e Liturgia.
# Roadmap - Atualizacao Fase 83

## Concluido

- Fase 83 - Relatorios agregados de formularios.

## Proxima fase sugerida

- Modo execucao do culto.

## Alternativa

- Construtor de formularios 2, com reordenacao visual de campos e graficos.

## Depois

- Check-in com salas infantis por idade.
- Status de notificacoes dos formularios.
# Roadmap - Atualizacao Fase 84

## Concluido

- Fase 84 - Modo execucao do culto.

## Proxima fase sugerida

- Execucao do Culto 2: acoes diretas, tela cheia e atalhos.

## Alternativa

- Check-in Salas Infantis.

## Depois

- Construtor de Formularios 2.
- Atalhos entre Culto, Liturgia, Escalas e Musicas.
# Roadmap - Atualizacao Fase 85

## Concluido

- Fase 85 - Execucao do Culto 2.

## Proxima fase sugerida

- Check-in Salas Infantis.

## Alternativa

- Atalhos entre Culto, Liturgia, Escalas e Musicas.

## Depois

- Construtor de Formularios 2.
- Permissoes operacionais mais granulares.
