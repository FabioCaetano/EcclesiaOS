# Fase 106 - Visitante No Check-in Kids

## Objetivo

Deixar claro o caminho para um responsavel visitante criar conta, acessar somente o fluxo permitido e chegar direto ao Check-in Kids para cadastrar criancas e gerar QR.

## Entregue

- Login ganhou entrada explicita **Visitante com crianca**.
- Cadastro iniciado por esse caminho ja vem como `Visitante`.
- Cadastro de visitante explica que o acesso fica limitado ao Check-in Kids.
- Apos criar conta como visitante, o app direciona para a aba Check-in.
- Check-in Kids exibe aviso de acesso visitante quando a pessoa logada tem status `visitor`.
- O fluxo aproveita a rota segura ja existente para cadastrar criancas vinculadas ao responsavel.

## Decisao De Produto

Visitante continua sendo status da pessoa, nao um novo papel de usuario nesta fase. O usuario criado pelo cadastro publico permanece com role `member`, enquanto a restricao real vem da navegacao/permissoes de membro e do status `visitor` na pessoa vinculada.

## Fora De Escopo

- Login sem senha por link magico.
- Cadastro publico completo do responsavel e crianca em uma tela unica.
- Envio automatico de QR por email para visitantes.
- Edicao de crianca pelo responsavel.

## Validacao

- `npm run build:web`: pendente por bloqueio do ambiente nesta execucao.
- Bloqueio observado: `CreateProcessAsUserW failed: 1920`.
