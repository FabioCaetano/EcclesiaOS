# Fase 40: Tela De Auditoria

## Objetivo

Criar uma tela administrativa para consultar eventos de auditoria ja registrados pela API, facilitando acompanhamento de alteracoes sensiveis.

## Status

Concluida.

## Escopo

- Adicionar modulo `audit` a permissao compartilhada.
- Exibir Auditoria no menu apenas para admin.
- Criar cliente `loadAuditLogs`.
- Criar tela `AuditPage`.
- Mostrar totais de registros, eventos de hoje, atualizacoes e remocoes.
- Filtrar por acao, entidade, usuario, data e busca textual.
- Listar resumo, entidade, id, ator e data/hora.

## Fora De Escopo

- Diff completo de campos alterados.
- Exportacao CSV/PDF.
- Retencao configuravel.
- Alertas automaticos.
- Auditoria de leitura.

## Criterios De Aceite

- Admin acessa Auditoria pelo menu.
- Membro/lider nao veem o item por permissao.
- Filtros combinados atualizam a lista.
- Tela usa endpoint existente `GET /audit-logs`.
- Build e testes continuam passando.

## Verificacao

Concluida:

```powershell
npm.cmd run build --workspace @ecclesiaos/shared
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Resultados:

- `typecheck`: concluido.
- `test`: 19 testes API passando.
- `build`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao recomendada sera:

> Queremos consolidar check-in em presenca ou preparar envio de comprovantes/ingressos?
