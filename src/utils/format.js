const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatMoney = value => brl.format(Number(value) || 0);

function parseDate(value) {
  if (!value) return null;
  const iso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const br = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return new Date(+br[3], +br[2] - 1, +br[1]);
  return null;
}

export function formatDate(value) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString("pt-BR") : "—";
}

export function dueLabel(value) {
  const date = parseDate(value);
  if (!date) return { text: "", late: false };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((date - today) / 86_400_000);

  if (days === 0) return { text: "Vence hoje", late: false };
  if (days > 0) return { text: `Vence em ${days} ${days === 1 ? "dia" : "dias"}`, late: false };
  return { text: `Vencida há ${-days} ${days === -1 ? "dia" : "dias"}`, late: true };
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export const formatDecimal = (value, digits = 1) => value.toFixed(digits).replace(".", ",");

/** "2026-11-12 07:11:55" ou "2026-11-12T07:11:55" -> Date no horário local. */
export function parseDateTime(value) {
  if (!value) return null;
  const date = new Date(String(value).trim().replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** -> "12/11 07:11" */
export function formatDateTimeShort(value) {
  const date = parseDateTime(value);
  if (!date) return "—";
  const pad = n => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** milissegundos -> "3d 4h 12min" */
export function formatDuration(ms) {
  if (ms === null || ms === undefined || ms < 0) return "—";
  const totalMin = Math.floor(ms / 60_000);
  const dias = Math.floor(totalMin / 1440);
  const horas = Math.floor((totalMin % 1440) / 60);
  const min = totalMin % 60;
  if (dias) return `${dias}d ${horas}h ${min}min`;
  if (horas) return `${horas}h ${min}min`;
  return `${min}min`;
}