# Fase 72 - Posicoes Por Pessoa E Substitutos Mais Precisos

## Status

Concluida.

## Objetivo

Completar a base de posicoes em ministerios criada na Fase 69, permitindo definir quais posicoes cada membro pode servir e usando isso na montagem da escala e na sugestao de substitutos.

## Entregue

- `GroupProfile` ganhou `memberServicePositions`.
- Ministerios/equipes podem definir posicoes por pessoa.
- Grupos comuns e classes continuam sem esse detalhamento.
- Na aba Grupos, admins podem marcar quais posicoes cada membro exerce.
- Na aba Escalas, ao escolher uma posicao, a lista de pessoas prioriza quem esta habilitado para aquela posicao.
- Caso uma pessoa ja escalada nao esteja habilitada para a posicao, a tela mostra alerta.
- Substitutos automaticos agora respeitam a posicao recusada quando ela pertence ao ministerio/equipe.
- Prisma recebeu migration para `GroupRecord.memberServicePositions`.

## Fora De Escopo

- Quantidade minima por posicao em cada culto.
- Regras de senioridade, preferencia ou rotacao por posicao.
- Relatorio mensal por posicao.
- Bloquear totalmente uma escala manual fora da posicao habilitada; por enquanto a UI alerta e o filtro ajuda o lider.

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

Aprofundar Check-in UX 2, porque o fluxo de Escalas ja possui equipe, posicao, indisponibilidade e substituto automatico.

