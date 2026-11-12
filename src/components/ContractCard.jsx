import { useOnu } from "../hooks/useSgp";
import { formatDecimal } from "../utils/format";
import { IconPin } from "./Icons";

const STATUS_STYLE = {
  1: "bg-emerald-100 text-emerald-700", // Ativo
  2: "bg-slate-100 text-slate-600", // Inativo
  3: "bg-red-100 text-red-700", // Cancelado
  4: "bg-amber-100 text-amber-700", // Suspenso
  5: "bg-amber-100 text-amber-700" // Reduzido
};

const DEBUG = new URLSearchParams(window.location.search).has("debug");

function signalInfo(rx) {
  if (rx >= -25 && rx <= -8) return { label: "Bom", text: "text-emerald-600" };
  if (rx >= -27 && rx < -25) return { label: "Atenção", text: "text-amber-600" };
  return { label: "Crítico", text: "text-red-600" };
}

// marcador: -30 dBm (0%) até -10 dBm (100%)
const signalPosition = rx => Math.min(100, Math.max(0, ((rx + 30) / 20) * 100));

// "2026-11-12 07:11:55" -> "12/11 07:11"
function formatLeitura(value) {
  const m = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  return m ? `${m[3]}/${m[2]} ${m[4]}:${m[5]}` : "";
}

const dbm = value => `${formatDecimal(value, 2)} dBm`;

function Tile({ label, children }) {
  return (
    <div className="rounded-lg border border-htech-100 bg-htech-50 p-2.5">
      <p className="text-sm font-medium text-htech-dark">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default function ContractCard({ contrato }) {
  const { data: onu, isLoading, error } = useOnu(contrato.id);

  const fallback = isLoading ? (
    <div className="h-5 w-16 animate-pulse rounded bg-htech-100" />
  ) : (
    <span className="text-sm text-htech-gray">
      {error ? "Indisponível" : onu && !onu.encontrada ? "Sem ONU" : "Sem dados"}
    </span>
  );

  const online = onu?.online ?? null;
  const rx = onu?.rx ?? null;
  const signal = rx !== null ? signalInfo(rx) : null;
  const leitura = formatLeitura(onu?.leitura);

  const tx = onu?.tx ?? null;
  const oltRx = onu?.oltRx ?? null;
  const temEquipamento = tx !== null || oltRx !== null;

  return (
    <section className="overflow-hidden rounded-xl border border-htech-100 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-2 border-b border-htech-100 bg-htech-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-htech-darker">
          Contrato {contrato.id}
          {contrato.plano && <span className="font-normal text-htech-dark"> · {contrato.plano}</span>}
        </h2>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-medium ${
            STATUS_STYLE[contrato.statusCodigo] || STATUS_STYLE[2]
          }`}
        >
          {contrato.status || "—"}
        </span>
      </div>

      <div className="p-4">
        {contrato.endereco && (
          <p className="flex gap-1.5 text-sm uppercase leading-relaxed text-slate-600">
            <IconPin className="mt-0.5 shrink-0 text-htech" width={15} height={15} />
            {contrato.endereco}
          </p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Tile label="Conexão">
            {online !== null ? (
              <>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <span className={`h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-500" : "bg-red-500"}`} />
                  {online ? "Online" : "Offline"}
                </span>
                {onu?.olt && (
                  <p className="mt-1 truncate text-sm text-htech-gray" title={`${onu.olt} ${onu.posicao}`}>
                    {onu.olt}
                  </p>
                )}
              </>
            ) : (
              fallback
            )}
          </Tile>

          <Tile label="Sinal ONU">
            {signal ? (
              <>
                <p className="text-sm font-semibold text-slate-800">{dbm(rx)}</p>
                <div className="relative mt-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-500">
                  <span
                    className="absolute -top-0.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2 border-white bg-htech-darker"
                    style={{ left: `${signalPosition(rx)}%` }}
                  />
                </div>
                <p className="mt-1 text-sm">
                  <span className={`font-medium ${signal.text}`}>{signal.label}</span>
                  {leitura && <span className="text-htech-gray"> · {leitura}</span>}
                </p>
              </>
            ) : (
              fallback
            )}
          </Tile>
        </div>

        {DEBUG && onu?.raw && (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-htech-dark">Resposta da ONU (debug)</summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded bg-htech-50 p-2 text-sm text-slate-700">
              {JSON.stringify(onu.raw, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </section>
  );
}