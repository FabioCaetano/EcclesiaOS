# Fase 74 - Pessoas 2 - Campos Ampliados

## Status

Concluida.

## Objetivo

Ampliar o cadastro de pessoas para sustentar melhor acompanhamento pastoral, membresia, ministerios e futuros relatorios.

## Entregue

- `PersonProfile` ganhou novos campos:
  - `membershipDate`;
  - `address`;
  - `baptized`;
  - `gender`.
- Tela Pessoas passou a exibir/editar nascimento, data de membresia, endereco, batismo, genero e notas.
- Tela Pessoas mostra `Ministerios que serve` de forma derivada dos grupos/ministerios onde a pessoa esta vinculada.
- Cadastros existentes continuam compativeis com valores padrao.
- Registro publico e criacao automatica de pessoa por usuario continuam funcionando.
- Prisma recebeu migration para os novos campos.

## Decisoes

- `ministerios que serve` nao foi duplicado em Pessoas; vem dos grupos/ministerios existentes.
- `batismo` inicia como booleano simples.
- `endereco` inicia como texto unico.
- `gender` foi adicionado para permitir relatorios de mulheres/homens.
- Adolescentes/kids poderao ser calculados por idade usando `birthDate`.

## Validacao

Executado em 2026-05-07:

```powershell
npm run db:generate
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado: builds concluidos e 37 testes da API passando.

## Proxima Evolucao Natural

Fase 75 - Relatorios 1 - Pessoas.

