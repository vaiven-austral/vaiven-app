export const NOMBRE_MAX_LENGTH = 50;

export function getInitials(nombre?: string | null, email?: string | null): string {
  if (nombre) {
    const parts = nombre.trim().split(/\s+/);
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email ? email[0].toUpperCase() : '?';
}
