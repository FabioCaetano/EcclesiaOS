# Fase 59: Lembretes Automaticos De Escala Por Email

## Objetivo

Enviar email de lembrete a cada voluntario escalado X dias antes da data do servico, sem precisar de cron job dedicado.

## Status

Concluida.

## Escopo

### Backend

- Tipo `ServingAssignment` ganha `reminderSentAt: string` (ISO; vazio = nunca enviado).
- Repositorio normaliza atribuicoes existentes para `reminderSentAt: ""`.
- Helper `processUpcomingReminders` percorre planos com data dentro da janela `REMINDER_DAYS_BEFORE` (env, default 2 dias) e envia lembrete para cada atribuicao com email cadastrado, status diferente de `declined` e sem `reminderSentAt`.
- Disparo lazy: `GET /serving-notifications` invoca o helper antes de devolver as notificacoes.
- Email com link para o sistema; texto + HTML simples.
- Best-effort: falha do provedor nao bloqueia a resposta.

### Frontend

- `ServingAssignment` no shared ganha o campo opcional; frontend continua igual (campo ignorado).

### Tests

- Cobertura ja existente de `/serving-notifications` com email desligado nao deve quebrar.
- Adicionar teste minimo que cria plano dentro da janela e verifica que `GET /serving-notifications` continua funcionando (sem provedor, sem efeitos colaterais).

## Fora De Escopo

- Multiplos lembretes por atribuicao.
- Lembretes configuraveis por plano.
- SMS, push.
- Cron externo dedicado.

## Criterios De Aceite

- Sem provedor de email: `/serving-notifications` retorna como antes.
- Com provedor: atribuicao em plano dentro da janela e com email recebe lembrete uma unica vez.
- Apos enviar, `reminderSentAt` e preenchido; chamadas seguintes nao reenviam.
- Atribuicoes recusadas nao recebem lembrete.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Manual: configurar `RESEND_API_KEY` e `REMINDER_DAYS_BEFORE=2`; criar plano com data daqui a 2 dias e pessoa com email; abrir painel de Escalas; ver email chegar.

## Proxima Pergunta

Depois desta fase:

> Pre-cadastro via QR Code na entrada (Fase 60), templates de mensagem com variaveis, ou confirmacao de email no registro publico?
