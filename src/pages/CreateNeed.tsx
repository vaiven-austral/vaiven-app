import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CategorySelect } from '../components/forms/CategorySelect';
import { ZoneCascadeSelect } from '../components/forms/ZoneCascadeSelect';

type Urgencia = 'alta' | 'media' | 'sin_apuro';

const urgenciaOptions: Array<{ value: Urgencia; label: string }> = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'sin_apuro', label: 'Sin apuro' },
];

interface FormErrors {
  titulo?: string;
  descripcion?: string;
  categoria?: string;
  zona?: string;
  cantidad?: string;
}

export function CreateNeed() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [zonaId, setZonaId] = useState<number | null>(null);
  const [urgencia, setUrgencia] = useState<Urgencia>('media');
  const [cantidad, setCantidad] = useState(1);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const submittingRef = useRef(false);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    const tituloLength = titulo.trim().length;
    const descripcionLength = descripcion.trim().length;

    if (tituloLength < 3 || tituloLength > 80) {
      nextErrors.titulo = 'El título debe tener entre 3 y 80 caracteres.';
    }
    if (descripcionLength < 10 || descripcionLength > 1000) {
      nextErrors.descripcion = 'La descripción debe tener entre 10 y 1000 caracteres.';
    }
    if (categoriaId === null) {
      nextErrors.categoria = 'Seleccioná una categoría.';
    }
    if (zonaId === null) {
      nextErrors.zona = 'Seleccioná una ubicación (región, partido y localidad si corresponde).';
    }
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      nextErrors.cantidad = 'La cantidad debe ser un número entero mayor o igual a 1.';
    }

    return nextErrors;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submittingRef.current) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (!user) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError('');

    const { error } = await supabase
      .from('publicaciones')
      .insert({
        tipo: 'necesidad',
        estado: 'activa',
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria_id: categoriaId,
        zona_id: zonaId,
        urgencia,
        cantidad,
        usuario_id: user.id,
      })
      .select();

    if (error) {
      submittingRef.current = false;
      setIsSubmitting(false);
      setSubmitError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/publicaciones'), 1500);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-800 text-tinta mb-6">Nueva Publicación</h1>

      <div className="flex bg-lienzo rounded-tarjeta p-1 mb-6">
        <Link
          to="/publicar/donacion"
          className="flex-1 text-center px-4 py-3 rounded-boton font-600 text-sm text-texto-medio"
        >
          🎁 Quiero Donar un Objeto
        </Link>
        <span className="flex-1 text-center px-4 py-3 rounded-boton font-600 text-sm bg-tarjeta text-tinta shadow-sm">
          🤝 Necesito Recibir una Ayuda
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Input
          label="Título de la publicación"
          placeholder="Ej: Notebook para cursar"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          error={errors.titulo}
        />

        <div>
          <CategorySelect value={categoriaId} onChange={setCategoriaId} />
          {errors.categoria && (
            <p className="text-critico text-sm mt-1 font-500">{errors.categoria}</p>
          )}
        </div>

        <Select
          label="Nivel de urgencia"
          options={urgenciaOptions}
          value={urgencia}
          onChange={(e) => setUrgencia(e.target.value as Urgencia)}
        />

        <Input
          label="Cantidad"
          type="number"
          min={1}
          step={1}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value === '' ? 0 : Number(e.target.value))}
          error={errors.cantidad}
        />

        <div>
          <p className="block mb-1.5 font-600 text-tinta text-sm">Ubicación</p>
          <ZoneCascadeSelect onChange={setZonaId} />
          {errors.zona && (
            <p className="text-critico text-sm mt-1 font-500">{errors.zona}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-600 text-tinta text-sm">¿Por qué lo necesitás?</label>
            <Badge variant="primary">✨ ANALIZADO POR IA</Badge>
          </div>
          <Textarea
            placeholder="Contanos brevemente tu situación..."
            rows={4}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            error={errors.descripcion}
          />
        </div>

        {submitError && (
          <div className="rounded-tarjeta border-2 border-critico bg-[rgba(220,38,38,0.06)] p-4 text-critico text-sm font-500">
            {submitError}
          </div>
        )}

        {success && (
          <div className="rounded-tarjeta border-2 border-exito bg-[rgba(47,127,93,0.08)] p-4 text-exito text-sm font-600">
            ¡Publicación creada con éxito!
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
          Publicar necesidad →
        </Button>
      </form>
    </div>
  );
}
