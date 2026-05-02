# Decisao 0037: Leitura De QR Code E Etiquetas Brother

## Status

Aceita.

## Contexto

O QR Code ja estava presente na etiqueta infantil, mas ainda nao havia leitura pela camera nem preparo de impressao com dimensoes de impressoras de etiqueta. A igreja precisa operar retirada infantil com menos digitacao e imprimir etiquetas em impressora Brother.

## Decisao

Adicionar leitura de QR Code pelo navegador usando `BarcodeDetector` quando disponivel, mantendo fallback manual. Para Brother, usar impressao do navegador com CSS em milimetros e presets de 62mm, deixando a selecao do modelo/papel para o driver da impressora.

## Consequencias

- O fluxo funciona sem backend novo.
- A camera depende do suporte do navegador e permissao do usuario.
- O fallback manual mantem o fluxo utilizavel quando a camera nao esta disponivel.
- A impressao usa o driver Brother instalado no sistema.
- Impressao silenciosa ou SDK Brother ficam para fase futura.

## Nao Objetivos

- Nao usar SDK Brother nesta fase.
- Nao criar app desktop de impressao.
- Nao criar impressao automatica sem confirmacao do navegador.
- Nao criar impressao em lote ainda.
