import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLayout from './components/admin/AdminLayout'

// Public pages
import HomePage from './pages/HomePage'
import {
  NoticiasPage, NoticiaDetallePage, EventosPage, DocentesPage,
  MejoresAlumnosPage, EgresadosPage, MultimediaPage, GaleriaPage,
  StreamingPage, WhatsappPage, MallaCurricularPage, TramitesPage,
  BibliotecaPage, IpicomPage, QuienesSomosPage, TransparenciaPage,
  ConvocatoriasPage, ContactoPage
} from './pages/PublicPages'

// Admin pages
import { AdminLoginPage, RecuperarPasswordPage } from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import {
  AdminNoticiasPage, NoticiaFormPage, AdminDocentesPage, AdminAlumnosPage,
  AdminEgresadosPage, AdminWhatsappPage, AdminGaleriaPage, AdminMultimediaPage,
  AdminInstitucionalPage, AdminUsuariosPage, AdminEventosPage,
  AdminConvocatoriasPage, AdminMallaPage
} from './pages/admin/AdminPages'

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

function AdminWrapper({ children, minRole = 'editor' }) {
  return (
    <ProtectedRoute minRole={minRole}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          {/* ============ RUTAS PÚBLICAS ============ */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/noticias" element={<PublicLayout><NoticiasPage /></PublicLayout>} />
          <Route path="/noticias/:slug" element={<PublicLayout><NoticiaDetallePage /></PublicLayout>} />
          <Route path="/eventos" element={<PublicLayout><EventosPage /></PublicLayout>} />
          <Route path="/convocatorias" element={<PublicLayout><ConvocatoriasPage /></PublicLayout>} />
          <Route path="/docentes" element={<PublicLayout><DocentesPage /></PublicLayout>} />
          <Route path="/mejores-alumnos" element={<PublicLayout><MejoresAlumnosPage /></PublicLayout>} />
          <Route path="/egresados" element={<PublicLayout><EgresadosPage /></PublicLayout>} />
          <Route path="/multimedia" element={<PublicLayout><MultimediaPage /></PublicLayout>} />
          <Route path="/galeria" element={<PublicLayout><GaleriaPage /></PublicLayout>} />
          <Route path="/streaming" element={<PublicLayout><StreamingPage /></PublicLayout>} />
          <Route path="/whatsapp" element={<PublicLayout><WhatsappPage /></PublicLayout>} />
          <Route path="/malla-curricular" element={<PublicLayout><MallaCurricularPage /></PublicLayout>} />
          <Route path="/tramites" element={<PublicLayout><TramitesPage /></PublicLayout>} />
          <Route path="/biblioteca" element={<PublicLayout><BibliotecaPage /></PublicLayout>} />
          <Route path="/ipicom" element={<PublicLayout><IpicomPage /></PublicLayout>} />
          <Route path="/quienes-somos" element={<PublicLayout><QuienesSomosPage /></PublicLayout>} />
          <Route path="/transparencia" element={<PublicLayout><TransparenciaPage /></PublicLayout>} />
          <Route path="/convenios" element={<PublicLayout><QuienesSomosPage /></PublicLayout>} />
          <Route path="/contacto" element={<PublicLayout><ContactoPage /></PublicLayout>} />

          {/* ============ ADMIN AUTH (sin layout) ============ */}
          <Route path="/admin/login"     element={<AdminLoginPage />} />
          <Route path="/admin/recuperar" element={<RecuperarPasswordPage />} />

          {/* ============ PANEL ADMIN (protegido) ============ */}
          <Route path="/admin" element={<AdminWrapper><DashboardPage /></AdminWrapper>} />
          <Route path="/admin/noticias"              element={<AdminWrapper><AdminNoticiasPage /></AdminWrapper>} />
          <Route path="/admin/noticias/nueva"        element={<AdminWrapper><NoticiaFormPage /></AdminWrapper>} />
          <Route path="/admin/noticias/:id/editar"   element={<AdminWrapper><NoticiaFormPage /></AdminWrapper>} />
          <Route path="/admin/eventos"               element={<AdminWrapper minRole="admin"><AdminEventosPage /></AdminWrapper>} />
          <Route path="/admin/convocatorias"         element={<AdminWrapper minRole="admin"><AdminConvocatoriasPage /></AdminWrapper>} />
          <Route path="/admin/docentes"              element={<AdminWrapper minRole="admin"><AdminDocentesPage /></AdminWrapper>} />
          <Route path="/admin/alumnos"               element={<AdminWrapper minRole="admin"><AdminAlumnosPage /></AdminWrapper>} />
          <Route path="/admin/egresados"             element={<AdminWrapper minRole="admin"><AdminEgresadosPage /></AdminWrapper>} />
          <Route path="/admin/multimedia"            element={<AdminWrapper><AdminMultimediaPage /></AdminWrapper>} />
          <Route path="/admin/galeria"               element={<AdminWrapper><AdminGaleriaPage /></AdminWrapper>} />
          <Route path="/admin/whatsapp"              element={<AdminWrapper minRole="admin"><AdminWhatsappPage /></AdminWrapper>} />
          <Route path="/admin/malla"                 element={<AdminWrapper minRole="admin"><AdminMallaPage /></AdminWrapper>} />
          <Route path="/admin/institucional"         element={<AdminWrapper minRole="admin"><AdminInstitucionalPage /></AdminWrapper>} />
          <Route path="/admin/usuarios"              element={<AdminWrapper minRole="superadmin"><AdminUsuariosPage /></AdminWrapper>} />

          {/* 404 */}
          <Route path="*" element={
            <PublicLayout>
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="text-6xl">404</div>
                <h1 className="text-2xl font-bold text-gray-700">Página no encontrada</h1>
                <a href="/" className="btn-primary">Ir al inicio</a>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
