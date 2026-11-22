import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: FaCheckCircle, className: "border-emerald-500/40 text-emerald-200", iconClass: "text-emerald-400" },
  error: { icon: FaExclamationCircle, className: "border-red-500/40 text-red-200", iconClass: "text-red-400" },
  warning: { icon: FaExclamationCircle, className: "border-amber-500/40 text-amber-100", iconClass: "text-amber-400" },
  info: { icon: FaInfoCircle, className: "border-violet-500/40 text-violet-100", iconClass: "text-violet-300" },
};

// showToast(message, type?, { action: { label, onClick }, duration })
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const showToast = useCallback(
    (message, type = "success", options = {}) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-3), { id, message, type, action: options.action }]);
      setTimeout(() => dismiss(id), options.duration || (options.action ? 7000 : 3500));
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 top-4 z-[200] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:top-6">
        {toasts.map((toast) => {
          const style = STYLES[toast.type] || STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className={`animate-fadeIn pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-gray-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl ${style.className}`}
            >
              <Icon className={`mt-0.5 shrink-0 ${style.iconClass}`} aria-hidden="true" />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action.onClick();
                    dismiss(toast.id);
                  }}
                  className="shrink-0 cursor-pointer rounded-lg bg-violet-500/20 px-2.5 py-1 text-xs font-semibold text-violet-100 hover:bg-violet-500/30"
                >
                  {toast.action.label}
                </button>
              )}
              <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss" className="shrink-0 cursor-pointer text-gray-500 hover:text-white">
                <FaTimes aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
};
