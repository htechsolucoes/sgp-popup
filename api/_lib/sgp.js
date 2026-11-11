// Cliente server-side da API do SGP.
// Autenticação: SGP_TOKEN + SGP_APP (preferencial) ou SGP_USERNAME + SGP_PASSWORD (Basic Auth).

function config() {
  const baseUrl = String(process.env.SGP_URL || "").replace(/\/+$/, "");
  if (!baseUrl) throw new Error("SGP_URL não configurado");

  const { SGP_TOKEN, SGP_APP, SGP_USERNAME, SGP_PASSWORD } = process.env;

  if (SGP_TOKEN && SGP_APP) {
    return { baseUrl, headers: {}, params: { token: SGP_TOKEN, app: SGP_APP } };
  }

  if (SGP_USERNAME && SGP_PASSWORD) {
    const basic = Buffer.from(`${SGP_USERNAME}:${SGP_PASSWORD}`).toString("base64");
    return { baseUrl, headers: { Authorization: `Basic ${basic}` }, params: {} };
  }

  throw new Error("Credenciais do SGP não configuradas");
}

function clean(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

/**
 * Faz uma requisição ao SGP.
 * POST envia os parâmetros como formulário; GET envia na query string.
 * Retorna { ok, status, data } sem lançar erro em respostas HTTP != 2xx.
 */
export async function sgpRequest(path, { method = "POST", params = {}, timeoutMs = 15000 } = {}) {
  const { baseUrl, headers: authHeaders, params: authParams } = config();
  const allParams = clean({ ...authParams, ...params });
  const headers = { Accept: "application/json", ...authHeaders };

  let url = `${baseUrl}${path}`;
  let body;

  if (method === "GET") {
    const qs = new URLSearchParams(allParams).toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  } else {
    body = new URLSearchParams(allParams);
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
    signal: AbortSignal.timeout(timeoutMs)
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text.slice(0, 500) };
  }

  return { ok: response.ok, status: response.status, data };
}

export function isTimeout(err) {
  return err?.name === "TimeoutError" || err?.name === "AbortError";
}