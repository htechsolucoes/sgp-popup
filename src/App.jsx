import { useUsers } from "./hooks/useUsers";
import { useToggleAvailability } from "./hooks/useToggleAvailability";

export default function App() {
  const { data: users = [], isLoading, error } = useUsers();
  const toggle = useToggleAvailability();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Atendentes</h1>

      {isLoading && <p className="text-slate-500">Carregando...</p>}
      {error && <p className="text-red-600">Erro: {error.message}</p>}

      <ul className="space-y-2">
        {users.map(user => {
          const available = user.available === "AVAILABLE";

          return (
            <li
              key={user.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-500">{user.profile}</p>
              </div>

              <button
                onClick={() =>
                  toggle.mutate({
                    user,
                    newAvailability: available ? "UNAVAILABLE" : "AVAILABLE"
                  })
                }
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  available ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {available ? "Disponível" : "Indisponível"}
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
