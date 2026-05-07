# Fase 61: Templates De Mensagem Com Variaveis

## Objetivo

Permitir salvar modelos de mensagem reutilizaveis e personalizar com variaveis por destinatario, eliminando trabalho repetitivo do operador na Fase 53 (Mensagens Em Lote).

## Status

Concluida.

## Escopo

### Shared

- Tipo `MessageTemplate`, `MessageTemplateInput`.
- Util `substituteMessageVariables(text, person, churchName)` para uso em backend e frontend.

### Backend

- `messageTemplateRepository` com `list`, `create`, `update`, `remove` em modo JSON e Prisma.
- Endpoints:
  - `GET /message-templates`
  - `POST /message-templates`
  - `PUT /message-templates/:id`
  - `DELETE /message-templates/:id`
- Leitura permitida a qualquer autenticado; escrita requer `canManageModule("messages")`.
- `POST /people-messages` aplica `substituteMessageVariables` por destinatario antes do envio via Resend (assunto e corpo).
- Schema Prisma + migration `MessageTemplate { id, name, channel, subject, body, createdAt, updatedAt }`.
- Seed nao adiciona templates; a igreja cria.

### Frontend

- MessagesPage:
  - bloco "Modelos" com select, botoes Carregar/Salvar/Excluir;
  - botoes "Inserir" para variaveis aplicaveis;
  - quando canal nao e email, substituicao acontece no frontend antes de gerar `mailto:`/`wa.me`.

## Fora De Escopo

- Variaveis condicionais.
- Variaveis dinamicas por evento.
- Editor rico.
- Versionamento de template.

## Criterios De Aceite

- Admin/lider consegue criar, editar e remover template.
- Membro lista templates mas nao edita.
- Mensagem com `Ola {{firstName}}` enviada via email chega com nome correto por destinatario.
- Mensagem com `Bem-vindo a {{churchName}}` enviada via WhatsApp gera link com nome da igreja substituido.
- Variaveis desconhecidas continuam visiveis no texto final.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Manual: criar template "Boas-vindas" com `Ola {{firstName}}, bem-vindo a {{churchName}}!`; enviar para 2 visitantes; conferir nome substituido em cada email/WhatsApp.

## Proxima Pergunta

Depois desta fase:

> Confirmacao de email no registro publico de eventos (Fase 62)?
