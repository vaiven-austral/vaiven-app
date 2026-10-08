import { Check, TriangleAlert } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

interface BulletTextBlockProps {
  variant: 'fortalezas' | 'consideraciones';
  items: string[];
}

const CONFIG = {
  fortalezas: {
    titulo: 'Fortalezas',
    icon: Check,
    border: 'border-green-200',
    text: 'text-green-800',
  },
  consideraciones: {
    titulo: 'Consideraciones',
    icon: TriangleAlert,
    border: 'border-amber-200',
    text: 'text-amber-800',
  },
} as const;

export function BulletTextBlock({ variant, items }: BulletTextBlockProps) {
  if (items.length === 0) return null;

  const { titulo, icon: IconComponent, border, text } = CONFIG[variant];

  return (
    <div className={`rounded-tarjeta border ${border} bg-tarjeta p-4`}>
      <h4 className={`mb-2 text-xs font-bold uppercase ${text}`}>{titulo}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-texto-medio">
            <Icon icon={IconComponent} className={`mt-0.5 h-4 w-4 shrink-0 ${text}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
