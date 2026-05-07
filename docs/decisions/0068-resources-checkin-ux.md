# 0068 - UX De Ambientes E Check-in

Data: 2026-05-07

## Contexto

O feedback de produto indicou que:

- Ambientes estava misturando criacao de ambiente e criacao de reserva.
- Erros de ambiente apareciam no contexto errado.
- Check-in precisava concentrar etiquetas, impressoras e preview da etiqueta.
- A operacao de Kids/Eventos ainda estava visualmente confusa.

## Decisao

Atacar primeiro os pontos de friccao mais diretos:

- mensagens separadas por formulario em Ambientes;
- validacao client-side antes de salvar;
- aba dedicada de Etiquetas dentro do Check-in;
- preview de etiqueta com campos configuraveis.

## Consequencias

- O usuario entende melhor se esta criando um ambiente ou uma reserva.
- Erros ficam mais proximos do formulario correto.
- Etiquetas passam a ser operadas a partir do Check-in, que e onde elas sao usadas no culto.
- A configuracao visual de campos da etiqueta pode evoluir depois para persistencia por template.
