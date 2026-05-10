# Fase 111 - Relatorios Historicos De Eventos

## Objetivo

Levar para a aba Relatorios uma visao historica de inscricoes e check-ins de eventos, permitindo filtrar antes de exportar.

## Entregue

- Relatorios agora carregam eventos e inscricoes.
- Nova secao **Historico de inscricoes e check-in**.
- Filtros por data inicial, data final, evento, status da inscricao e presenca.
- Indicadores de eventos, confirmados, presentes, ausentes, pendentes e receita confirmada.
- Previa das inscricoes filtradas.
- Exportacao CSV respeitando o recorte aplicado.

## Decisao De Produto

Relatorios historicos de eventos ficam na aba Relatorios, enquanto o Totem Evento permanece focado na operacao do dia. A primeira versao usa dados ja existentes, sem nova tabela ou migration.

## Fora De Escopo

- PDF dedicado.
- Graficos historicos.
- Relatorios por operador.
- Relatorio publico sem login.

## Validacao

- `npm run build:web`: pendente por bloqueio/limite do ambiente nesta execucao.
