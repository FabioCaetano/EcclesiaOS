# Fase 39: Impressao Em Lote De Etiquetas Infantis

## Objetivo

Permitir que a equipe infantil selecione varias criancas com check-in ativo e imprima etiquetas Brother em sequencia, sem abrir e imprimir uma etiqueta por vez.

## Status

Concluida.

## Escopo

- Adicionar selecao por checkbox na lista de check-ins infantis.
- Adicionar acao `Selecionar ativos`.
- Adicionar acao para limpar selecao.
- Adicionar acao `Imprimir lote`.
- Gerar uma area de impressao com uma etiqueta por crianca selecionada.
- Reutilizar o layout Brother 62mm ja criado.
- Separar modo de impressao individual e modo de impressao em lote.
- Manter QR Code e codigo de seguranca em cada etiqueta do lote.

## Fora De Escopo

- Impressao silenciosa sem dialogo do navegador.
- SDK Brother nativo.
- Impressao automatica logo apos o check-in.
- Fila historica de impressao.
- Reimpressao auditada.

## Criterios De Aceite

- Operador consegue selecionar varias criancas.
- Operador consegue selecionar todos os check-ins infantis ativos.
- Impressao em lote nao mistura etiqueta individual com o lote.
- Cada etiqueta impressa mantem crianca, responsavel, telefone, codigo e QR Code.
- Build e testes continuam passando.

## Verificacao

Concluida:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Resultados:

- `typecheck`: concluido.
- `test`: 19 testes API passando.
- `build`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao recomendada sera:

> Queremos criar a tela de auditoria ou consolidar check-in em presenca?
