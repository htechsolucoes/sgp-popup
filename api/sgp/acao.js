// POST /api/sgp/acao { acao, ... } -> executa uma ação no SGP
import { sgpRequest, handleError, readBody, onlyDigits } from "../_lib/sgp.js";

const badRequest = message => Object.assign(new Error(message), { status: 400 });

const ACOES = {
  "reiniciar-onu": body => {
    const onuId = onlyDigits(body.onuId);
    if (!onuId) throw badRequest("ONU não informada");
    return sgpRequest(`/api/fttx/onu/${onuId}/reset/`, { method: "GET", timeoutMs: 20000 });
  },

  "reiniciar-roteador": body => {
    const servicoId = onlyDigits(body.servicoId);
    if (!servicoId) throw badRequest("Serviço não informado");
    return sgpRequest(`/api/cpemanager/servico/${servicoId}/command/boot/`, { auth: "basic", timeoutMs: 20000 });
  },

  liberar: body => {
    const contrato = onlyDigits(body.contrato);
    if (!contrato) throw badRequest("Contrato não informado");
    return sgpRequest("/api/ura/liberacaopromessa/", { params: { contrato } });
  },

  "alterar-wifi": body => {
    const servicoId = onlyDigits(body.servicoId);
    const redes = Array.isArray(body.redes) ? body.redes : [];
    const json = {};

    for (const rede of redes) {
      const iface = String(rede.id || "").trim();
      const ssid = String(rede.ssid || "").trim();
      const senha = String(rede.senha || "");

      if (!iface) continue;
      if (!ssid || ssid.length > 32) throw badRequest("Nome da rede deve ter entre 1 e 32 caracteres");
      if (senha && (senha.length < 8 || senha.length > 63)) throw badRequest("Senha deve ter entre 8 e 63 caracteres");

      json[`${iface}_ssid`] = ssid;
      if (senha) json[`${iface}_password`] = senha;
      json[`${iface}_enabled`] = "on";
    }

    if (!servicoId || !Object.keys(json).length) throw badRequest("Dados do Wi-Fi inválidos");

    return sgpRequest(`/api/cpemanager/servico/${servicoId}/wifi/update/`, {
      json,
      auth: "basic",
      timeoutMs: 20000
    });
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const body = readBody(req);
  const executar = ACOES[body.acao];

  const acoesCpe = ["alterar-wifi", "reiniciar-roteador"];
  if (acoesCpe.includes(body.acao) && process.env.VITE_FEATURE_WIFI !== "true") {
    return res.status(404).json({ error: "Função não disponível" });
  }

  if (!executar) {
    return res.status(400).json({ error: "Ação inválida" });
  }

  try {
    const resp = await executar(body);

    if (!resp.ok) {
      return res.status(502).json({ error: "O SGP recusou a ação", detail: resp.data });
    }

    if (body.acao === "liberar" && resp.data?.liberado === false) {
      return res.status(422).json({ error: resp.data?.msg || "Liberação não permitida para este contrato" });
    }

    return res.status(200).json({ ok: true, dados: resp.data });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    return handleError(res, err, "Erro ao executar a ação");
  }
}