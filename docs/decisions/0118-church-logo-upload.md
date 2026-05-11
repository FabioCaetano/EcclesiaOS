# Decisao 0118: Upload De Logo Da Igreja

## Status

Aceita.

## Contexto

O cabecalho, a barra lateral e a tela de login mostram o logo padrao do EcclesiaOS (`/ecclesia-os-logo-cropped.png`). Cada igreja tem identidade visual propria e gostaria de ver o proprio logo no painel — especialmente na tela de login que e a porta de entrada. Falta um lugar para o admin subir um arquivo e ver isso refletido na interface.

Tres opcoes consideradas:

1. **Storage externo (S3/Cloudinary)**: profissional mas exige credencial paga e novo SDK no monorepo.
2. **Filesystem local**: simples em dev, problemático em Render/Vercel (sistemas efemeros) e exige rota estatica.
3. **Base64 data URL no `ChurchProfile.logoDataUrl`**: zero infra extra, persiste no Postgres ja existente, renderiza direto via `<img src={dataUrl}>`. **Escolhida.**

## Decisao

- Adicionar campo `logoDataUrl: string` em `ChurchProfile` no shared.
- Adicionar coluna `logoDataUrl String @default("")` em `ChurchProfileRecord` no Prisma + migration.
- Backend valida no `sanitizeChurchUpdate`:
  - se nao vazio, exige prefixo `data:image/{png|jpeg|svg+xml|webp};base64,`;
  - tamanho total do data URL ≤ 100 KB (100 * 1024 bytes); rejeita com 400 acima disso;
  - tipos invalidos rejeitados com 400.
- Novo endpoint **publico** `GET /public/church-info` retorna `{ name, logoDataUrl }` para a tela de login e telas publicas.
- `ChurchPage` ganha bloco "Logo da igreja" com `<input type="file" accept="image/*">`, preview e botao "Remover logo".
- `AppLayout` recebe `logoDataUrl?` e usa quando presente; caso contrario, usa o asset estatico padrao.
- `LoginPage` chama o endpoint publico no mount e usa o logo da igreja se houver.

## Consequencias

- Sem nova dependencia externa, sem credencial paga.
- Logo viaja com o profile no payload — bytes extras mas controlado pelo limite 100 KB.
- Render do logo no `<img>` funciona em qualquer navegador moderno.
- A tela de login passa a expor o nome e logo da igreja publicamente — isso e adequado para o contexto (nao e informacao sensivel).

## Nao Objetivos

- Multiplos logos (claro/escuro, splash).
- Cropper/editor de imagem.
- Storage externo (S3 etc.).
- Upload por arrastar e soltar.
- Compressao automatica do arquivo.
- Logo aplicado em etiquetas/relatorios PDF.
