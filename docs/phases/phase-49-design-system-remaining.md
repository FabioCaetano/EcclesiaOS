# Fase 49: Aplicar Sistema De Design Aos Modulos Restantes

## Objetivo

Fechar a consistencia visual do produto aplicando `PageHeader` + `Card` + `EmptyState` + icones lucide em Financeiro, Usuarios, Auditoria, Ambientes, Grupos e Presenca.

## Status

Concluida.

## Escopo

- FinancePage
- UsersPage
- AuditPage
- ResourcesPage (Ambientes)
- GroupsPage
- AttendancePage (Presenca, mantida oculta no menu)

Apenas estrutura visual. Sem mudar logica, dados ou endpoints.

## Fora De Escopo

- Reativar Presenca no menu.
- Mensagens em lote, troca de senha ou outras features novas.
- Polimento mobile fino (fica para Fase 50).

## Criterios De Aceite

- As seis telas usam `PageHeader` consistente.
- Card substitui `.panel`.
- Listas vazias mostram EmptyState.
- Icones em botoes principais.
- Typecheck, test e build passam.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

## Proxima Pergunta

Depois desta fase:

> Polimento mobile fino (Fase 50) ou mensagens em lote / troca de senha (features novas)?
