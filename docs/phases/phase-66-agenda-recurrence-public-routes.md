# Fase 66 - Estabilizacao De Agenda, Recorrencia E Rotas Publicas

Status: concluida.

## Objetivo

Corrigir os bloqueios apontados no feedback de produto de 2026-05-07 para liberar novos testes reais da Agenda e dos links publicos publicados.

## Entregas

- Agenda passou a exibir o campo `Ambiente` em vez de `Local`.
- O campo Ambiente agora usa uma lista de ambientes ativos cadastrados.
- Salvamento de evento valida campos obrigatorios e retorna mensagens especificas.
- Erros conhecidos de persistencia, como slug publico duplicado, deixam de vazar erro bruto do Prisma para a interface.
- Recorrencias `weekly` e `monthly` agora tambem geram ocorrencias materializadas, nao apenas recorrencias `cron`.
- O botao `Gerar ocorrencias` aparece para qualquer evento recorrente mestre.
- `vercel.json` ganhou rewrite para rotas SPA, cobrindo links publicos como `/visitor`, `/forgot-password`, `/reset-password`, `/register/:slug`, `/register/:slug/confirm` e `/event-checkin/:slug`.

## Decisoes

- Manter `location` como campo interno por enquanto para evitar migration nesta fase, mas tratar visualmente como Ambiente.
- Usar o nome do ambiente como valor salvo no evento nesta rodada.
- Deixar ambiente vazio permitido para eventos externos ou eventos ainda sem sala definida.
- Materializar recorrencias simples como eventos filhos com `parentEventId`, reaproveitando o fluxo ja criado para cron.
- Continuar usando teto tecnico de 12 meses quando a recorrencia nao tem data final.

## Validacao

- `npm.cmd run build:api`
- `npm.cmd run build:web`
- `npm.cmd test --workspace @ecclesiaos/api`

## Proxima Fase Recomendada

Fase 67 - UX De Ambientes E Check-in.

Motivo: depois de desbloquear Agenda e rotas publicas, o proximo maior atrito de uso esta na organizacao visual de Ambientes e Check-in.
