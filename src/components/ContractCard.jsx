import { useOnu } from "../hooks/useSgp";
import { formatDecimal } from "../utils/format";
import { IconPin } from "./Icons";

const STATUS_STYLE = {
  1: "bg-emerald-50 text-emerald-700", // Ativo
  2: "bg-slate-100 text-slate-600", // Inativo
  3: "bg-red-50 text-red-700", // Cancelado
  4: "bg-amber-50 text-amber-700", // Suspenso
  5: "bg-amber-50 text-amber-700" // Reduzido
};

const DEBUG = new URLSearchParams(window.location.search).has("debug");

function signalInfo(rx) {
  if (rx >= -25 && rx <= -8) return { label: "Bom", bar: "bg-emerald-500", text: "text-emerald-600" };
  if (rx >= -27 && rx < -25) return { label: "Atenção", bar: "bg-amber-500", text: "text-amber-600" };
  return { label: "Crítico", bar: "bg-red-500", text: "text-red-600" };
}

// marcador: -30 dBm (0%) até -10 dBm (100%)
const signalPosition = rx => Math.min(100, Math.max(0, ((rx + 30) / 20) * 100));

function Tile({ label, children }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-htech-gray">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default function ContractCard({ contrato }) {
  const { data: onu, isLoading, error } = useOnu(contrato.id);

  const fallback = isLoading ? (
    <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
  ) : (
    <span className="text-sm text-htech-gray">
      {error ? "Indisponível" : onu && !onu.encontrada ? "Sem ONU" : "Sem dados"}
    </span>
  );

  const conexao = onu?.conexao || "";
  const conexaoLower = conexao.toLowerCase();
  const online = conexaoLower.includes("online") ? true : conexaoLower.includes("offline") ? false : null;

  const rx = onu?.rx ?? null;
  const signal = rx !== null ? signalInfo(rx) : null;

  const temperatura = onu?.temperatura ?? null;
  const distancia = onu?.distanciaKm ?? null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-800">
          Contrato {contrato.id}
          {contrato.plano && <span className="font-normal text-slate-500"> · {contrato.plano}</span>}
        </h2>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            STATUS_STYLE[contrato.statusCodigo] || STATUS_STYLE[2]
          }`}
        >
          {contrato.status || "—"}
        </span>
      </div>

      {contrato.endereco && (
        <p className="mt-2 flex gap-1.5 text-xs uppercase leading-relaxed text-slate-500">
          <IconPin className="mt-0.5 shrink-0 text-htech-gray" width={13} height={13} />
          {contrato.endereco}
        </p>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Tile label="Conexão">
          {conexao ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
              <span
                className={`h-2 w-2 rounded-full ${
                  online === true ? "bg-emerald-500" : online === false ? "bg-red-500" : "bg-htech-gray"
                }`}
              />
              {conexao}
            </span>
          ) : (
            fallback
          )}
        </Tile>

        <Tile label="Sinal ONU">
          {signal ? (
            <>
              <p className="text-sm font-medium text-slate-800">{formatDecimal(rx)} dBm</p>
              <div className="relative mt-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-500">
                <span
                  className="absolute -top-0.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-white bg-slate-700"
                  style={{ left: `${signalPosition(rx)}%` }}
                />
              </div>
              <p className={`mt-1 text-[11px] font-medium ${signal.text}`}>{signal.label}</p>
            </>
          ) : (
            fallback
          )}
        </Tile>

        <Tile label="Equipamento">
          {temperatura !== null || distancia !== null ? (
            <>
              <p className="text-sm font-medium text-slate-800">
                {temperatura !== null ? `${formatDecimal(temperatura, 0)} °C` : "—"}
              </p>
              {distancia !== null && (
                <p className="text-[11px] text-htech-gray">{formatDecimal(distancia)} km da OLT</p>
              )}
            </>
          ) : (
            fallback
          )}
        </Tile>
      </div>

      {DEBUG && onu?.raw && (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer text-htech-gray">Resposta da ONU (debug)</summary>
          <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-50 p-2 text-slate-700">
            {JSON.stringify(onu.raw, null, 2)}
          </pre>
        </details>
      )}
    </section>
  );
}