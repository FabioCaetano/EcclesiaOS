# Fase 34: Responsaveis E Criancas

## Objetivo

Criar uma relacao permanente entre pessoas responsaveis e criancas para facilitar check-in infantil, retirada futura por responsavel logado e evolucao para familias/casas.

## Status

Concluida.

## Escopo

- Adicionar `guardianPersonIds` ao cadastro de pessoas.
- Criar migration `20260501020000_person_guardian_links`.
- Atualizar Prisma Client, provider Prisma e provider JSON.
- Permitir selecionar responsaveis vinculados na tela Pessoas.
- Persistir a lista de responsaveis no cadastro da crianca.
- Sugerir automaticamente o primeiro responsavel vinculado no check-in infantil.
- Destacar responsaveis vinculados no seletor do check-in infantil.
- Manter compatibilidade com pessoas antigas sem responsaveis cadastrados.

## Fora De Escopo

- Criar modulo completo de familias/casas.
- Obrigar toda crianca a ter responsavel.
- Retirada publica feita diretamente pelo responsavel logado.
- QR Code infantil.
- Validacao por documento ou foto.

## Criterios De Aceite

- Admin consegue editar uma pessoa e vincular responsaveis cadastrados.
- Check-in infantil identifica responsaveis vinculados a crianca selecionada.
- Ao selecionar uma crianca com responsavel, o formulario sugere o responsavel.
- Dados antigos continuam compativeis com `guardianPersonIds` vazio.
- Banco real possui a nova coluna.

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
- `db:migrate`: migration aplicada no PostgreSQL local; sessao idle do Prisma foi encerrada manualmente apos timeout conhecido.
- `reset-dev-data`: concluido.
- `db:verify`: concluido com usuarios e pessoas semente.
- `test`: 18 testes API passando.
- `build`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao recomendada sera:

> Queremos aprofundar inscricoes de eventos ou criar retirada infantil por responsavel logado/QR Code?
