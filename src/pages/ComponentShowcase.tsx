import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { InfoHint } from '../components/ui/info-hint';
import { FACTOR_INFO } from '../lib/factorInfo';
import { CategorySelect } from '../components/forms/CategorySelect';
import { ZoneCascadeSelect } from '../components/forms/ZoneCascadeSelect';
import { PublicationCard, type Publication } from '../components/publications/PublicationCard';
import { ScoreRing } from '../components/matching/ScoreRing';
import { CandidateCard } from '../components/matching/CandidateCard';
import { ConfirmarEleccionModal } from '../components/matching/ConfirmarEleccionModal';
import type { Candidate } from '../lib/n8n';
import type { PublicacionOrigen } from '../lib/eleccion';

// Pesos reales del motor (docs/motor/contrato.md): 40/10/20/10/5/15 sobre 100.
// Se escalan al score de prueba para que el anillo se vea proporcionado.
const PESOS_MOTOR = { f1: 40, f2: 10, f3: 20, f4: 10, f5: 5, f6: 15 };
function factoresDeMuestra(score: number) {
  const escala = score / 100;
  return Object.fromEntries(
    Object.entries(PESOS_MOTOR).map(([k, max]) => [k, max * escala])
  );
}

const candidatoConJuicio: Candidate = {
  id: 'test-candidato-1',
  titulo: 'Notebook Lenovo i5 para carrera',
  descripcion: 'Notebook en buen estado, con cargador incluido.',
  tipo: 'donacion',
  categoria_id: 5,
  zona_id: 1178,
  estado_objeto: 'bueno',
  cantidad: 1,
  usuario_id: 'usuario-test',
  vence_en: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  perfiles: { zona_id: 1178, avatar_ruta: '/avatars/test.webp' },
  zonas: { id: 1178, region: 'AMBA', partido: 'Comuna 6', localidad: 'Caballito' },
  nivel: 4,
  version_scoring: 'v1',
  analizando: false,
  score_total: 87,
  factores: {
    f1_resolucion: 40,
    f2_urgencia: 7,
    f3_proximidad: 13,
    f4_confianza: 10,
    f5_calidad: 2,
    f6_categoria: 15,
  },
  justificacion: {
    narrativa:
      'Este candidato es el match más fuerte para esta notebook. Su solicitud coincide plenamente con la categoría y las especificaciones del equipo, y su historia académica —finales en agosto, sin equipo desde marzo— muestra un impacto directo y verificable. Su perfil está verificado y tiene historial positivo, lo que reduce el riesgo de reventa. El único punto a considerar es que otros dos receptores declararon urgencia mayor, aunque ninguno alcanza su nivel de compatibilidad técnica ni de cercanía. Este párrafo se extiende deliberadamente para probar que el panel hace scroll interno y que el texto no se corta con una narrativa larga, tal como pide el criterio de aceptación del ticket.',
    fortalezas: [
      'Coincidencia exacta de categoría: pidió "Notebook para carrera" en Electrónica.',
      'Identidad verificada (DNI + correo) y 4.8★ en 6 intercambios previos.',
      'A 3,2 km del punto de entrega: retiro posible sin logística.',
    ],
    consideraciones: [
      'Su pedido tiene 14 días: hay dos receptores con urgencia declarada mayor.',
      'No especificó si necesita cargador ni sistema operativo preferido.',
    ],
  },
};

const candidatoPendiente: Candidate = {
  id: 'test-candidato-2',
  titulo: 'Mesa de luz (Pendiente)',
  descripcion: 'En buen estado',
  tipo: 'donacion',
  categoria_id: 2,
  zona_id: 1178,
  estado_objeto: 'bueno',
  cantidad: 1,
  usuario_id: 'usuario-test-2',
  vence_en: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  perfiles: { zona_id: 1178, avatar_ruta: '/avatars/test.webp' },
  zonas: { id: 1178, region: 'AMBA', partido: 'Comuna 6', localidad: 'Caballito' },
  nivel: null,
  version_scoring: null,
  analizando: true,
  score_total: null,
  factores: {
    f1_resolucion: null,
    f2_urgencia: 0,
    f3_proximidad: 0,
    f4_confianza: 0,
    f5_calidad: 0,
    f6_categoria: 0,
  },
  justificacion: null,
};

// El mismo candidato del lado de una necesidad, para verlo desde una donación.
const candidatoNecesidad: Candidate = {
  ...candidatoConJuicio,
  id: 'test-candidato-necesidad',
  titulo: 'Compu para que mi hija estudie',
  tipo: 'necesidad',
  estado_objeto: undefined,
  urgencia: 'alta',
};

const origenDonacion: PublicacionOrigen = { id: 'demo-donacion', titulo: 'PC de escritorio completa', tipo: 'donacion' };
const origenNecesidad: PublicacionOrigen = { id: 'demo-necesidad', titulo: 'Compu para estudiar', tipo: 'necesidad' };

const mockPublications: Publication[] = [
  {
    id: '1',
    tipo: 'donacion',
    estado: 'activa',
    titulo: 'Mantas de invierno 1½ plaza',
    vence_en: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    estado_objeto: 'bueno',
    categorias: { nombre: 'Ropa & Abrigo' },
    zonas: { partido: 'Pilar', localidad: 'Del Viso' },
  },
  {
    id: '2',
    tipo: 'necesidad',
    estado: 'activa',
    titulo: 'Notebook para cursar',
    // vencida a propósito, para ver el badge "VENCIDA" en el showcase (SCRUM-37)
    vence_en: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    urgencia: 'alta',
    categorias: { nombre: 'Tecnología' },
    zonas: { partido: 'San Isidro', localidad: null },
  },
  {
    id: '3',
    tipo: 'donacion',
    estado: 'completada',
    titulo: 'Mesa plegable',
    vence_en: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    estado_objeto: 'bueno',
    categorias: { nombre: 'Mobiliario' },
    zonas: { partido: 'Tigre', localidad: 'Tigre' },
  },
];

export function ComponentShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [confirmarOpen, setConfirmarOpen] = useState(false);
  const [selectValue, setSelectValue] = useState('opcion1');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [zonaId, setZonaId] = useState<number | null>(null);

  useEffect(() => {
    console.log('CategorySelect + ZoneCascadeSelect ->', { categoria_id: categoriaId, zona_id: zonaId });
  }, [categoriaId, zonaId]);

  const categoryOptions = [
    { value: 'opcion1', label: 'Opción 1' },
    { value: 'opcion2', label: 'Opción 2' },
    { value: 'opcion3', label: 'Opción 3' },
  ];

  return (
    <div className="min-h-screen bg-superficie p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-800 text-tinta mb-2">VaiVén Components</h1>
        <p className="text-texto-medio mb-12">Base de componentes tematizada contra el kit de marca</p>

        {/* BUTTONS */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">Buttons</h2>

          <div className="space-y-6">
            {/* Primary */}
            <div>
              <p className="text-sm font-600 text-texto-medio mb-3">Primary</p>
              <div className="flex gap-3 flex-wrap">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="md" isLoading>Loading</Button>
                <Button size="md" disabled>Disabled</Button>
              </div>
            </div>

            {/* Secondary */}
            <div>
              <p className="text-sm font-600 text-texto-medio mb-3">Secondary</p>
              <div className="flex gap-3 flex-wrap">
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary" size="md">Medium</Button>
                <Button variant="secondary" size="lg">Large</Button>
              </div>
            </div>

            {/* Outline */}
            <div>
              <p className="text-sm font-600 text-texto-medio mb-3">Outline</p>
              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" size="sm">Small</Button>
                <Button variant="outline" size="md">Medium</Button>
                <Button variant="outline" size="lg">Large</Button>
              </div>
            </div>

            {/* Ghost */}
            <div>
              <p className="text-sm font-600 text-texto-medio mb-3">Ghost</p>
              <div className="flex gap-3 flex-wrap">
                <Button variant="ghost" size="sm">Small</Button>
                <Button variant="ghost" size="md">Medium</Button>
                <Button variant="ghost" size="lg">Large</Button>
              </div>
            </div>

            {/* Destructive */}
            <div>
              <p className="text-sm font-600 text-texto-medio mb-3">Destructive</p>
              <div className="flex gap-3 flex-wrap">
                <Button variant="destructive" size="sm">Small</Button>
                <Button variant="destructive" size="md">Medium</Button>
                <Button variant="destructive" size="lg">Large</Button>
              </div>
            </div>
          </div>
        </section>

        {/* INPUTS & FIELDS */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">Inputs & Fields</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Normal Input"
              placeholder="Ingresa texto..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <Input
              label="Input con Error"
              placeholder="Este tiene error"
              error="Este campo es requerido"
            />

            <Input
              label="Input Disabled"
              placeholder="No se puede editar"
              disabled
            />

            <Input
              label="Input con Helper"
              placeholder="Con texto de ayuda"
              helperText="Este es un texto de ayuda"
            />

            <Textarea
              label="Textarea"
              placeholder="Ingresa un mensaje largo..."
              rows={4}
            />

            <Textarea
              label="Textarea con Error"
              placeholder="Este tiene error"
              error="Máximo 100 caracteres"
              rows={4}
            />

            <Select
              label="Select"
              options={categoryOptions}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
            />

            <Select
              label="Select Disabled"
              options={categoryOptions}
              disabled
            />
          </div>
        </section>

        {/* FORM SELECTS: CATEGORIA Y ZONA */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">CategorySelect & ZoneCascadeSelect</h2>

          <div className="space-y-6 max-w-2xl">
            <CategorySelect value={categoriaId} onChange={setCategoriaId} />
            <ZoneCascadeSelect onChange={setZonaId} />

            <p className="text-sm text-texto-medio">
              Salida: <code className="text-xs">{JSON.stringify({ categoria_id: categoriaId, zona_id: zonaId })}</code>
            </p>
          </div>
        </section>

        {/* SCORE RING */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">ScoreRing</h2>

          <div className="flex flex-wrap items-end gap-10">
            {[85, 55, 20].map((score) => (
              <div key={score} className="flex flex-col items-center gap-2">
                <ScoreRing score={score} factores={factoresDeMuestra(score)} size="tarjeta" />
                <span className="text-xs text-texto-suave">{score} · tarjeta</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={null} factores={{}} size="tarjeta" />
              <span className="text-xs text-texto-suave">null · tarjeta</span>
            </div>

            {[85, 55, 20].map((score) => (
              <div key={`drawer-${score}`} className="flex flex-col items-center gap-2">
                <ScoreRing score={score} factores={factoresDeMuestra(score)} size="drawer" />
                <span className="text-xs text-texto-suave">{score} · drawer</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={null} factores={{}} size="drawer" />
              <span className="text-xs text-texto-suave">null · drawer</span>
            </div>
          </div>
        </section>

        {/* ANALYSIS PANEL (SCRUM-75) */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">AnalysisPanel (Drawer)</h2>
          <p className="text-sm text-texto-medio mb-4">
            Candidato de prueba con justificación completa (narrativa larga incluida, para probar el scroll interno).
          </p>
          <div className="max-w-md flex flex-col gap-6">
            <div>
              <p className="text-sm font-600 text-texto-medio mb-3">Desde una donación: «Elegir a esta persona»</p>
              <CandidateCard candidate={candidatoNecesidad} categoriaNombre="Tecnología" origen={origenDonacion} />
            </div>

            <div>
              <p className="text-sm font-600 text-texto-medio mb-3">Desde una necesidad: texto, sin botón</p>
              <CandidateCard candidate={candidatoConJuicio} categoriaNombre="Tecnología" origen={origenNecesidad} />
            </div>

            <div>
              <p className="text-sm font-600 text-texto-medio mb-3">Estado Analizando / Pendiente</p>
              <CandidateCard candidate={candidatoPendiente} />
            </div>
          </div>
        </section>

        {/* CONFIRMAR ELECCIÓN (SCRUM-90) */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">ConfirmarEleccionModal</h2>
          <p className="text-sm text-texto-medio mb-4">
            «Sí, elegir» navega a /contacto/:donacionId con los dos títulos en el state; no guarda nada.
          </p>
          <Button variant="outline" onClick={() => setConfirmarOpen(true)}>Abrir modal</Button>
          <ConfirmarEleccionModal
            open={confirmarOpen}
            onOpenChange={setConfirmarOpen}
            donacionId={origenDonacion.id}
            tituloDonacion={origenDonacion.titulo}
            tituloNecesidad={candidatoNecesidad.titulo}
          />
        </section>

        {/* PUBLICATION CARD */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">PublicationCard</h2>

          <div className="space-y-4 max-w-md">
            {mockPublications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>

          <p className="text-sm font-600 text-texto-medio mt-8 mb-3">Con etiqueta de tipo (historial)</p>
          <div className="space-y-4 max-w-md">
            {mockPublications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} mostrarTipo />
            ))}
          </div>
        </section>

        {/* CARDS */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">Cards</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Simple</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-texto-medio">
                  Este es un card simple con header y content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-texto-medio mb-4">
                  Este card tiene header, content y footer con acciones.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="ghost">Cancelar</Button>
                <Button size="sm">Aceptar</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* BADGES */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">Badges</h2>

          <div className="flex flex-wrap gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
        </section>

        {/* INFO HINT (SCRUM-140) */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">InfoHint</h2>
          <p className="text-sm text-texto-medio mb-4">
            Ícono de info que abre una explicación corta. Abre con clic, tap o Enter; cierra con Esc o tocando afuera.
          </p>

          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-1 text-sm text-texto-medio">
              Resolución
              <InfoHint texto={FACTOR_INFO.resolucion} />
            </div>
            <div className="flex items-center justify-end gap-1 text-sm text-texto-medio">
              Pegado al borde derecho
              <InfoHint texto={FACTOR_INFO.total} />
            </div>
          </div>
        </section>

        {/* COLOR PALETTE */}
        <section className="mb-16">
          <h2 className="text-3xl font-700 text-tinta mb-6">Paleta de Colores</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-full h-32 bg-primario rounded-tarjeta mb-2 shadow-sm"></div>
              <p className="font-600 text-sm text-tinta">Primario</p>
              <p className="text-xs text-texto-suave">#49A078</p>
            </div>

            <div className="text-center">
              <div className="w-full h-32 bg-secundario rounded-tarjeta mb-2 shadow-sm"></div>
              <p className="font-600 text-sm text-tinta">Secundario</p>
              <p className="text-xs text-texto-suave">#216869</p>
            </div>

            <div className="text-center">
              <div className="w-full h-32 bg-terciario rounded-tarjeta mb-2 shadow-sm"></div>
              <p className="font-600 text-sm text-tinta">Terciario</p>
              <p className="text-xs text-texto-suave">#785964</p>
            </div>

            <div className="text-center">
              <div className="w-full h-32 bg-exito rounded-tarjeta mb-2 shadow-sm"></div>
              <p className="font-600 text-sm text-tinta">Éxito</p>
              <p className="text-xs text-texto-suave">#2F7F5D</p>
            </div>

            <div className="text-center">
              <div className="w-full h-32 bg-atencion rounded-tarjeta mb-2 shadow-sm"></div>
              <p className="font-600 text-sm text-tinta">Atención</p>
              <p className="text-xs text-texto-suave">#92620A</p>
            </div>

            <div className="text-center">
              <div className="w-full h-32 bg-critico rounded-tarjeta mb-2 shadow-sm"></div>
              <p className="font-600 text-sm text-tinta">Crítico</p>
              <p className="text-xs text-texto-suave">#B91C1C</p>
            </div>

            <div className="text-center">
              <div className="w-full h-32 bg-lienzo rounded-tarjeta border border-borde mb-2 shadow-sm"></div>
              <p className="font-600 text-sm text-tinta">Lienzo</p>
              <p className="text-xs text-texto-suave">#E9ECEE</p>
            </div>

            <div className="text-center">
              <div className="w-full h-32 bg-tinta rounded-tarjeta mb-2 shadow-sm"></div>
              <p className="font-600 text-sm text-tarjeta">Tinta</p>
              <p className="text-xs text-texto-suave">#111827</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}