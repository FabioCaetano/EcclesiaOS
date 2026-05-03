# Decisao 0046: Eventos Solicitam Equipes E Lider Escala A Propria

## Status

Aceita.

## Contexto

A primeira versao de Escalas trata `ServingPlan` como entidade independente, criada manualmente por admin com `groupId`, `date`, `title` e atribuicoes. Nao havia ligacao com a Agenda. Em um culto que precisa de Louvor + Recepcao + Audiovisual, era preciso criar tres planos manualmente sem relacao com o evento.

A igreja pediu:

- ao criar evento, indicar quais equipes servem;
- lider da equipe ver e montar a escala apenas dos eventos da sua equipe;
- pessoas escaladas confirmarem ou recusarem (fluxo ja existia).

## Decisao

Conectar Agenda e Escalas atraves de duas mudancas mínimas:

- `ChurchEvent` ganha `requestedTeamIds: string[]`. Apenas grupos do tipo `ministry` ou `team` sao validos como equipe solicitada.
- `ServingPlan` ganha `eventId: string` opcional. Plano com `eventId` esta vinculado a um evento; plano sem `eventId` continua sendo escala avulsa.

Sincronizacao automatica:

- Ao criar/atualizar evento com `requestedTeamIds`, o backend garante um plano por equipe vinculado ao evento, idempotente.
- Ao desmarcar uma equipe, o plano correspondente e removido apenas se nao tiver atribuicoes; com atribuicoes, o plano permanece para auditoria/historico (admin pode remover manualmente).
- Ao remover o evento, todos os planos vinculados ao evento sao removidos junto.
- Quando ocorrencias de cron sao materializadas, `requestedTeamIds` e copiado para o evento filho e os planos correspondentes sao gerados.

Permissoes:

- Admin pode criar, editar e remover qualquer plano e atribuir qualquer pessoa.
- Lider da equipe (lider do grupo cujo `id` e o `groupId` do plano) pode editar atribuicoes do proprio plano. Ao escalar pessoa, a API exige que a pessoa esteja em `memberPersonIds` da equipe; admin nao tem essa restricao.
- Lider/membro continua respondendo apenas as proprias escalas (sem alteracao no fluxo de status).

API:

- `GET /serving-plans?groupId=` aceita filtro por equipe; sem filtro, devolve tudo.
- `PUT /serving-plans/:id` passa a aceitar lider do `groupId` do plano, com validacao de pertencimento de pessoas a equipe.
- `POST /serving-plans` continua restrito a admin (criacao avulsa).

Recusa de escala:

- Status `declined` ja existia. Plano passa a exibir contagem visivel de recusas para lider/admin.
- Nao ha substituicao automatica nesta fase.
- Nao ha envio externo (WhatsApp/email) ao lider nesta fase.

## Consequencias

- Agenda e Escalas ficam coerentes; uma alteracao do evento propaga para os planos.
- Lider de equipe passa a ter acesso operacional sem precisar do admin para abrir cada evento.
- Modelagem de dados continua simples: dois campos novos, sem nova tabela.
- Idempotencia evita duplicar planos quando um cron gera multiplas ocorrencias.
- Eventos cron filhos herdam `requestedTeamIds` do mestre, gerando planos automaticamente em cada ocorrencia materializada.
- Nao reescreve historico de planos ja preenchidos quando admin desmarca equipe.

## Nao Objetivos

- Nao incluir substituicao automatica de escalas recusadas.
- Nao notificar lider externamente (WhatsApp, email).
- Nao permitir lider criar evento; criar evento continua restrito a admin.
- Nao mudar o fluxo de confirmacao/recusa pessoal (Fase 16/17 ja entregaram).
- Nao acrescentar funcoes/cargos como entidade propria; o campo `role` continua texto livre na atribuicao.
