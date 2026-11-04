import { supabase } from './supabaseClient';
import { MEDIOS_CONTACTO, tieneContacto, type Contacto } from './contacto';
import { rolEnMatch, type MiMatch } from './misMatches';

// El medio preferido de la otra persona con su dato como enlace.
export interface EnlaceContacto {
  medio: string;
  dato: string;
  href: string;
}

// El match visible, el rol del usuario en él y el contacto de la otra persona.
// `otraCerrada`: la otra publicación no llega (está cerrada), así que no se sabe
// de quién es y su contacto no se puede pedir. `contacto` null con `otraCerrada`
// false es que la persona todavía no cargó el suyo.
export type ContactoDelMatch =
  | { tipo: 'sin_match' }
  | {
      tipo: 'match';
      match: MiMatch;
      rol: 'Donás' | 'Recibís';
      otraCerrada: boolean;
      contacto: Contacto | null;
    };

const SELECT_MATCH =
  'id, creado_en, donacion:publicaciones!donacion_id(titulo, usuario_id), necesidad:publicaciones!necesidad_id(titulo, usuario_id)';

// Lee de la base y nada más: si el match o el contacto no llegan, no existen para
// este usuario (las políticas deciden quién ve qué). Si una consulta falla,
// lanza: quien llama decide qué mostrar.
export async function fetchContactoDelMatch(
  donacionId: string,
  usuarioId: string
): Promise<ContactoDelMatch> {
  const { data, error } = await supabase
    .from('matches')
    .select(SELECT_MATCH)
    .eq('donacion_id', donacionId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { tipo: 'sin_match' };

  const match = data as unknown as MiMatch;
  const rol = rolEnMatch(match, usuarioId);

  // La otra persona es la dueña del lado que no es el mío.
  const otroLado = rol === 'Donás' ? match.necesidad : match.donacion;
  if (!otroLado) return { tipo: 'match', match, rol, otraCerrada: true, contacto: null };

  const { data: contacto, error: errorContacto } = await supabase
    .from('contactos')
    .select('telefono, email_contacto, medio_preferido')
    .eq('usuario_id', otroLado.usuario_id)
    .maybeSingle();

  if (errorContacto) throw errorContacto;

  return {
    tipo: 'match',
    match,
    rol,
    otraCerrada: false,
    contacto: (contacto as Contacto | null) ?? null,
  };
}

// El medio preferido con su dato como enlace: WhatsApp → wa.me con sólo dígitos,
// teléfono → tel:, correo → mailto:. Sin el dato de ese medio, no hay enlace.
export function enlaceDeContacto(contacto: Contacto): EnlaceContacto | null {
  if (!tieneContacto(contacto)) return null;

  const { medio_preferido: medio, telefono, email_contacto: email } = contacto;
  const etiqueta = MEDIOS_CONTACTO.find((m) => m.value === medio)?.label ?? '';

  if (medio === 'email') return { medio: etiqueta, dato: email!, href: `mailto:${email}` };
  if (medio === 'telefono') return { medio: etiqueta, dato: telefono!, href: `tel:${telefono}` };

  const digitos = telefono!.replace(/\D/g, '');
  return digitos ? { medio: etiqueta, dato: telefono!, href: `https://wa.me/${digitos}` } : null;
}
