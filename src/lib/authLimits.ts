// Compartidos entre LoginPage y RegisterPageS
export const EMAIL_MAX_LENGTH = 254; // RFC 5321 §4.5.3.1.3
export const PASSWORD_MAX_LENGTH = 72; // bcrypt (lo que usa Supabase Auth) ignora todo lo que pase de 72 bytes
