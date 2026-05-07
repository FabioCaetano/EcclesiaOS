# 0069 - Escrita Incremental De Ocorrencias No Prisma

Data: 2026-05-07

## Contexto

Em producao, o Render registrou erro Prisma `P2028` durante `GET /events`.

O problema acontecia porque a listagem de eventos tentava materializar recorrencias e, para persistir as novas ocorrencias, chamava `writePrismaData`, que regrava todo o estado do sistema em uma unica transacao Prisma grande.

## Decisao

Adicionar um caminho incremental para materializacao de recorrencias no Prisma.

## Detalhes

- Novo helper `appendEventsAndServingPlans` no data store.
- Novo helper `appendPrismaEventsAndServingPlans` no Prisma store.
- A materializacao de recorrencias passa a inserir apenas:
  - novos eventos filhos;
  - novos planos de escala gerados para equipes solicitadas.
- `GET /events` captura falhas de materializacao e ainda retorna a lista atual de eventos.
- Geracao manual de ocorrencias retorna mensagem amigavel se a escrita falhar.

## Consequencias

- Menor risco de timeout/transacao encerrada no Neon/Render.
- Menor carga no banco ao listar eventos.
- `writePrismaData` continua existindo para reset/seed e fluxos legados, mas sai do caminho critico da recorrencia.
