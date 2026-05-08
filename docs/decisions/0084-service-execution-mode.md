# 0084 - Modo Execucao Do Culto

## Contexto

A aba Culto consolidava a operacao em uma unica tela, mas ainda era mais adequada para planejamento e conferencia. Durante o culto, a equipe precisa de menos informacao e mais foco: item atual, proximo item, repertorio, escala e pendencias.

## Decisao

Adicionar uma aba interna **Execucao** dentro do modulo Culto, preservando a visao completa como **Operacao**.

## Consequencias

- A equipe pode usar a aba Culto antes e durante o servico.
- Nao duplicamos dados nem regras de edicao.
- A tela de execucao depende dos vinculos existentes por `eventId`.
- Futuras acoes diretas, como concluir item da liturgia, podem ser adicionadas sem mudar o conceito do modulo.
