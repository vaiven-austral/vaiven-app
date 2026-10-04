import type { Profile } from '../contexts/auth';

export interface ProfileCompleteness {
  percent: number;
  message: string;
}

interface CompletenessFactor {
  label: string;
  completo: boolean;
}

// Agregar un factor: El % y el "Falta X" / "Te faltan X y Y" se arman solos.
function getFactores(profile: Pick<Profile, 'avatar_ruta' | 'zona_id'>): CompletenessFactor[] {
  return [
    { label: 'tu foto', completo: profile.avatar_ruta != null },
    { label: 'tu zona', completo: profile.zona_id != null },
  ];
}

const MENSAJE_TODO_COMPLETO = 'Foto y zona cargadas';

function mensajeConY(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// Cuenta los campos declarados en getFactores.
export function getProfileCompleteness(
  profile: Pick<Profile, 'avatar_ruta' | 'zona_id'>
): ProfileCompleteness {
  const factores = getFactores(profile);
  const faltantes = factores.filter((f) => !f.completo);
  const percent = Math.round(((factores.length - faltantes.length) / factores.length) * 100);

  if (faltantes.length === 0) {
    return { percent, message: MENSAJE_TODO_COMPLETO };
  }

  const verbo = faltantes.length === 1 ? 'Falta' : 'Te faltan';
  return { percent, message: `${verbo} ${mensajeConY(faltantes.map((f) => f.label))}` };
}
