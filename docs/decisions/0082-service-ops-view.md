# 0082 - Visao Unica Operacional Do Culto

## Contexto

A Agenda ja mostrava um resumo de preparo do culto, mas a operacao real precisava de uma tela unica para quem esta coordenando o dia: equipes, escala, repertorio, liturgia e inscricoes/check-in.

## Decisao

Criar o modulo `serviceOps`, exibido como **Culto**, como uma superficie operacional agregada e predominantemente de leitura.

## Consequencias

- Nao criamos uma nova tabela para operacao do culto.
- Os vinculos existentes por `eventId` continuam sendo a base de integracao.
- A tela reduz a necessidade de alternar entre Agenda, Escalas, Musicas, Liturgia e Inscricoes durante a preparacao.
- Edicoes continuam nos modulos de origem para evitar duplicacao de regras.
