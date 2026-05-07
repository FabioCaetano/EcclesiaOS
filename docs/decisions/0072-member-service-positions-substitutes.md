# 0072 - Posicoes Por Pessoa E Substitutos Por Posicao

## Contexto

A Fase 69 permitiu cadastrar posicoes em ministerios/equipes. O passo seguinte era evitar que a posicao fosse apenas uma lista generica, porque substituto automatico e escala real dependem de saber quem pode servir em cada funcao.

## Decisao

Adicionar `memberServicePositions` ao grupo:

- chave: `personId`;
- valor: lista de posicoes que aquela pessoa pode servir no ministerio/equipe.

A escala continua usando `ServingAssignment.role`, mas agora a UI e a sugestao de substitutos consultam as posicoes habilitadas da pessoa.

## Consequencias

- Lider escala com menos ruido.
- Substituto automatico fica mais util para ministerios como Louvor e Midia.
- A mudanca continua compativel com escalas antigas.
- Ainda permitimos excecoes manuais com alerta, em vez de bloquear o lider rigidamente.

