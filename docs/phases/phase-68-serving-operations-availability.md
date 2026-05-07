# Fase 68 - Escalas Operacionais E Indisponibilidade

## Status

Concluida.

## Objetivo

Amadurecer a aba Escalas para refletir melhor o uso real:

- admin cria e remove escalas;
- lider visualiza e opera escalas das equipes que lidera;
- membro visualiza somente suas escalas, responde pendencias e registra indisponibilidade.

## Entregue

- Membros deixam de ver escalas de outras equipes quando nao estao escalados.
- Lideres passam a ver apenas planos das equipes que lideram.
- Aba `Matriz` fica disponivel apenas para admin e lider.
- A lista de pendencias mostra itens relevantes por perfil:
  - admin: todas as pendencias;
  - lider: pendencias das equipes lideradas;
  - membro: apenas pendencias proprias.
- A area de indisponibilidade foi movida para dentro de Escalas como aba propria.
- Membro pode registrar data inicial, data final e motivo da indisponibilidade.
- Membro pode remover suas indisponibilidades cadastradas.
- Cards de resumo foram ajustados para destacar pendencias e escalas pessoais.

## Fora De Escopo

- Posicoes de ministerio, como vocal, bateria, guitarra, camera e transmissao.
- Regras avancadas de conflito entre indisponibilidade e escala existente.
- Notificacao automatica ao lider quando membro registra indisponibilidade.
- Redesenho completo da tela de Escalas.

## Validacao

Executado em 2026-05-07:

```powershell
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado: builds concluidos e 37 testes da API passando.

## Proxima Fase Recomendada

Fase 69 - Posicoes Em Ministerios.
