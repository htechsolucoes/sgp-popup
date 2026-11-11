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
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} - ${bodyText}`
    );
  }

  return response.json().catch(() => ({}));
}

const PROFILES = {
  ADMIN: "Administrador",
  AGENT: "Atendente",
  RESTRICTED_AGENT: "Atendente Restrito"
};

export function translateProfile(profile) {
  return PROFILES[profile] || profile || "";
}

export function normalizeUser(user) {
  return {
    id: user.id,
    userId: user.userId,
    name: user.name,
    profile: translateProfile(user.profile || user.role),
    available: user.available || user.availability,
    isOwner: user.isOwner === true,
    since: user.since || null,
    color: user.color || "#3E7BD6"
  };
}

/** Lista todos os atendentes (já normalizados). */
export async function fetchUsers() {
  const data = await request("/agent");

  if (!Array.isArray(data)) {
    throw new Error("Resposta de usuários inválida");
  }

  return data.map(normalizeUser);
}

/** Busca um atendente pelo id (resposta crua da API). */
export function fetchUser(userId) {
  return request(`/agent/${encodeURIComponent(userId)}`);
}

/** Atualiza a disponibilidade, ex.: "AVAILABLE" | "UNAVAILABLE". */
export function updateUserAvailability(userId, availability) {
  return request(`/agent/${encodeURIComponent(userId)}`, {
    method: "PUT",
    body: { availability, fields: ["Availability"] }
  });
}
