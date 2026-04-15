import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/services'
import toast from 'react-hot-toast'

// ============================================================
// LOGIN
// ============================================================
export function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciales incorrectas')
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="bg-primary h-1 w-full absolute top-0" />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-xl">CS</span>
          </div>
          <h1 className="font-bold text-xl text-gray-800">Panel de administración</h1>
          <p className="text-gray-500 text-sm">Comunicación Social — UMSA</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Correo electrónico</label>
            <input className="input" type="email" autoComplete="email"
              {...register('email', { required: 'Requerido' })} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" autoComplete="current-password"
              {...register('password', { required: 'Requerido' })} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link to="/admin/recuperar" className="text-secondary text-sm hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>
        <div className="border-t mt-4 pt-4 text-center">
          <Link to="/" className="text-gray-400 text-xs hover:text-gray-600">← Volver al sitio público</Link>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// RECUPERAR CONTRASEÑA
// ============================================================
export function RecuperarPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()
  const onSubmit = async ({ email }) => {
    try {
      await authService.recuperar(email)
      setSent(true)
    } catch { toast.error('Error al enviar el correo') }
  }
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
        {sent ? (
          <>
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="font-bold text-lg mb-2">Revisa tu correo</h2>
            <p className="text-gray-500 text-sm mb-4">Si el email existe, recibirás un enlace para restablecer tu contraseña.</p>
            <Link to="/admin/login" className="btn-primary inline-block">Volver al login</Link>
          </>
        ) : (
          <>
            <h1 className="font-bold text-xl mb-2">Recuperar contraseña</h1>
            <p className="text-gray-500 text-sm mb-6">Ingresa tu correo y te enviaremos un enlace.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
              <div>
                <label className="label">Correo electrónico</label>
                <input className="input" type="email" {...register('email', { required: true })} />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
            <Link to="/admin/login" className="text-gray-400 text-xs hover:text-gray-600 mt-4 block">← Volver al login</Link>
          </>
        )}
      </div>
    </div>
  )
}
