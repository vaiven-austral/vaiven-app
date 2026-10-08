import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'error';
}

export function EmptyState({ title, description, actionLabel, actionTo, onAction, icon, variant = 'default' }: EmptyStateProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionTo) {
      navigate(actionTo);
    }
  };

  const iconCircleClasses = variant === 'error'
    ? 'bg-critico/10 text-critico'
    : 'bg-lienzo text-texto-medio';

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      {icon && (
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${iconCircleClasses}`}>
          {icon}
        </div>
      )}
      {title && <p className="font-700 text-tinta text-lg mb-2 max-w-[280px] leading-snug">{title}</p>}
      {description && <p className="text-texto-medio text-sm mb-6">{description}</p>}
      {actionLabel && (actionTo || onAction) && (
        <Button onClick={handleAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
