interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  label,
  error,
  helperText,
  options,
  className = '',
  disabled,
  ...props
}: SelectProps) {
  const baseStyles = `
    w-full px-3 py-2 rounded-boton border-2
    font-sans text-base text-tinta
    bg-tarjeta
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primario focus:ring-offset-0
    disabled:bg-lienzo disabled:cursor-not-allowed disabled:opacity-60
    appearance-none cursor-pointer
    bg-no-repeat bg-right bg-padding-4
  `;

  const borderColor = error ? 'border-critico' : 'border-borde-fuerte';

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 font-600 text-tinta text-sm">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          disabled={disabled}
          className={`${baseStyles} ${borderColor} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tinta pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      {error && (
        <p className="text-critico text-sm mt-1 font-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-texto-suave text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
}
