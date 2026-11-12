import { useManutencoes, useOnu } from "../hooks/useSgp";
import { formatDateTimeShort } from "../utils/format";
import { IconAlert } from "./Icons";

export default function MaintenanceBanner({ contrato }) {
  const { data: onu, isLoading: onuLoading } = useOnu(contrato.id);

  const filtro = { pop: contrato.popId, olt: onu?.oltId, slot: onu?.slot, pon: onu?.pon };
  const { data: lista = [] } = useManutencoes(filtro, !onuLoading);

  if (!lista.length) return null;

  return (
    <div className="mb-3 space-y-2">
      {lista.map(m => (
        <div
          key={m.id}
          className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800"
        >
          <IconAlert className="mt-0.5 shrink-0 text-amber-600" width={18} height={18} />
          <div className="min-w-0 flex-1">
            <span className="font-semibold">Manutenção na região</span>
            {m.descricao && <span> · {m.descricao}</span>}
            {m.mensagem && <p className="mt-0.5 text-amber-700">{m.mensagem}</p>}
          </div>
          {m.fim && (
            <span className="shrink-0 rounded-full bg-amber-200 px-2.5 py-0.5 font-medium">
              Previsão {formatDateTimeShort(m.fim)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}