# 0093 - Detalhe Da Escala Agrupado Por Status

## Contexto

Mesmo com filtros na lista de escalas, o detalhe do plano ainda misturava todos os escalados em uma unica lista. Isso dificultava a leitura quando o lider precisava tratar recusas ou acompanhar pendencias.

## Decisao

Agrupar visualmente os escalados por status dentro do plano selecionado, mantendo a edicao sobre os mesmos dados do formulario.

A ordem escolhida foi:

1. Recusadas.
2. Pendentes.
3. Confirmadas.

## Motivos

- Recusas normalmente exigem acao imediata.
- Pendencias precisam de acompanhamento.
- Confirmacoes sao contexto importante, mas nao devem competir visualmente com problemas.
- A mudanca pode ser feita no frontend sem impactar API ou banco.

## Consequencias

- A tela de Escalas fica mais proxima de uma operacao real de lider ministerial.
- O proximo passo pode criar uma acao dedicada de substituicao no backend, com auditoria e notificacao.
