# Deploy do Painel SENA COMERCIAL · Gestão

## Variáveis de Ambiente

Para rodar localmente ou em produção, configure:

```env
VITE_SUPABASE_URL=https://ssgurhxphmmnpwkbpmyu.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_jd01zieNMNOAP9_81hVdmA_10eqixkE
```

Crie o arquivo `.env.local` em `gestao/`:
```bash
cp gestao/.env.example gestao/.env.local
# edite com as credenciais acima
```

## Desenvolvimento Local

```bash
cd gestao
npm install
npm run dev
```

App roda em http://localhost:5173

## Deploy (Netlify)

### Via Dashboard Netlify

1. Vá para https://app.netlify.com
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Selecione GitHub e o repositório `senacomercial/sena-comercial`
4. Configure:
   - **Build command:** `cd gestao && npm run build`
   - **Publish directory:** `gestao/dist`
   - **Base directory:** `gestao`
5. Clique **"Deploy site"**
6. Após criar o site, vá em **Site settings** → **Build & deploy** → **Environment**
7. Adicione as variáveis:
   - `VITE_SUPABASE_URL=https://ssgurhxphmmnpwkbpmyu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=sb_publishable_jd01zieNMNOAP9_81hVdmA_10eqixkE`
8. Clique em **"Trigger deploy"** para rodar com as variáveis

### Via CLI (Netlify)

```bash
cd gestao
npm run build

# Instale Netlify CLI se não tiver
npm i -g netlify-cli

# Faça login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Via GitHub Actions (automático)

Se quiser deploy automático a cada push, crie `.github/workflows/deploy-gestao.yml`:

```yaml
name: Deploy Gestao
on:
  push:
    branches: [main, claude/tender-volta-54yehw]
    paths:
      - 'gestao/**'
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: cd gestao && npm install && npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=gestao/dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          VITE_SUPABASE_URL: https://ssgurhxphmmnpwkbpmyu.supabase.co
          VITE_SUPABASE_ANON_KEY: sb_publishable_jd01zieNMNOAP9_81hVdmA_10eqixkE
```

Depois defina os secrets no GitHub.

## Verificação

Após deploy, teste:
1. Acesse a URL do site
2. Faça login (nova conta será criada e organização será inicializada)
3. Teste cada módulo (Financeiro, CRM, Tarefas, etc.)
4. Verrifique que os dados persistem no Supabase
