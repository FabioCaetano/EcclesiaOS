# Fase 4: Cadastro Da Igreja

## Objetivo

Criar o cadastro basico da igreja unica do EcclesiaOS.

## Status

Implementada.

## Escopo

- Contrato compartilhado de igreja.
- Persistencia local dos dados da igreja.
- Endpoint para ler dados da igreja.
- Endpoint para atualizar dados da igreja.
- Tela administrativa simples para visualizar e editar o cadastro.

## Fora De Escopo

- Campus.
- Multi-igreja.
- Logo e identidade visual.
- Configuracoes financeiras.
- Usuarios e permissoes granulares.
- Horarios de cultos detalhados.

## Criterios De Aceite

- A API retorna os dados atuais da igreja. Concluido.
- Um admin consegue atualizar os dados da igreja. Concluido.
- A tela exibe nome, email, telefone, site e endereco. Concluido.
- As alteracoes sobrevivem ao reinicio da API porque ficam no arquivo local. Concluido.

## Verificacao

- `npm.cmd run reset-dev-data`: concluido.
- `npm.cmd run typecheck`: concluido.
- `npm.cmd run build`: concluido.
- `GET /church/profile`: concluido.
- `PUT /church/profile` com admin: concluido.
- `PUT /church/profile` bloqueado para membro: concluido com `403`.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos desenvolver Pessoas agora? Quais campos sao obrigatorios para uma pessoa?
