# 0066 - Substituto Automatico Para Recusas Em Escala

## Decisao

Quando uma atribuicao de escala for recusada, o backend deve calcular substitutos sugeridos automaticamente e retornar essa lista na resposta da atualizacao de status.

## Contexto

O sistema ja tinha bloqueios de data e endpoint manual de sugestao. A dor operacional acontece no momento da recusa, quando o lider precisa agir rapidamente.

## Consequencias

- A resposta de `PATCH /serving-plans/:planId/assignments/:assignmentId/status` passa a incluir `substituteSuggestions`.
- O email ao lider inclui os candidatos sugeridos quando provedor de email esta configurado.
- A UI pode mostrar sugestoes imediatamente sem exigir clique extra em "Buscar candidatos".
- A substituicao final continua manual, feita por lider/admin.

## Fora Do Escopo

- Escolher e aplicar substituto automaticamente.
- Enviar convite direto ao substituto.
- Reabrir uma escala como workflow de aprovacao.
- Notificacao por SMS ou WhatsApp.
