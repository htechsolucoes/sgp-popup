// GET /api/sgp/chamado-opcoes -> tipos de ocorrência e motivos de OS para o formulário de novo chamado
import { sgpRequest, handleError } from "../_lib/sgp.js";

function mapear(resp) {
  const lista = resp.ok && Array.isArray(resp.data) ? resp.data : [];
  return lista
    .map(item => ({ codigo: item.codigo ?? item.id, descricao: item.descricao || "" }))
    .filter(item => item.codigo !== undefined && item.codigo !== null && item.descricao)
    .sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const [tipos, motivos] = await Promise.all([
      sgpRequest("/api/os/ocorrencia/tipo/list/", { method: "GET" }),
      sgpRequest("/api/os/ocorrencia/motivo/list/", { method: "GET" })
    ]);

    return res.status(200).json({ tipos: mapear(tipos), motivos: mapear(motivos) });
  } catch (err) {
    return handleError(res, err, "Erro ao carregar opções de chamado");
  }
}
