import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useContact } from "./hooks/useContact";
import { useSgpCliente } from "./hooks/useSgp";
import ClientHeader from "./components/ClientHeader";
import ContractCard from "./components/ContractCard";
import InvoiceList from "./components/InvoiceList";

// Aceita /?contactId=ID ou /ID
function getContactId() {
  const fromQuery = new URLSearchParams(window.location.search).get("contactId");
  if (fromQuery) return fromQuery;

  const fromPath = window.location.pathname.split("/").filter(Boolean)[0];
  if (fromPath) return decodeURIComponent(fromPath);

  return (import.meta.env.DEV && import.meta.env.VITE_DEV_CONTACT_ID) || null;
}

const contactId = getContactId();

function contactErrorMessage(error) {
  if (error?.status === 404 || error?.status === 400) {
    return "Contato não encontrado na wts.chat. Verifique se o ID está correto.";
  }
  return "Não foi possível carregar os dados do contato. Tente novamente em instantes.";
}

function sgpErrorMessage(error) {
  if (error?.status === 404) return "Nenhum cliente com este CPF/CNPJ foi encontrado no SGP.";
  if (error?.status === 504) return "O SGP demorou para responder. Tente novamente em instantes.";
  return "Não foi possível consultar o SGP. Tente novamente em instantes.";
}

function Shell({ children }) {
  return <main className="w-full p-4">{children}</main>;
}

function Message({ tone = "info", children }) {
  const styles = {
    info: "border-htech-100 bg-htech-50 text-htech-darker",
    warn: "border-amber-200 bg-amber-50 text-amber-700",
    error: "border-red-200 bg-red-50 text-red-700"
  };
  return <div className={`rounded-xl border p-4 text-sm ${styles[tone]}`}>{children}</div>;
}

export default function App() {
  const queryClient = useQueryClient();
  const contact = useContact(contactId);
  const devCpf = import.meta.env.DEV ? String(import.meta.env.VITE_DEV_CPF || "").replace(/\D/g, "") : "";
  const cpfCnpj = devCpf || contact.data?.cpfCnpj || "";
  const sgp = useSgpCliente(cpfCnpj);
  const [selectedId, setSelectedId] = useState(null);

  if (!contactId) {
    return (
      <Shell>
        <Message tone="error">Nenhum contato informado. Abra este popup a partir de um atendimento.</Message>
      </Shell>
    );
  }

  if (contact.isLoading) return <Shell><Message>Carregando contato...</Message></Shell>;
  if (contact.error) return <Shell><Message tone="error">{contactErrorMessage(contact.error)}</Message></Shell>;

  if (!cpfCnpj) {
    return (
      <Shell>
        <Message tone="error">Este contato não tem o campo "cpf-cnpj" preenchido na wts.chat.</Message>
      </Shell>
    );
  }

  if (sgp.isLoading) return <Shell><Message>Buscando cliente no SGP...</Message></Shell>;
  if (sgp.error) return <Shell><Message tone="error">{sgpErrorMessage(sgp.error)}</Message></Shell>;

  const { cliente, resumo, contratos, avisos = [] } = sgp.data;
  const contrato = contratos.find(c => c.id === selectedId) || contratos[0];

  return (
    <Shell>
      <ClientHeader
        nome={cliente.nome}
        cpfCnpj={cliente.cpfCnpj}
        resumo={resumo}
        refreshing={sgp.isFetching}
        onRefresh={() => queryClient.invalidateQueries()}
      />

      {avisos.map(aviso => (
        <div key={aviso} className="mt-3">
          <Message tone="warn">{aviso}</Message>
        </div>
      ))}

      {contratos.length > 1 && (
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {contratos.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium transition ${
                c.id === contrato.id
                  ? "border-htech-darker bg-htech-darker text-white"
                  : "border-htech-100 bg-htech-50 text-htech-dark hover:border-htech hover:text-htech-darker"
              }`}
            >
              Contrato {c.id}
              {c.faturas.length > 0 && ` · ${c.faturas.length} em aberto`}
            </button>
          ))}
        </nav>
      )}

      <div className="mt-3 grid grid-cols-2 items-start gap-3">
        <ContractCard contrato={contrato} />
        <InvoiceList faturas={contrato.faturas} total={contrato.totalAberto} />
      </div>
    </Shell>
  );
}