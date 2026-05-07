# Fase 69 - Posicoes Em Ministerios

## Status

Concluida.

## Objetivo

Permitir que ministerios e equipes tenham posicoes operacionais configuraveis para uso em Escalas.

Exemplos:

- Louvor: vocal, bateria, guitarra, teclado, baixo;
- Midia: camera, transmissao, slides, som;
- Kids: recepcao, sala infantil, apoio.

## Entregue

- `GroupProfile` ganhou `servicePositions`.
- Grupos comuns e classes continuam sem obrigatoriedade de posicoes.
- Ministerios/equipes exibem campo de posicoes no cadastro de Grupos.
- Posicoes podem ser digitadas uma por linha ou separadas por virgula.
- Escalas passa a usar um seletor de posicao quando o grupo selecionado possui posicoes cadastradas.
- Escalas ainda aceita funcao livre quando o grupo nao possui posicoes configuradas.
- Seed inicial do ministerio Louvor recebeu posicoes basicas.
- Prisma recebeu migration para `GroupRecord.servicePositions`.

## Fora De Escopo

- Vincular cada pessoa a posicoes permitidas dentro do ministerio.
- Validar quantidade minima por posicao em um culto.
- Relatorios por posicao.
- Sugestao automatica considerando posicao especifica.

## Proxima Evolucao Natural

Permitir que cada membro do ministerio tenha posicoes habilitadas, para que substitutos automaticos e escala por funcao fiquem mais precisos.

## Validacao

Executado em 2026-05-07:

```powershell
npm run db:generate
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado: builds concluidos e 37 testes da API passando.
