// Compartidos entre LoginPage y RegisterPageS
export const EMAIL_MAX_LENGTH = 254; // RFC 5321 §4.5.3.1.3
export const PASSWORD_MAX_LENGTH = 72; // bcrypt (lo que usa Supabase Auth) ignora todo lo que pase de 72 bytes
export const PASSWORD_MIN_LENGTH = 8; // el mismo minimum_password_length de supabase/config.toml

// Devuelve el error para mostrar, o null si la contraseña nueva se puede mandar a Supabase.
export function validarContrasenaNueva(password: string, confirmacion: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña tiene que tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `La contraseña puede tener hasta ${PASSWORD_MAX_LENGTH} caracteres`;
  }
  if (password !== confirmacion) {
    return 'Las contraseñas no coinciden';
  }
  return null;
}
