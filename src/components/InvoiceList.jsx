import { useState } from "react";

import { fetchPix } from "../services/api";
import { copyText } from "../utils/clipboard";
import { dueLabel, formatDate, formatMoney } from "../utils/format";
import { IconCheck, IconDownload, IconQrcode, IconReceipt } from "./Icons";

const PIX_STYLE = {
  idle: "border-htech bg-white text-htech hover:bg-htech-50",
  loading: "border-htech-100 bg-htech-50 text-htech-dark",
  copied: "border-emerald-500 bg-emerald-50 text-emerald-700",
  error: "border-red-300 bg-red-50 text-red-600"
};

const PIX_LABEL = {
  idle: "PIX",
  loading: "Gerando...",
  copied: "Copiado",
  error: "Indisponível"
};

function PixButton({ fatura }) {
  const [state, setState] = useState("idle");
  const [codigo, setCodigo] = useState(fatura.codigoPix || "");

  async function handleClick() {
    if (state === "loading") return;
    setState("loading");

    try {
      let pix = codigo;

      if (!pix) {
        const data = await fetchPix(fatura.id, fatura.contratoId);
        pix = data.codigo;
        setCodigo(pix);
      }

      setState((await copyText(pix)) ? "copied" : "error");
    } catch {
      setState("error");
    }

    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button
      onClick={handleClick}
      title="Copiar PIX copia e cola"
      className={`flex min-w-[112px] items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${PIX_STYLE[state]}`}
    >
      {state === "copied" ? <IconCheck width={14} height={14} /> : <IconQrcode width={14} height={14} />}
      {PIX_LABEL[state]}
    </button>
  );
}

export default function InvoiceList({ faturas, total }) {
  return (
    <section className="overflow-hidden rounded-xl border border-htech-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-htech-100 bg-htech-50 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-htech-darker">
          <IconReceipt className="text-htech" />
          Faturas em aberto
        </h2>
        <span className="rounded-full bg-htech px-2.5 py-0.5 text-sm font-semibold text-white">
          {formatMoney(total)}
        </span>
      </div>

      {faturas.length === 0 ? (
        <p className="p-4 text-sm text-htech-gray">Nenhuma fatura em aberto neste contrato.</p>
      ) : (
        <ul className="max-h-[330px] space-y-2 overflow-y-auto p-3">
          {faturas.map(fatura => {
            const due = dueLabel(fatura.vencimento);

            return (
              <li
                key={fatura.id}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition ${
                  due.late
                    ? "border-red-200 bg-red-50"
                    : "border-slate-100 bg-white hover:border-htech-100 hover:bg-htech-50"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{formatDate(fatura.vencimento)}</p>
                  <p className={`text-sm ${due.late ? "font-medium text-red-600" : "text-htech-gray"}`}>
                    {due.text}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="mr-1 text-sm font-semibold text-htech-darker">{formatMoney(fatura.valor)}</span>

                  {fatura.link ? (
                    <a
                      href={fatura.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Baixar boleto"
                      className="flex items-center gap-1 rounded-lg border border-htech bg-htech px-3 py-1.5 text-sm font-medium text-white transition hover:bg-htech-dark"
                    >
                      <IconDownload width={14} height={14} />
                      Boleto
                    </a>
                  ) : (
                    <span className="text-sm text-htech-gray">Sem boleto</span>
                  )}

                  <PixButton fatura={fatura} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}