import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { noticiasService, institucionalService, eventosService } from '../services/services'
import { formatDate, truncate } from '../utils/helpers'
import { LoadingCenter, Badge } from '../components/ui/UI'

export default function HomePage() {
  const { data: noticias }    = useQuery({ queryKey: ['noticias-home'], queryFn: () => noticiasService.getAll({ limit: 6 }) })
  const { data: eventos }     = useQuery({ queryKey: ['eventos-home'],  queryFn: () => eventosService.getAll({ limit: 4 }) })
  const { data: mision }      = useQuery({ queryKey: ['inst-mision'],   queryFn: () => institucionalService.get('mision') })

  const notiList   = noticias?.data?.data || []
  const eventoList = eventos?.data?.data  || []
  const destacada  = notiList.find(n => n.destacado) || notiList[0]

  return (
    <div>
      {/* HERO */}
      <section className="bg-secondary text-white relative overflow-hidden">
        <div className="bg-primary h-1 w-full absolute top-0" />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Universidad Mayor de San Andrés
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Carrera de Ciencias de la<br />
              <span className="text-red-300">Comunicación Social</span>
            </h1>
            <p className="text-blue-200 text-lg mb-6">
              {mision?.data?.data?.contenido
                ? truncate(mision.data.data.contenido, 200)
                : 'Formando comunicadores comprometidos con la realidad boliviana.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/quienes-somos" className="btn-primary">Conocer la carrera</Link>
              <Link to="/malla-curricular" className="border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-secondary transition-colors font-medium">
                Ver malla curricular
              </Link>
            </div>
          </div>

          {/* Destacada */}
          {destacada && (
            <Link to={`/noticias/${destacada.slug}`} className="card overflow-hidden group">
              {destacada.imagen_url && (
                <img src={destacada.imagen_url} alt={destacada.titulo}
                     className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              )}
              <div className="p-4">
                <Badge color={destacada.color_hex || '#C0392B'}>{destacada.categoria || 'Noticia'}</Badge>
                <h3 className="text-gray-800 font-semibold mt-2 text-sm group-hover:text-primary transition-colors">
                  {destacada.titulo}
                </h3>
                <p className="text-gray-400 text-xs mt-1">{formatDate(destacada.publicado_en)}</p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* STATS BAR */}
      <div className="bg-primary text-white py-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 sm:grid-cols-3 gap-4 text-center">
          {[['40+', 'Años formando'], ['5000+', 'Estudiantes'], ['1984', 'Fundación']].map(([v, l]) => (
            <div key={l}>
              <p className="text-2xl font-bold">{v}</p>
              <p className="text-red-200 text-xs">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ACCESOS RÁPIDOS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="section-title text-center mb-8">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { to: '/whatsapp',        icon: '💬', label: 'Grupos WhatsApp' },
            { to: '/malla-curricular',icon: '📋', label: 'Malla Curricular' },
            { to: '/tramites',        icon: '📄', label: 'Trámites' },
            { to: '/biblioteca',      icon: '📚', label: 'Biblioteca' },
            { to: '/docentes',        icon: '👩‍🏫', label: 'Docentes' },
            { to: '/multimedia',      icon: '🎬', label: 'Multimedia' },
          ].map(({ to, icon, label }) => (
            <Link key={to} to={to}
              className="card p-4 text-center hover:border-primary hover:shadow-md transition-all group">
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-xs font-medium text-gray-600 group-hover:text-primary transition-colors">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* NOTICIAS */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Últimas noticias</h2>
            <Link to="/noticias" className="text-primary hover:underline text-sm font-medium">Ver todas →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {notiList.slice(0, 6).map(n => (
              <Link key={n.id} to={`/noticias/${n.slug}`} className="card group hover:shadow-md transition-shadow">
                {n.imagen_url && (
                  <img src={n.imagen_url} alt={n.titulo} className="w-full h-40 object-cover group-hover:opacity-90 transition-opacity" />
                )}
                <div className="p-4">
                  <Badge color={n.color_hex || '#1A5276'}>{n.categoria || 'Noticia'}</Badge>
                  <h3 className="font-semibold text-gray-800 mt-2 text-sm group-hover:text-primary transition-colors line-clamp-2">
                    {n.titulo}
                  </h3>
                  {n.resumen && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{n.resumen}</p>}
                  <p className="text-gray-400 text-xs mt-2">{formatDate(n.publicado_en)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS */}
      {eventoList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Próximos eventos</h2>
            <Link to="/eventos" className="text-primary hover:underline text-sm font-medium">Ver calendario →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {eventoList.map(e => (
              <div key={e.id} className="card p-4 border-l-4" style={{ borderColor: e.color || '#C0392B' }}>
                <span className="text-xs text-gray-400 uppercase tracking-wide">{e.tipo}</span>
                <h3 className="font-semibold text-sm text-gray-800 mt-1 line-clamp-2">{e.titulo}</h3>
                <p className="text-xs text-gray-500 mt-2">{formatDate(e.fecha_inicio)}</p>
                {e.lugar && <p className="text-xs text-gray-400">{e.lugar}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
