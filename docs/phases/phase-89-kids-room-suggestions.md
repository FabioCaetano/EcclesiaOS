# Fase 89 - Check-in Kids Com Salas Sugeridas

## Objetivo

Dar o primeiro passo pratico para salas infantis dentro do Check-in, sem criar nova migration nesta etapa.

## Entregue

- Regras iniciais de sala por idade no frontend:
  - Berçario: 0 a 2 anos.
  - Maternal: 3 a 5 anos.
  - Kids: 6 a 8 anos.
  - Juniores: 9 a 11 anos.
  - Teens: 12 a 17 anos.
- Sala sugerida no formulario de check-in infantil.
- Sala exibida nos cards de criancas ativas.
- Dashboard lateral por sala na Administracao kids.
- Campo opcional **Sala sugerida** na configuracao da etiqueta.
- Sala impressa na etiqueta individual e em lote quando o campo estiver ativo.

## Validacao

- `npm run build:web`: passou.

## Observacoes

- A sala e calculada pela data de nascimento da pessoa vinculada a crianca.
- Quando a crianca nao tem pessoa vinculada ou data de nascimento, aparece **Sala a definir**.
- Proximo passo natural: transformar essas regras em configuracao administravel no banco.
