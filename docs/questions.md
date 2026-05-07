# Backlog De Perguntas

Estas perguntas devem ser respondidas ao longo do projeto, nao todas agora.

## Produto

- A primeira versao sera usada por uma unica igreja? Respondido: sim.
- Existe necessidade real de campus? Respondido por enquanto: nao.
- Quais cargos/papeis administrativos existem hoje?
- Quais processos sao mais urgentes agora: YouTube/cron real, escalas por equipes solicitadas, mensagens em lote ou relatorios?
- Existem planilhas ou sistemas atuais para migrar dados?

## Tecnico

- Vamos usar React + Vite no frontend? Respondido: sim.
- Vamos usar Node.js + TypeScript no backend? Respondido: sim.
- Vamos usar PostgreSQL? Respondido: sim, mantendo JSON para desenvolvimento rapido.
- Preferimos Prisma, Drizzle ou SQL direto? Respondido: Prisma.
- O sistema sera hospedado onde?
- Precisamos de Docker desde o inicio? Respondido: sim para PostgreSQL local.

## Autenticacao

- Quem podera acessar o sistema?
- Membros comuns terao conta?
- Lideres de ministerio terao acesso limitado?
- O login sera email/senha, magic link ou ambos?
  - Respondido por enquanto: email/senha.

## Dados Da Igreja

- O cadastro da igreja precisa incluir apenas dados basicos?
  - Respondido parcialmente: dados basicos e canal do YouTube.
- Ha multiplos locais de culto?
- Ha departamentos ou ministerios formais?

## Pessoas

- Quais campos sao obrigatorios?
- Como tratar familias/casas?
- Precisamos de consentimento LGPD?
- Precisamos registrar batismo, membresia, voluntariado ou aconselhamento?
- Para relatorios por mulheres/homens/adolescentes/kids, vamos adicionar campo de genero/categoria ou calcular parte por idade?
- Endereco sera texto unico ou campos separados?

## Financeiro

- Havera registro manual de contribuicoes? Respondido: sim.
- Havera doacao online? Respondido por enquanto: nao.
- Quais meios de pagamento importam?
- Quem pode ver dados financeiros? Fase 20: somente admin nesta primeira regra granular.

## Comunicacao

- O sistema precisa enviar emails?
- Precisa enviar WhatsApp/SMS?
- Precisa registrar historico de comunicacao?
- Mensagens em lote devem usar quais filtros obrigatorios?
- Mensagens para responsaveis do Kids devem ser enviadas por provedor externo ou apenas abrir WhatsApp/SMS?

## Agenda E Escalas

- A expressao cron deve gerar ocorrencias automaticamente ate qual data limite?
- Eventos recorrentes devem criar registros separados ou ocorrencias virtuais?
- Quais equipes podem ser solicitadas por evento?
- Lider pode escalar apenas pessoas da propria equipe?
- Como tratar recusa de escala: substituto automatico, aviso ao lider ou ambos?

## Musicas E Liturgia

- Musicas precisam ter cifra/anexo ou apenas links?
- Tons serao livres ou uma lista padronizada?
- Playlist pertence ao culto/evento ou a escala de Louvor?
- Liturgia deve ter horario previsto, duracao ou apenas checklist?
- Quem pode editar a liturgia: admin, lider do culto ou lider do ministerio?

## Formularios

- Formularios serao publicos, internos ou ambos?
- Respostas anonimas serao permitidas?
- Quais tipos de campo entram na primeira versao?
- Responsaveis recebem email a cada resposta ou resumo diario?
- Relatorios de formulario precisam exportar CSV?

## Conteudo E Transmissao

- O canal do YouTube sera sempre URL `/channel/UC...` ou tambem `@handle`?
- Vamos usar API oficial do YouTube com chave propria?
- A Inicio deve mostrar apenas lives ou tambem videos recentes do canal?
