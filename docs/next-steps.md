# Proximos Passos

## Contexto Atual

O EcclesiaOS concluiu ate a **Fase 111 - Relatorios Historicos De Eventos**.

Em 2026-05-07 foi registrado um feedback completo de produto em [[feedback-2026-05-07|Feedback De Produto - 2026-05-07]]. Esse feedback mudou a prioridade imediata: antes de novas automacoes, precisamos estabilizar fluxos que bloqueiam teste real e reduzir confusao nas telas operacionais.

Tambem em 2026-05-07 foi registrado o bloco [[feedback-2026-05-07-new-modules|Feedback De Produto - Novos Modulos - 2026-05-07]], com pedidos de musicas/playlists, liturgia/checklist, formularios, campos ampliados de pessoas e relatorios.

A base atual ja cobre:

- autenticacao com senha em hash, reset por email e usuarios vinculados a pessoas;
- PostgreSQL/Prisma como banco real local e JSON como fallback/teste;
- igreja unica com canal do YouTube, QR de visitante e templates de etiqueta;
- Inicio operacional com videos reais do canal via feed publico;
- pessoas com campos ampliados, grupos, ministerios com posicoes de servico, visitantes e mensagens em lote;
- templates de mensagem com variaveis por destinatario;
- provedor de email via Resend com fallback seguro quando nao configurado;
- presenca historica consolidada a partir de check-ins;
- agenda/eventos com inscricoes publicas, ingresso, QR Code, pagamento manual, confirmacao opcional de email, reenvio administrativo de confirmacao e check-in self-service;
- cron real com ocorrencias materializadas como eventos filhos;
- ambientes, reservas e calendario mensal/semanal;
- check-in de evento, Kids, administracao kids, salas infantis configuraveis, filtro por sala, alerta de lotacao, painel operacional por culto/evento, QR universal e etiquetas Brother;
- escalas estilo Planning Center: evento solicita equipes, lider escala a propria equipe por posicao, pessoas habilitadas por posicao, matrix view para admin/lider, pendencias por perfil, indisponibilidade no modulo, lembretes por email e substitutos automaticos por posicao;
- musicas/repertorios por culto, liturgia/checklist por culto, visao unica operacional do culto, modo Execucao, acoes diretas na liturgia e atalhos entre modulos;
- formularios customizados com responsaveis, notificacoes por email, respostas, exportacao CSV, filtros e relatorios agregados;
- financeiro com filtros/resumos/recibos;
- auditoria administrativa;
- testes automatizados de API, smoke tests do frontend e build/typecheck recorrentes.

## Banco E Deploy

O banco local e o banco Neon ja usam migrations Prisma.

Comandos importantes:

```powershell
npm run db:migrate
npm run db:migrate:deploy
npm run db:verify
npm run build:api
npm run build:web
```

Para ambiente publicado:

- API: Render Web Service.
- Banco: Neon PostgreSQL.
- Frontend: Vercel ou Render Static Site.
- Email: Resend opcional, configurado por `RESEND_API_KEY` e `EMAIL_FROM`.

## Bloqueadores Imediatos

1. Publicar as Fases 90 e 91 no GitHub e redeployar Render/Vercel.
2. Aplicar a migration `20260509090000_kids_rooms` no ambiente online.
3. Testar Check-in > Salas e Check-in > Administracao kids com admin/lider.
4. Seguir para o proximo bloco combinado: Escalas ou um polimento final de Check-in Eventos.
5. Retomar proximas fases fora de auditoria, conforme prioridade do produto.

## Proximas Fases Recomendadas

### Relatorios 1 - Pessoas

Escopo provavel:

- aniversariantes da semana;
- total de membros;
- membros por mulheres/homens;
- adolescentes/kids por idade;
- filtros por status, idade e ministerio;
- exportacao CSV.

Valor: transforma o cadastro ampliado em informacao de gestao.

### Musicas E Liturgia

Escopo provavel:

- cadastro de musicas e tons;
- playlists/setlists por culto;
- checklist/liturgia por culto.

Valor: conecta Agenda, Louvor e operacao do culto.

### Musicas E Liturgia

Escopo provavel:

- cadastro de musicas e tons;
- playlists/setlists por culto;
- vinculo com evento/culto da Agenda;
- checklist/liturgia por culto;
- responsaveis e status por item.

Valor: conecta Agenda, Louvor e operacao do culto.

### Formularios

Escopo provavel:

- criador de formularios por admin;
- campos configuraveis;
- responsaveis por formulario;
- notificacoes/email de novas respostas;
- relatorios/exportacao por formulario.

Valor: cria captação estruturada de informacoes sem depender de ferramentas externas.

## Recomendacao Atual

Primeiro publicar a Fase 87. Depois seguir para **Check-in Salas Infantis**.

Motivo: a operacao do culto ja tem leitura, execucao e atalhos; o maior ganho operacional agora e aprofundar o Kids com salas por idade.
# Proximos Passos Apos Fase 75

1. Validar a Fase 75 localmente com `npm run build:web`, `npm run build:api` e `npm test --workspace @ecclesiaos/api`.
2. Iniciar Fase 76 - Musicas e Repertorio:
   - cadastro de musicas;
   - tons disponiveis;
   - playlists por culto/evento;
   - visualizacao do repertorio dentro do culto.
3. Depois seguir para Liturgia/Checklist do culto.
4. Em seguida iniciar Formularios customizados.
# Proximos Passos Apos Fase 76

1. Subir a migracao `20260507160000_music_repertoire` no ambiente publicado.
2. Iniciar Fase 77 - Liturgia e Checklist do Culto:
   - checklist por culto/evento;
   - itens ordenados da liturgia;
   - responsavel por item;
   - marcacao de concluido durante o culto.
3. Depois conectar Agenda com:
   - repertorio do culto;
   - checklist/liturgia;
   - equipes solicitadas.
4. Em seguida iniciar Formularios customizados.
# Proximos Passos Apos Fase 77

1. Subir a migracao `20260507170000_service_checklists` no ambiente publicado.
2. Conectar Agenda com preparo do culto:
   - repertorio vinculado;
   - liturgia/checklist vinculada;
   - equipes solicitadas;
   - escala gerada.
3. Melhorar edicao do repertorio e da liturgia dentro da propria tela.
4. Iniciar Fase 78 - Formularios customizados.
# Proximos Passos Apos Fase 78

1. Criar navegação/atalhos entre Agenda e:
   - Escalas;
   - Musicas/Repertorio;
   - Liturgia.
2. Criar uma visão única operacional do culto.
3. Iniciar Fase 79 - Formularios customizados.
4. Depois evoluir Relatorios com dados de culto, check-in, presença e formulários.
# Proximos Passos Apos Fase 79

1. Subir a migracao `20260507180000_custom_forms` no ambiente publicado.
2. Evoluir Formularios:
   - notificacao/email para responsaveis;
   - exportacao CSV;
   - filtros por periodo/formulario;
   - relatorios.
3. Melhorar UX de criação dos campos.
4. Retomar visão unica operacional do culto.
# Proximos Passos Apos Fase 80

1. Criar filtros e busca nas respostas dos formularios.
2. Adicionar relatorios de formularios.
3. Registrar status de entrega de notificacoes.
4. Retomar visão unica operacional do culto.
# Proximos Passos Apos Fase 81

1. Criar relatorios agregados de formularios.
2. Melhorar construtor de campos com reordenacao visual.
3. Registrar status de notificacoes.
4. Retomar visão unica operacional do culto.
# Proximos Passos Apos Fase 82

1. Publicar a Fase 82 no GitHub e redeployar os ambientes.
2. Criar relatorios agregados de formularios:
   - total de respostas por formulario;
   - respostas por periodo;
   - agrupamento por campo de selecao;
   - exportacao consolidada.
3. Evoluir a aba Culto para modo execucao:
   - tela mais limpa;
   - foco em liturgia atual/proxima;
   - repertorio do culto;
   - escala e pendencias;
   - resumo de check-in.
4. Criar atalhos de edicao para Agenda, Escalas, Musicas e Liturgia a partir da aba Culto.
# Proximos Passos Apos Fase 83

1. Publicar a Fase 83 no GitHub e redeployar os ambientes.
2. Iniciar Modo Execucao do Culto:
   - tela limpa para uso durante o culto;
   - foco em item atual/proximo da liturgia;
   - repertorio do culto;
   - pendencias de escala;
   - resumo de check-in.
3. Evoluir Formularios 2:
   - reordenacao visual de campos;
   - melhor separacao entre construcao e respostas;
   - graficos para campos de selecao;
   - status de notificacoes.
# Proximos Passos Apos Fase 84

1. Publicar a Fase 84 no GitHub e redeployar os ambientes.
2. Evoluir Execucao do Culto 2:
   - marcar item da liturgia como concluido direto pela tela;
   - modo tela cheia;
   - atalhos para editar Liturgia, Escalas e Musicas;
   - destacar pendencias criticas.
3. Evoluir Check-in Salas Infantis:
   - configurar salas por idade;
   - sugerir sala automaticamente no check-in;
   - dashboard por sala;
   - fila de retirada.
4. Evoluir Formularios 2:
   - reordenacao visual de campos;
   - graficos para campos de selecao;
   - status de notificacoes.
# Proximos Passos Apos Fase 85

1. Publicar a Fase 85 no GitHub e redeployar os ambientes.
2. Iniciar Check-in Salas Infantis:
   - cadastrar/configurar salas por faixa etaria;
   - sugerir sala automaticamente no check-in infantil;
   - dashboard por sala;
   - fila de retirada e criancas aguardando responsavel.
3. Criar atalhos entre modulos:
   - da aba Culto para Liturgia;
   - da aba Culto para Escalas;
   - da aba Culto para Musicas/Repertorio.
4. Evoluir permissao operacional:
   - separar operador de culto/check-in de lider ministerial.
# Proximos Passos Apos Fase 87

1. Publicar a Fase 87 no GitHub e redeployar os ambientes.
2. Iniciar Check-in Salas Infantis:
   - cadastrar/configurar salas por faixa etaria;
   - sugerir sala automaticamente no check-in infantil;
   - mostrar sala na etiqueta;
   - dashboard por sala;
   - fila de retirada.
3. Evoluir Atalhos Contextuais:
   - abrir Liturgia ja filtrada pelo culto selecionado;
   - abrir Escalas ja no plano do culto;
   - abrir Musicas/Repertorio ja no culto selecionado.
4. Evoluir Construtor de Formularios 2:
   - reordenacao visual de campos;
   - graficos para campos de selecao.

# Proximos Passos Apos Fase 88

1. Testar localmente com banco real:
   - criar evento recorrente semanal e cron;
   - conferir ocorrencias na Agenda e no Calendario;
   - criar ambiente e reserva separadamente;
   - criar escala como lider da equipe.
2. Evoluir Check-in Kids por sala:
   - configurar salas/faixas etarias;
   - sugerir sala pela idade;
   - mostrar sala na etiqueta;
   - dashboard por sala.
3. Evoluir Culto operacional:
   - abrir Agenda/Escalas/Musicas/Liturgia ja filtradas pelo culto selecionado;
   - consolidar reservas do culto na visao operacional.
4. Evoluir Escalas:
   - filtro rapido de pendentes/recusadas;
   - aplicar substituto sugerido salvando automaticamente;
   - notificacao mais clara para lider quando houver recusa.

# Proximos Passos Apos Fase 89

1. Testar Check-in Kids localmente:
   - vincular crianca a pessoa com data de nascimento;
   - registrar check-in infantil;
   - conferir sala sugerida;
   - imprimir/preview de etiqueta com sala.
2. Transformar salas em configuracao administravel:
   - cadastro de salas;
   - faixa etaria inicial/final;
   - capacidade por sala;
   - responsaveis por sala.
3. Evoluir dashboard kids:
   - lotacao por sala;
   - alerta de sala cheia;
   - fila de retirada.
4. Retomar atalhos contextuais do Culto:
   - abrir modulos ja filtrados pelo culto selecionado.

# Proximos Passos Apos Fase 92

1. Publicar a Fase 92 no GitHub e redeployar o frontend.
2. Continuar o Passo 5 - Escalas:
   - separar visualmente pendentes, recusadas e confirmadas dentro do plano selecionado;
   - criar acao de backend especifica para substituicao com auditoria;
   - enviar notificacao opcional quando substituto for aplicado;
   - melhorar a visao mensal do lider por equipe.
3. Retomar Passo 3 - Liturgia/Culto operacional:
   - atalhos contextuais abrindo modulos ja filtrados pelo culto selecionado;
   - consolidar reservas e check-in do culto na visao operacional.
4. Retomar Passo 4 - Check-in:
   - painel operacional de eventos;
   - fila de retirada Kids;
   - regras de bloqueio/override para sala cheia.

# Proximos Passos Apos Fase 93

1. Publicar a Fase 93 no GitHub e redeployar o frontend.
2. Continuar Passo 5 - Escalas:
   - criar endpoint especifico para aplicar substituto;
   - registrar auditoria da substituicao;
   - notificar substituto quando aplicado;
   - criar visao mensal do lider por equipe.
3. Retomar Passo 3 - Culto operacional:
   - abrir Escalas, Liturgia e Musicas ja filtradas pelo culto selecionado;
   - consolidar reservas e check-in do culto na visao operacional.
4. Retomar Passo 4 - Check-in:
   - painel operacional de eventos;
   - fila de retirada Kids;
   - refinamento das etiquetas por sala.

# Proximos Passos Apos Fase 94

1. Publicar a Fase 94 no GitHub e redeployar API e frontend.
2. Continuar Passo 5 - Escalas:
   - exibir resultado da notificacao ao aplicar substituto;
   - criar visao mensal do lider por equipe;
   - permitir motivo estruturado para substituicao;
   - destacar historico de substituicoes na auditoria.
3. Retomar Passo 3 - Culto operacional:
   - abrir Escalas, Liturgia e Musicas ja filtradas pelo culto selecionado.
4. Retomar Passo 4 - Check-in:
   - painel operacional de eventos;
   - fila de retirada Kids.

# Proximos Passos Apos Fase 95

1. Publicar a Fase 95 no GitHub e redeployar o frontend.
2. Fechar Passo 5 - Escalas com polimentos:
   - exibir resultado da notificacao ao aplicar substituto;
   - destacar pessoas sobrecarregadas no mes;
   - permitir exportar/imprimir escala mensal;
   - permitir motivo estruturado para substituicao.
3. Retomar Passo 3 - Culto operacional:
   - abrir Escalas, Liturgia e Musicas ja filtradas pelo culto selecionado.
4. Retomar Passo 4 - Check-in:
   - painel operacional de eventos;
   - fila de retirada Kids.

# Proximos Passos Apos Fase 96

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Publicar a Fase 96 no GitHub e redeployar o frontend.
3. Retomar Passo 3 - Culto operacional:
   - abrir Escalas, Liturgia e Musicas ja filtradas pelo culto selecionado;
   - consolidar reservas e check-in do culto na visao operacional.
4. Retomar Passo 4 - Check-in:
   - painel operacional de eventos;
   - fila de retirada Kids.

# Proximos Passos Apos Fase 97

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Concluir Agenda dentro do Calendario:
   - editar evento clicado com formulario ja preenchido;
   - excluir evento com confirmacao clara;
   - abrir Culto ja no contexto do evento;
   - mover a lista de eventos/agendas para baixo do Calendario.
3. Avancar para Check-in 2.0:
   - responsavel pre-cadastra criancas no app;
   - responsavel seleciona criancas e gera QR do culto;
   - totem do culto escaneia QR, imprime etiquetas e faz check-out;
   - evento pago/gratuito envia QR por email e usa totem proprio sem check-out.
4. Refinar Liturgia e Musicas:
   - liturgia em linhas simples sem botao de concluido na criacao;
   - responsavel pesquisavel por nome;
   - musicas com biblioteca prioritaria, link obrigatorio e repertorios por culto.
5. Grupos, Pessoas e Ambientes:
   - familiares pesquisaveis;
   - ministerios com posicoes e membros por busca;
   - calendario de ambientes com bloqueio de conflito.
6. Iniciar notificacoes internas:
   - central de avisos por usuario;
   - notificacoes de escala, formulario, check-in e mensagens operacionais.

# Proximos Passos Apos Fase 98

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Escolher o proximo corte:
   - **Calendario 3**: lista completa de eventos abaixo do Calendario e formularios mais contextuais;
   - **Check-in 2.0**: pre-registro de criancas, QR por culto e totem operacional.
3. Se seguir Calendario 3:
   - mover eventos/agendas para baixo do Calendario;
   - melhorar feedback de exclusao;
   - preparar formulario em drawer/modal futuro.
4. Se seguir Check-in 2.0:
   - modelar criancas vinculadas ao responsavel;
   - gerar QR do culto para criancas selecionadas;
   - criar fluxo de totem para leitura, etiqueta e checkout.

# Proximos Passos Apos Fase 99

1. Rodar `npm run build:api` e `npm run build:web` quando o ambiente permitir.
2. Criar **Totem Kids por culto**:
   - rota/tela operacional por evento;
   - dashboard de criancas esperadas, presentes e retiradas;
   - leitura de QR/pre-check-in;
   - impressao de etiquetas;
   - checkout manual e por QR.
3. Evoluir cadastro pelo responsavel:
   - adicionar crianca pelo app;
   - editar dados basicos da crianca vinculada;
   - sugerir sala pela idade antes do check-in.
4. Evoluir visitante:
   - cadastro rapido do responsavel visitante;
   - acesso limitado ao app com Check-in Kids;
   - check-in das criancas do visitante.
5. Depois retomar:
   - Check-in Eventos 2.0;
   - alternancia de camera frontal/traseira;
   - relatorios do culto/evento.

# Proximos Passos Apos Fase 100

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Evoluir pre-check-in com QR do responsavel:
   - responsavel seleciona criancas;
   - app gera QR do lote;
   - totem le o QR;
   - operador confirma entrada;
   - etiquetas sao impressas para as criancas do lote.
3. Melhorar camera:
   - seletor de camera;
   - alternancia frontal/traseira;
   - feedback visual de leitura.
4. Evoluir cadastro rapido:
   - visitante cria cadastro reduzido;
   - visitante adiciona crianca;
   - acesso limitado ao Check-in Kids.
5. Depois criar relatorios:
   - presentes por culto;
   - retiradas;
   - sala/idade;
   - atrasos de retirada.

# Proximos Passos Apos Fase 101

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Cadastro de crianca pelo responsavel:
   - formulario simples dentro do Check-in Kids;
   - vinculo automatico com o responsavel logado;
   - data de nascimento para sugestao de sala;
   - observacoes importantes.
3. Melhorar camera:
   - seletor frontal/traseira;
   - mensagem clara quando permissao da camera falhar;
   - feedback visual apos leitura.
4. Visitante:
   - cadastro rapido do responsavel visitante;
   - acesso limitado ao Check-in;
   - criancas vinculadas ao visitante.
5. Relatorios:
   - presentes e retiradas por culto;
   - criancas por sala;
   - horarios de entrada/saida.

# Proximos Passos Apos Fase 102

1. Rodar `npm run build:api` e `npm run build:web` quando o ambiente permitir.
2. Melhorar camera/leitor:
   - seletor de camera;
   - alternancia frontal/traseira;
   - permissao negada com mensagem clara;
   - feedback visual apos leitura.
3. Evoluir dados da crianca:
   - autorizados adicionais de retirada;
   - alergias/observacoes medicas;
   - foto opcional;
   - edicao pelo responsavel com limite de campos.
4. Visitante:
   - cadastro rapido do responsavel visitante;
   - crianca vinculada ao visitante;
   - acesso limitado ao Check-in.
5. Relatorios:
   - presentes por culto;
   - retiradas e horarios;
   - ocupacao por sala.

# Proximos Passos Apos Fase 103

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Evoluir dados da crianca:
   - autorizados adicionais de retirada;
   - alergias/observacoes medicas;
   - avisos importantes no totem;
   - impressao desses alertas na etiqueta quando habilitado.
3. Melhorar feedback do leitor:
   - feedback visual apos leitura;
   - som/vibracao opcional;
   - mira/overlay no video.
4. Visitante:
   - cadastro rapido do responsavel visitante;
   - acesso limitado ao Check-in Kids;
   - criancas vinculadas ao visitante.
5. Relatorios:
   - presentes por culto;
   - retiradas e horarios;
   - ocupacao por sala.

# Proximos Passos Apos Fase 104

1. Rodar `npm run build:api` e `npm run build:web` quando o ambiente permitir.
2. Relatorios de Check-in Kids:
   - presentes por culto;
   - retiradas e horarios;
   - criancas por sala;
   - alertas importantes por culto.
3. Evoluir dados da crianca:
   - autorizados adicionais estruturados;
   - edicao limitada pelo responsavel;
   - foto opcional.
4. Visitante:
   - cadastro rapido do responsavel visitante;
   - acesso limitado ao Check-in;
   - criancas vinculadas ao visitante.
5. Depois:
   - Check-in Eventos 2.0;
   - relatorios gerais de eventos.

# Proximos Passos Apos Fase 105

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Retomar visitante no Check-in Kids:
   - cadastro rapido do responsavel visitante;
   - crianca vinculada ao visitante;
   - acesso limitado ao Check-in;
   - QR do responsavel visitante;
   - impressao pelo Totem Kids.
3. Depois evoluir relatorios:
   - historico por culto na aba Relatorios;
   - filtros por periodo/sala/status;
   - PDF dedicado.
4. Check-in Eventos 2.0:
   - totem de evento;
   - relatorio de participantes;
   - presentes e ausentes.

# Proximos Passos Apos Fase 106

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Criar link dedicado para cadastro visitante Kids:
   - URL compartilhavel para visitantes;
   - texto voltado para responsavel;
   - opcao futura de cadastrar responsavel e criancas em uma etapa guiada.
3. Evoluir Check-in Eventos 2.0:
   - pagina/totem de evento por link;
   - leitura de QR de ingresso;
   - lista de inscritos presentes e ausentes;
   - relatorio CSV/impresso do evento.
4. Evoluir dados infantis:
   - edicao limitada pelo responsavel;
   - autorizados adicionais;
   - foto opcional;
   - historico por crianca.

# Proximos Passos Apos Fase 107

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Refinar permissao operacional de eventos:
   - permitir lider/operador designado abrir o Totem Evento;
   - evitar que operador tenha acesso completo a criacao/edicao da Agenda;
   - registrar auditoria do operador que fez o check-in.
3. Melhorar experiencia do scanner:
   - feedback visual apos leitura;
   - som/vibracao opcional;
   - evitar dupla leitura do mesmo ingresso em sequencia.
4. Relatorios:
   - levar relatorio historico de eventos para a aba Relatorios;
   - filtrar por periodo/evento/status;
   - exportar presentes e ausentes.
5. Retomar cadastro visitante Kids avancado:
   - link dedicado;
   - responsavel + criancas em fluxo guiado.

# Proximos Passos Apos Fase 108

1. Rodar `npm run build:api` e `npm run build:web` quando o ambiente permitir.
2. Melhorar experiencia do scanner:
   - feedback visual apos leitura;
   - som/vibracao opcional;
   - evitar dupla leitura do mesmo ingresso em sequencia.
3. Evoluir permissao de operadores:
   - operador designado por evento;
   - permissao por grupo/ministerio responsavel;
   - token temporario para totem sem login.
4. Relatorios de eventos:
   - historico na aba Relatorios;
   - filtros por periodo/evento/status;
   - exportacao de presentes e ausentes.

# Proximos Passos Apos Fase 109

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Aplicar padrao semelhante ao Totem Kids:
   - feedback visual por leitura;
   - prevencao de dupla leitura;
   - opcional de som/vibracao.
3. Relatorios de eventos:
   - historico na aba Relatorios;
   - filtros por periodo/evento/status;
   - exportacao de presentes e ausentes.
4. Operadores por evento:
   - designar pessoas que podem operar cada evento;
   - permissao por ministerio/grupo responsavel;
   - token temporario de totem sem login.

# Proximos Passos Apos Fase 110

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Relatorios de eventos:
   - historico na aba Relatorios;
   - filtros por periodo/evento/status;
   - exportacao de presentes e ausentes.
3. Evoluir operadores por evento:
   - designar pessoas que podem operar cada evento;
   - permissao por ministerio/grupo responsavel;
   - token temporario de totem sem login.
4. Melhorar scanners:
   - overlay/mira visual;
   - persistir camera preferida;
   - configuracao de som/vibracao.

# Proximos Passos Apos Fase 111

1. Rodar `npm run build:web` quando o ambiente permitir.
2. Evoluir operadores por evento:
   - designar pessoas que podem operar cada evento;
   - permissao por ministerio/grupo responsavel;
   - token temporario de totem sem login.
3. Melhorar scanners:
   - overlay/mira visual;
   - persistir camera preferida;
   - configuracao de som/vibracao.
4. Relatorios:
   - PDF dedicado;
   - graficos por periodo;
   - relatorio por operador.

# Proximos Passos Apos Fase 112

1. Aplicar a migration `20260510112000_event_operator_person_ids` no banco local/deploy.
2. Validar fluxo do operador designado:
   - admin seleciona uma pessoa no evento;
   - usuario dessa pessoa abre `/event-totem/:eventId`;
   - API lista apenas inscricoes daquele evento autorizado;
   - check-in registra o operador logado.
3. Evoluir permissao operacional:
   - permissao por grupo/ministerio responsavel;
   - token temporario para totem sem login;
   - notificacao ao operador designado.
4. Melhorar scanners:
   - overlay/mira visual;
   - persistir camera preferida;
   - configuracao de som/vibracao.
