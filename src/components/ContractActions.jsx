import { useState } from "react";

import { useAcao } from "../hooks/useSgp";
import { apiErrorMessage } from "../services/api";
import ConfirmDialog from "./ConfirmDialog";
import { IconLockOpen, IconPower, IconRouter } from "./Icons";

const CONFIG = {
  "reiniciar-onu": {
    icon: IconPower,
    title: "Reiniciar ONU?",
    description: id => `O cliente do contrato ${id} ficará sem internet por cerca de 2 minutos.`,
    confirmLabel: "Reiniciar",
    success: () => "Comando de reinício enviado para a ONU."
  },
  "reiniciar-roteador": {
    icon: IconRouter,
    title: "Reiniciar roteador?",
    description: id => `O roteador do contrato ${id} será reiniciado e o Wi-Fi ficará fora por alguns minutos.`,
    confirmLabel: "Reiniciar",
    success: () => "Comando de reinício enviado para o roteador."
  },
  liberar: {
    icon: IconLockOpen,
    tone: "warning",
    title: "Liberar por confiança?",
    description: id =>
      `O contrato ${id} será liberado temporariamente, conforme a regra de promessa de pagamento do SGP.`,
    confirmLabel: "Liberar",
    success: data => {
      const dias = data?.dados?.liberado_dias;
      const protocolo = data?.dados?.protocolo;
      return `Contrato liberado${dias ? ` por ${dias} ${dias === 1 ? "dia" : "dias"}` : ""}.${
        protocolo ? ` Protocolo ${protocolo}.` : ""
      }`;
    }
  }
};

/** Controla as ações do contrato: abre a confirmação, executa e devolve o feedback. */
export function useContractActions(contrato, onu) {
  const acao = useAcao();
  const [pending, setPending] = useState(null);
  const [feedback, setFeedback] = useState("");

  const payload = {
    "reiniciar-onu": { onuId: onu?.id },
    "reiniciar-roteador": { servicoId: onu?.servicoId },
    liberar: { contrato: contrato.id }
  };

  function open(name) {
    acao.reset();
    setFeedback("");
    setPending(name);
  }

  function close() {
    if (!acao.isPending) setPending(null);
  }

  function confirm() {
    const name = pending;
    acao.mutate(
      { acao: name, ...payload[name] },
      {
        onSuccess: data => {
          setPending(null);
          setFeedback(CONFIG[name].success(data));
          setTimeout(() => setFeedback(""), 6000);
        }
      }
    );
  }

  const cfg = pending ? CONFIG[pending] : null;
  const Icon = cfg?.icon;

  const dialog = (
    <ConfirmDialog
      open={Boolean(cfg)}
      tone={cfg?.tone}
      icon={Icon ? <Icon width={20} height={20} /> : null}
      title={cfg?.title}
      description={cfg?.description(contrato.id)}
      confirmLabel={cfg?.confirmLabel}
      loading={acao.isPending}
      error={acao.isError ? apiErrorMessage(acao.error, "Não foi possível executar a ação.") : ""}
      onConfirm={confirm}
      onCancel={close}
    />
  );

  return { open, feedback, dialog };
}