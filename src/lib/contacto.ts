export type MedioPreferido = 'whatsapp' | 'telefono' | 'email';

// La fila propia de contactos, sin las columnas de control.
export interface Contacto {
  telefono: string | null;
  email_contacto: string | null;
  medio_preferido: MedioPreferido | null;
}

// Cada medio con su etiqueta en español, en el orden en que se muestran.
export const MEDIOS_CONTACTO: { value: MedioPreferido; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telefono', label: 'Llamada' },
  { value: 'email', label: 'Correo' },
];

// Saca espacios, guiones, puntos y paréntesis. Un + inicial se conserva.
export function normalizarTelefono(texto: string): string {
  return texto.replace(/[\s\-.()]/g, '');
}

// null si quedan entre 8 y 15 dígitos (sin contar el + inicial).
export function validarTelefono(texto: string): string | null {
  const digitos = normalizarTelefono(texto).replace(/^\+/, '');
  return /^\d{8,15}$/.test(digitos)
    ? null
    : 'Revisá el teléfono: tiene que tener entre 8 y 15 números.';
}

export interface ErrorContacto {
  campo: 'telefono' | 'medio';
  mensaje: string;
}

// Los dos vacíos es válido (así se vacía el contacto). Con correo no se pide
// teléfono: se usa el de la cuenta.
export function validarContacto(
  telefono: string,
  medio: MedioPreferido | null
): ErrorContacto | null {
  if (telefono.trim() !== '') {
    const error = validarTelefono(telefono);
    if (error) return { campo: 'telefono', mensaje: error };
    if (!medio) return { campo: 'medio', mensaje: 'Elegí cómo preferís que te contacten.' };
    return null;
  }

  if (medio === 'whatsapp' || medio === 'telefono') {
    return { campo: 'telefono', mensaje: 'Cargá tu teléfono.' };
  }
  return null;
}

// Hay contacto si hay medio preferido y el dato de ese medio.
export function tieneContacto(contacto: Contacto | null): boolean {
  if (!contacto?.medio_preferido) return false;
  return contacto.medio_preferido === 'email'
    ? Boolean(contacto.email_contacto)
    : Boolean(contacto.telefono);
}
