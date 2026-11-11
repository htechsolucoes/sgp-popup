import { dueLabel, formatDate, formatMoney } from "../utils/format";
import { IconDownload, IconReceipt } from "./Icons";

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

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-htech-darker">{formatMoney(fatura.valor)}</span>
                  {fatura.link ? (
                    <a
                      href={fatura.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Baixar boleto"
                      className="flex items-center gap-1 rounded-lg bg-htech px-3 py-1.5 text-sm font-medium text-white transition hover:bg-htech-dark"
                    >
                      <IconDownload width={14} height={14} />
                      Boleto
                    </a>
                  ) : (
                    <span className="text-sm text-htech-gray">Sem boleto</span>
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