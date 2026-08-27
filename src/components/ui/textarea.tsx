interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  disabled,
  rows = 4,
  ...props
}: TextareaProps) {
  const baseStyles = `
    w-full px-3 py-2 rounded-boton border-2
    font-sans text-base text-tinta
    bg-tarjeta
    placeholder-texto-suave
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primario focus:ring-offset-0
    disabled:bg-lienzo disabled:cursor-not-allowed disabled:opacity-60
    resize-vertical
  `;

  const borderColor = error ? 'border-critico' : 'border-borde-fuerte';

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 font-600 text-tinta text-sm">
          {label}
        </label>
      )}
      <textarea
        disabled={disabled}
        rows={rows}
        className={`${baseStyles} ${borderColor} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-critico text-sm mt-1 font-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-texto-suave text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
}
