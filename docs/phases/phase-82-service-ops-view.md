# Fase 82 - Visao Unica Operacional Do Culto

## Objetivo

Criar uma aba propria para acompanhar a operacao de um culto/evento em uma unica tela, sem mover a responsabilidade dos dados de Agenda, Escalas, Musicas, Liturgia ou Inscricoes.

## Entregue

- Novo modulo `serviceOps`, exibido no menu como **Culto**.
- Seletor de culto/evento com escolha automatica do proximo culto.
- Resumo do evento com data, horario, tipo, ambiente/local e descricao.
- Indicadores de equipes solicitadas, pessoas escaladas, musicas, liturgia, confirmados, pendentes, inscritos e repertorios.
- Bloco de equipes e escalas com status traduzido.
- Bloco de repertorio musical vinculado ao culto.
- Bloco de liturgia/checklist com pendencias e concluidos.
- Bloco de inscricoes/check-in visivel para administradores.

## Decisoes De Escopo

- A aba **Culto** e uma visao agregadora, nao uma nova fonte de dados.
- Agenda continua dona dos eventos.
- Escalas continua dona das atribuicoes e confirmacoes.
- Musicas continua dona da biblioteca e repertorios.
- Liturgia continua dona dos checklists.
- Inscricoes continuam no fluxo de eventos/check-in.
- Nenhuma migration Prisma foi necessaria nesta fase.

## Validacao

```powershell
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado: builds passaram e a API passou com 40 testes.

## Proximas Evolucoes

- Criar atalhos de edicao para abrir Agenda, Escalas, Musicas e Liturgia a partir da aba Culto.
- Criar modo de execucao do culto com tela mais limpa para uso durante o servico.
- Incluir resumo operacional de Check-in Kids e Check-in de Eventos na mesma visao.
- Refinar permissao para lideres enxergarem somente equipes sob sua lideranca quando fizer sentido.
