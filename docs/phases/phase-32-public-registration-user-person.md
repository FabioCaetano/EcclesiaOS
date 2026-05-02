# Fase 32: Registro Publico E Vinculo Usuario/Pessoa

## Objetivo

Garantir que todo usuario esteja vinculado a uma pessoa, permitindo que responsaveis por criancas tenham login sem exigir que toda crianca tenha usuario.

## Status

Concluida.

## Escopo

- Criar contrato `RegisterRequest`.
- Criar endpoint publico:

```text
POST /auth/register
```

- Adicionar area de registro na tela de login.
- Permitir cadastro publico como membro ou visitante.
- Criar uma `Pessoa` automaticamente no cadastro publico.
- Criar um `Usuario` vinculado a essa pessoa.
- Todo cadastro publico entra com papel de usuario `member`.
- Permitir que admin altere papel depois para `leader` ou `admin`.
- Atualizar seed para o admin tambem ter `personId`.
- Impedir que duas contas usem a mesma pessoa vinculada.
- Quando admin criar usuario sem selecionar pessoa, criar pessoa automaticamente.
- Atualizar verificacao Prisma para garantir que usuarios semente possuem pessoa vinculada.

## Regra De Identidade

- Todo `Usuario` deve ter uma `Pessoa`.
- Nem toda `Pessoa` precisa ter um `Usuario`.
- Criancas podem existir como `Pessoa` sem login.
- Responsaveis podem existir como `Pessoa` com `Usuario`.
- Uma mesma pessoa nao deve ter mais de um usuario.

## Fora De Escopo

- Recuperacao de senha.
- Confirmacao de email.
- Aprovacao manual antes do primeiro login.
- Vinculo familiar responsavel/crianca.
- Check-in infantil por responsavel logado.
- Etiqueta infantil.

## Criterios De Aceite

- Novo membro consegue se cadastrar pela tela de login.
- Visitante consegue se cadastrar pela tela de login.
- Usuario novo entra como `member`.
- Pessoa correspondente e criada automaticamente.
- Admin pode alterar papel depois.
- Usuarios semente possuem pessoa vinculada.
- Nao e possivel reutilizar email de usuario.

## Verificacao

Concluida:

```powershell
npm.cmd run typecheck
npm.cmd run reset-dev-data
npm.cmd run db:verify
npm.cmd run test
npm.cmd run build
```

Resultados:

- `typecheck`: concluido.
- `reset-dev-data`: concluido.
- `db:verify`: `People: 3` e credenciais semente vinculadas a pessoas.
- `test`: 17 testes API passando.
- `build`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Vamos seguir para etiquetas infantis e retirada por responsavel?
