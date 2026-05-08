# Fase 84 - Modo Execucao Do Culto

## Objetivo

Transformar a aba **Culto** em uma ferramenta usavel durante o culto, com uma visao limpa para acompanhar liturgia, repertorio, escala e check-in sem navegar entre modulos.

## Entregue

- Nova aba interna **Execucao** dentro de Culto.
- Aba **Operacao** mantida como visao completa.
- Cabecalho de execucao com culto/evento, data, horario e ambiente/local.
- Destaque do item atual da liturgia.
- Exibicao do proximo item pendente da liturgia.
- Linha do culto com status `Atual`, `Pendente` e `Concluido`.
- Painel operacional com:
  - progresso da liturgia;
  - escala confirmada;
  - pendencias de escala;
  - resumo de check-in de inscricoes.
- Repertorio do culto em formato compacto.
- Lista de pendencias de escala para a coordinacao.
- Layout responsivo para desktop e mobile.

## Decisoes De Escopo

- A fase foi implementada apenas no frontend.
- Nenhuma migration Prisma foi necessaria.
- Nenhum endpoint novo foi criado.
- A liturgia continua sendo editada no modulo Liturgia.
- Escalas, repertorio e inscricoes continuam sendo fontes dos seus proprios dados.

## Validacao

```powershell
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado: builds passaram e a API passou com 40 testes.

## Proximas Evolucoes

- Permitir marcar item da liturgia como concluido diretamente no modo execucao.
- Adicionar modo tela cheia.
- Incluir check-in Kids/eventos em tempo real quando o modulo de salas infantis avancar.
- Criar atalhos de edicao para Liturgia, Escalas e Musicas.
