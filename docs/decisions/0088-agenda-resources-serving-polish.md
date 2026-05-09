# Decisao 0088 - Polimento Incremental De Agenda, Ambientes E Escalas

## Contexto

Depois dos testes locais com banco real, a prioridade passou a ser reduzir atrito operacional antes de criar novas estruturas grandes.

## Decisao

- Gerar ocorrencias recorrentes automaticamente ao salvar um evento recorrente.
- Separar a pagina de Ambientes em duas areas internas: cadastro de ambientes e reservas.
- Permitir que lider crie escala, mas somente para equipe que lidera.
- Manter membro restrito a resposta de escala e indisponibilidade.

## Consequencias

- O uso diario fica mais direto sem exigir um clique manual extra para recorrencias.
- Ambientes deixa de misturar dois formularios na mesma leitura.
- A regra de escala passa a ser validada no frontend e no backend.
- Ainda falta evoluir Check-in Kids por salas/faixas etarias em uma fase propria.
