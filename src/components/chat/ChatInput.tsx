import { useState, type FormEvent } from "react";

interface ChatInputProps {
  onSend: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, placeholder = "Digite o que você precisa...", disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="glass-soft min-w-0 flex-1 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="submit"
        aria-label="Enviar"
        disabled={disabled}
        className="gradient-brand shadow-brand grid size-10 shrink-0 place-items-center rounded-xl text-primary-foreground transition disabled:opacity-60"
      >
        ➤
      </button>
    </form>
  );
}
