import { usePppoe } from "../hooks/useSgp";
import { apiErrorMessage } from "../services/api";
import { formatDateTimeShort, formatDuration, parseDateTime } from "../utils/format";
import { IconPlug } from "./Icons";

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-htech-gray">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-800">{children || "—"}</p>
    </div>
  );
}

export default function PppoeCard({ login }) {
  const { data, isLoading, error } = usePppoe(login);

  const sessoes = data?.sessoes || [];
  const atual = sessoes.find(s => !s.fim);
  const encerradas = sessoes.filter(s => s.fim).sort((a, b) => b.fim.localeCompare(a.fim));
  const umDiaAtras = Date.now() - 24 * 60 * 60 * 1000;
  const quedas24h = encerradas.filter(s => (parseDateTime(s.fim)?.getTime() ?? 0) >= umDiaAtras).length;

  const online = data?.online ?? (data?.encontrado ? Boolean(atual) : null);
  const conectadoHa = atual ? Date.now() - (parseDateTime(atual.inicio)?.getTime() ?? Date.now()) : null;

  let body;
  if (!login) {
    body = <p className="p-4 text-sm text-htech-gray">Este contrato não tem login PPPoE.</p>;
  } else if (isLoading) {
    body = (
      <div className="grid grid-cols-2 gap-3 p-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-9 animate-pulse rounded bg-htech-50" />
        ))}
      </div>
    );
  } else if (error) {
    body = <p className="p-4 text-sm text-red-600">{apiErrorMessage(error, "Não foi possível consultar o PPPoE.")}</p>;
  } else if (!data?.encontrado) {
    body = <p className="p-4 text-sm text-htech-gray">Nenhuma sessão encontrada para o login {login}.</p>;
  } else {
    body = (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3">
        <Field label="Login">{data.login}</Field>
        <Field label="IP">{atual?.ip || data.ip}</Field>
        <Field label="Conectado há">{atual ? formatDuration(conectadoHa) : "Desconectado"}</Field>
        <Field label="Última desconexão">{encerradas[0] ? formatDateTimeShort(encerradas[0].fim) : ""}</Field>
        <div className="col-span-2 flex items-center gap-2 border-t border-slate-100 pt-2.5 text-sm">
          <span className="text-htech-gray">Quedas nas últimas 24h</span>
          <span
            className={`rounded-full px-2.5 py-0.5 font-semibold ${
              quedas24h >= 3 ? "bg-amber-100 text-amber-700" : "bg-htech-50 text-htech-darker"
            }`}
          >
            {quedas24h}
          </span>
          {encerradas[0]?.causa && (
            <span className="truncate text-htech-gray" title={encerradas[0].causa}>
              · última: {encerradas[0].causa}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-htech-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-htech-100 bg-htech-50 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-htech-darker">
          <IconPlug className="text-htech" />
          Sessão PPPoE
        </h2>
        {online !== null && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-sm font-medium ${
              online ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {online ? "Autenticado" : "Desconectado"}
          </span>
        )}
      </div>
      {body}
    </section>
  );
}