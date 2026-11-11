// GET /api/contact/:id -> dados de um contato da wts.chat
import { wtsRequest, send } from "../_lib/wts.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "id do contato é obrigatório" });
  }

  try {
    return send(
      res,
      await wtsRequest(`/contact/${encodeURIComponent(id)}?IncludeDetails=CustomFields`)
    );
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar contato", detail: err.message });
  }
}