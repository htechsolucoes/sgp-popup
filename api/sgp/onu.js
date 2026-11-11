// GET /api/sgp/onu?contrato=ID -> conexão, sinal, temperatura e distância da ONU do contrato
import { sgpRequest, isTimeout } from "../_lib/sgp.js";

// Os nomes exatos dos campos de sinal variam; procuramos pelos mais comuns.
const KEYS = {
  conexao: ["connection", "conexao", "status_conexao", "connection_status", "onu_status", "state"],
  rx: ["rx", "rx_power", "rxpower", "onu_rx", "rx_onu", "sinal_rx", "signal_rx", "rx_dbm", "signal", "sinal"],
  temperatura: ["temperature", "temperatura", "temp", "onu_temperature"],
  distancia: ["distance", "distancia", "onu_distance"]
};

function findValue(obj, keys, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 2) return undefined;

  for (const [key, value] of Object.entries(obj)) {
    if (keys.includes(key.toLowerCase()) && value !== null && value !== "" && typeof value !== "object") {
      return value;
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") {
      const found = findValue(value, keys, depth + 1);
      if (found !== undefined) return found;
    }
  }

  return undefined;
}

function toNumber(value) {
  if (value === undefined || value === null) return null;
  const n = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function normalizarOnu(onu) {
  const conexaoRaw = findValue(onu, KEYS.conexao);
  const conexao =
    typeof conexaoRaw === "boolean" ? (conexaoRaw ? "Online" : "Offline") : conexaoRaw ? String(conexaoRaw) : "";

  let distanciaKm = toNumber(findValue(onu, KEYS.distancia));
  if (distanciaKm !== null && distanciaKm > 100) distanciaKm = distanciaKm / 1000; // veio em metros

  return {
    encontrada: true,
    conexao,
    rx: toNumber(findValue(onu, KEYS.rx)),
    temperatura: toNumber(findValue(onu, KEYS.temperatura)),
    distanciaKm,
    modelo: onu.type || "",
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