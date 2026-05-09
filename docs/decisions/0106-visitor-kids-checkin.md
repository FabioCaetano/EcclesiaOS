# Decisao 0106 - Visitante No Check-in Kids

## Contexto

O Check-in Kids ja permite que responsaveis logados cadastrem criancas, gerem QR do culto e apresentem o lote no Totem Kids. Faltava tornar explicito o caminho para visitantes, especialmente pais/responsaveis que chegam pela primeira vez.

## Decisao

O EcclesiaOS passa a oferecer um caminho visual de cadastro **Visitante com crianca** na tela de login. Esse caminho cria a conta como pessoa com status `visitor` e redireciona o usuario para Check-in apos o cadastro.

Nesta fase nao foi criado um papel `visitor` separado em `CurrentUser.role`. Visitante segue como status de pessoa, enquanto permissoes sensiveis continuam controladas por `canAccessModule`/`canManageModule`.

## Consequencias

- Visitantes conseguem chegar ao Check-in Kids sem depender de instrucao externa.
- O backend existente continua valido: a crianca cadastrada pelo responsavel fica vinculada ao `personId` do usuario logado.
- O visitante herda a experiencia limitada do membro, sem acesso a Pessoas, Ambientes, Culto, Mensagens e Musicas.
- Uma fase futura pode criar cadastro publico unificado de responsavel + criancas antes do login completo.
