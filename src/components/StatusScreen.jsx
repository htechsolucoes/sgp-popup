import { useState } from "react";

import { IconAlert, IconRefresh } from "./Icons";

const LOGO_SRC = "/logo-htech.png";

function Logo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="text-3xl font-bold tracking-tight text-htech">htech</span>;
  }

  return <img src={LOGO_SRC} alt="Htech" className="h-12 w-auto" onError={() => setFailed(true)} />;
}

/** Tela cheia para carregamento e erros gerais. */
export default function StatusScreen({ loading, message, title, description, onRetry }) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-white p-6 text-center">
      <Logo />

      {loading ? (
        <>
          <div className="mt-8 h-10 w-10 animate-spin rounded-full border-4 border-htech-100 border-t-htech" />
          {message && <p className="mt-4 text-sm text-htech-gray">{message}</p>}
        </>
      ) : (
        <div className="mt-8 flex max-w-sm flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <IconAlert width={24} height={24} />
          </div>
          <p className="mt-4 text-base font-semibold text-htech-darker">{title}</p>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-5 flex items-center gap-1.5 rounded-lg bg-htech px-4 py-2 text-sm font-medium text-white transition hover:bg-htech-dark"
            >
              <IconRefresh width={15} height={15} />
              Tentar novamente
            </button>
          )}
        </div>
      )}
    </main>
  );
}