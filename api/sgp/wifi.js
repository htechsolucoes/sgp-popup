// GET /api/sgp/wifi?servico=ID -> redes Wi-Fi do roteador (Gerenciador CPE)
import { sgpRequest, handleError, onlyDigits } from "../_lib/sgp.js";

function extrairLista(data) {
  const candidatos = [data, data?.wifi, data?.wifis, data?.result, data?.interfaces, data?.data];
  const lista = candidatos.find(Array.isArray);
  if (lista) return lista;

  // formato { "1-1": { ssid, ... }, "1-5": { ... } }
  const base = data?.result && typeof data.result === "object" ? data.result : data;
  if (base && typeof base === "object") {
    return Object.entries(base)
      .filter(([, v]) => v && typeof v === "object" && "ssid" in v)
      .map(([k, v]) => ({ interface_id: k, ...v }));
  }

  return [];
}

function rotulo(w, i) {
  const texto = [w.band, w.banda, w.frequency_band, w.standard, w.name, w.nome, w.interface]
    .filter(Boolean)
    .join(" ");
  if (/5\s?g/i.test(texto)) return "5G";
  if (/2[.,]?4/.test(texto)) return "2.4G";
  return `Rede ${i + 1}`;
}

export default async function handler(req, res) {
  if (process.env.VITE_FEATURE_WIFI !== "true") {
    return res.status(404).json({ error: "Função não disponível" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const servico = onlyDigits(req.query.servico);

  if (!servico) {
    return res.status(400).json({ error: "servico é obrigatório" });
  }

  try {
    const resp = await sgpRequest(`/api/cpemanager/servico/${servico}/wifi/list/`, {
      method: "GET",
      auth: "basic",
      timeoutMs: 20000
    });

    if (!resp.ok) {
      return res.status(502).json({ error: "Não foi possível ler o Wi-Fi do roteador", detail: resp.data });
    }

    const redes = extrairLista(resp.data).map((w, i) => ({
      id: String(w.interface_id ?? w.interfaceId ?? w.interface ?? w.id ?? ""),
      banda: rotulo(w, i),
      ssid: w.ssid ?? w.SSID ?? "",
      senha: w.password ?? w.senha ?? w.key ?? w.passphrase ?? ""
    }));

    return res.status(200).json({ redes, raw: resp.data });
  } catch (err) {
    return handleError(res, err, "Erro ao consultar Wi-Fi");
  }
}