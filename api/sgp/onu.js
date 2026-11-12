// GET /api/sgp/onu?contrato=ID -> conexão e sinal da ONU do contrato
import { sgpRequest, isTimeout } from "../_lib/sgp.js";

function toNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function normalizarOnu(onu) {
  return {
    encontrada: true,
    id: onu.id,
    online: typeof onu.online === "boolean" ? onu.online : null,
    rx: toNumber(onu.info_rx), // sinal recebido pela ONU (dBm)
    tx: toNumber(onu.info_tx), // potência de transmissão da ONU (dBm)
    oltRx: toNumber(onu.info_olt_rx), // sinal recebido pela OLT (dBm)
    leitura: onu.info_date || "", // data da última coleta de sinal
    olt: onu.olt_name || "",
    posicao: [onu.slot, onu.pon, onu.onuid].every(v => v !== undefined && v !== null)
      ? `${onu.slot}/${onu.pon}/${onu.onuid}`
      : "",
    raw: onu
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const contrato = String(req.query.contrato || "").trim();

  if (!contrato) {
    return res.status(400).json({ error: "contrato é obrigatório" });
  }

  try {
    const resp = await sgpRequest("/api/fttx/onu/list/", {
      method: "GET",
      params: { contrato, signal: 1, connection: 1 },
      timeoutMs: 9000
    });

    if (!resp.ok) {
      return res.status(502).json({ error: "Erro ao consultar ONU no SGP", detail: resp.data });
    }

    const lista = Array.isArray(resp.data) ? resp.data : resp.data?.onus || [];

    if (!lista.length) {
      return res.status(200).json({ encontrada: false });
    }

    const onu = lista.find(o => String(o.service_contrato) === contrato) || lista[0];
    return res.status(200).json(normalizarOnu(onu));
  } catch (err) {
    return res.status(isTimeout(err) ? 504 : 500).json({
      error: isTimeout(err) ? "OLT não respondeu a tempo" : "Erro ao consultar ONU",
      detail: err.message
    });
  }
}