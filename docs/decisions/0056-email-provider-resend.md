# Decisao 0056: Provedor De Email Com Resend

## Status

Aceita.

## Contexto

A Fase 53 entregou Mensagens em lote, mas sem envio real de email — o frontend abre `mailto:` no dispositivo do operador. A Fase 51 fechou senha (troca propria + reset administrativo) mas sem fluxo "esqueci minha senha". Diversas features futuras (notificacoes de escala, lembrete de inscricao, ingresso digital) tambem dependem de email.

Para destravar tudo isso de uma vez, precisamos de um provedor de email transacional. As opcoes pesquisadas:

- **Resend** — free tier 3000/mes, 100/dia, SDK em TS, requer dominio verificado em producao.
- **Postmark** — pago, excelente entregabilidade.
- **Brevo (Sendinblue)** — free tier 300/dia.
- **AWS SES** — barato em escala, configuracao mais complexa.

A igreja e pequena, o volume e baixo, e queremos a integracao mais simples.

## Decisao

Adotar **Resend** como provedor padrao. Implementar uma camada `emailService` no backend que:

- usa Resend quando `RESEND_API_KEY` esta configurado;
- cai para "no-op + log" quando nao esta configurado, sem quebrar o fluxo;
- expoe o status via `GET /system/email-status` para o frontend ajustar a UX.

Variaveis de ambiente:

```text
RESEND_API_KEY=re_...
EMAIL_FROM=EcclesiaOS <noreply@dominio-da-igreja.com>
```

Em desenvolvimento local, sem essas variaveis, o sistema continua funcionando: Mensagens em lote permanece com `mailto:` no frontend.

### Integracoes nesta fase

- `POST /people-messages` com `channel === "email"`: quando provedor disponivel, dispara email automaticamente para todos os destinatarios via Resend; quando indisponivel, comportamento atual (frontend abre `mailto:`) continua valido.

### Diferido para fases futuras

- Fluxo "esqueci minha senha" por email (nova fase 56).
- Notificacoes de escala (alteracao, lembrete).
- Confirmacoes de inscricao em evento.
- Templates HTML mais ricos.

## Consequencias

- Mensagens em lote ganha envio real quando admin configura o Resend.
- Custo zero ate 3000 emails/mes; muito acima do volume previsto.
- Producao precisa de dominio verificado no Resend antes do envio em massa funcionar.
- Em desenvolvimento, sem chave configurada, o sistema continua com fallback `mailto:` — sem quebra.
- Bundle do API ganha `resend` (~50KB).

## Nao Objetivos

- Nao implementar SMTP direto.
- Nao implementar reset de senha por email nesta fase.
- Nao adicionar SMS provider (Twilio etc.).
- Nao implementar templates HTML elaborados; corpo simples por enquanto.
- Nao tentar "verificar entrega" via webhook agora.
- Nao multi-provedor (so Resend).
