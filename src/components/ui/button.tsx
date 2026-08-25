import type { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-600 font-sans rounded-boton transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primario text-tarjeta hover:bg-[#3D8A6A] active:bg-[#2F6850]',
    secondary: 'bg-secundario text-tarjeta hover:bg-[#1A5058] active:bg-[#0F3A42]',
    outline: 'border-2 border-primario text-primario hover:bg-[rgba(73,160,120,0.1)] active:bg-[rgba(73,160,120,0.2)]',
    ghost: 'text-primario hover:bg-[rgba(73,160,120,0.1)] active:bg-[rgba(73,160,120,0.2)]',
    destructive: 'bg-critico text-tarjeta hover:bg-[#991919] active:bg-[#7A1515]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <span className="animate-spin">⟳</span>}
      {children}
    </button>
  );
}
