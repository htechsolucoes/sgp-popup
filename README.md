# wts-api-kit

Projeto React + Vite + Tailwind conectado à API wts.chat (extraído do `htech-toppharma`).

```
api/
  _lib/wts.js              # cliente server-side (token, URL base, fetch)
  agent/index.js           # GET  /api/agent      -> lista de atendentes
  agent/[id].js            # GET  /api/agent/:id  -> um atendente
                           # PUT  /api/agent/:id  -> { availability }
src/
  services/api.js          # fetchUsers, fetchUser, updateUserAvailability
  hooks/useUsers.js        # React Query: lista
  hooks/useToggleAvailability.js  # React Query: muda disponibilidade
  App.jsx                  # tela de exemplo (pode substituir)
vite.config.js             # roda as rotas /api localmente no `npm run dev`
```

## Rodando

1. Copie `.env.example` para `.env.local` e preencha `API_TOKEN`.
2. Instale e rode:

```bash
npm install
npm run dev
```

O `npm run dev` já executa as rotas `/api`, não precisa do `vercel dev`.

## Uso no código

```js
import { fetchUsers, updateUserAvailability } from "./services/api";

const users = await fetchUsers();
await updateUserAvailability(users[0].userId, "AVAILABLE"); // ou "UNAVAILABLE"
```

## Deploy

Na Vercel, configure `API_TOKEN` em Settings → Environment Variables. As funções em `api/` viram serverless automaticamente.

O token fica só no servidor e o navegador nunca o recebe. Não coloque o token no código.
