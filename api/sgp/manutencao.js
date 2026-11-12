// GET /api/sgp/manutencao?pop=&olt=&slot=&pon= -> manutenções ativas que afetam o cliente
import { sgpRequest, handleError } from "../_lib/sgp.js";

const same = (a, b) => a !== undefined && a !== null && a !== "" && String(a) === String(b);

function parseDate(value) {
  const d = value ? new Date(String(value).replace(" ", "T")) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

function estaAtiva(m, agora) {
  if (Number(m.ativa) === 0 || m.ativa === false) return false;
  const inicio = parseDate(m.data_inicial);
  const fim = parseDate(m.data_final);
  if (inicio && inicio > agora) return false;
  if (fim && fim < agora) return false;
  return true;
}

function afetaCliente(m, { pop, olt, slot, pon }) {
  const escopos = [m.pops, m.olts, m.oltpons, m.nas, m.aps, m.sources, m.switches, m.ctos];
  const temEscopo = escopos.some(lista => Array.isArray(lista) && lista.length);

  if (!temEscopo) return true; // manutenção geral

  if ((m.pops || []).some(p => same(p.id, pop))) return true;
  if ((m.olts || []).some(o => same(o.id, olt))) return true;
  if ((m.oltpons || []).some(p => same(p.olt_id, olt) && same(p.slot, slot) && same(p.pon, pon))) return true;

  return false;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const resp = await sgpRequest("/api/ura/manutencao/list/", { method: "GET" });

    if (!resp.ok) {
      return res.status(502).json({ error: "Erro ao consultar manutenções no SGP", detail: resp.data });
    }

    const lista = Array.isArray(resp.data) ? resp.data : resp.data?.result || [];
    // a data do SGP não tem fuso; comparamos no horário de Brasília
    const agora = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Fortaleza" }));

    const manutencoes = lista
      .filter(m => estaAtiva(m, agora) && afetaCliente(m, req.query))
      .map(m => ({
        id: m.id,
        descricao: m.descricao || "",
        mensagem: m.mensagem_central || m.observacoes || "",
        inicio: m.data_inicial || "",
        fim: m.data_final || "",
        severidade: m.severidade || ""
      }));

    return res.status(200).json(manutencoes);
  } catch (err) {
    return handleError(res, err, "Erro ao consultar manutenções");
  }
}