// GET /api/sgp/cliente?cpfcnpj=... -> cliente, contratos e faturas em aberto
import { sgpRequest, isTimeout } from "../_lib/sgp.js";

const onlyDigits = v => String(v ?? "").replace(/\D/g, "");

function montarEndereco(c) {
  const rua = [c.endereco_logradouro, c.endereco_numero].filter(Boolean).join(", ");
  const cidade = [c.endereco_cidade, c.endereco_uf].filter(Boolean).join(" - ");

  return [rua, c.endereco_complemento, c.endereco_pontoreferencia, c.endereco_bairro, cidade]
    .map(p => String(p ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

function normalizarFatura(t) {
  return {
    id: t.id,
    contratoId: t.clienteContrato ?? null,
    numeroDocumento: t.numeroDocumento ?? null,
    vencimento: t.dataVencimento || "",
    valor: Number(t.valorCorrigido ?? t.valor ?? 0),
    link: t.link || "",
    linkPagamento: t.link_cobranca || "",
    linhaDigitavel: t.linhaDigitavel || ""
  };
}

function normalizarContrato(c, faturas) {
  return {
    id: c.contratoId,
    plano: c.planointernet || c.servico_plano || "",
    status: String(c.contratoStatusDisplay || "").trim(),
    statusCodigo: Number(c.contratoStatus) || null, // 1 Ativo, 2 Inativo, 3 Cancelado, 4 Suspenso, 5 Reduzido
    endereco: montarEndereco(c),
    login: c.servico_login || "",
    faturas,
    totalAberto: faturas.reduce((soma, f) => soma + f.valor, 0)
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const cpfcnpj = onlyDigits(req.query.cpfcnpj);

  if (cpfcnpj.length !== 11 && cpfcnpj.length !== 14) {
    return res.status(400).json({ error: "cpfcnpj inválido" });
  }

  try {
    const [clienteResp, titulosResp] = await Promise.all([
      sgpRequest("/api/ura/consultacliente/", { params: { cpfcnpj } }),
      sgpRequest("/api/ura/titulos/", {
        params: {
          cpfcnpj,
          status: "abertos",
          ordenar: "data_vencimento",
          ordenar_ordem: "asc",
          limit: 250
        }
      })
    ]);

    if (!clienteResp.ok && clienteResp.status !== 404) {
      return res.status(502).json({ error: "Erro ao consultar cliente no SGP", detail: clienteResp.data });
    }

    const contratosSgp = Array.isArray(clienteResp.data?.contratos) ? clienteResp.data.contratos : [];

    if (!contratosSgp.length) {
      return res.status(404).json({ error: "Cliente não encontrado no SGP" });
    }

    const titulos = titulosResp.ok && Array.isArray(titulosResp.data?.titulos) ? titulosResp.data.titulos : [];

    const faturas = titulos
      .map(normalizarFatura)
      .sort((a, b) => a.vencimento.localeCompare(b.vencimento));

    const contratos = contratosSgp
      .map(c => normalizarContrato(c, faturas.filter(f => f.contratoId === c.contratoId)))
      .sort((a, b) => (a.statusCodigo === 1 ? 0 : 1) - (b.statusCodigo === 1 ? 0 : 1)); // ativos primeiro

    return res.status(200).json({
      cliente: { nome: contratosSgp[0].razaoSocial || "", cpfCnpj: cpfcnpj },
      resumo: {
        contratos: contratos.length,
        faturasAbertas: faturas.length,
        totalAberto: faturas.reduce((soma, f) => soma + f.valor, 0)
      },
      contratos,
      avisos: titulosResp.ok ? [] : ["Não foi possível carregar as faturas agora."]
    });
  } catch (err) {
    return res.status(isTimeout(err) ? 504 : 500).json({
      error: isTimeout(err) ? "SGP não respondeu a tempo" : "Erro ao consultar o SGP",
      detail: err.message
    });
  }
}