import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: ReactNode;
}

export function EmptyState({ title, description, actionLabel, actionTo, icon }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-lienzo flex items-center justify-center mb-5 text-texto-medio">
          {icon}
        </div>
      )}
      {title && <p className="font-700 text-tinta text-lg mb-2 max-w-[280px] leading-snug">{title}</p>}
      {description && <p className="text-texto-medio text-sm mb-6">{description}</p>}
      {actionLabel && actionTo && (
        <Button onClick={() => navigate(actionTo)}>{actionLabel}</Button>
      )}
    </div>
  );
}
