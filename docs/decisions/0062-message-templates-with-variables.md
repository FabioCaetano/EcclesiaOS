# Decisao 0062: Templates De Mensagem Com Variaveis

## Status

Aceita.

## Contexto

A Fase 53 (Mensagens Em Lote) e a Fase 55/56 (provedor de email Resend e reset de senha) deixaram o envio de mensagens funcional, mas hoje cada envio tem que ser escrito do zero. Para campanhas recorrentes (boas-vindas, lembrete de culto, aniversariante do mes) o operador acaba copiando texto de outro lugar, perdendo personalizacao por pessoa. Falta um cofre simples de modelos e a possibilidade de inserir o nome da pessoa automaticamente sem digitar manualmente.

## Decisao

Introduzir uma entidade `MessageTemplate` reaproveitavel pela Fase 53 e variaveis simples no estilo Mustache:

- Entidade `MessageTemplate { id, name, channel, subject, body, createdAt, updatedAt }` com `channel` igual ao `MessageChannel` existente (`email`, `whatsapp`, `manual`).
- Endpoints `/message-templates` com CRUD: leitura por qualquer autenticado, escrita por `canManageModule(user.role, "messages")` (admin/lider).
- Lista pequena, sem filtros de busca; ordenada por `name`.
- Substituicao de variaveis via util compartilhado em `packages/shared`:
  - `{{firstName}}`
  - `{{lastName}}`
  - `{{fullName}}`
  - `{{email}}`
  - `{{phone}}`
  - `{{churchName}}`
- Substituicao acontece:
  - no backend, antes de mandar email via Resend, por destinatario (substitui em `subject` e `body`);
  - no frontend, antes de montar o link `mailto:` ou `wa.me`, por destinatario.
- Variaveis nao reconhecidas ficam como estao (operador percebe e ajusta).

### Frontend

- MessagesPage ganha bloco "Modelos" no card de composicao com:
  - select de templates carregados;
  - botao "Carregar" que copia para os campos atuais;
  - botao "Salvar como modelo" que pede um nome em prompt e cria;
  - botao "Excluir" no template selecionado quando o usuario tem permissao.
- Lista de variaveis disponiveis e botoes "Inserir" que injetam no `body` na posicao do cursor (ou no fim, mais simples e suficiente).
- Preview por pessoa nao e necessario nesta fase; o operador confia no nome no template.

### Banco

- Em modo Prisma, criar tabela `MessageTemplate`.
- Em modo JSON, persistir em `messageTemplates` no `data` global.

## Consequencias

- Operador prepara textos uma vez e reutiliza com personalizacao automatica.
- Variaveis cobrem 90% dos casos sem complicar com sintaxe condicional ou loops.
- Reaproveita `personRepository` e `churchRepository`; nao precisa de servico novo.
- Sem migracao de dados antigos: mensagens ja enviadas seguem como historico literal; templates sao prospectivos.

## Nao Objetivos

- Variaveis condicionais (`{{#if}}`) ou loops.
- Templates por evento (Fase 28 nao precisa nesta fase).
- Tipos de variaveis dinamicos vindos do contexto (ex.: `{{eventTitle}}`).
- Editor rico com formatacao; usar `<textarea>` puro.
- Versionamento ou historico de mudancas de template.
- Galeria de templates pre-cadastrados.
