// Cliente server-side da API do SGP.
// Padrão: SGP_TOKEN + SGP_APP. Gerenciador CPE exige Basic: SGP_USERNAME + SGP_PASSWORD.

function config(auth) {
  const baseUrl = String(process.env.SGP_URL || "").replace(/\/+$/, "");
  if (!baseUrl) throw new Error("SGP_URL não configurado");

  const { SGP_TOKEN, SGP_APP, SGP_USERNAME, SGP_PASSWORD } = process.env;

  const basic =
    SGP_USERNAME && SGP_PASSWORD
      ? {
          baseUrl,
          headers: {
            Authorization: `Basic ${Buffer.from(`${SGP_USERNAME}:${SGP_PASSWORD}`).toString("base64")}`
          },
          params: {}
        }
      : null;

  if (auth === "basic") {
    if (!basic) throw new Error("SGP_USERNAME e SGP_PASSWORD são necessários para esta função");
    return basic;
  }

  if (SGP_TOKEN && SGP_APP) {
    return { baseUrl, headers: {}, params: { token: SGP_TOKEN, app: SGP_APP } };
  }

  if (basic) return basic;

  throw new Error("Credenciais do SGP não configuradas");
}

function clean(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

/**
 * Faz uma requisição ao SGP.
 * - GET: parâmetros na query string
 * - POST com `json`: corpo JSON (parâmetros de auth vão na query string)
 * - POST sem `json`: parâmetros como formulário
 * Retorna { ok, status, data } sem lançar erro em respostas HTTP != 2xx.
 */
export async function sgpRequest(
  path,
  { method = "POST", params = {}, json, auth = "default", timeoutMs = 15000 } = {}
) {
  const { baseUrl, headers: authHeaders, params: authParams } = config(auth);
  const allParams = clean({ ...authParams, ...params });
  const headers = { Accept: "application/json", ...authHeaders };

  let url = `${baseUrl}${path}`;
  let body;

  if (method === "GET" || json !== undefined) {
    const qs = new URLSearchParams(allParams).toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }

  if (json !== undefined) {
    body = JSON.stringify(json);
    headers["Content-Type"] = "application/json";
  } else if (method !== "GET") {
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

/** Resposta padrão para exceções (timeout vira 504). */
export function handleError(res, err, message) {
  const timeout = isTimeout(err);
  return res.status(timeout ? 504 : 500).json({
    error: timeout ? "O SGP não respondeu a tempo" : message,
    detail: err.message
  });
}

export function readBody(req) {
  return typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
}

export const onlyDigits = v => String(v ?? "").replace(/\D/g, "");