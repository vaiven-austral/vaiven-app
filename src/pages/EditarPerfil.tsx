import { useEffect, useMemo, useRef, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOwnProfile } from '../hooks/useOwnProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useAvatarUrl } from '../hooks/useAvatarUrl';
import { validateAvatarFile, subirAvatar, borrarAvatar } from '../lib/avatarUpload';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ZoneCascadeSelect } from '../components/forms/ZoneCascadeSelect';
import { getInitials, NOMBRE_MAX_LENGTH } from '../lib/userDisplay';

export function EditarPerfil() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useOwnProfile();
  const { updateProfile } = useUpdateProfile();
  const { url: currentAvatarUrl } = useAvatarUrl(profile?.avatar_ruta ?? null);
  const [nombreVisible, setNombreVisible] = useState<string | null>(null);
  const [zonaId, setZonaId] = useState<number | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarFileError, setAvatarFileError] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const camaraInputRef = useRef<HTMLInputElement>(null);
  const galeriaInputRef = useRef<HTMLInputElement>(null);

  if (profile && nombreVisible === null) {
    setNombreVisible(profile.nombre_visible);
  }

  const avatarPreviewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile]
  );
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  function handleAvatarSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite elegir el mismo archivo de nuevo
    if (!file) return;

    const error = validateAvatarFile(file);
    if (error) {
      setAvatarFileError(error);
      return;
    }
    setAvatarFileError('');
    setAvatarFile(file);
  }

  function validate(): boolean {
    const nombreTrim = nombreVisible?.trim() ?? '';
    if (!nombreTrim) {
      setNombreError('El nombre no puede quedar vacío.');
      return false;
    }
    if (nombreTrim.length > NOMBRE_MAX_LENGTH) {
      setNombreError(`El nombre no puede tener más de ${NOMBRE_MAX_LENGTH} caracteres.`);
      return false;
    }
    setNombreError('');
    return true;
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current || !user || !profile) return;
    if (!validate()) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError('');

    let nuevaRutaAvatar: string | null = null;
    if (avatarFile) {
      const { rutaStorage, error } = await subirAvatar(avatarFile, user.id);
      if (error) {
        submittingRef.current = false;
        setIsSubmitting(false);
        setSubmitError(error);
        return;
      }
      nuevaRutaAvatar = rutaStorage;
    }

    const nombreTrim = (nombreVisible ?? '').trim();
    const changes: { nombre_visible?: string; zona_id?: number | null; avatar_ruta?: string } = {};
    if (nombreTrim !== profile.nombre_visible) changes.nombre_visible = nombreTrim;
    if (zonaId !== profile.zona_id) changes.zona_id = zonaId;
    if (nuevaRutaAvatar) changes.avatar_ruta = nuevaRutaAvatar;

    if (Object.keys(changes).length === 0) {
      navigate('/perfil');
      return;
    }

    const error = await updateProfile(changes);
    submittingRef.current = false;
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    if (nuevaRutaAvatar && profile.avatar_ruta) {
      await borrarAvatar(profile.avatar_ruta);
    }

    navigate('/perfil');
  }

  if (!profile) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-800 text-tinta mb-6">Editar perfil</h1>
        {!profileLoading && (
          <p className="text-texto-suave text-sm">No se pudo cargar tu perfil.</p>
        )}
      </div>
    );
  }

  const initials = getInitials(profile.nombre_visible, user?.email);
  const avatarMostrado = avatarPreviewUrl ?? currentAvatarUrl;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-800 text-tinta mb-6">Editar perfil</h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="flex flex-col items-center">
          <button
            type="button"
            aria-label="Cambiar foto de perfil"
            onClick={() => galeriaInputRef.current?.click()}
            className="group relative h-28 w-28 rounded-pill"
          >
            {avatarMostrado ? (
              <img src={avatarMostrado} alt="" className="h-28 w-28 rounded-pill object-cover" />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-pill bg-secundario font-700 text-3xl text-tarjeta">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-pill bg-tinta/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Pencil className="h-6 w-6 text-tarjeta" />
            </div>
          </button>

          <p className="font-600 text-tinta text-sm mt-4">Editar foto de perfil:</p>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              className="border-borde-fuerte text-tinta hover:bg-lienzo"
              onClick={() => camaraInputRef.current?.click()}
            >
              Sacar foto
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-borde-fuerte text-tinta hover:bg-lienzo"
              onClick={() => galeriaInputRef.current?.click()}
            >
              Elegir de la galería
            </Button>
          </div>

          <input
            ref={camaraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleAvatarSelected}
          />
          <input
            ref={galeriaInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelected}
          />

          {avatarFileError ? (
            <p className="text-critico text-sm mt-2 font-500">{avatarFileError}</p>
          ) : (
            <p className="text-texto-suave text-sm mt-2">JPG · PNG · máx 5 MB</p>
          )}
        </div>

        <Input
          label="Nombre visible"
          value={nombreVisible ?? ''}
          onChange={(e) => setNombreVisible(e.target.value)}
          maxLength={NOMBRE_MAX_LENGTH}
          error={nombreError}
        />

        <ZoneCascadeSelect onChange={setZonaId} valorInicial={profile.zona_id} />

        {submitError && (
          <div className="rounded-tarjeta border-2 border-critico bg-[rgba(220,38,38,0.06)] p-4 text-critico text-sm font-500">
            {submitError}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
          Guardar cambios
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full border-borde-fuerte text-tinta hover:bg-lienzo"
          disabled={isSubmitting}
          onClick={() => navigate('/perfil')}
        >
          Cancelar
        </Button>
      </form>
    </div>
  );
}
