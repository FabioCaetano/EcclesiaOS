# Decisao 0050: Aplicar Sistema De Design Aos Modulos Restantes

## Status

Aceita.

## Contexto

As Fases 47 e 48 entregaram o redesign em 7 telas (Inicio, Igreja, Pessoas, Agenda, Check-in, Calendario, Escalas). Restam 6 telas usando o padrao antigo: Financeiro, Usuarios, Auditoria, Ambientes, Grupos, Presenca.

## Decisao

Aplicar o mesmo padrao (`PageHeader` + `Card` + `EmptyState` + icones lucide) nas 6 telas restantes para fechar a consistencia visual do produto. Nao mudar dados, regras ou endpoints.

## Consequencias

- Todas as telas autenticadas com mesmo padrao visual.
- Equipe administrativa para de "trocar de produto" ao mudar de modulo.
- Ainda sobra polimento mobile fino (Fase 50) e features novas (mensagens em lote, troca de senha) para fases futuras.

## Nao Objetivos

- Nao alterar logica, dados ou regras.
- Nao reativar Presenca no menu principal (ja foi decidido manter oculta).
- Nao adicionar features.
