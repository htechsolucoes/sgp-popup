// Cliente server-side da API wts.chat.
// Arquivos/pastas com "_" dentro de /api não viram rotas na Vercel.

const WTS_BASE_URL = process.env.WTS_BASE_URL || "https://api.wts.chat/core/v1";

function authHeader() {
  const token = process.env.API_TOKEN;

  if (!token) {
    throw new Error("API_TOKEN não configurado");
  }

  // aceita o token com ou sem o prefixo "Bearer "
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

/**
 * Faz uma requisição para a API wts.chat.
 * Retorna { ok, status, data } sem lançar erro em respostas HTTP != 2xx.
 */
export async function wtsRequest(path, { method = "GET", body } = {}) {
  const headers = {
    Authorization: authHeader(),
    Accept: "application/json"
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/*+json";
  }

  const response = await fetch(`${WTS_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return { ok: false, status: response.status, data: { error: text } };
  }

  const data = await response.json().catch(() => ({}));
  return { ok: true, status: response.status, data };
}

/** Envia o resultado de wtsRequest como resposta do handler. */
export function send(res, result) {
  return res.status(result.ok ? 200 : result.status).json(result.data);
}
