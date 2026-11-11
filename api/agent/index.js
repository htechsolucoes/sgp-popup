// GET /api/agent -> lista de atendentes
import { wtsRequest, send } from "../_lib/wts.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    return send(res, await wtsRequest("/agent"));
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar dados do CRM", detail: err.message });
  }
}
