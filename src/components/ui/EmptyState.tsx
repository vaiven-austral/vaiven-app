import { useNavigate } from 'react-router-dom';
import { Button } from './button';

interface EmptyStateProps {
  title?: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({ title, description, actionLabel, actionTo }: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      {title && <p className="font-700 text-tinta text-lg mb-2">{title}</p>}
      <p className="text-texto-medio text-sm mb-6">{description}</p>
      {actionLabel && actionTo && (
        <Button onClick={() => navigate(actionTo)}>{actionLabel}</Button>
      )}
    </div>
  );
}
