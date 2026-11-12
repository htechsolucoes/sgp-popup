import { useState } from "react";
import { copyText } from "../utils/clipboard";
import { formatCpfCnpj } from "../services/api";
import { formatMoney, initials } from "../utils/format";
import { IconCheck, IconCopy, IconRefresh } from "./Icons";

function Chip({ children, highlight }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${
        highlight ? "bg-white text-htech-darker" : "border border-white/25 bg-white/15 text-white"
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
    if (await copyText(cpfCnpj)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <header className="flex items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-htech to-htech-darker p-4 text-white shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-htech-darker">
          {initials(nome)}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold uppercase" title={nome}>
            {nome}
          </h1>
          <button
            onClick={copy}
            title="Copiar"
            className="flex items-center gap-1 text-sm text-htech-100 transition hover:text-white"
          >
            {docLabel} {formatCpfCnpj(cpfCnpj)}
            {copied ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
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
          className="rounded-lg bg-white/15 p-2 text-white transition hover:bg-white/25 disabled:opacity-50"
        >
          <IconRefresh className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </header>
  );
}