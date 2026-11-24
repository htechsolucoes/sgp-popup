// GET /api/sgp/chamados?contrato=ID -> chamados (ocorrências) não encerrados do contrato
import { sgpRequest, handleError, onlyDigits } from "../_lib/sgp.js";

const STATUS = { 0: "Aberto", 1: "Encerrado", 2: "Em execução", 3: "Pendente" };
const STATUS_ABERTOS = [0, 2, 3];

function normalizar(o) {
  return {
    numero: String(o.numero ?? ""),
    statusId: Number(o.status_id),
    status: STATUS[o.status_id] || o.status || "",
    tipo: o.tipo || "",
    conteudo: o.conteudo || "",
    responsavel: o.responsavel || "",
    abertura: o.data_cadastro || "",
    agendamento: o.data_agendamento || "",
    ordensServico: (o.ordens_servicos || []).map(os => ({
      id: os.id,
      status: os.status || "",
      motivo: os.motivo || "",
      responsavel: os.responsavel || "",
      agendamento: os.data_agendamento || ""
    }))
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const contrato = onlyDigits(req.query.contrato);

  if (!contrato) {
    return res.status(400).json({ error: "contrato é obrigatório" });
  }

  try {
    // uma consulta por status em aberto, para não depender da ordem/limite do histórico completo
    const respostas = await Promise.all(
      STATUS_ABERTOS.map(status =>
        sgpRequest("/api/ura/ocorrencia/list/", { params: { contrato, status, limit: 100 } })
      )
    );

    if (respostas.every(r => !r.ok)) {
      return res.status(502).json({ error: "Erro ao consultar chamados no SGP", detail: respostas[0].data });
    }

    const vistos = new Set();
    const chamados = respostas
      .flatMap(r => (r.ok && Array.isArray(r.data?.ocorrencias) ? r.data.ocorrencias : []))
      .filter(o => Number(o.status_id) !== 1)
      .map(normalizar)
      .filter(c => (vistos.has(c.numero) ? false : vistos.add(c.numero)))
      .sort((a, b) => String(b.abertura).localeCompare(String(a.abertura)));

    return res.status(200).json(chamados);
  } catch (err) {
    return handleError(res, err, "Erro ao consultar chamados");
  }
}
