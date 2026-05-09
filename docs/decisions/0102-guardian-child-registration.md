# 0102 - Cadastro Reduzido De Crianca Pelo Responsavel

## Contexto

O responsavel ja conseguia selecionar criancas vinculadas e gerar QR de check-in. Ainda havia uma dependencia operacional: se a crianca nao existisse em Pessoas, o responsavel nao conseguia iniciar o fluxo sozinho.

## Decisao

Criar uma rota especifica para responsavel cadastrar suas proprias criancas:

- `POST /people/my-children`;
- usa campos reduzidos;
- exige usuario autenticado com `personId`;
- sempre adiciona o `personId` do usuario como responsavel da crianca.

## Motivos

- Nao abrir `POST /people` completo para membros.
- Garantir vinculo familiar automatico.
- Reduzir trabalho da secretaria no primeiro check-in.

## Consequencias

- Criancas cadastradas por responsavel entram como `visitor` ate uma revisao futura.
- Edicao completa continua restrita ao modulo Pessoas.
- Campos mais sensiveis, como autorizados adicionais e dados medicos, ficam para uma fase posterior.
