# Decisao 0121: Aba Etiquetas Dedicada

## Status

Aceita.

## Contexto

Na pagina Igreja (`ChurchPage`) ha um bloco "Etiquetas e impressoras" com CRUD de templates Brother, escolha de layout (Kids / Visitante), tamanho da fita e impressao de teste. Esse bloco e operacional (configurar impressora) e nao tem nada a ver com o cadastro da igreja (nome, endereco, logo). O usuario pediu para mover.

Opcoes consideradas:

1. **Mover para dentro do Check-in**: aproxima de onde a etiqueta e usada (Kids/Visitante), mas Check-in ja tem muita coisa (totem, scanner, lista).
2. **Mover para Minha conta**: nao faz sentido — e configuracao da igreja, nao do usuario.
3. **Criar aba dedicada "Etiquetas"** no grupo Sistema, admin-only. **Escolhida** — separa cadastro de igreja da configuracao operacional de impressao e fica facil de achar.

## Decisao

- Adicionar `"labels"` em `AppModuleKey` em `@ecclesiaos/shared`.
- `canAccessModule("labels")` e `canManageModule("labels")` retornam `true` apenas para admin.
- Criar `apps/web/src/LabelsPage.tsx` com todo o codigo extraido do `ChurchPage` (`templateForm`, `editingTemplateId`, `printingTemplate`, `handleTemplateSubmit`, `handleDeleteTemplate`, `printTestLabel`, `labelPageStyle`).
- Adicionar entrada no menu (`AppLayout`) e roteamento (`main.tsx`).
- Remover bloco e dependencias correspondentes de `ChurchPage`.
- Endpoints `/label-templates` no backend permanecem inalterados.

## Consequencias

- `ChurchPage` fica focada em cadastro (dados, logo, QR de visitante).
- `LabelsPage` tem espaco proprio para crescer (preview, mais layouts, multi-impressora) sem poluir Igreja.
- Admin ve nova entrada "Etiquetas" no grupo Sistema. Lider/membro nao veem.

## Nao Objetivos

- Preview interativo do conteudo da etiqueta antes de imprimir.
- Suporte a outras marcas de impressora alem de Brother.
- Aplicar etiquetas em outros modulos (eventos, financeiro).
- Layouts personalizaveis pelo admin (alem de Kids / Visitante).
