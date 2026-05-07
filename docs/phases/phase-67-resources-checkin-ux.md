# Fase 67 - UX De Ambientes E Check-in

Status: implementada, com hotfix de producao aplicado; validacao automatica pendente por bloqueio do sandbox.

## Objetivo

Reduzir a confusao operacional apontada no feedback de produto, principalmente em Ambientes e Check-in.

## Entregas

- Hotfix de API aplicado durante a fase: `GET /events` nao derruba mais a API se a materializacao automatica de recorrencias falhar no Prisma/Neon.
- Transacao Prisma de escrita recebeu `maxWait` e `timeout` maiores para reduzir erro `P2028` em producao.
- Geracao manual de ocorrencias agora retorna erro amigavel se a transacao falhar, sem encerrar o processo Node.
- Ambientes agora separa melhor o fluxo de cadastro de ambiente e o fluxo de reserva.
- Mensagens de erro de ambiente e reserva foram separadas, evitando erro de cadastro aparecer no formulario de reserva.
- Criacao de ambiente valida nome antes de chamar a API.
- Criacao de reserva valida ambiente, titulo, data, inicio e fim antes de chamar a API.
- API client passa a reaproveitar mensagens amigaveis retornadas pelo backend para ambientes e reservas.
- Check-in ganhou aba propria de `Etiquetas`.
- A aba Etiquetas permite selecionar criancas/check-ins infantis e imprimir lote.
- Preview de etiqueta infantil ganhou campos configuraveis:
  - idade;
  - telefone do responsavel;
  - observacoes;
  - QR Code.
- O preview segue usando os templates de etiqueta cadastrados e fallback Brother quando nenhum template esta disponivel.

## Decisoes

- Manter os templates existentes sem migration nesta fase.
- Comecar centralizando o uso operacional das etiquetas no Check-in.
- Separar criacao de ambiente e reserva primeiro no fluxo visual, deixando uma reorganizacao mais profunda de layout para iteracao posterior se necessario.

## Validacao

Tentativas de validacao:

- `npm.cmd run build:web`
- `npm.cmd run build:api`

Resultado: os comandos nao puderam ser executados nesta sessao porque o ambiente bloqueou execucao de processos Windows apos atingir limite de uso/aprovacao. A validacao deve ser rodada assim que a execucao local estiver disponivel.

## Observacao De Producao

Durante a conclusao da fase, o Render registrou erro Prisma `P2028` em `handleListEvents`, causado pela materializacao automatica de recorrencias dentro de `GET /events`. O hotfix aplicado evita queda da API e aumenta o tempo permitido da transacao. A arquitetura futura ideal e substituir o `writePrismaData` completo por operacoes incrementais no Prisma para eventos/ocorrencias.

## Proxima Fase Recomendada

Fase 68 - Escalas Operacionais E Indisponibilidade.

Motivo: o feedback indicou que Escalas ainda permite/parece permitir acoes demais para membro e precisa de uma tela menos poluida.
