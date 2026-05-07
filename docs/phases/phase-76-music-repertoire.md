# Fase 76 - Musicas e Repertorio

## Objetivo

Criar a primeira versao da area de musicas do EcclesiaOS, permitindo cadastrar musicas e montar repertorios/playlists vinculados aos cultos ou eventos.

## Implementado

- Novo modulo `Musicas` no menu de Operacao.
- Biblioteca de musicas com:
  - titulo;
  - artista;
  - tom principal;
  - BPM;
  - tema;
  - cifra;
  - letra;
  - notas.
- Repertorios de culto/evento com:
  - vinculo opcional com agenda/evento;
  - titulo e data;
  - lista ordenada de musicas;
  - tom por musica;
  - notas do repertorio.
- Permissao:
  - membros podem visualizar;
  - lideres e administradores podem criar, editar e remover.
- API:
  - `GET /songs`
  - `POST /songs`
  - `PUT /songs/:id`
  - `DELETE /songs/:id`
  - `GET /worship-sets`
  - `POST /worship-sets`
  - `PUT /worship-sets/:id`
  - `DELETE /worship-sets/:id`
- Persistencia JSON local e PostgreSQL/Prisma.
- Migracao Prisma `20260507160000_music_repertoire`.
- Teste de API garantindo que lider gerencia musicas/repertorios e membro apenas visualiza.

## Arquivos principais

- `packages/shared/src/index.ts`
- `apps/api/src/data/musicRepository.ts`
- `apps/api/src/data/dataStore.ts`
- `apps/api/src/data/prismaStore.ts`
- `apps/api/src/server.ts`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260507160000_music_repertoire/migration.sql`
- `apps/api/src/http.test.ts`
- `apps/web/src/MusicPage.tsx`
- `apps/web/src/AppLayout.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/api.ts`

## Validacao

Executado com sucesso:

```powershell
npm run build:web
npm run db:generate
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado dos testes:

- 38 testes passaram.

## Proximos passos

- Permitir editar tom/notas de cada musica dentro do repertorio com controles individuais.
- Exibir repertorio dentro da tela de Agenda/Culto.
- Criar impressao/exportacao do repertorio.
- Avancar para liturgia/checklist do culto.
