# FABER Price

Calculadora de precificação de impressão 3D — versão standalone, sem banco de dados e sem
login. Extraída de `/admin/precificacao` do `faber-web`, pensada como produto à parte
(replicável/white-label), enquanto o deploy da plataforma principal (`faber-api` + `faber-web`)
ainda não acontece.

## Como funciona

- **Cálculo de custo** (filamento, energia, mão de obra, depreciação, custos fixos, margem de
  lucro) roda 100% no navegador — `src/lib/pricing.ts`, função pura, sem I/O.
- **Presets** (impressoras, bandeiras tarifárias, materiais de referência usados nos botões
  rápidos da calculadora) ficam salvos no `localStorage` do navegador (`src/lib/presets.ts` +
  `src/hooks/use-presets.ts`) — sem conta, sem sincronizar entre dispositivos.
- **PDF do orçamento** é a única coisa que passa pelo servidor: `POST /api/quote-pdf`
  (`src/app/api/quote-pdf/route.ts`) gera o PDF com `pdfkit` e devolve o arquivo — não persiste
  nada, só processa e responde.
- Reaproveita a identidade visual do FABER (tema, tipografia Plus Jakarta Sans/Syne, componentes
  shadcn/ui "new-york") — ver `src/app/globals.css`.

## Rodando localmente

```bash
npm install
npm run dev
```

Sobe em [http://localhost:3001](http://localhost:3001) (porta 3001 pra não conflitar com o
`faber-web`, que usa a 3000).

## Deploy

Projeto standalone, sem dependência de banco de dados nem de variáveis de ambiente — dá pra
deployar na Vercel (free tier) sem nenhuma configuração extra além do repositório.
