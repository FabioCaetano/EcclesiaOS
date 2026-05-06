# Decisao 0054: Mensagens Em Lote Para Pessoas

## Status

Aceita.

## Contexto

A igreja precisa contatar grupos de pessoas: visitantes da semana, membros sem email, lideres de uma equipe etc. Hoje o operador faz isso fora do sistema (planilha + WhatsApp manual). Sem provedor de email contratado, ainda nao da para enviar diretamente, mas da para:

- montar filtros dinamicos sobre `Pessoas`;
- selecionar destinatarios e compor a mensagem (titulo + corpo);
- abrir WhatsApp/email do dispositivo do operador via `wa.me` e `mailto:`;
- registrar o envio (quem mandou, quando, para quem, com qual conteudo) para historico e auditoria.

Quando integrarmos provedor de email/SMS depois, a infra de filtros + composicao + historico ja estara pronta.

## Decisao

Implementar uma nova area "Mensagens" como modulo proprio. Acessivel por admin e lider; admin e lider podem enviar; membros podem ver historico (sem ver corpo da mensagem alheia? simplificacao: por enquanto so admin/lider acessa o modulo).

### Modelo

```text
PeopleMessage {
  id
  subject
  body
  channel             # "email" | "whatsapp" | "manual"
  recipientPersonIds  # array de pessoas
  createdAt
  createdByUserId
  createdByName       # snapshot para historico
}
```

### Filtros

Aplicaveis na hora de selecionar destinatarios:

- Status: todos / membros / visitantes
- Possui email: qualquer / sim / nao
- Possui telefone: qualquer / sim / nao
- Membro de grupo: qualquer grupo cadastrado
- Cadastrado depois de uma data
- Busca textual por nome/email

Filtros sao combinaveis (AND).

### Envio

- Admin/lider seleciona pessoas (via filtro + checkboxes individuais).
- Define canal: `email` (gera `mailto:`), `whatsapp` (gera `wa.me`), ou `manual` (apenas registra, sem abrir nada).
- Compoe titulo e corpo.
- Ao confirmar, backend cria `PeopleMessage` com snapshot da lista, e responde com a entidade criada.
- Frontend abre os links (um a um, ou copia para a area de transferencia em lote).

### Permissoes

- `messages` adicionado a `AppModuleKey`.
- `canAccessModule` continua aberto para todas as funcoes (qualquer autenticado pode listar historico).
- Para criacao, exigir admin ou lider via `canManageModule`.
- Endpoint POST registra audit log.

## Consequencias

- Pessoas continuam como cadastro central; mensagens viram modulo separado para nao inflar a tela de Pessoas.
- Snapshot do nome do remetente em `createdByName` evita problema quando o usuario for renomeado/removido.
- Lista de pessoas selecionadas e armazenada no banco; permite "ver para quem foi" anos depois.
- Quando provedor de email/SMS chegar, basta plugar e mudar a flag de canal para enviar de fato.

## Nao Objetivos

- Enviar email ou SMS de fato nesta fase.
- Templates de mensagem reutilizaveis (talvez fase futura).
- Confirmacao de leitura.
- Mensagem por grupo automatico em recorrencia.
- Mensagens para usuarios (so para pessoas).
- Mensagens individuais como historico de conversa (sem thread).
