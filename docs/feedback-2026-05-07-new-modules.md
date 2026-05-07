# Feedback De Produto - Novos Modulos - 2026-05-07

## Contexto

Depois das fases de Escalas e Check-in, foram solicitadas novas areas para ampliar o EcclesiaOS alem da operacao de domingo:

- musicas e repertorio;
- playlists por culto;
- checklist/liturgia do culto;
- criacao de formularios;
- campos ampliados em pessoas/usuarios;
- relatorios administrativos.

## Area De Musicas

Objetivo: criar uma area para cadastrar musicas usadas pela igreja e conectar repertorio aos cultos.

Escopo desejado:

- cadastrar musicas;
- registrar tons;
- registrar informacoes como artista/compositor, BPM, cifra/link, observacoes e tags;
- criar playlists/setlists por culto;
- relacionar musicas da playlist ao evento/culto da agenda;
- permitir visualizar as musicas de cada culto.

Possivel evolucao futura:

- anexos de cifras/partituras;
- audio/video de referencia;
- historico de tons usados;
- integracao com escalas de Louvor.

## Checklist E Liturgia Do Culto

Objetivo: permitir que cada culto tenha uma checklist operacional baseada na liturgia.

Escopo desejado:

- checklist por culto/evento;
- itens ordenados da liturgia;
- status de item concluido/pendente;
- responsavel por item;
- horarios ou duracao estimada;
- observacoes internas.

Exemplos:

- abertura;
- boas-vindas;
- louvor 1;
- avisos;
- oferta;
- mensagem;
- apelo;
- encerramento.

## Formularios

Objetivo: criar uma area onde admins montam formularios e acompanham respostas.

Escopo desejado:

- admin cria formularios;
- campos configuraveis;
- responsaveis por formulario;
- responsaveis recebem notificacoes/emails quando houver resposta;
- respostas ficam armazenadas;
- relatorios/exportacao por formulario.

Possiveis tipos de campo:

- texto curto;
- texto longo;
- email;
- telefone;
- data;
- numero;
- selecao unica;
- multipla escolha;
- checkbox;
- consentimento.

Possiveis usos:

- novos voluntarios;
- pedido de aconselhamento;
- inscricao de pequenos grupos;
- pedido de batismo;
- interesse em membresia;
- pedidos de oracao.

## Pessoas E Usuarios - Campos Ampliados

Campos solicitados:

- nome;
- data de nascimento;
- data que se membrou;
- endereco;
- telefone;
- email;
- batismo;
- ministerios que serve;
- notas.

Observacoes:

- `ministerios que serve` deve provavelmente vir dos grupos/ministerios e nao ser apenas texto livre;
- `batismo` pode iniciar como booleano e evoluir para data/local/observacoes;
- endereco pode comecar como texto simples e depois virar campos estruturados.

## Relatorios

Objetivo: criar uma aba central de relatorios.

Relatorios solicitados:

- aniversariantes da semana;
- total de membros;
- membros por categoria: mulheres, homens, adolescentes, kids;
- outros relatorios operacionais.

Observacoes:

- para relatorio por genero/faixa, o cadastro de pessoas precisa ter campos suficientes;
- adolescentes/kids podem ser calculados por idade a partir da data de nascimento;
- mulheres/homens exigem campo novo de genero ou categoria demografica.

## Ordem Recomendada

1. Campos ampliados em Pessoas.
2. Relatorios base de Pessoas.
3. Musicas e Playlists por Culto.
4. Checklist/Liturgia do Culto.
5. Formularios.

Motivo: Pessoas e relatorios criam base de dados; Musicas e Liturgia conectam com Agenda/Escalas; Formularios e relatorios de respostas sao um modulo maior e merecem fase propria.

