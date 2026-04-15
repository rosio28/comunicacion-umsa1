import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const LINKS = [
  { to: '/noticias',       label: 'Noticias' },
  { to: '/eventos',        label: 'Eventos' },
  { to: '/docentes',       label: 'Docentes' },
  { to: '/mejores-alumnos',label: 'Alumnos' },
  { to: '/multimedia',     label: 'Multimedia' },
  { to: '/galeria',        label: 'Galería' },
  { to: '/malla-curricular',label: 'Malla' },
  { to: '/whatsapp',       label: 'WhatsApp' },
  { to: '/contacto',       label: 'Contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-secondary shadow-md sticky top-0 z-50">
      {/* Top stripe */}
      <div className="bg-primary h-1 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">Comunicación Social</p>
              <p className="text-blue-200 text-xs leading-tight">UMSA · La Paz</p>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {LINKS.map(l => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-blue-100 hover:bg-secondary-light hover:text-white'
                  }`
                }>
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Admin button + mobile toggle */}
          <div className="flex items-center gap-2">
            <Link to="/admin" className="hidden sm:inline-flex items-center gap-1 bg-primary hover:bg-primary-dark text-white text-xs font-medium px-3 py-1.5 rounded transition-colors">
              Panel Admin
            </Link>
            <button onClick={() => setOpen(!open)} className="lg:hidden text-white p-1">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden pb-3 pt-1 flex flex-col gap-1">
            {LINKS.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium ${isActive ? 'bg-primary text-white' : 'text-blue-100 hover:bg-secondary-light'}`
                }>
                {l.label}
              </NavLink>
            ))}
            <Link to="/admin" onClick={() => setOpen(false)} className="btn-primary text-center text-sm mt-2">Panel Admin</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
