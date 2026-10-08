import { X } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import type { Candidate } from '@/lib/n8n';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScoreRing } from './ScoreRing';
import { FactorBars } from './FactorBars';
import { BulletTextBlock } from './BulletTextBlock';
import { Reasoning } from './Reasoning';
import { PanelActions } from './PanelActions';

interface AnalysisPanelProps {
  candidate: Candidate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: (candidateId: string) => Promise<void> | void;
}

// Un solo Drawer para los dos casos: sube desde abajo en mobile, entra desde
// la derecha en desktop (swipeDirection), en vez de un componente aparte.
export function AnalysisPanel({ candidate, open, onOpenChange, onAccept }: AnalysisPanelProps) {
  const isMobile = useIsMobile();

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={isMobile ? 'down' : 'right'}
      showSwipeHandle={isMobile}
    >
      <DrawerContent className={isMobile ? 'max-h-[90dvh]' : undefined}>
        <DrawerHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <DrawerTitle>Análisis de compatibilidad IA</DrawerTitle>
              <p className="text-xs text-texto-suave mt-0.5">{candidate.titulo}</p>
            </div>
            <DrawerClose
              render={
                <button
                  type="button"
                  aria-label="Cerrar"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-texto-medio hover:bg-lienzo"
                />
              }
            >
              <Icon icon={X} className="h-4 w-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center">
            <ScoreRing score={candidate.score_total} factores={candidate.factores} size="drawer" />
          </div>

          <FactorBars candidate={candidate} />

          {candidate.justificacion && (
            <>
              <BulletTextBlock variant="fortalezas" items={candidate.justificacion.fortalezas} />
              <BulletTextBlock variant="consideraciones" items={candidate.justificacion.consideraciones} />
              <Reasoning narrativa={candidate.justificacion.narrativa} />
            </>
          )}
        </div>

        <DrawerFooter className="border-t border-borde pt-4">
          <PanelActions
            onAccept={
              onAccept
                ? async () => {
                    await onAccept(candidate.id);
                    onOpenChange(false);
                  }
                : undefined
            }
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
