import { useState } from "react";

import { useAcao, useOnu, useWifi } from "../hooks/useSgp";
import { apiErrorMessage } from "../services/api";
import { copyText } from "../utils/clipboard";
import ConfirmDialog from "./ConfirmDialog";
import { IconCheck, IconCopy, IconEdit, IconEye, IconEyeOff, IconWifi } from "./Icons";

const DEBUG = new URLSearchParams(window.location.search).has("debug");

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:border-htech focus:outline-none focus:ring-2 focus:ring-htech-100";

function WifiRow({ rede }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (rede.senha && (await copyText(rede.senha))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
      <span className="rounded-full bg-htech-50 py-0.5 text-center text-sm font-semibold text-htech-darker">
        {rede.banda}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-htech-gray">Rede</p>
        <p className="truncate text-sm font-semibold text-slate-800" title={rede.ssid}>
          {rede.ssid || "—"}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-sm text-htech-gray">Senha</p>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className="truncate">{rede.senha ? (visible ? rede.senha : "••••••••") : "—"}</span>
          {rede.senha && (
            <>
              <button
                onClick={() => setVisible(v => !v)}
                title={visible ? "Ocultar senha" : "Mostrar senha"}
                className="shrink-0 text-htech hover:text-htech-darker"
              >
                {visible ? <IconEyeOff width={15} height={15} /> : <IconEye width={15} height={15} />}
              </button>
              <button onClick={copy} title="Copiar senha" className="shrink-0 text-htech hover:text-htech-darker">
                {copied ? <IconCheck width={15} height={15} /> : <IconCopy width={15} height={15} />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function validar(form) {
  const erros = {};
  form.forEach((r, i) => {
    const ssid = r.ssid.trim();
    if (!ssid || ssid.length > 32) erros[`${i}-ssid`] = "O nome deve ter entre 1 e 32 caracteres.";
    if (r.senha && (r.senha.length < 8 || r.senha.length > 63)) {
      erros[`${i}-senha`] = "A senha deve ter entre 8 e 63 caracteres.";
    }
  });
  return erros;
}

function WifiEditDialog({ redes, servicoId, onClose, onDone }) {
  const acao = useAcao();
  const [form, setForm] = useState(() => redes.map(r => ({ id: r.id, banda: r.banda, ssid: r.ssid || "", senha: "" })));
  const [erros, setErros] = useState({});

  function update(index, field, value) {
    setForm(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    setErros(prev => ({ ...prev, [`${index}-${field}`]: undefined }));
  }

  function confirm() {
    const novosErros = validar(form);
    if (Object.values(novosErros).some(Boolean)) {
      setErros(novosErros);
      return;
    }

    const mudancas = form.filter((r, i) => r.ssid.trim() !== (redes[i].ssid || "") || r.senha);
    if (!mudancas.length) {
      onClose();
      return;
    }

    acao.mutate(
      {
        acao: "alterar-wifi",
        servicoId,
        redes: mudancas.map(r => ({ id: r.id, ssid: r.ssid.trim(), senha: r.senha }))
      },
      { onSuccess: () => onDone("Alteração enviada. O roteador pode levar alguns minutos para aplicar.") }
    );
  }

  return (
    <ConfirmDialog
      open
      icon={<IconWifi width={20} height={20} />}
      title="Alterar Wi-Fi"
      description="O cliente será desconectado do Wi-Fi e precisará entrar de novo com os novos dados."
      confirmLabel="Salvar alterações"
      loading={acao.isPending}
      error={acao.isError ? apiErrorMessage(acao.error, "Não foi possível alterar o Wi-Fi.") : ""}
      onConfirm={confirm}
      onCancel={onClose}
    >
      <div className="mt-3 space-y-3">
        {form.map((r, i) => (
          <div key={r.id || i} className="rounded-lg border border-htech-100 p-3">
            <p className="mb-2 text-sm font-semibold text-htech-darker">{r.banda}</p>

            <label className="block text-sm text-slate-600">
              Nome da rede
              <input value={r.ssid} maxLength={32} onChange={e => update(i, "ssid", e.target.value)} className={inputClass} />
            </label>
            {erros[`${i}-ssid`] && <p className="mt-1 text-sm text-red-600">{erros[`${i}-ssid`]}</p>}

            <label className="mt-2 block text-sm text-slate-600">
              Nova senha
              <input
                value={r.senha}
                maxLength={63}
                placeholder="Deixe em branco para manter a atual"
                onChange={e => update(i, "senha", e.target.value)}
                className={inputClass}
              />
            </label>
            {erros[`${i}-senha`] && <p className="mt-1 text-sm text-red-600">{erros[`${i}-senha`]}</p>}
          </div>
        ))}
      </div>
    </ConfirmDialog>
  );
}

export default function WifiCard({ contratoId }) {
  const { data: onu, isLoading: onuLoading } = useOnu(contratoId);
  const servicoId = onu?.servicoId;
  const { data, isLoading, error } = useWifi(servicoId);
  const redes = data?.redes || [];
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState("");

  let body;
  if (onuLoading || (servicoId && isLoading)) {
    body = (
      <div className="space-y-2 p-3">
        {[0, 1].map(i => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-htech-50" />
        ))}
      </div>
    );
  } else if (!servicoId) {
    body = <p className="p-4 text-sm text-htech-gray">Roteador não encontrado no SGP para este contrato.</p>;
  } else if (error) {
    body = <p className="p-4 text-sm text-red-600">{apiErrorMessage(error, "Não foi possível ler o Wi-Fi do roteador.")}</p>;
  } else if (!redes.length) {
    body = <p className="p-4 text-sm text-htech-gray">Nenhuma rede Wi-Fi encontrada no roteador.</p>;
  } else {
    body = (
      <div className="space-y-2 p-3">
        {redes.map((rede, i) => (
          <WifiRow key={rede.id || i} rede={rede} />
        ))}
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-htech-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-htech-100 bg-htech-50 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-htech-darker">
          <IconWifi className="text-htech" />
          Wi-Fi
        </h2>
        {redes.length > 0 && (
          <button
            onClick={() => {
              setFeedback("");
              setEditing(true);
            }}
            className="flex items-center gap-1 rounded-lg bg-htech px-3 py-1 text-sm font-medium text-white transition hover:bg-htech-dark"
          >
            <IconEdit width={14} height={14} />
            Alterar Wi-Fi
          </button>
        )}
      </div>

      {body}

      {feedback && <p className="mx-3 mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{feedback}</p>}

      {DEBUG && data?.raw && (
        <details className="mx-3 mb-3 text-sm">
          <summary className="cursor-pointer text-htech-dark">Resposta do Wi-Fi (debug)</summary>
          <pre className="mt-2 max-h-48 overflow-auto rounded bg-htech-50 p-2 text-sm text-slate-700">
            {JSON.stringify(data.raw, null, 2)}
          </pre>
        </details>
      )}

      {editing && (
        <WifiEditDialog
          redes={redes}
          servicoId={servicoId}
          onClose={() => setEditing(false)}
          onDone={message => {
            setEditing(false);
            setFeedback(message);
          }}
        />
      )}
    </section>
  );
}