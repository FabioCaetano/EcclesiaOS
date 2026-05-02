# Fase 20: Permissoes Granulares Iniciais

## Objetivo

Iniciar permissoes granulares com uma regra pequena e sensivel: Financeiro visivel e acessivel somente por admin.

## Status

Implementada.

## Escopo

- Restringir `GET /financial-transactions` a `admin`.
- Ocultar o item Financeiro da navegacao para lider e membro.
- Atualizar testes HTTP da API para validar bloqueio de membro.
- Atualizar documentacao de desenvolvimento, status e decisoes.

## Fora De Escopo

- Criar roles customizadas.
- Criar permissao de tesouraria separada.
- Criar tela administrativa de permissoes.
- Revisar todos os dominios com matriz completa.

## Criterios De Aceite

- Usuario sem token recebe `401` ao listar financeiro.
- Membro recebe `403` ao listar financeiro.
- Admin recebe `200` ao listar financeiro.
- Financeiro nao aparece no menu lateral de lider/membro.
- Testes e build continuam passando.

## Verificacao

Concluida:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run test:web
npm.cmd run build
```

Resultados:

- `typecheck`: concluido.
- `test`: 10 testes API passando.
- `test:web`: 2 smoke tests Playwright passando.
- `build`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos criar uma matriz de permissoes mais completa, iniciar auditoria, ou seguir para agenda/eventos?
