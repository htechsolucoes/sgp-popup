// GET /api/agent/:id -> dados de um atendente
// PUT /api/agent/:id -> atualiza disponibilidade { availability }
import { wtsRequest, send } from "../_lib/wts.js";

export default async function handler(req, res) {
  const { id } = req.query;
  const path = `/agent/${encodeURIComponent(id)}`;

  if (req.method === "GET") {
    try {
      return send(res, await wtsRequest(path));
    } catch (err) {
      return res.status(500).json({ error: "Erro ao buscar dados do CRM", detail: err.message });
    }
  }

  if (req.method === "PUT") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { availability } = body;

    if (!availability) {
      return res.status(400).json({ error: "availability é obrigatório" });
    }

    try {
      return send(
        res,
        await wtsRequest(path, {
          method: "PUT",
          body: { fields: ["Availability"], availability }
        })
      );
    } catch (err) {
      return res.status(500).json({ error: "Erro ao atualizar status", detail: err.message });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
