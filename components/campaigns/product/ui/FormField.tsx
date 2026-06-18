interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function FormField({ label, required, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
