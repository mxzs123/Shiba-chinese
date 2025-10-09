interface ModulePlaceholderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function ModulePlaceholder({
  title,
  description,
  children,
}: ModulePlaceholderProps) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-neutral-600">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>
      {children ? (
        <div className="mt-4 text-sm text-neutral-500">{children}</div>
      ) : null}
    </div>
  );
}
