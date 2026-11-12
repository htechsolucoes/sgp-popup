import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Em desenvolvimento, executa as funções de /api dentro do próprio Vite,
// então `npm run dev` já funciona sem precisar do `vercel dev`.
// Em produção (Vercel) as mesmas funções rodam como serverless.
function localApi() {
  const routes = [
    { pattern: /^\/api\/contact\/([^/]+)\/?$/, file: "./api/contact/[id].js", param: "id" },
    { pattern: /^\/api\/sgp\/cliente\/?$/, file: "./api/sgp/cliente.js" },
    { pattern: /^\/api\/sgp\/onu\/?$/, file: "./api/sgp/onu.js" },
    { pattern: /^\/api\/sgp\/pix\/?$/, file: "./api/sgp/pix.js" }
  ];

  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        const route = routes.find(r => r.pattern.test(url.pathname));
        if (!route) return next();

        const match = url.pathname.match(route.pattern);
        req.query = Object.fromEntries(url.searchParams);
        if (route.param) req.query[route.param] = decodeURIComponent(match[1]);

        let raw = "";
        for await (const chunk of req) raw += chunk;
        try {
          req.body = raw ? JSON.parse(raw) : {};
        } catch {
          req.body = raw;
        }

        res.status = code => {
          res.statusCode = code;
          return res;
        };
        res.json = data => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
          return res;
        };

        try {
          const { default: handler } = await server.ssrLoadModule(route.file);
          await handler(req, res);
        } catch (err) {
          res.status(500).json({ error: String(err?.message || err) });
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  // disponibiliza API_TOKEN (e demais variáveis do .env.local) para as funções /api
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [tailwindcss(), react(), localApi()]
  };
});
