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

/** Lê um campo personalizado, aceitando objeto ou lista em customFields. */
function getCustomField(customFields, key) {
  if (!customFields) return "";

  if (Array.isArray(customFields)) {
    const wanted = key.toLowerCase();
    const field = customFields.find(item =>
      [item?.key, item?.name, item?.label, item?.id]
        .filter(Boolean)
        .some(name => String(name).toLowerCase() === wanted)
    );
    return field?.value ?? "";
  }

  return customFields[key] ?? "";
}

/** Formata CPF (11 dígitos) ou CNPJ (14 dígitos) para exibição. */
export function formatCpfCnpj(digits = "") {
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return digits;
}

/**
 * Normaliza o contato da wts.chat.
 * O objeto original fica em `raw`.
 */
export function normalizeContact(contact = {}) {
  const cpfCnpj = String(getCustomField(contact.customFields, "cpf-cnpj") || "").replace(/\D/g, "");

  return {
    id: contact.id,
    name: contact.name || contact.displayName || "",
    phone: contact.phonenumber || contact.phoneNumber || contact.phone || "",
    email: contact.email || "",
    cpfCnpj, // só números, ex.: "12345678901". Vazio se o contato não tiver o campo.
    raw: contact
  };
}

/** Busca um contato pelo id. */
export async function fetchContact(contactId) {
  const data = await request(`/contact/${encodeURIComponent(contactId)}`);
  return normalizeContact(data);
}