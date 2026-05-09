# 0097 - Calendario Como Entrada Principal Da Agenda

## Contexto

O feedback mais recente indicou que a aba Agenda estava duplicando responsabilidades com o Calendario e deixando o fluxo mais pesado: para criar ou consultar eventos, o usuario precisava alternar entre telas que representam o mesmo dominio.

Tambem foi apontado que alguns modulos ainda estavam visiveis para membros sem necessidade operacional.

## Decisao

Iniciar a UX Operacional 2.0 tratando o Calendario como centro de eventos, cultos e reservas:

- remover Agenda do menu lateral;
- manter o editor antigo de Agenda como tela interna transicional;
- adicionar **Novo evento/agenda** no Calendario;
- adicionar acoes rapidas no detalhe do dia;
- restringir modulos operacionais para membros.

## Motivos

- O Calendario e a visualizacao natural para entender quando algo acontece.
- A criacao de agenda/evento deve nascer do contexto do calendario, nao de uma aba administrativa separada.
- Membros devem ter uma experiencia mais simples e nao devem navegar por dados sensiveis de outros membros ou operacao interna.

## Consequencias

- A navegação fica mais curta para admin/lider.
- A Agenda ainda existe internamente ate a edicao contextual ficar pronta.
- Proximas fases devem concluir o vinculo evento selecionado -> edicao, culto operacional e lista abaixo do Calendario.
