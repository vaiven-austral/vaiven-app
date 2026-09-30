import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import {
  EMPTY_PUBLICATIONS_SUMMARY,
  getOwnPublicationsForSummary,
  summarizePublications,
  type PublicationsSummary,
} from '../lib/publicationsSummary';

interface Resolved {
  userId: string;
  summary: PublicationsSummary;
}

// Resumen de publicaciones propias (Activas/Completadas por tipo) para la tarjeta de perfil.
export function usePublicationsSummary() {
  const { user } = useAuth();
  const [resolved, setResolved] = useState<Resolved | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    getOwnPublicationsForSummary(user.id).then((rows) => {
      if (cancelled) return;
      setResolved({ userId: user.id, summary: summarizePublications(rows) });
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return { summary: EMPTY_PUBLICATIONS_SUMMARY, loading: false };
  if (resolved?.userId !== user.id) return { summary: EMPTY_PUBLICATIONS_SUMMARY, loading: true };
  return { summary: resolved.summary, loading: false };
}
