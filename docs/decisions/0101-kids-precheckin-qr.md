# 0101 - QR Do Responsavel Carrega Lote No Totem Kids

## Contexto

A Fase 99 permitiu ao responsavel gerar check-ins infantis pelo app, e a Fase 100 criou o totem autenticado por culto. Faltava conectar os dois pontos de forma pratica no balcao: responsavel mostra QR, operador escaneia e imprime etiquetas do lote correto.

## Decisao

Criar um payload de QR para o lote do responsavel:

- prefixo `ecclesiaos-kids-precheckin`;
- inclui o `eventId`;
- inclui pares `checkInId.securityCode`.

O totem interpreta esse QR como selecao de lote, nao como retirada.

## Motivos

- Evita o operador buscar manualmente cada crianca.
- Mantem seguranca usando o codigo de seguranca ja existente no check-in infantil.
- Reduz risco de imprimir etiqueta errada.

## Consequencias

- O QR depende de registros ja criados pelo app.
- Se o responsavel ainda nao gerou check-in, o QR nao existe.
- A proxima evolucao pode criar criancas/check-ins a partir de um cadastro rapido antes de mostrar o QR.
