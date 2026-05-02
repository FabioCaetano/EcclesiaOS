# Fase 23: Senha Segura

## Objetivo

Trocar o armazenamento de senhas em texto puro por hash, sem quebrar os usuarios locais existentes.

## Status

Concluida.

## Escopo

- Criar utilitario de hash e verificacao com `scrypt`.
- Gerar hash com salt aleatorio.
- Salvar novas senhas sempre como hash.
- Preservar senha existente quando a edicao de usuario vier com senha vazia.
- Suportar login legado com senha em texto puro.
- Atualizar senha legada para hash automaticamente apos login bem-sucedido.
- Gravar seeds locais com hash.
- Fazer `db:verify` validar que os usuarios seed estao com hash.

## Fora De Escopo

- Reset de senha por email.
- Troca propria de senha.
- Politica de complexidade.
- Autenticacao multifator.

## Criterios De Aceite

- Admin, lider e membro continuam conseguindo login.
- Senhas semente sao armazenadas com hash.
- Usuario criado pela API consegue login.
- API nao retorna senha na listagem de usuarios.
- Nao ha migration pendente.

## Verificacao

Concluida:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
npm.cmd run reset-dev-data
npm.cmd run db:verify
```

Resultados:

- `typecheck`: concluido.
- `test`: 11 testes API passando.
- `build`: concluido.
- `reset-dev-data`: PostgreSQL populado com senhas em hash.
- `db:verify`: credenciais seed verificadas e com hash.
- varredura ASCII: sem ocorrencias.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos seguir para auditoria de alteracoes sensiveis ou agenda/eventos?
