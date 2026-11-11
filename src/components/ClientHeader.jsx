import { useState } from "react";

import { formatCpfCnpj } from "../services/api";
import { formatMoney, initials } from "../utils/format";
import { IconCheck, IconCopy, IconRefresh } from "./Icons";

function Chip({ children, highlight }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${
        highlight ? "border-htech/30 bg-htech/10 text-htech" : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {children}
    </span>
  );
}

export default function ClientHeader({ nome, cpfCnpj, resumo, onRefresh, refreshing }) {
  const [copied, setCopied] = useState(false);
  const docLabel = cpfCnpj.length === 14 ? "CNPJ" : "CPF";

  async function copy() {
    try {
      await navigator.clipboard.writeText(cpfCnpj);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* navegador bloqueou a área de transferência */
    }
  }

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-htech text-sm font-semibold text-white">
          {initials(nome)}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold uppercase text-slate-800" title={nome}>
            {nome}
          </h1>
          <button
            onClick={copy}
            title="Copiar"
            className="flex items-center gap-1 text-xs text-htech-gray transition hover:text-htech"
          >
            {docLabel} {formatCpfCnpj(cpfCnpj)}
            {copied ? <IconCheck width={13} height={13} /> : <IconCopy width={13} height={13} />}
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Chip>
          {resumo.contratos} {resumo.contratos === 1 ? "contrato" : "contratos"}
        </Chip>
        <Chip highlight={resumo.faturasAbertas > 0}>
          {resumo.faturasAbertas} em aberto · {formatMoney(resumo.totalAberto)}
        </Chip>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Atualizar"
          className="rounded-lg border border-slate-200 bg-white p-2 text-htech-gray transition hover:border-htech hover:text-htech disabled:opacity-50"
        >
          <IconRefresh className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}