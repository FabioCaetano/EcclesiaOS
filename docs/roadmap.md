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
