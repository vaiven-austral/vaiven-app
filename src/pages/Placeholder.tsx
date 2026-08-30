interface PlaceholderProps {
  title: string;
  implementedBy?: string;
  description?: string;
}

export function Placeholder({ title, implementedBy, description }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-superficie p-6">
      <div className="bg-tarjeta rounded-tarjeta shadow-md p-12 max-w-md text-center">
        <h1 className="text-3xl font-bold text-tinta mb-4">{title}</h1>
        {description && (
          <p className="text-texto-medio mb-6">{description}</p>
        )}
        {implementedBy && (
          <p className="text-sm text-texto-suave">
            Implementado por: <span className="font-medium text-tinta">{implementedBy}</span>
          </p>
        )}
      </div>
    </div>
  );
}
