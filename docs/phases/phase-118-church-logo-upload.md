# Fase 118: Upload De Logo Da Igreja

## Objetivo

Permitir que o admin suba o logo da igreja e veja-o aplicado na sidebar, no header e na tela de login.

## Status

Concluida.

## Escopo

### Shared

- `ChurchProfile.logoDataUrl: string` (vazio = sem logo personalizado).
- Tipo `PublicChurchInfo { name, logoDataUrl }` para o endpoint publico.

### Backend

- Migration Prisma adicionando `logoDataUrl String @default("")` em `ChurchProfileRecord`.
- `dataStore.ts` normaliza o campo na leitura JSON.
- `sanitizeChurchUpdate` valida prefixo data URL aceito e tamanho ≤ 100 KB; 400 caso invalido.
- Novo endpoint **publico** `GET /public/church-info` retorna `{ name, logoDataUrl }`.

### Frontend

- `apps/web/src/api.ts`: `loadPublicChurchInfo()` (sem token).
- `apps/web/src/ChurchPage.tsx`: bloco "Logo da igreja" com `<input type="file">`, preview e botao "Remover".
- `apps/web/src/AppLayout.tsx`: aceita `logoDataUrl?: string` e usa quando presente; fallback para asset padrao.
- `apps/web/src/main.tsx`: guarda `logoDataUrl` junto do `churchName` e passa para o `AppLayout`.
- `apps/web/src/LoginPage.tsx`: carrega `loadPublicChurchInfo` no mount e renderiza o logo dinamico com fallback.

### Tests

- `apps/api/src/http.test.ts`: novo teste cobre rejeicao de payload acima de 100 KB e tipo invalido, e aceite de PNG base64 pequeno.

## Fora De Escopo

- Multiplos logos (claro/escuro).
- Cropper/editor de imagem.
- Storage externo (S3, Cloudinary).
- Drag-and-drop de arquivo.
- Compressao automatica.
- Logo em etiquetas/relatorios.

## Criterios De Aceite

- Admin sobe um PNG pequeno e ve o logo aplicado em sidebar, header e login (apos refresh).
- Tentativa de salvar payload > 100 KB ou tipo invalido recebe 400.
- Sem `logoDataUrl`, o app cai no asset padrao.
- Endpoint publico responde sem autenticacao.

## Verificacao

```powershell
npm.cmd run db:generate
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build:web
```

Manual: logar como admin, abrir Igreja, subir PNG ~30 KB, conferir preview, salvar; refresh; ver logo aplicado; logout; conferir logo na tela de login.

## Proxima Pergunta

Depois desta fase:

> Integracao real com WhatsApp em lote (depende de provedor/custo), importacao CSV de pessoas em lote, ou foto de perfil em Minha Conta?
