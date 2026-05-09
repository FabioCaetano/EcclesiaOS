# 0099 - Responsavel Logado Pode Fazer Check-in Das Proprias Criancas

## Contexto

O feedback de UX definiu que o Check-in infantil nao deve depender apenas de operadores cadastrando criancas manualmente. O responsavel deve acessar o app, selecionar as criancas que estao com ele e iniciar o check-in do culto.

## Decisao

Criar a primeira camada do Check-in 2.0 no fluxo autenticado:

- membro/visitante logado ve somente o fluxo Kids;
- responsavel seleciona criancas vinculadas a ele;
- backend permite criar check-in infantil para usuario comum somente quando a crianca esta vinculada ao `personId` do usuario;
- backend sobrescreve os dados do responsavel com a pessoa logada.

## Motivos

- Reduzir trabalho manual na entrada do culto.
- Impedir que um membro faca check-in de crianca que nao esteja vinculada a ele.
- Preparar o proximo passo do totem sem abrir uma superficie insegura.

## Consequencias

- O app passa a depender mais do vinculo pessoa -> usuario -> familiares para Check-in Kids.
- Criancas ainda precisam existir como pessoas cadastradas para aparecerem ao responsavel.
- O totem e o QR de pre-check-in ficam para a fase seguinte.
