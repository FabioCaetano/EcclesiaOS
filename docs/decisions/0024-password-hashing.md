# Decisao 0024: Senhas Com Hash

## Status

Aceita.

## Contexto

Usuarios ja podiam ser gerenciados pela interface, mas as senhas ainda estavam em texto puro no ambiente local. Antes de avancar para auditoria ou producao, a autenticacao precisava armazenar senha de forma mais segura.

## Decisao

Usar hash `scrypt` com salt aleatorio para novas senhas e seeds.

Tambem manter compatibilidade com senhas antigas em texto puro: quando um usuario com senha antiga faz login com sucesso, a senha e atualizada automaticamente para hash.

## Consequencias

- Nao foi necessaria migration, pois a coluna `password` ja e `String`.
- Seeds locais passam a ser gravados com hash ao rodar `reset-dev-data`.
- `db:verify` valida credenciais e confirma que as senhas semente estao em hash.
- Respostas da API continuam sem expor senha.

## Nao Objetivos

- Nao criar reset de senha por email.
- Nao criar troca propria de senha pelo usuario.
- Nao alterar politica de complexidade de senha ainda.
