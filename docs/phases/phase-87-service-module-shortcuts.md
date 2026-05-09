# Fase 87 - Atalhos Entre Modulos

## Objetivo

Reduzir atrito de navegacao a partir da aba **Culto**, permitindo abrir rapidamente os modulos de origem usados na operacao: Agenda, Escalas, Musicas e Liturgia.

## Entregue

- Atalhos no topo da aba Culto para:
  - Agenda;
  - Escalas;
  - Musicas;
  - Liturgia.
- Atalhos respeitam a permissao de acesso do usuario.
- Navegacao usa o estado interno existente do app, sem React Router novo.
- A aba Culto permanece como visao operacional, enquanto a edicao detalhada continua nos modulos de origem.

## Decisoes De Escopo

- Nao foi criada nova API.
- Nao foi criada migration Prisma.
- Os atalhos mudam de modulo, mas ainda nao carregam filtros/contexto especifico do culto selecionado.
- O proximo refinamento pode passar `eventId` entre modulos quando o app tiver navegação com estado contextual ou rotas internas.

## Validacao

```powershell
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado: builds passaram e a API passou com 40 testes.

## Proximas Evolucoes

- Criar navegação contextual para abrir Liturgia/Escalas/Musicas ja filtradas pelo culto atual.
- Adicionar atalho para Check-in do culto selecionado.
- Evoluir para React Router ou estado global de contexto quando a navegacao contextual ficar mais frequente.
