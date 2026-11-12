// GET /api/sgp/pppoe?login=... -> situação e sessões recentes do PPPoE
import { sgpRequest, handleError } from "../_lib/sgp.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const login = String(req.query.login || "").trim();

  if (!login) {
    return res.status(400).json({ error: "login é obrigatório" });
  }

  try {
    const resp = await sgpRequest("/ws/radius/radacct/list/all/", { params: { username: login, limit: 1 } });

    if (!resp.ok) {
      return res.status(502).json({ error: "Erro ao consultar PPPoE no SGP", detail: resp.data });
    }

    const item = (resp.data?.result || [])[0];

    if (!item) {
      return res.status(200).json({ encontrado: false });
    }

    // datas sem fuso: o navegador interpreta no horário local do atendente
    const sessoes = (item.radacct || [])
      .map(s => ({
        inicio: s.acctstarttime || "",
        fim: s.acctstoptime || "",
        ip: s.framedipaddress || "",
        causa: s.acctterminatecause || ""
      }))
      .filter(s => s.inicio)
      .sort((a, b) => b.inicio.localeCompare(a.inicio))
      .slice(0, 50);

    return res.status(200).json({
      encontrado: true,
      online: typeof item.online === "boolean" ? item.online : null,
      login: item.pppoe_login || login,
      ip: item.ip || sessoes.find(s => !s.fim)?.ip || "",
      sessoes
    });
  } catch (err) {
    return handleError(res, err, "Erro ao consultar PPPoE");
  }
}