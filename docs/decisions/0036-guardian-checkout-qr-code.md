# Decisao 0036: Retirada Infantil Por Responsavel Logado E QR Code

## Status

Aceita.

## Contexto

O sistema ja tinha check-in infantil com etiqueta, codigo de seguranca e vinculo permanente entre crianca e responsaveis. O proximo passo natural era permitir que o proprio responsavel logado participasse da retirada, sem depender sempre de um operador admin/lider.

## Decisao

Permitir que usuarios autenticados retirem apenas criancas vinculadas ao seu `personId`, exigindo o `securityCode` do check-in. Admin e lider continuam com retirada operacional direta. A etiqueta infantil passa a exibir QR Code gerado no frontend com o identificador do check-in e o codigo de seguranca.

## Consequencias

- Membros passam a ter uso real no modulo Check-in quando sao responsaveis.
- A API filtra check-ins infantis para membros, reduzindo exposicao de dados.
- O codigo de seguranca vira validacao obrigatoria para retirada feita por responsavel.
- O QR Code fica pronto para evoluir para leitura por camera.
- A retirada ainda exige usuario autenticado.

## Nao Objetivos

- Nao criar retirada anonima por link publico.
- Nao criar camera scanner nesta fase.
- Nao substituir a conferencia humana da equipe infantil.
- Nao criar token assinado para QR Code nesta fase.
