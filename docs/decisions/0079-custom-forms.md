# 0079 - Formularios customizados com resposta publica

## Contexto

Foi solicitada uma area para formularios criados por administradores, com responsaveis notificados, envio publico e relatorios.

## Decisao

Criar o modulo `Formularios` com duas entidades:

- `CustomForm`: configuração do formulario.
- `CustomFormResponse`: respostas enviadas pelo link publico.

## Motivos

- Separar a definição do formulario das respostas.
- Permitir links publicos sem login.
- Manter responsaveis vinculados por pessoa para notificacoes futuras.

## Consequencias

- A primeira versao ainda nao envia email aos responsaveis.
- Relatorios e exportacao CSV entram como proximas evoluções.
- Campos condicionais e anexos ficam fora da primeira entrega.
