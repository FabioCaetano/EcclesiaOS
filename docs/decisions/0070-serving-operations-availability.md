# 0070 - Escalas Por Perfil E Indisponibilidade No Modulo

## Contexto

O feedback de produto apontou que Escalas ainda estava aberta e poluida demais:

- membro parecia conseguir operar areas que deveriam ser do lider/admin;
- lider precisava focar nos cultos/eventos em que sua equipe foi solicitada;
- indisponibilidade estava em Minha Conta, mas faz mais sentido no contexto de Escalas.

## Decisao

Escalas passa a ser organizada por perfil:

- admin ve todas as escalas e continua criando/removendo planos;
- lider ve somente escalas das equipes que lidera e usa a matriz para acompanhamento;
- membro ve somente suas escalas, responde convites e cadastra indisponibilidade.

Indisponibilidade fica dentro da aba Escalas, preservando a entidade `PersonBlockOut` existente.

## Consequencias

- A tela fica mais operacional e menos confusa para membro.
- A logica de produto fica alinhada ao fluxo real de servico.
- O backend continua sendo a protecao principal de permissao; o frontend reduz ruido e evita caminhos indevidos.
- A proxima evolucao natural e adicionar posicoes por ministerio/equipe.

