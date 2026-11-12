// POST /api/sgp/pix { fatura, contrato } -> { codigo } (PIX copia e cola)
import { sgpRequest, isTimeout } from "../_lib/sgp.js";

const onlyDigits = v => String(v ?? "").replace(/\D/g, "");

// Todo PIX copia e cola (padrão EMV) começa com "000201".
function findPix(value, depth = 0) {
  if (value == null || depth > 4) return "";

  if (typeof value === "string") {
    const text = value.trim();
    return text.startsWith("000201") ? text : "";
  }

  const values = Array.isArray(value) ? value : typeof value === "object" ? Object.values(value) : [];
  for (const item of values) {
    const found = findPix(item, depth + 1);
    if (found) return found;
  }

  return "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const fatura = onlyDigits(body.fatura);
  const contrato = onlyDigits(body.contrato);

  if (!fatura || !contrato) {
    return res.status(400).json({ error: "fatura e contrato são obrigatórios" });
  }

  try {
    const resp = await sgpRequest(`/api/ura/pagamento/pix/${fatura}`, { params: { contrato } });

    if (!resp.ok) {
      return res.status(502).json({ error: "Erro ao gerar PIX no SGP", detail: resp.data });
    }

    const codigo = findPix(resp.data);

    if (!codigo) {
      return res.status(404).json({ error: "PIX não disponível para esta fatura", detail: resp.data });
    }

    return res.status(200).json({ codigo });
  } catch (err) {
    return res.status(isTimeout(err) ? 504 : 500).json({
      error: isTimeout(err) ? "SGP não respondeu a tempo" : "Erro ao gerar PIX",
      detail: err.message
    });
  }
}