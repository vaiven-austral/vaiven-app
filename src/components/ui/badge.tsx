import type { CSSProperties, ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'neutral' | 'terciario';
  className?: string;
  style?: CSSProperties;
}

export function Badge({
  children,
  variant = 'primary',
  className = '',
  style,
}: BadgeProps) {
  const variants = {
    primary: 'bg-[rgba(73,160,120,0.13)] text-primario',
    secondary: 'bg-[rgba(33,104,105,0.13)] text-secundario',
    success: 'bg-[rgba(47,127,93,0.13)] text-exito',
    warning: 'bg-[rgba(245,158,11,0.13)] text-atencion',
    destructive: 'bg-[rgba(220,38,38,0.09)] text-critico',
    neutral: 'bg-lienzo text-texto-medio',
    terciario: 'bg-terciario-claro text-terciario-oscuro',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1
        rounded-chip
        font-600 text-xs
        ${variants[variant]}
        ${className}
      `}
      style={style}
    >
      {children}
    </span>
  );
}
