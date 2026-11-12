export default function ConfirmDialog({
  open,
  icon,
  title,
  description,
  confirmLabel = "Confirmar",
  tone = "primary",
  loading,
  error,
  onConfirm,
  onCancel,
  children
}) {
  if (!open) return null;

  const warning = tone === "warning";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex gap-3 overflow-y-auto p-4">
          {icon && (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                warning ? "bg-amber-50 text-amber-600" : "bg-htech-50 text-htech"
              }`}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-htech-darker">{title}</p>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
            {children}
            {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white transition disabled:opacity-60 ${
              warning ? "bg-amber-600 hover:bg-amber-700" : "bg-htech hover:bg-htech-dark"
            }`}
          >
            {loading ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}