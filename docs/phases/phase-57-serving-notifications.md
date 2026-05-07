# Fase 57: Notificacoes De Escala Por Email

## Objetivo

Avisar automaticamente a pessoa quando ela for escalada em um plano de servico, e avisar o lider da equipe quando alguem confirmar ou recusar a escala. Usa o Resend ja configurado na Fase 55; sem provedor, o fluxo continua igual e nao envia nada.

## Status

Concluida.

## Escopo

### Backend

- `handleUpdateServingPlan` (PUT /serving-plans/:id) compara as atribuicoes antigas e novas; para cada `personId` recem adicionado, envia email para a pessoa.
- `handleUpdateServingAssignmentStatus` (PATCH /serving-plans/:planId/assignments/:assignmentId/status) envia email ao lider do grupo do plano informando a resposta.
- Helper interno (apenas no server) para gerar texto + HTML simples do email.
- Sends sao best-effort: falha do provedor nao quebra a resposta HTTP.

### Email

- Nova atribuicao:
  - Assunto: "Voce foi escalado em [titulo do plano]"
  - Texto: nome, plano, data, funcao, "acesse o sistema para confirmar ou recusar".
  - HTML minimo com link para o frontend.
- Resposta:
  - Assunto: "[nome] [confirmou|recusou] a escala de [titulo]"
  - Texto: contexto basico, link para o sistema.

### Frontend

- Sem mudancas. O painel atual (Fase 45) ja cobre a UI; emails sao paralelos.

## Fora De Escopo

- Tokens de confirmacao por email (clicar no link confirma).
- Lembretes proximos da data.
- Email quando admin remove pessoa do plano.
- SMS.

## Criterios De Aceite

- Sem provedor: PUT/PATCH funcionam normalmente, nenhum email enviado, sem erros.
- Com provedor: nova atribuicao gera email para pessoa com email cadastrado.
- Com provedor: status `declined` ou `confirmed` gera email para lider do grupo (se existir e tiver email).
- Pessoa sem email simplesmente nao recebe; sem erro.
- Plano sem grupo ou sem lider nao gera email; sem erro.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Manual: configurar `RESEND_API_KEY`, criar plano com pessoa que tenha email cadastrado, ver email chegar; responder pelo painel da pessoa, ver email do lider.

## Proxima Pergunta

Depois desta fase:

> Confirmacao de email no registro publico, matrix view de equipes, ou templates de mensagem com variaveis?
