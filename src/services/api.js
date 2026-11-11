// Cliente front-end: conversa apenas com as rotas /api (o token fica no servidor).

const API_BASE = import.meta.env?.VITE_API_BASE || "/api";

async function request(path, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    const error = new Error(
      `API request failed: ${response.status} ${response.statusText} - ${bodyText}`
    );
    error.status = response.status; // usado pela tela para escolher a mensagem
    throw error;
  }

  return response.json().catch(() => ({}));
}

/**
 * Normaliza o contato da wts.chat.
 * Os nomes dos campos ainda vão ser confirmados com a resposta real;
 * por isso há alternativas e o objeto original fica em `raw`.
 */
export function normalizeContact(contact = {}) {
  return {
    id: contact.id,
    name: contact.name || contact.displayName || "",
    phone: contact.phonenumber || contact.phoneNumber || contact.phone || "",
    email: contact.email || "",
    raw: contact
  };
}

/** Busca um contato pelo id. */
export async function fetchContact(contactId) {
  const data = await request(`/contact/${encodeURIComponent(contactId)}`);
  return normalizeContact(data);
}