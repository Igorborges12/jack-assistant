import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const control =
  "glass-soft w-full rounded-xl px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Label({ label, children }: { label?: string | undefined; children: ReactNode }) {
  if (!label) return <>{children}</>;
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function TextInput({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <Label label={label}>
      <input {...props} className={cn(control, className)} />
    </Label>
  );
}

export function TextArea({
  label,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <Label label={label}>
      <textarea {...props} className={cn(control, "min-h-24 resize-y", className)} />
    </Label>
  );
}

export function SelectInput({
  label,
  options,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Label label={label}>
      <select {...props} className={cn(control, "pr-8", className)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Label>
  );
}

export const toOptions = (values: readonly string[], allLabel?: string) => [
  ...(allLabel ? [{ value: "", label: allLabel }] : []),
  ...values.map((value) => ({ value, label: value })),
];
