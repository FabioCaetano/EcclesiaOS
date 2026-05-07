# 0064 - Reenvio De Confirmacao De Inscricao Em Eventos

## Decisao

Inscricoes de eventos com status `pending_email_confirmation` podem ter a confirmacao reenviada por administradores.

## Contexto

A Fase 62 criou confirmacao de email com token de 24 horas. Sem reenvio, uma inscricao legitima poderia ficar travada caso o participante nao encontrasse o email ou o link expirasse.

## Consequencias

- O backend gera novo token e substitui o hash anterior.
- A validade volta a ser de 24 horas a partir do reenvio.
- O email e enviado em modo best-effort via Resend.
- Sem provedor configurado, o endpoint retorna sucesso com `emailSent: false`.
- A Agenda mostra o estado expirado e permite renovar pelo painel admin.
- Cada reenvio gera auditoria.

## Fora Do Escopo

- Reenvio automatico agendado.
- Limite/rate limit por participante.
- Historico de todos os tokens anteriores.
- Confirmacao via SMS ou WhatsApp.
