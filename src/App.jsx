import { useContact } from "./hooks/useContact";

// Provisório: depois o ID virá da wts.chat. Por enquanto, ?contactId=... na URL sobrescreve.
const DEFAULT_CONTACT_ID = "862e827f-5003-4dd9-ab75-1624c1fd7ddd";

function getContactId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("contactId") || DEFAULT_CONTACT_ID;
}

const contactId = getContactId();

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-slate-800">{value || "—"}</p>
    </div>
  );
}

export default function App() {
  const { data: contact, isLoading, error } = useContact(contactId);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Contato</h1>

      {isLoading && <p className="text-slate-500">Carregando...</p>}
      {error && <p className="text-red-600">Erro: {error.message}</p>}

      {contact && (
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <Field label="Nome" value={contact.name} />
          <Field label="Telefone" value={contact.phone} />
          <Field label="E-mail" value={contact.email} />
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