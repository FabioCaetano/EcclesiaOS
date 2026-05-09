# Fase 90 - Salas Infantis Configuraveis

## Objetivo

Transformar as regras fixas de sala infantil em configuracao administravel e persistida no banco.

## Entregue

- Nova entidade `KidsRoom` no contrato compartilhado.
- Nova tabela Prisma `KidsRoomRecord`.
- Migration `20260509090000_kids_rooms` com seed inicial:
  - Berçario: 0 a 2 anos.
  - Maternal: 3 a 5 anos.
  - Kids: 6 a 8 anos.
  - Juniores: 9 a 11 anos.
  - Teens: 12 a 17 anos.
- Repositorio `kidsRoomRepository`.
- Endpoints autenticados:
  - `GET /kids-rooms`.
  - `POST /kids-rooms`.
  - `PUT /kids-rooms/:id`.
  - `DELETE /kids-rooms/:id`.
- Nova aba **Salas** dentro do Check-in:
  - cria sala infantil;
  - edita faixa etaria;
  - define capacidade;
  - vincula responsaveis;
  - ativa/inativa sala para sugestao.
- Sugestao de sala, dashboard e etiquetas agora usam salas ativas carregadas da API.

## Validacao

- `npm run db:generate --workspace @ecclesiaos/api`: passou.
- `npm run build:api`: passou.
- `npm run build:web`: passou.
- `npm run db:migrate:deploy --workspace @ecclesiaos/api`: passou no banco local.
- `npm test --workspace @ecclesiaos/api`: 40 testes passaram.

## Observacoes

- Se a API nao conseguir carregar salas, o frontend ainda usa um fallback local para nao bloquear a operacao.
- A migration precisa ser aplicada no Neon/Render antes de publicar esta fase.
- A capacidade ainda e informativa; alerta de sala cheia fica para uma fase posterior.
