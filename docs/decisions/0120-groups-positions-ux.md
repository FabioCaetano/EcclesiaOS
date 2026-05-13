# Decisao 0120: Grupos Com Posicoes E Visibilidade

## Status

Aceita.

## Contexto

A pagina Grupos hoje guarda `servicePositions: string[]` por grupo e `memberServicePositions: Record<string, string[]>` para mapear membro → posicoes. Mas a UX nao acompanha: posicoes sao editadas como uma string colada (`textarea` com `\n`), membros sao escolhidos por checkbox de TODAS as pessoas, e a atribuicao posicao×membro e uma matriz de checkboxes. Para igrejas com 100+ pessoas isso e inviavel. Alem disso, todo usuario autenticado ve todos os grupos, mesmo nao fazendo parte deles.

## Decisao

Sem migration. Sem mudar contrato compartilhado. Apenas frontend.

- **Renomear visualmente** "Posicoes de servico" → "Posicoes" quando o grupo e `ministry` ou `team`.
- **Chips editaveis** para posicoes: um `<input>` por posicao com X de remover, botao `+ Posicao` no final. Mesma tecnica da Fase 115 (Builder de Formularios).
- **Membros por busca**: `<input list="groups-people-options">` + `<datalist>` populado pelas pessoas. Adicionar gera um chip por membro. Substituicao completa do `member-picker` (checkbox-grid).
- **Atribuir posicoes por membro**: dentro do chip do membro, mostrar todas as posicoes do grupo como toggles clicaveis (multi-select). Quando uma posicao e adicionada, ela vira clicavel pra todos os membros.
- **Visibilidade**: na propria `GroupsPage`, filtrar `groups` se `user.role !== "admin"`:
  - mostra grupos onde `leaderPersonId === user.personId`,
  - ou onde `memberPersonIds.includes(user.personId)`.
- Admin continua vendo todos. Lider/membro fora do grupo nao ve o grupo.

Backend continua aberto (sem filtro server-side), porque outros modulos (calendario, mensagens, notificacoes, escala) precisam da lista completa para resolver nomes. A privacidade da pagina Grupos e protegida no frontend.

## Consequencias

- Cadastro de ministerios fica viavel mesmo com igreja grande.
- Atribuir posicao ao membro fica explicito sem matriz.
- Membros nao veem grupos de outros ministerios na propria pagina.
- Reaproveita componentes/padrao ja existentes (chips, datalist) — sem nova dependencia.

## Nao Objetivos

- Drag-and-drop para reordenar posicoes.
- Limite de membros por posicao.
- Sub-grupos / hierarquia.
- Restricao server-side de visibilidade.
- Importacao de membros via CSV.
