import { Sparkles } from 'lucide-react';

interface ReasoningProps {
  narrativa: string;
}

export function Reasoning({ narrativa }: ReasoningProps) {
  return (
    <div
      className="rounded-tarjeta p-4 text-white"
      style={{ background: 'linear-gradient(150deg,#216869,#1B565A)' }}
    >
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white/80">
        <Sparkles className="h-3.5 w-3.5" />
        Razonamiento del modelo
      </h4>
      <p className="text-sm leading-relaxed">{narrativa}</p>
    </div>
  );
}
