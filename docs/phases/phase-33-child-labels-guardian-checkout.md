# Fase 33: Etiquetas Infantis E Retirada Por Responsavel

## Objetivo

Aprofundar o check-in infantil com vinculo opcional de crianca e responsavel a pessoas cadastradas, etiqueta simples e registro de quem realizou a retirada.

## Status

Concluida.

## Escopo

- Adicionar campos ao check-in infantil:
  - `childPersonId`;
  - `guardianPersonId`;
  - `checkedOutByPersonId`.
- Criar migration `20260501010000_child_checkin_guardian_links`.
- Atualizar Prisma Client.
- Atualizar provider JSON e Prisma.
- Permitir selecionar pessoa da crianca no check-in infantil.
- Permitir selecionar pessoa responsavel no check-in infantil.
- Preencher nome/telefone do responsavel a partir da pessoa selecionada.
- Registrar pessoa do operador que realizou a saida.
- Adicionar visualizacao de etiqueta infantil.
- Permitir imprimir a etiqueta pelo navegador.
- Exibir codigo de seguranca, crianca, evento, responsavel e telefone.

## Fora De Escopo

- Relacao familiar permanente responsavel/crianca.
- Retirada publica feita diretamente pelo responsavel logado.
- Impressao especializada em impressora termica.
- QR Code.
- Foto da crianca.

## Criterios De Aceite

- Lider/admin registra check-in infantil com responsavel vinculado.
- Etiqueta mostra codigo de seguranca.
- Saida registra `checkedOutByPersonId`.
- Dados antigos continuam compativeis.
- Banco real possui os novos campos.

## Verificacao

Concluida:

```powershell
npm.cmd run db:generate
npm.cmd run typecheck
npm.cmd run db:migrate
npm.cmd run reset-dev-data
npm.cmd run db:verify
npm.cmd run test
npm.cmd run build
```

Resultados:

- `db:generate`: Prisma Client atualizado.
- `typecheck`: concluido.
- `db:migrate`: migration aplicada no PostgreSQL local.
- `reset-dev-data`: concluido.
- `db:verify`: concluido.
- `test`: 17 testes API passando.
- `build`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos criar relacao responsavel/crianca permanente ou aprofundar inscricoes de eventos?
