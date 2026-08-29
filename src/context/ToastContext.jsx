const { createContext, useContext, useState, useCallback } = React;

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Floating Toast Portal Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 dark:bg-emerald-950/90 text-emerald-100 border-emerald-700/50 shadow-emerald-950/40'
                : toast.type === 'error'
                ? 'bg-rose-950/90 dark:bg-rose-950/90 text-rose-100 border-rose-700/50 shadow-rose-950/40'
                : 'bg-indigo-950/90 dark:bg-indigo-950/90 text-indigo-100 border-indigo-700/50 shadow-indigo-950/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <span className="text-emerald-400">✓</span>}
              {toast.type === 'error' && <span className="text-rose-400">✕</span>}
              {toast.type === 'info' && <span className="text-indigo-400">ℹ</span>}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
