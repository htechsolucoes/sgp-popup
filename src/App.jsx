import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { features } from "./config";
import { useContact } from "./hooks/useContact";
import { useSgpCliente } from "./hooks/useSgp";
import { formatCpfCnpj } from "./services/api";
import ClientHeader from "./components/ClientHeader";
import ContractCard from "./components/ContractCard";
import InvoiceList from "./components/InvoiceList";
import MaintenanceBanner from "./components/MaintenanceBanner";
import PppoeCard from "./components/PppoeCard";
import StatusScreen from "./components/StatusScreen";
import WifiCard from "./components/WifiCard";

// Aceita /?contactId=ID ou /ID
function getContactId() {
  const fromQuery = new URLSearchParams(window.location.search).get("contactId");
  if (fromQuery) return fromQuery;

  const fromPath = window.location.pathname.split("/").filter(Boolean)[0];
  if (fromPath) return decodeURIComponent(fromPath);

  // só no npm run dev: contato fixo do .env.development.local
  return (import.meta.env.DEV && import.meta.env.VITE_DEV_CONTACT_ID) || null;
}

const contactId = getContactId();

function contactError(error) {
  if (error?.status === 404 || error?.status === 400) {
    return {
      title: "Contato não encontrado",
      description: "Não encontramos este contato na Htech. Abra o popup de novo a partir da conversa."
    };
  }
  return {
    title: "Não foi possível carregar o contato",
    description: "A Htech não respondeu como esperado. Tente novamente em instantes."
  };
}

function sgpError(error, cpfCnpj) {
  if (error?.status === 404) {
    return {
      title: "Cliente não encontrado no SGP",
      description: `Nenhum cliente com o CPF/CNPJ ${formatCpfCnpj(cpfCnpj)} foi encontrado.`
    };
  }
  if (error?.status === 504) {
    return {
      title: "O SGP demorou para responder",
      description: "A consulta passou do tempo limite. Tente novamente em instantes."
    };
  }
  return {
    title: "Não foi possível consultar o SGP",
    description: "Ocorreu um erro ao buscar os dados do cliente. Tente novamente em instantes."
  };
}

function Shell({ children }) {
  return <main className="w-full p-4">{children}</main>;
}

export default function App() {
  const queryClient = useQueryClient();
  const contact = useContact(contactId);

  // só no npm run dev: VITE_DEV_CPF sobrescreve o CPF do contato
  const devCpf = import.meta.env.DEV ? String(import.meta.env.VITE_DEV_CPF || "").replace(/\D/g, "") : "";
  const cpfCnpj = devCpf || contact.data?.cpfCnpj || "";

  const sgp = useSgpCliente(cpfCnpj);
  const [selectedId, setSelectedId] = useState(null);

  if (!contactId) {
    return (
      <StatusScreen
        title="Nenhum atendimento selecionado"
        description="Abra este popup a partir de uma conversa na plataforma."
      />
    );
  }

  if (contact.isLoading) return <StatusScreen loading message="Carregando contato..." />;

  if (contact.error) {
    return <StatusScreen {...contactError(contact.error)} onRetry={() => contact.refetch()} />;
  }

  if (!cpfCnpj) {
    return (
      <StatusScreen
        title="CPF/CNPJ não informado"
        description='Preencha o campo "CPF/CNPJ" deste contato nos dados do contato e tente novamente.'
        onRetry={() => contact.refetch()}
      />
    );
  }

  if (sgp.isLoading) return <StatusScreen loading message="Buscando cliente no SGP..." />;

  if (sgp.error) {
    return <StatusScreen {...sgpError(sgp.error, cpfCnpj)} onRetry={() => sgp.refetch()} />;
  }

  const { cliente, resumo, contratos, avisos = [] } = sgp.data;
  const contrato = contratos.find(c => c.id === selectedId) || contratos[0];

  return (
    <Shell>
      <MaintenanceBanner key={`m-${contrato.id}`} contrato={contrato} />

      <ClientHeader
        nome={cliente.nome}
        cpfCnpj={cliente.cpfCnpj}
        resumo={resumo}
        refreshing={sgp.isFetching}
        onRefresh={() => queryClient.invalidateQueries()}
      />

      {avisos.map(aviso => (
        <div key={aviso} className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {aviso}
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
        <div className="flex min-w-0 flex-col gap-3">
          <ContractCard key={`c-${contrato.id}`} contrato={contrato} />
          <PppoeCard key={`p-${contrato.id}`} login={contrato.login} />
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <InvoiceList faturas={contrato.faturas} total={contrato.totalAberto} />
          {features.wifi && <WifiCard key={`w-${contrato.id}`} contratoId={contrato.id} />}
        </div>
      </div>
    </Shell>
  );
}