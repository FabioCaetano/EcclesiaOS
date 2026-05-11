# Decisao 0114: Calendario De Ambientes

## Status

Aceita.

## Contexto

A pagina Ambientes hoje lista reservas em coluna vertical com filtro por mes. Funciona para auditoria, mas e dificil ver "quando a sala X esta livre" no contexto de uma semana. Liderancas de ministerio relataram que checar disponibilidade requer rolar a lista. Alem disso, o cadastro de ambiente e a criacao de reservas ja estao em abas separadas, mas a permissao no frontend ainda exige `admin`, apesar de o backend permitir `leader` em `canManageModule("resources")`.

## Decisao

- Adicionar terceira aba **Calendario** na pagina Ambientes com grid mensal real (7 colunas, dias do mes corrente, com dias da semana adjacentes em cinza para preencher).
- Cada dia mostra ate 3 reservas como pills coloridas; quando ha mais, exibir `+N`. Cor da pill e derivada de hash deterministico do `resourceId` para distinguir ambientes a olho.
- Clicar em pill seleciona a reserva e leva para a aba **Reservas** com o editor preenchido.
- Clicar em dia vazio abre nova reserva com `date` pre-preenchida e `resourceId` igual ao ambiente filtrado (se algum).
- Filtro de ambiente na barra superior do calendario; quando nenhum ambiente esta selecionado, mostra todos.
- Reservas com status `cancelled` aparecem com opacidade reduzida.
- Substituir checagens diretas `user.role !== "admin"` por `canManageModule(user.role, "resources")` em todo o `ResourcesPage`, alinhando com o backend.

Sem mudancas em backend, banco ou contrato compartilhado. O bloqueio de conflito ja funciona via `resourceRepository.createReservation` e o frontend ja exibe mensagem clara em 409.

## Consequencias

- Lideres de ministerio passam a poder criar e gerenciar reservas no frontend (ja era permitido pelo backend).
- Visao de mes vira a forma natural de planejar uso de salas.
- Reaproveita CSS de calendarios ja usados no app.

## Nao Objetivos

- Visao semanal/diaria com linha do tempo por hora.
- Drag-and-drop para reagendar reserva no calendario.
- Visao multi-mes simultanea.
- Notificacao automatica de conflito iminente.
- iCal/Google Calendar export.
