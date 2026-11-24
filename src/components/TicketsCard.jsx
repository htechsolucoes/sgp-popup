import { useState } from "react";

import { useAcao, useChamadoOpcoes, useChamados } from "../hooks/useSgp";
import { apiErrorMessage } from "../services/api";
import { formatDate, formatDateTimeShort } from "../utils/format";
import ConfirmDialog from "./ConfirmDialog";
import { IconPlus, IconTicket } from "./Icons";

const STATUS_STYLE = {
  0: "bg-htech-100 text-htech-darker", // Aberto
  2: "bg-amber-100 text-amber-700", // Em execução
  3: "bg-slate-100 text-slate-600" // Pendente
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-htech focus:outline-none focus:ring-2 focus:ring-htech-100";

// "2026-11-20" -> "20/11/2026" | "2026-11-20 14:30:00" -> "20/11 14:30"
const formatData = value => (String(value || "").length > 10 ? formatDateTimeShort(value) : formatDate(value));

function TicketItem({ chamado }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-lg border border-slate-100 px-3 py-2 transition hover:border-htech-100 hover:bg-htech-50">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left" title={open ? "Recolher" : "Ver detalhes"}>
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
            {chamado.tipo || "Chamado"}
            <span className="font-normal text-htech-gray"> · #{chamado.numero}</span>
          </p>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-medium ${
              STATUS_STYLE[chamado.statusId] || STATUS_STYLE[3]
            }`}
          >
            {chamado.status}
          </span>
        </div>

        <p className="text-sm text-htech-gray">
          Aberto em {formatData(chamado.abertura)}
          {chamado.responsavel && ` · ${chamado.responsavel}`}
        </p>

        {chamado.conteudo && (
          <p className={`mt-1 whitespace-pre-line text-sm text-slate-600 ${open ? "" : "line-clamp-2"}`}>
            {chamado.conteudo}
          </p>
        )}
      </button>

      {open && chamado.ordensServico.length > 0 && (
        <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
          {chamado.ordensServico.map(os => (
            <p key={os.id} className="text-sm text-slate-600">
              <span className="font-medium text-htech-darker">OS #{os.id}</span>
              {os.status && ` · ${os.status}`}
              {os.motivo && ` · ${os.motivo}`}
              {os.responsavel && ` · Técnico: ${os.responsavel}`}
              {os.agendamento && ` · Agendada ${formatData(os.agendamento)}`}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}

function NewTicketDialog({ contratoId, contato, onClose, onDone }) {
  const acao = useAcao();
  const { data: opcoes, isLoading: opcoesLoading } = useChamadoOpcoes();
  const [tipo, setTipo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [gerarOs, setGerarOs] = useState(true);
  const [erro, setErro] = useState("");

  const tipos = opcoes?.tipos || [];
  const motivos = opcoes?.motivos || [];

  function confirm() {
    if (conteudo.trim().length < 10) {
      setErro("Descreva o problema com pelo menos 10 caracteres.");
      return;
    }

    acao.mutate(
      {
        acao: "criar-chamado",
        contrato: contratoId,
        tipo,
        motivo: gerarOs ? motivo : "",
        conteudo: conteudo.trim(),
        gerarOs,
        contatoNome: contato?.name || "",
        contatoTelefone: contato?.phone || ""
      },
      {
        onSuccess: data => {
          const protocolo = data?.dados?.protocolo;
          onDone(`Chamado aberto${protocolo ? `. Protocolo ${protocolo}` : ""}.`);
        }
      }
    );
  }

  return (
    <ConfirmDialog
      open
      icon={<IconTicket width={20} height={20} />}
      title="Novo chamado"
      description={`Contrato ${contratoId}`}
      confirmLabel="Abrir chamado"
      loading={acao.isPending}
      error={acao.isError ? apiErrorMessage(acao.error, "Não foi possível abrir o chamado.") : ""}
      onConfirm={confirm}
      onCancel={onClose}
    >
      <div className="mt-3 space-y-3">
        {opcoesLoading && <p className="text-sm text-htech-gray">Carregando tipos de chamado...</p>}

        {tipos.length > 0 && (
          <label className="block text-sm text-slate-600">
            Tipo
            <select value={tipo} onChange={e => setTipo(e.target.value)} className={inputClass}>
              <option value="">Padrão do SGP</option>
              {tipos.map(t => (
                <option key={t.codigo} value={t.codigo}>
                  {t.descricao}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block text-sm text-slate-600">
          Descrição
          <textarea
            rows={4}
            maxLength={2000}
            value={conteudo}
            placeholder="Ex.: Cliente sem internet desde ontem à noite, ONU com luz LOS vermelha."
            onChange={e => {
              setConteudo(e.target.value);
              setErro("");
            }}
            className={`${inputClass} resize-none`}
          />
        </label>
        {erro && <p className="-mt-2 text-sm text-red-600">{erro}</p>}

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={gerarOs}
            onChange={e => setGerarOs(e.target.checked)}
            className="h-4 w-4 accent-htech"
          />
          Gerar ordem de serviço
        </label>

        {gerarOs && motivos.length > 0 && (
          <label className="block text-sm text-slate-600">
            Motivo da OS
            <select value={motivo} onChange={e => setMotivo(e.target.value)} className={inputClass}>
              <option value="">Não informar</option>
              {motivos.map(m => (
                <option key={m.codigo} value={m.codigo}>
                  {m.descricao}
                </option>
              ))}
            </select>
          </label>
        )}

        {(contato?.name || contato?.phone) && (
          <p className="text-sm text-htech-gray">
            Contato: {[contato.name, contato.phone].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </ConfirmDialog>
  );
}

export default function TicketsCard({ contratoId, contato }) {
  const { data: chamados = [], isLoading, error } = useChamados(contratoId);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState("");

  let body;
  if (isLoading) {
    body = (
      <div className="space-y-2 p-3">
        {[0, 1].map(i => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-htech-50" />
        ))}
      </div>
    );
  } else if (error) {
    body = <p className="p-4 text-sm text-red-600">{apiErrorMessage(error, "Não foi possível carregar os chamados.")}</p>;
  } else if (!chamados.length) {
    body = <p className="p-4 text-sm text-htech-gray">Nenhum chamado em aberto neste contrato.</p>;
  } else {
    body = (
      <ul className="max-h-[260px] space-y-2 overflow-y-auto p-3">
        {chamados.map(chamado => (
          <TicketItem key={chamado.numero} chamado={chamado} />
        ))}
      </ul>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-htech-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-htech-100 bg-htech-50 px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-htech-darker">
          <IconTicket className="text-htech" />
          Chamados em aberto
          {chamados.length > 0 && (
            <span className="rounded-full bg-htech px-2 py-0.5 text-sm font-semibold text-white">{chamados.length}</span>
          )}
        </h2>
        <button
          onClick={() => {
            setFeedback("");
            setCreating(true);
          }}
          className="flex items-center gap-1 rounded-lg bg-htech px-3 py-1 text-sm font-medium text-white transition hover:bg-htech-dark"
        >
          <IconPlus width={14} height={14} />
          Novo chamado
        </button>
      </div>

      {body}

      {feedback && <p className="mx-3 mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{feedback}</p>}

      {creating && (
        <NewTicketDialog
          contratoId={contratoId}
          contato={contato}
          onClose={() => setCreating(false)}
          onDone={message => {
            setCreating(false);
            setFeedback(message);
          }}
        />
      )}
    </section>
  );
}
