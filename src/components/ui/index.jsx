// Sonora UI kit: small, consistent building blocks used by every page.
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

const cx = (...classes) => classes.filter(Boolean).join(" ");

// ===== Button =====
const VARIANTS = {
  primary:
    "bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:brightness-110",
  secondary:
    "border border-violet-500/30 bg-violet-500/10 text-violet-200 hover:border-violet-400/50 hover:bg-violet-500/20",
  ghost: "text-gray-300 hover:bg-white/5 hover:text-white",
  danger:
    "border border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-400/60 hover:bg-red-500/20",
  success:
    "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
};
const SIZES = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
  icon: "h-10 w-10 justify-center",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon: Icon,
  className,
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <FaSpinner className="animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}

export const Spinner = ({ className }) => (
  <FaSpinner
    className={cx("animate-spin text-violet-400", className)}
    aria-label="Loading"
  />
);

// ===== Form fields =====
const fieldBase =
  "w-full rounded-xl border bg-gray-900/70 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30";

function Field({ id, label, error, hint, counter, required, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-sm font-medium text-gray-300">
            {label}
            {required && <span className="ml-0.5 text-fuchsia-400">*</span>}
          </label>
          {counter}
        </div>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const Counter = ({ value, max }) =>
  max ? (
    <span
      className={cx(
        "text-xs",
        (value || "").length > max ? "text-red-400" : "text-gray-500",
      )}
    >
      {(value || "").length}/{max}
    </span>
  ) : null;

export function Input({
  label,
  error,
  hint,
  maxLength,
  showCounter,
  required,
  className,
  id: idProp,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      counter={showCounter && <Counter value={props.value} max={maxLength} />}
    >
      <input
        id={id}
        maxLength={maxLength}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={cx(
          fieldBase,
          error ? "border-red-500/60" : "border-violet-500/20",
          className,
        )}
        {...props}
      />
    </Field>
  );
}

export function PasswordInput({
  label,
  error,
  hint,
  maxLength,
  required,
  className,
  id: idProp,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  const [visible, setVisible] = useState(false);
  const input = (
    <div className="relative">
      <input
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        maxLength={maxLength}
        required={required}
        aria-invalid={Boolean(error) || props["aria-invalid"] || undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={cx(
          className || fieldBase,
          !className && (error ? "border-red-500/60" : "border-violet-500/20"),
          "pr-12",
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
      >
        {visible ? (
          <FaEyeSlash aria-hidden="true" />
        ) : (
          <FaEye aria-hidden="true" />
        )}
      </button>
    </div>
  );

  return label || error || hint ? (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      {input}
    </Field>
  ) : (
    input
  );
}

export function Textarea({
  label,
  error,
  hint,
  maxLength,
  required,
  rows = 4,
  className,
  id: idProp,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      counter={<Counter value={props.value} max={maxLength} />}
    >
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={Boolean(error) || undefined}
        className={cx(
          fieldBase,
          "resize-y",
          error ? "border-red-500/60" : "border-violet-500/20",
          className,
        )}
        {...props}
      />
    </Field>
  );
}

export function Select({
  label,
  error,
  hint,
  options,
  required,
  className,
  id: idProp,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        aria-invalid={Boolean(error) || undefined}
        className={cx(
          fieldBase,
          "cursor-pointer",
          error ? "border-red-500/60" : "border-violet-500/20",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-900"
          >
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

// ===== Card / headers =====
export const Card = ({ className, children, ...props }) => (
  <div
    className={cx(
      "rounded-2xl border border-violet-500/10 bg-gray-900/60 p-5 backdrop-blur-xl",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export function PageHeader({ title, subtitle, icon: Icon, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/30 to-fuchsia-500/20 text-violet-200">
            <Icon aria-hidden="true" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// ===== Badge / Avatar =====
const BADGE_TONES = {
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  red: "border-red-500/30 bg-red-500/10 text-red-300",
  yellow: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  gray: "border-gray-600/40 bg-gray-700/30 text-gray-300",
  fuchsia: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200",
};
export const Badge = ({ tone = "violet", className, children }) => (
  <span
    className={cx(
      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
      BADGE_TONES[tone],
      className,
    )}
  >
    {children}
  </span>
);

export function Avatar({ src, name, size = "md", className }) {
  const [failed, setFailed] = useState(false);
  const sizes = {
    xs: "h-7 w-7 text-xs",
    sm: "h-9 w-9 text-sm",
    md: "h-12 w-12 text-base",
    lg: "h-20 w-20 text-2xl",
    xl: "h-28 w-28 text-4xl",
  };
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return src && !failed ? (
    <img
      src={src}
      alt={name ? `${name} avatar` : ""}
      onError={() => setFailed(true)}
      className={cx(
        "shrink-0 rounded-full object-cover",
        sizes[size],
        className,
      )}
    />
  ) : (
    <span
      aria-hidden={!name}
      className={cx(
        "flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 font-bold text-white",
        sizes[size],
        className,
      )}
    >
      {initial}
    </span>
  );
}

// ===== Skeletons =====
export const Skeleton = ({ className }) => (
  <div
    className={cx("skeleton rounded-xl bg-gray-800/80", className)}
    aria-hidden="true"
  />
);

export function SkeletonGrid({ count = 8 }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 6 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ===== Empty / error states =====
export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-violet-500/20 bg-gray-900/30 px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-300">
          <Icon aria-hidden="true" />
        </span>
      )}
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {message && (
        <p className="mt-2 max-w-md text-sm text-gray-400">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-10 text-center"
    >
      <FaExclamationTriangle
        className="mb-3 text-2xl text-red-400"
        aria-hidden="true"
      />
      <p className="text-sm text-red-200">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}

export function LoadMore({ hasMore, loading, onClick }) {
  if (!hasMore) return null;
  return (
    <div className="mt-6 flex justify-center">
      <Button variant="secondary" loading={loading} onClick={onClick}>
        Load more
      </Button>
    </div>
  );
}

// ===== Tabs =====
export function Tabs({ tabs, value, onChange, className }) {
  const refs = useRef([]);
  const onKeyDown = (event, index) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next =
      (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
      tabs.length;
    refs.current[next]?.focus();
    onChange(tabs[next].value);
  };
  return (
    <div
      role="tablist"
      className={cx(
        "flex gap-1 overflow-x-auto rounded-xl border border-violet-500/10 bg-gray-900/60 p-1 scrollbar-thin",
        className,
      )}
    >
      {tabs.map((tab, index) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => (refs.current[index] = el)}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={(e) => onKeyDown(e, index)}
            onClick={() => onChange(tab.value)}
            className={cx(
              "flex min-h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 text-sm font-medium transition",
              active
                ? "bg-violet-500/20 text-violet-100"
                : "text-gray-400 hover:text-white",
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <Badge tone={active ? "fuchsia" : "gray"}>{tab.count}</Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ===== Tooltip (simple, keyboard friendly) =====
export function Tooltip({ label, children }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-800 px-2 py-1 text-xs text-gray-100 opacity-0 shadow-lg transition group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

// ===== Modal =====
export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  const panelRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          last.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === last) {
          first.focus();
          event.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setTimeout(
      () =>
        panelRef.current
          ?.querySelector("input, textarea, select, button")
          ?.focus(),
      0,
    );
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cx(
          "animate-fade-in-up max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-violet-500/20 bg-gray-900 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:pb-6",
          widths[size],
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && (
            <h2 id={titleId} className="text-lg font-bold text-white">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>
        {children}
        {footer && (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading,
  onConfirm,
  onCancel,
  children,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message && <p className="text-sm text-gray-300">{message}</p>}
      {children}
    </Modal>
  );
}
