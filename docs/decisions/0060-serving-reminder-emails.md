# Decisao 0060: Lembretes Automaticos De Escala Por Email

## Status

Aceita.

## Contexto

A Fase 57 entregou notificacao quando o lider escala alguem e quando a pessoa responde. Falta o lembrete proximo da data: "voce esta escalado para domingo, dia X". Sem isso, voluntario esquece, lider precisa cobrar manualmente.

Render Free nao tem cron job nativo na API. Adicionar um servico cron separado complica o deploy. Em vez disso, vamos usar a abordagem **"lazy"** que ja foi usada com sucesso na Fase 44 (cron real de eventos).

## Decisao

Disparar lembretes em modo lazy, na proxima vez que o painel for consultado:

- `GET /serving-notifications` (chamado por admin, lider e membro ao abrir o painel) varre planos dentro da janela de lembrete e envia email para atribuicoes ainda nao notificadas.
- Cada `ServingAssignment` ganha campo `reminderSentAt` (string ISO, vazio quando nao enviado).
- Janela padrao: 2 dias antes do servico (`REMINDER_DAYS_BEFORE`, default 2; configurable via env).
- Pessoas com `status === "declined"` nao recebem lembrete.
- Sem email cadastrado: pula sem enviar; nao marca `reminderSentAt` para nao impedir reenvio depois quando email for adicionado.
- Sem provedor configurado: helper retorna sem efeito; nao marca como enviado.
- Falhas de envio sao silenciosas (best-effort, padrao das fases 55-57).

### Por que lazy

- Caso real: alguem do time abre o painel pelo menos uma vez ao dia. Em seguida, todos os lembretes pendentes do dia saem.
- Nao precisa scheduler externo, sem dependencia adicional, sem tempo de configuracao.
- Quando uma igreja tiver volume maior, da para adicionar um cron externo (GitHub Actions, Cloudflare Workers Cron) que bate `/serving-notifications` diariamente — implementacao da fase nao muda.

## Consequencias

- Voluntario recebe lembrete sem o lider precisar lembrar.
- Cada atribuicao recebe no maximo um lembrete (uso unico via `reminderSentAt`).
- Mudanca pequena no schema (campo dentro do JSON ja existente de `assignments`); sem migration.
- Em janelas de baixo trafego, lembrete pode atrasar — aceito como compromisso.

## Nao Objetivos

- Lembrete configuravel por plano.
- Multiplos lembretes (dia anterior + 1 hora antes etc.).
- Lembrete por SMS.
- Cron job dedicado.
- Botoes de "confirmar/recusar" via link unico no lembrete.
- Notificacao quando substituto precisa entrar de emergencia (caso sem dia suficiente).
