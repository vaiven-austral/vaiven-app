import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { MAX_IMAGENES_POR_PUBLICACION } from '../../lib/imagenesPublicacion';

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function ImageUploader({ files, onChange, error }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [warning, setWarning] = useState('');

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const seleccionados = Array.from(e.target.files ?? []);
    e.target.value = ''; // permite volver a elegir el mismo archivo después de sacarlo

    if (seleccionados.length === 0) return;

    // accept="image/*" es solo una sugerencia para el selector del sistema
    // operativo — no bloquea un archivo arrastrado o elegido por otra vía.
    const imagenes = seleccionados.filter((file) => file.type.startsWith('image/'));

    const disponibles = MAX_IMAGENES_POR_PUBLICACION - files.length;
    const aceptados = imagenes.slice(0, disponibles);

    if (imagenes.length < seleccionados.length) {
      setWarning('Solo se aceptan archivos de imagen.');
    } else if (seleccionados.length > disponibles) {
      setWarning(`Como máximo podés subir ${MAX_IMAGENES_POR_PUBLICACION} fotos por publicación.`);
    } else {
      setWarning('');
    }

    onChange([...files, ...aceptados]);
  }

  function handleRemove(index: number) {
    setWarning('');
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <p className="block mb-1.5 font-600 text-tinta text-sm">
        Fotos (de 1 a {MAX_IMAGENES_POR_PUBLICACION})
      </p>

      <div className="flex gap-3 flex-wrap">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="relative w-20 h-20 rounded-boton overflow-hidden border border-borde bg-lienzo"
          >
            {previews[index] && (
              <img src={previews[index]} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              aria-label="Quitar foto"
              className="absolute top-0.5 right-0.5 h-5 w-5 flex items-center justify-center rounded-pill bg-tinta/70 text-tarjeta text-xs leading-none"
            >
              ×
            </button>
          </div>
        ))}

        {files.length < MAX_IMAGENES_POR_PUBLICACION && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-boton border-2 border-dashed border-borde-fuerte text-texto-suave text-2xl flex items-center justify-center hover:border-primario hover:text-primario transition-colors"
            aria-label="Agregar foto"
          >
            +
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {error && <p className="text-critico text-sm mt-1.5 font-500">{error}</p>}
      {warning && <p className="text-critico text-sm mt-1.5 font-500">{warning}</p>}
    </div>
  );
}
