# 0087 - Atalhos Entre Modulos Da Operacao Do Culto

## Contexto

A aba Culto consolidou a operacao, mas quando o usuario precisava editar Agenda, Escalas, Musicas ou Liturgia ainda era necessario usar o menu lateral e procurar o modulo.

## Decisao

Adicionar atalhos visiveis no topo da aba Culto para navegar aos modulos de origem da operacao.

## Consequencias

- A operacao fica mais fluida sem mudar arquitetura de rotas.
- Permissoes continuam centralizadas em `canAccessModule`.
- A edicao detalhada continua nos modulos corretos.
- Filtros contextuais por culto ficam para uma fase futura.
