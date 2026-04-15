import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-secondary text-white mt-16">
      <div className="bg-primary h-1" />
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-2">Comunicación Social</h3>
          <p className="text-blue-200 text-sm">Universidad Mayor de San Andrés</p>
          <p className="text-blue-200 text-sm">Facultad de Ciencias Sociales</p>
          <p className="text-blue-200 text-sm mt-2">Edificio René Zavaleta, Piso 5</p>
          <p className="text-blue-200 text-sm">La Paz, Bolivia</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">Accesos rápidos</h3>
          <ul className="space-y-1 text-sm text-blue-200">
            {[
              ['/noticias','Noticias'],
              ['/docentes','Docentes'],
              ['/malla-curricular','Malla curricular'],
              ['/tramites','Trámites'],
              ['/biblioteca','Biblioteca digital'],
              ['/ipicom','IpICOM'],
              ['/transparencia','Transparencia'],
            ].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Contacto</h3>
          <p className="text-blue-200 text-sm">Tel: (591-2) 2911880</p>
          <p className="text-blue-200 text-sm">Tel: (591-2) 2911890</p>
          <p className="text-blue-200 text-sm mt-1">comunicasocialumsa@gmail.com</p>
          <div className="flex gap-3 mt-3">
            <a href="https://www.facebook.com/comunicacion.umsa.bo" target="_blank" rel="noreferrer"
               className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded transition-colors">
              Facebook
            </a>
            <a href="https://tiktok.com/@comunicacion_social_umsa" target="_blank" rel="noreferrer"
               className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-3 py-1.5 rounded transition-colors">
              TikTok
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-blue-700 text-center py-3 text-blue-300 text-xs">
        © {new Date().getFullYear()} Carrera de Ciencias de la Comunicación Social — UMSA, La Paz, Bolivia
      </div>
    </footer>
  )
}
