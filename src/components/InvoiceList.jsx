import { dueLabel, formatDate, formatMoney } from "../utils/format";
import { IconDownload, IconReceipt } from "./Icons";

export default function InvoiceList({ faturas, total }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <IconReceipt className="text-htech" />
          Faturas em aberto
        </h2>
        <span className="text-sm font-semibold text-slate-800">{formatMoney(total)}</span>
      </div>

      {faturas.length === 0 ? (
        <p className="mt-3 text-sm text-htech-gray">Nenhuma fatura em aberto neste contrato.</p>
      ) : (
        <ul className="mt-3 max-h-[340px] space-y-2 overflow-y-auto pr-1">
          {faturas.map(fatura => {
            const due = dueLabel(fatura.vencimento);

            return (
              <li
                key={fatura.id}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                  due.late ? "border-red-100 bg-red-50/50" : "border-slate-100 bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{formatDate(fatura.vencimento)}</p>
                  <p className={`text-xs ${due.late ? "text-red-600" : "text-htech-gray"}`}>{due.text}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-800">{formatMoney(fatura.valor)}</span>
                  {fatura.link ? (
                    <a
                      href={fatura.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Baixar boleto"
                      className="flex items-center gap-1 rounded-lg bg-htech px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-htech-dark"
                    >
                      <IconDownload width={13} height={13} />
                      Boleto
                    </a>
                  ) : (
                    <span className="text-xs text-htech-gray">Sem boleto</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}