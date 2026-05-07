# 0071 - Posicoes Configuraveis Em Ministerios

## Contexto

O feedback de produto apontou que ministerios como Louvor e Midia nao podem ser tratados apenas como uma lista de pessoas. Ao montar uma escala, o lider precisa escolher funcoes reais, como vocal, bateria, guitarra, camera e transmissao.

Grupos comuns, como jovens ou comunhao, nao precisam obrigatoriamente dessas posicoes.

## Decisao

Adicionar `servicePositions` diretamente em `GroupProfile`, aplicando o uso principalmente para grupos do tipo `ministry` e `team`.

Escalas continua gravando a funcao escolhida em `ServingAssignment.role`, mas agora a UI oferece as posicoes cadastradas quando existirem.

## Consequencias

- A mudanca e pequena e compativel com as escalas existentes.
- Nao precisamos criar uma tabela nova nesta fase.
- Ministerios ganham uma configuracao concreta e reutilizavel.
- O proximo passo pode ser associar pessoas a posicoes especificas, sem refazer esta base.

