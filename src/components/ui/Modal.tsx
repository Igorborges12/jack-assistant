import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="glass relative w-full max-w-lg rounded-3xl p-6"
      >
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <div className="mt-3 text-sm text-muted-foreground">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          {footer ?? (
            <button
              onClick={onClose}
              className="glass-soft rounded-xl px-4 py-2 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
