import { useContact } from "./hooks/useContact";
import { formatCpfCnpj } from "./services/api";

// Aceita /?contactId=ID ou /ID
function getContactId() {
  const fromQuery = new URLSearchParams(window.location.search).get("contactId");
  if (fromQuery) return fromQuery;

  const fromPath = window.location.pathname.split("/").filter(Boolean)[0];
  if (fromPath) return decodeURIComponent(fromPath);

  return null;
}

const contactId = getContactId();

function errorMessage(error) {
  if (error?.status === 404 || error?.status === 400) {
    return "Contato não encontrado na wts.chat. Verifique se o ID está correto.";
  }
  return "Não foi possível carregar os dados do contato. Tente novamente em instantes.";
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-slate-800">{value || "—"}</p>
    </div>
  );
}

function ErrorBox({ children }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{children}</div>
  );
}

export default function App() {
  const { data: contact, isLoading, error } = useContact(contactId);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Contato</h1>

      {!contactId && (
        <ErrorBox>Nenhum contato informado. Abra este popup a partir de um atendimento.</ErrorBox>
      )}

      {contactId && isLoading && <p className="text-slate-500">Carregando...</p>}

      {error && <ErrorBox>{errorMessage(error)}</ErrorBox>}

      {contact && (
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <Field label="Nome" value={contact.name} />
          <Field label="Telefone" value={contact.phone} />
          <Field label="E-mail" value={contact.email} />
          <Field label="CPF/CNPJ" value={formatCpfCnpj(contact.cpfCnpj)} />
          <Field label="ID" value={contact.id} />

          {/* Temporário: para vermos todos os campos que a wts.chat devolve */}
          <details className="text-sm">
            <summary className="cursor-pointer text-slate-500">Resposta completa</summary>
            <pre className="mt-2 overflow-auto rounded bg-slate-50 p-3 text-xs text-slate-700">
              {JSON.stringify(contact.raw, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </main>
  );
}