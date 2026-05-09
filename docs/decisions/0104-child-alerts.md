# 0104 - Alertas Infantis Em Notas Estruturadas

## Contexto

O Check-in Kids ja permite cadastrar criancas pelo responsavel, gerar QR, imprimir etiquetas e operar um totem. O proximo ponto de seguranca operacional e destacar alergias, saude e observacoes de retirada.

## Decisao

Adicionar campos no contrato do formulario do responsavel e salvar esses dados em `PersonProfile.notes` com prefixos estruturados:

- `Alergias:`;
- `Saude:`;
- `Retirada:`.

## Motivos

- Evitar migration nesta etapa enquanto a UX ainda esta sendo validada.
- Tornar os alertas visiveis imediatamente no totem e na etiqueta.
- Permitir migrar depois para campos normalizados sem perder informacao.

## Consequencias

- Os alertas dependem do padrao textual nos prefixos.
- Edicao estruturada ainda nao existe.
- Uma fase futura deve normalizar esses dados se o modelo for aprovado.
