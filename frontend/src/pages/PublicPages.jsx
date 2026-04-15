// ============================================================
// TODAS LAS PÁGINAS PÚBLICAS
// ============================================================
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import {
  noticiasService, docentesService, alumnosService, egresadosService,
  multimediaService, galeriaService, whatsappService, materiasService,
  tramitesService, streamingService, institucionalService, contactoService, convocatoriasService
} from '../services/services'
import { formatDate, truncate, getYouTubeThumbnail } from '../utils/helpers'
import { LoadingCenter, EmptyState, Badge, Pagination, Modal } from '../components/ui/UI'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

// ============================================================
export function NoticiasPage() {
  const [page, setPage] = useState(1)
  const [cat, setCat]   = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['noticias', page, cat],
    queryFn:  () => noticiasService.getAll({ page, limit: 9, categoria: cat || undefined })
  })
  const list  = data?.data?.data        || []
  const pages = data?.data?.pagination?.pages || 1

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="section-title">Noticias</h1>
      <p className="section-subtitle">Novedades de la Carrera de Comunicación Social UMSA</p>
      {isLoading ? <LoadingCenter /> : (
        <>
          {list.length === 0 ? <EmptyState title="No hay noticias publicadas" /> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {list.map(n => (
                <Link key={n.id} to={`/noticias/${n.slug}`} className="card group hover:shadow-md transition-shadow">
                  {n.imagen_url && <img src={n.imagen_url} alt={n.titulo} className="w-full h-44 object-cover" />}
                  <div className="p-4">
                    <Badge color={n.color_hex || '#1A5276'}>{n.categoria || 'Noticia'}</Badge>
                    <h2 className="font-semibold text-gray-800 mt-2 group-hover:text-primary transition-colors line-clamp-2">{n.titulo}</h2>
                    {n.resumen && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{n.resumen}</p>}
                    <p className="text-gray-400 text-xs mt-2">{formatDate(n.publicado_en)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  )
}

// ============================================================
export function NoticiaDetallePage() {
  const { slug } = useParams()
  const { data, isLoading } = useQuery({
    queryKey: ['noticia', slug],
    queryFn:  () => noticiasService.getBySlug(slug)
  })
  const n = data?.data?.data
  if (isLoading) return <LoadingCenter />
  if (!n) return <div className="text-center py-20"><p>Noticia no encontrada.</p><Link to="/noticias" className="btn-primary mt-4 inline-block">Volver</Link></div>
  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      {n.categoria && <Badge color={n.color_hex || '#1A5276'}>{n.categoria}</Badge>}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-3 mb-2">{n.titulo}</h1>
      <p className="text-gray-400 text-sm mb-6">Por {n.autor || 'Redacción'} · {formatDate(n.publicado_en)}</p>
      {n.imagen_url && <img src={n.imagen_url} alt={n.titulo} className="w-full rounded-xl mb-6 max-h-96 object-cover" />}
      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
           dangerouslySetInnerHTML={{ __html: n.contenido }} />
      <Link to="/noticias" className="inline-block mt-8 text-primary hover:underline text-sm">← Volver a noticias</Link>
    </article>
  )
}

// ============================================================
export function EventosPage() {
  const { data } = useQuery({ queryKey: ['eventos-pub'], queryFn: () => eventosService.getAll({}) })
  const eventos  = (data?.data?.data || []).map(e => ({
    id: e.id, title: e.titulo, start: e.fecha_inicio, end: e.fecha_fin,
    color: e.color || '#C0392B', extendedProps: e
  }))
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="section-title">Calendario de eventos</h1>
      <p className="section-subtitle">Talleres, seminarios, defensas y fechas académicas</p>
      <div className="card p-4">
        <FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth"
          locale="es" events={eventos} height="auto"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }} />
      </div>
    </div>
  )
}

// ============================================================
export function DocentesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['docentes'], queryFn: docentesService.getAll })
  const list = data?.data?.data || []
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="section-title">Directorio de docentes</h1>
      <p className="section-subtitle">Cuerpo docente de la Carrera de Comunicación Social UMSA</p>
      {isLoading ? <LoadingCenter /> : list.length === 0 ? <EmptyState icon="👩‍🏫" title="Sin docentes registrados" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {list.map(d => (
            <div key={d.id} className="card p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden bg-gray-200 flex items-center justify-center">
                {d.foto_url
                  ? <img src={d.foto_url} alt={d.nombre_completo} className="w-full h-full object-cover" />
                  : <span className="text-2xl font-bold text-gray-500">{d.nombre_completo.charAt(0)}</span>
                }
              </div>
              <p className="font-semibold text-sm text-gray-800">{d.nombre_completo}</p>
              {d.titulo_academico && <p className="text-primary text-xs font-medium">{d.titulo_academico}</p>}
              {d.especialidad && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{d.especialidad}</p>}
              {d.email && <a href={`mailto:${d.email}`} className="text-secondary text-xs hover:underline mt-1 block">{d.email}</a>}
              <Badge color={d.tipo === 'titular' ? '#1A5276' : '#C0392B'} className="mt-2">{d.tipo}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
export function MejoresAlumnosPage() {
  const { data, isLoading } = useQuery({ queryKey: ['alumnos'], queryFn: () => alumnosService.getAll({}) })
  const list = data?.data?.data || []
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="section-title">Mejores estudiantes</h1>
      <p className="section-subtitle">Reconocimiento a la excelencia académica por gestión</p>
      {isLoading ? <LoadingCenter /> : list.length === 0 ? <EmptyState icon="🏆" title="Sin datos registrados" /> : (
        <div className="space-y-3">
          {list.map((a, i) => (
            <div key={a.id} className="card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${
                i===0?'bg-yellow-400':i===1?'bg-gray-400':i===2?'bg-yellow-700':'bg-secondary'}`}>
                {i + 1}
              </div>
              {a.foto_url && <img src={a.foto_url} alt={a.nombre_completo} className="w-12 h-12 rounded-full object-cover" />}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{a.nombre_completo}</p>
                <p className="text-sm text-gray-500">Semestre {a.semestre_actual} · Gestión {a.gestion}</p>
                {a.logros && <p className="text-xs text-gray-400 mt-0.5">{a.logros}</p>}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{a.promedio}</p>
                <p className="text-xs text-gray-400">promedio</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
export function EgresadosPage() {
  const { data, isLoading } = useQuery({ queryKey: ['egresados'], queryFn: egresadosService.getAll })
  const list = data?.data?.data || []
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="section-title">Egresados destacados</h1>
      <p className="section-subtitle">Comunicadores que hacen historia</p>
      {isLoading ? <LoadingCenter /> : list.length === 0 ? <EmptyState icon="🎓" title="Sin egresados registrados" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(e => (
            <div key={e.id} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {e.foto_url ? <img src={e.foto_url} alt={e.nombre_completo} className="w-full h-full object-cover" />
                    : <span className="text-xl font-bold text-gray-500">{e.nombre_completo.charAt(0)}</span>}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{e.nombre_completo}</p>
                  {e.anio_egreso && <p className="text-xs text-gray-400">Egresado {e.anio_egreso}</p>}
                </div>
              </div>
              {e.ocupacion_actual && <p className="text-sm font-medium text-primary">{e.ocupacion_actual}</p>}
              {e.empresa_institucion && <p className="text-xs text-gray-500">{e.empresa_institucion}</p>}
              {e.testimonio && <p className="text-xs text-gray-500 mt-2 italic border-l-2 border-primary pl-2">"{truncate(e.testimonio, 120)}"</p>}
              {e.linkedin_url && <a href={e.linkedin_url} target="_blank" rel="noreferrer" className="text-secondary text-xs hover:underline mt-2 block">Ver LinkedIn</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
export function MultimediaPage() {
  const [tipo, setTipo] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['multimedia', tipo],
    queryFn:  () => multimediaService.getAll(tipo ? { tipo } : {})
  })
  const list = data?.data?.data || []
  const tipos = ['video','podcast','fotografia','reportaje','otro']
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="section-title">Multimedia estudiantil</h1>
      <p className="section-subtitle">Trabajos producidos por estudiantes de la carrera</p>
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setTipo('')} className={`badge px-3 py-1 text-xs font-medium cursor-pointer ${!tipo ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todos</button>
        {tipos.map(t => (
          <button key={t} onClick={() => setTipo(t)} className={`badge px-3 py-1 text-xs font-medium capitalize cursor-pointer ${tipo===t?'bg-primary text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
        ))}
      </div>
      {isLoading ? <LoadingCenter /> : list.length === 0 ? <EmptyState icon="🎬" title="Sin trabajos publicados" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(m => {
            const thumb = m.thumbnail_url || getYouTubeThumbnail(m.url_contenido)
            return (
              <a key={m.id} href={m.url_contenido} target="_blank" rel="noreferrer" className="card group hover:shadow-md transition-shadow">
                <div className="relative bg-gray-200 h-44 overflow-hidden">
                  {thumb ? <img src={thumb} alt={m.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    : <div className="flex items-center justify-center h-full text-5xl">🎬</div>}
                  <span className="absolute top-2 left-2 badge bg-primary text-white text-xs px-2 py-0.5 capitalize">{m.tipo}</span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-800 group-hover:text-primary transition-colors line-clamp-2">{m.titulo}</p>
                  <p className="text-xs text-gray-500 mt-1">Por {m.autor_nombre}</p>
                  {m.materia_origen && <p className="text-xs text-gray-400">{m.materia_origen}</p>}
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================
export function GaleriaPage() {
  const [albumId, setAlbumId] = useState(null)
  const { data: albumesData } = useQuery({ queryKey: ['albumes'], queryFn: galeriaService.getAlbumes })
  const { data: imagenesData, isLoading } = useQuery({
    queryKey: ['imagenes', albumId], enabled: !!albumId,
    queryFn: () => galeriaService.getImagenes(albumId)
  })
  const albumes  = albumesData?.data?.data  || []
  const imagenes = imagenesData?.data?.data || []
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="section-title">Galería fotográfica</h1>
      <p className="section-subtitle">Momentos de la vida académica de la carrera</p>
      <div className="flex flex-wrap gap-3 mb-6">
        {albumes.map(a => (
          <button key={a.id} onClick={() => setAlbumId(a.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${albumId===a.id?'bg-primary text-white':'card hover:shadow-md'}`}>
            {a.nombre} <span className="text-xs opacity-70">({a.total_imagenes || 0})</span>
          </button>
        ))}
      </div>
      {albumId && (
        isLoading ? <LoadingCenter /> : imagenes.length === 0 ? <EmptyState icon="📷" title="Sin imágenes en este álbum" /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {imagenes.map(img => (
              <a key={img.id} href={img.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl">
                <img src={img.thumbnail_url || img.url} alt={img.titulo || 'Imagen'} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
              </a>
            ))}
          </div>
        )
      )}
      {!albumId && albumes.length > 0 && <p className="text-gray-400 text-sm text-center py-8">Selecciona un álbum para ver las fotos.</p>}
    </div>
  )
}

// ============================================================
export function StreamingPage() {
  const { data } = useQuery({ queryKey: ['streaming'], queryFn: streamingService.getAll })
  const canales = data?.data?.data || []
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="section-title">Streaming y producciones</h1>
      <p className="section-subtitle">Canal de YouTube, TikTok y radio de la carrera</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {canales.map(c => (
          <a key={c.id} href={c.url_canal} target="_blank" rel="noreferrer" className="card p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">{c.plataforma[0].toUpperCase()}</div>
              <div>
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{c.nombre}</p>
                <p className="text-xs text-gray-400 capitalize">{c.plataforma}</p>
              </div>
            </div>
            <p className="text-secondary text-xs hover:underline truncate">{c.url_canal}</p>
          </a>
        ))}
        {canales.length === 0 && <EmptyState icon="📺" title="Sin canales registrados" />}
      </div>
    </div>
  )
}

// ============================================================
export function WhatsappPage() {
  const { data, isLoading } = useQuery({ queryKey: ['whatsapp'], queryFn: whatsappService.getAll })
  const grupos = data?.data?.data || []
  const bySemestre = grupos.reduce((acc, g) => {
    if (!acc[g.semestre]) acc[g.semestre] = []
    acc[g.semestre].push(g)
    return acc
  }, {})
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="section-title">Grupos de WhatsApp por materia</h1>
      <p className="section-subtitle">Accede directamente al grupo de tu materia</p>
      {isLoading ? <LoadingCenter /> : Object.keys(bySemestre).length === 0 ? <EmptyState icon="💬" title="Sin grupos registrados" /> : (
        Object.entries(bySemestre).sort(([a],[b]) => +a - +b).map(([sem, gs]) => (
          <div key={sem} className="mb-6">
            <h2 className="text-sm font-bold text-secondary mb-2 uppercase tracking-wide">Semestre {sem}</h2>
            <div className="space-y-2">
              {gs.map(g => (
                <a key={g.id} href={g.enlace_wa} target="_blank" rel="noreferrer"
                   className="flex items-center justify-between card p-3 hover:border-green-400 hover:shadow-sm transition-all group">
                  <div>
                    <p className="font-medium text-sm text-gray-800 group-hover:text-green-600">{g.materia_nombre}</p>
                    <p className="text-xs text-gray-400">Gestión {g.gestion}</p>
                  </div>
                  <span className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">Unirse</span>
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ============================================================
export function MallaCurricularPage() {
  const [selected, setSelected] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['materias'], queryFn: () => materiasService.getAll('2023') })
  const materias = data?.data?.data || []
  const bySemestre = {}
  for (let i = 1; i <= 10; i++) bySemestre[i] = materias.filter(m => m.semestre === i)
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="section-title">Malla curricular — Pensum 2023</h1>
      <p className="section-subtitle">Plan de estudios vigente de la carrera</p>
      {isLoading ? <LoadingCenter /> : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 min-w-[600px]">
            {Object.entries(bySemestre).map(([sem, ms]) => (
              <div key={sem}>
                <div className="bg-secondary text-white text-center text-xs font-bold py-2 rounded-t-lg">
                  Semestre {sem}
                </div>
                <div className="space-y-1">
                  {ms.length === 0
                    ? <div className="card p-2 text-center text-xs text-gray-300">—</div>
                    : ms.map(m => (
                      <button key={m.id} onClick={() => setSelected(m)}
                        className="w-full card p-2 text-left hover:border-primary hover:shadow-sm transition-all">
                        <p className="text-xs font-medium text-gray-700 line-clamp-2">{m.nombre}</p>
                        {m.creditos && <p className="text-xs text-gray-400 mt-0.5">{m.creditos} créditos</p>}
                      </button>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalle de materia">
          <p className="font-semibold text-gray-800">{selected.nombre}</p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
            <div><span className="font-medium">Semestre:</span> {selected.semestre}</div>
            <div><span className="font-medium">Créditos:</span> {selected.creditos || '—'}</div>
            <div><span className="font-medium">Área:</span> {selected.area || '—'}</div>
            <div><span className="font-medium">Tipo:</span> {selected.tipo}</div>
            <div><span className="font-medium">Pensum:</span> {selected.pensum}</div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ============================================================
export function TramitesPage() {
  const [selected, setSelected] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['tramites'], queryFn: tramitesService.getAll })
  const list = data?.data?.data || []
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="section-title">Trámites académicos</h1>
      <p className="section-subtitle">Guías paso a paso para gestiones en la carrera</p>
      {isLoading ? <LoadingCenter /> : list.length === 0 ? <EmptyState icon="📄" title="Sin trámites registrados" /> : (
        <div className="space-y-3">
          {list.map(t => (
            <button key={t.id} onClick={() => setSelected(t)}
              className="w-full card p-4 text-left hover:border-primary hover:shadow-sm transition-all">
              <p className="font-semibold text-gray-800">{t.nombre}</p>
              {t.descripcion && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.descripcion}</p>}
              {t.contacto && <p className="text-xs text-secondary mt-1">Contacto: {t.contacto}</p>}
            </button>
          ))}
        </div>
      )}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected.nombre} size="lg">
          {selected.descripcion && <p className="text-gray-600 text-sm mb-4">{selected.descripcion}</p>}
          {selected.pasos && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-2">Pasos:</h4>
              <ol className="list-decimal list-inside space-y-1">
                {(typeof selected.pasos === 'string' ? JSON.parse(selected.pasos) : selected.pasos).map((p, i) => (
                  <li key={i} className="text-sm text-gray-600">{typeof p === 'string' ? p : p.descripcion}</li>
                ))}
              </ol>
            </div>
          )}
          {selected.archivo_url && (
            <a href={selected.archivo_url} target="_blank" rel="noreferrer" className="btn-primary text-sm inline-block">
              Descargar formulario
            </a>
          )}
          {selected.contacto && <p className="text-sm text-gray-500 mt-3">Contacto: {selected.contacto}</p>}
        </Modal>
      )}
    </div>
  )
}

// ============================================================
export function BibliotecaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-center">
      <div className="text-6xl mb-4">📚</div>
      <h1 className="section-title">Biblioteca digital</h1>
      <p className="text-gray-600 mb-6">Accede a libros, revistas y recursos académicos de la UMSA para complementar tu formación.</p>
      <a href="https://bibliotecas.umsa.bo" target="_blank" rel="noreferrer" className="btn-primary text-lg px-6 py-3 inline-block">
        Ir a la biblioteca virtual de la UMSA
      </a>
      <p className="text-gray-400 text-sm mt-4">Serás redirigido al portal oficial de bibliotecas de la UMSA.</p>
    </div>
  )
}

// ============================================================
export function IpicomPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="section-title">IpICOM</h1>
      <p className="section-subtitle">Instituto de Investigación, Postgrado e Interacción Social en Comunicación</p>
      <div className="grid sm:grid-cols-2 gap-5">
        {[
          { icon: '🔬', title: 'Investigaciones', desc: 'Proyectos de investigación activos en comunicación, medios y sociedad boliviana.' },
          { icon: '🎓', title: 'Maestría', desc: 'Programa de Maestría en Comunicación. Consulta convocatorias y requisitos de admisión.' },
          { icon: '🌐', title: 'Interacción Social', desc: 'Proyectos de extensión universitaria y vinculación con la comunidad.' },
          { icon: '📰', title: 'Publicaciones', desc: 'Revistas académicas y publicaciones científicas del instituto.' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="card p-5">
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="font-semibold text-secondary mb-1">{title}</h3>
            <p className="text-gray-600 text-sm">{desc}</p>
            <a href="https://ipicom.umsa.bo" target="_blank" rel="noreferrer" className="text-primary text-xs hover:underline mt-2 block">
              Ver más en ipicom.umsa.bo →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
export function QuienesSomosPage() {
  const claves = ['mision','vision','historia']
  const queries = claves.map(c => useQuery({ queryKey: ['inst', c], queryFn: () => institucionalService.get(c) }))
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="section-title">Quiénes somos</h1>
      {queries.map((q, i) => {
        const item = q.data?.data?.data
        return item ? (
          <section key={claves[i]} className="mb-8">
            <h2 className="text-xl font-bold text-secondary mb-3 border-l-4 border-primary pl-3">{item.titulo}</h2>
            <p className="text-gray-700 leading-relaxed">{item.contenido}</p>
          </section>
        ) : null
      })}
    </div>
  )
}

// ============================================================
export function TransparenciaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="section-title">Transparencia institucional</h1>
      <p className="section-subtitle">Documentos normativos y resoluciones de la carrera</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {['Reglamento interno','Resoluciones del HCU','Plan de estudios 2023','Convocatorias a docentes','Informes de gestión','Evaluaciones institucionales'].map(d => (
          <div key={d} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <p className="text-sm font-medium text-gray-700">{d}</p>
          </div>
        ))}
      </div>
      <p className="text-gray-400 text-xs mt-6 text-center">Los documentos se actualizan periódicamente desde el panel de administración.</p>
    </div>
  )
}

// ============================================================
export function ConvocatoriasPage() {
  const { data, isLoading } = useQuery({ queryKey: ['convocatorias'], queryFn: convocatoriasService.getAll })
  const list = data?.data?.data || []
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="section-title">Convocatorias</h1>
      <p className="section-subtitle">Pasantías, docentes, investigación y becas</p>
      {isLoading ? <LoadingCenter /> : list.length === 0 ? <EmptyState icon="📢" title="Sin convocatorias activas" /> : (
        <div className="space-y-4">
          {list.map(c => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge color="#C0392B">{c.tipo}</Badge>
                  <h2 className="font-semibold text-gray-800 mt-1">{c.titulo}</h2>
                  {c.fecha_limite && <p className="text-xs text-primary font-medium mt-1">Hasta el {formatDate(c.fecha_limite)}</p>}
                  <p className="text-gray-600 text-sm mt-2">{truncate(c.descripcion, 200)}</p>
                </div>
                {c.archivo_url && (
                  <a href={c.archivo_url} target="_blank" rel="noreferrer" className="btn-outline text-xs flex-shrink-0">Descargar</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
export function ContactoPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const onSubmit = async (data) => {
    try {
      await contactoService.enviar(data)
      toast.success('¡Mensaje enviado correctamente!')
      reset()
    } catch { toast.error('Error al enviar el mensaje. Intenta de nuevo.') }
  }
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-10">
      <div>
        <h1 className="section-title">Contacto</h1>
        <div className="space-y-4 text-sm text-gray-600">
          {[
            ['📍', 'Dirección', 'Edificio René Zavaleta, Piso 5, Calle Federizo Suazo, La Paz, Bolivia'],
            ['📞', 'Teléfonos', '(591-2) 2911880 · (591-2) 2911890'],
            ['✉️', 'Correo', 'comunicasocialumsa@gmail.com'],
            ['🌐', 'Web actual', 'comunicacion.umsa.bo'],
          ].map(([icon, label, val]) => (
            <div key={label} className="flex gap-3">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <div>
                <p className="font-medium text-gray-700">{label}</p>
                <p>{val}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <iframe title="Mapa UMSA"
            src="https://maps.google.com/maps?q=-16.505857,-68.127117&z=16&output=embed"
            className="w-full h-48 rounded-xl border" loading="lazy" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-secondary mb-4">Envíanos un mensaje</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nombre completo</label>
            <input className="input" {...register('nombre', { required: true })} />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">Campo requerido</p>}
          </div>
          <div>
            <label className="label">Correo electrónico</label>
            <input className="input" type="email" {...register('email', { required: true })} />
            {errors.email && <p className="text-red-500 text-xs mt-1">Correo válido requerido</p>}
          </div>
          <div>
            <label className="label">Mensaje</label>
            <textarea className="input h-28 resize-none" {...register('mensaje', { required: true })} />
            {errors.mensaje && <p className="text-red-500 text-xs mt-1">Campo requerido</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </form>
      </div>
    </div>
  )
}
