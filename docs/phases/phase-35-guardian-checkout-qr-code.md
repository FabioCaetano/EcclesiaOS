# Fase 35: Retirada Infantil Por Responsavel Logado E QR Code

## Objetivo

Permitir que o responsavel logado retire uma crianca vinculada a ele, usando o codigo de seguranca da etiqueta e QR Code como apoio operacional.

## Status

Concluida.

## Escopo

- Permitir retirada infantil por usuario autenticado vinculado como responsavel.
- Validar se o usuario logado e o `guardianPersonId` do check-in.
- Tambem aceitar vinculo permanente via `guardianPersonIds` da pessoa da crianca.
- Exigir `securityCode` para retirada feita por membro/responsavel.
- Manter admin e lider com retirada operacional direta.
- Filtrar a listagem de check-ins infantis para membro ver apenas criancas vinculadas a ele.
- Adicionar QR Code real na etiqueta infantil.
- Adicionar acao de retirada para responsavel na tela Check-in.
- Cobrir o fluxo com teste HTTP.

## Fora De Escopo

- Leitor de camera dentro do navegador.
- Rota publica anonima de retirada.
- QR Code com token assinado de longa duracao.
- Integracao com impressora termica.
- Foto ou documento do responsavel.

## Criterios De Aceite

- Admin/lider continuam registrando saida infantil.
- Membro responsavel consegue retirar crianca vinculada com codigo correto.
- Membro nao responsavel nao consegue retirar outra crianca.
- Codigo incorreto bloqueia a retirada.
- Etiqueta infantil mostra QR Code junto do codigo de seguranca.

## Verificacao

Concluida:

```powershell
npm.cmd run build --workspace @ecclesiaos/shared
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Resultados:

- `typecheck`: concluido.
- `test`: 19 testes API passando.
- `build`: concluido.
- Dependencia `qrcode` adicionada ao workspace web para gerar QR Code no frontend.

## Proxima Pergunta

Depois desta fase, a proxima decisao recomendada sera:

> Queremos aprofundar inscricoes de eventos ou criar leitura de QR Code pela camera?
