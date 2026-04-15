import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, LogOut, Home, Newspaper, Calendar, Users, GraduationCap,
         Image, MessageSquare, BookOpen, Settings, ChevronDown } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin',               label: 'Dashboard',    icon: Home,          minRole: 'editor' },
  { to: '/admin/noticias',      label: 'Noticias',     icon: Newspaper,     minRole: 'editor' },
  { to: '/admin/eventos',       label: 'Eventos',      icon: Calendar,      minRole: 'admin' },
  { to: '/admin/convocatorias', label: 'Convocatorias',icon: BookOpen,      minRole: 'admin' },
  { to: '/admin/docentes',      label: 'Docentes',     icon: GraduationCap, minRole: 'admin' },
  { to: '/admin/alumnos',       label: 'Mejores Alumnos', icon: Users,      minRole: 'admin' },
  { to: '/admin/egresados',     label: 'Egresados',    icon: Users,         minRole: 'admin' },
  { to: '/admin/multimedia',    label: 'Multimedia',   icon: Image,         minRole: 'editor' },
  { to: '/admin/galeria',       label: 'Galería',      icon: Image,         minRole: 'editor' },
  { to: '/admin/whatsapp',      label: 'WhatsApp',     icon: MessageSquare, minRole: 'admin' },
  { to: '/admin/malla',         label: 'Malla Curricular', icon: BookOpen,  minRole: 'admin' },
  { to: '/admin/institucional', label: 'Institucional',icon: Settings,      minRole: 'admin' },
  { to: '/admin/tramites',      label: 'Trámites',     icon: BookOpen,      minRole: 'admin' },
  { to: '/admin/usuarios',      label: 'Usuarios',     icon: Users,         minRole: 'superadmin' },
]

const ROLE_HIERARCHY = { superadmin: 4, admin: 3, editor: 2, visitante: 1 }

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/admin/login') }
  const userLevel = ROLE_HIERARCHY[usuario?.rol] || 0

  const visibleItems = NAV_ITEMS.filter(item =>
    userLevel >= (ROLE_HIERARCHY[item.minRole] || 0)
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-secondary flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-sm">CCS — UMSA</p>
            <p className="text-red-200 text-xs">Panel de Administración</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-blue-100 hover:bg-secondary-light hover:text-white'
                }`
              }>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-blue-700 px-3 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{usuario?.nombre}</p>
              <p className="text-blue-300 text-xs capitalize">{usuario?.rol}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-blue-200 hover:text-white text-xs w-full px-2 py-1.5 rounded hover:bg-secondary-light transition-colors">
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
            <Menu size={22} />
          </button>
          <div className="w-1 h-6 bg-primary rounded hidden lg:block" />
          <h2 className="text-sm font-semibold text-gray-700 flex-1">Comunicación Social UMSA</h2>
          <span className="hidden sm:inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
            {usuario?.rol}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
