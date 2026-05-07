# Fase 73 - Check-in UX 2

## Status

Concluida.

## Objetivo

Reduzir a confusao da aba Check-in criando um contexto operacional claro por evento/culto.

## Entregue

- Check-in ganhou um painel do dia com evento/culto selecionado.
- O operador pode escolher um evento operacional e aplicar esse evento aos formularios de Check-in por Evento e Kids.
- Contadores passaram a refletir o evento/culto selecionado:
  - check-ins de evento;
  - criancas ativas;
  - retiradas kids;
  - presenca consolidada.
- Lista de pessoas em eventos passa a ser filtrada pelo evento selecionado.
- Lista de criancas ativas passa a ser filtrada pelo culto selecionado.
- Administracao kids passa a mostrar criancas do evento/culto selecionado.
- Etiquetas tambem passam a listar check-ins infantis do contexto selecionado.

## Fora De Escopo

- Novo endpoint agregado de dashboard.
- Fila por sala infantil.
- Notificacoes internas ao responsavel.
- Redesign completo da aba Check-in.
- Regras de idade/sala automaticas.

## Validacao

Executado em 2026-05-07:

```powershell
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado: builds concluidos e 37 testes da API passando.

## Proxima Evolucao Natural

Aprofundar Check-in com salas infantis, fila por idade/sala e dashboard do culto mais completo.

