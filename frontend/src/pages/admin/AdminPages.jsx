import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  noticiasService, docentesService, alumnosService, egresadosService,
  multimediaService, galeriaService, whatsappService, materiasService,
  institucionalService, tramitesService, convocatoriasService, usuariosService,
  eventosService, streamingService, categoriasService
} from '../../services/services'
import { LoadingCenter, EmptyState, Modal, ConfirmDialog, SectionHeader, Badge } from '../../components/ui/UI'
import { formatDate, rolColor } from '../../utils/helpers'
import api from '../../services/api'

// ============================================================
// NOTICIAS ADMIN
// ============================================================
export function AdminNoticiasPage() {
  const qc = useQueryClient()
  const [confirmId, setConfirmId] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['noticias-admin'], queryFn: () => noticiasService.getAll({ limit: 50 }) })
  const list = data?.data?.data || []

  const deleteMut  = useMutation({ mutationFn: (id) => noticiasService.delete(id),  onSuccess: () => { qc.invalidateQueries(['noticias-admin']); toast.success('Noticia eliminada') } })
  const publishMut = useMutation({ mutationFn: (id) => noticiasService.publicar(id), onSuccess: () => { qc.invalidateQueries(['noticias-admin']); toast.success('Estado actualizado') } })

  return (
    <div>
      <SectionHeader title="Noticias" subtitle="Gestiona las noticias y avisos de la carrera">
        <Link to="/admin/noticias/nueva" className="btn-primary text-sm">+ Nueva noticia</Link>
      </SectionHeader>
      {isLoading ? <LoadingCenter /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">TÍTULO</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">CATEGORÍA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ESTADO</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Sin noticias</td></tr>}
              {list.map(n => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 truncate max-w-xs">{n.titulo}</p>
                    <p className="text-xs text-gray-400">{formatDate(n.creado_en)}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {n.categoria && <Badge color={n.color_hex || '#1A5276'}>{n.categoria}</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => publishMut.mutate(n.id)}
                      className={`badge text-xs px-2 py-0.5 cursor-pointer hover:opacity-80 ${n.publicado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {n.publicado ? '✓ Publicada' : '○ Borrador'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/admin/noticias/${n.id}/editar`} className="text-secondary hover:underline text-xs">Editar</Link>
                      <button onClick={() => setConfirmId(n.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { deleteMut.mutate(confirmId); setConfirmId(null) }}
        title="Eliminar noticia" message="¿Seguro que deseas eliminar esta noticia? Esta acción no se puede deshacer." />
    </div>
  )
}

// ============================================================
// NOTICIA FORM (crear / editar)
// ============================================================
export function NoticiaFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm()

  const { data: catData } = useQuery({ queryKey: ['cats-noticias'], queryFn: () => categoriasService.getAll('noticias') })
  const cats = catData?.data?.data || []

  const { data: noticiaData } = useQuery({
    queryKey: ['noticia-edit', id], enabled: isEdit,
    queryFn: () => api.get(`/noticias/admin`).then(r => r.data.data.find(n => n.id === +id))
  })

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await noticiasService.update(id, data)
        toast.success('Noticia actualizada')
      } else {
        await noticiasService.create(data)
        toast.success('Noticia creada')
      }
      qc.invalidateQueries(['noticias-admin'])
      navigate('/admin/noticias')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    }
  }

  return (
    <div className="max-w-3xl">
      <SectionHeader title={isEdit ? 'Editar noticia' : 'Nueva noticia'} subtitle="">
        <Link to="/admin/noticias" className="btn-outline text-sm">← Volver</Link>
      </SectionHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div>
          <label className="label">Título *</label>
          <input className="input" {...register('titulo', { required: 'Requerido' })} defaultValue={noticiaData?.titulo} />
          {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message}</p>}
        </div>
        <div>
          <label className="label">Categoría</label>
          <select className="input" {...register('categoria_id')}>
            <option value="">Sin categoría</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Resumen</label>
          <textarea className="input h-20 resize-none" {...register('resumen')} defaultValue={noticiaData?.resumen} />
        </div>
        <div>
          <label className="label">Contenido (HTML) *</label>
          <textarea className="input h-48 resize-y font-mono text-xs" {...register('contenido', { required: 'Requerido' })} defaultValue={noticiaData?.contenido} />
          {errors.contenido && <p className="text-red-500 text-xs mt-1">{errors.contenido.message}</p>}
        </div>
        <div>
          <label className="label">URL de imagen destacada</label>
          <input className="input" type="url" {...register('imagen_url')} defaultValue={noticiaData?.imagen_url} placeholder="https://..." />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="destacado" {...register('destacado')} defaultChecked={noticiaData?.destacado} />
          <label htmlFor="destacado" className="text-sm text-gray-600">Marcar como destacada (aparece en el Hero)</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear noticia'}
          </button>
          <Link to="/admin/noticias" className="btn-outline">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}

// ============================================================
// DOCENTES ADMIN
// ============================================================
export function AdminDocentesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['docentes-admin'], queryFn: docentesService.getAll })
  const list = data?.data?.data || []
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const saveMut = useMutation({
    mutationFn: (d) => editing ? docentesService.update(editing.id, d) : docentesService.create(d),
    onSuccess: () => { qc.invalidateQueries(['docentes-admin']); toast.success(editing ? 'Actualizado' : 'Docente creado'); setModal(false); reset(); setEditing(null) }
  })
  const delMut = useMutation({
    mutationFn: (id) => docentesService.delete(id),
    onSuccess: () => { qc.invalidateQueries(['docentes-admin']); toast.success('Docente desactivado') }
  })

  const openEdit = (d) => { setEditing(d); setModal(true) }
  const openNew  = ()  => { setEditing(null); reset(); setModal(true) }

  return (
    <div>
      <SectionHeader title="Docentes" subtitle="Directorio del cuerpo docente">
        <button onClick={openNew} className="btn-primary text-sm">+ Agregar docente</button>
      </SectionHeader>
      {isLoading ? <LoadingCenter /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.length === 0 && <EmptyState icon="👩‍🏫" title="Sin docentes" />}
          {list.map(d => (
            <div key={d.id} className="card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                  {d.nombre_completo.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{d.nombre_completo}</p>
                  {d.titulo_academico && <p className="text-xs text-primary">{d.titulo_academico}</p>}
                </div>
              </div>
              {d.especialidad && <p className="text-xs text-gray-500 line-clamp-1">{d.especialidad}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(d)} className="text-secondary hover:underline text-xs">Editar</button>
                <button onClick={() => setConfirmId(d.id)} className="text-red-500 hover:underline text-xs">Desactivar</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null) }}
        title={editing ? 'Editar docente' : 'Nuevo docente'}>
        <form onSubmit={handleSubmit((d) => saveMut.mutate(d))} className="space-y-3">
          {[
            { name: 'nombre_completo', label: 'Nombre completo *', required: true, def: editing?.nombre_completo },
            { name: 'titulo_academico', label: 'Título académico (ej: M.Sc.)', def: editing?.titulo_academico },
            { name: 'especialidad', label: 'Especialidad', def: editing?.especialidad },
            { name: 'email', label: 'Correo de contacto', type: 'email', def: editing?.email },
            { name: 'foto_url', label: 'URL de foto', def: editing?.foto_url },
          ].map(({ name, label, required, type, def }) => (
            <div key={name}>
              <label className="label">{label}</label>
              <input className="input" type={type || 'text'} defaultValue={def}
                {...register(name, required ? { required: 'Requerido' } : {})} />
            </div>
          ))}
          <div>
            <label className="label">Tipo</label>
            <select className="input" defaultValue={editing?.tipo || 'titular'} {...register('tipo')}>
              <option value="titular">Titular</option>
              <option value="interino">Interino</option>
              <option value="invitado">Invitado</option>
            </select>
          </div>
          <div>
            <label className="label">Bio corta</label>
            <textarea className="input h-20 resize-none" defaultValue={editing?.bio_corta} {...register('bio_corta')} />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)}
        onConfirm={() => { delMut.mutate(confirmId); setConfirmId(null) }}
        title="Desactivar docente" message="¿Desactivar este docente? Dejará de aparecer en el sitio." />
    </div>
  )
}

// ============================================================
// MEJORES ALUMNOS ADMIN
// ============================================================
export function AdminAlumnosPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['alumnos-admin'], queryFn: () => alumnosService.getAll({}) })
  const list = data?.data?.data || []
  const { register, handleSubmit, reset } = useForm()

  const saveMut = useMutation({
    mutationFn: (d) => editing ? alumnosService.update(editing.id, d) : alumnosService.create(d),
    onSuccess: () => { qc.invalidateQueries(['alumnos-admin']); toast.success('Guardado'); setModal(false); reset(); setEditing(null) }
  })
  const delMut = useMutation({
    mutationFn: alumnosService.delete,
    onSuccess: () => { qc.invalidateQueries(['alumnos-admin']); toast.success('Eliminado') }
  })

  return (
    <div>
      <SectionHeader title="Mejores estudiantes" subtitle="Ranking académico por gestión">
        <button onClick={() => { setEditing(null); reset(); setModal(true) }} className="btn-primary text-sm">+ Agregar alumno</button>
      </SectionHeader>
      {isLoading ? <LoadingCenter /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">NOMBRE</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">PROMEDIO</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">GESTIÓN</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{a.nombre_completo}</td>
                  <td className="px-4 py-3 font-bold text-primary">{a.promedio}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{a.gestion}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(a); setModal(true) }} className="text-secondary hover:underline text-xs mr-2">Editar</button>
                    <button onClick={() => delMut.mutate(a.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Sin datos</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null) }} title={editing ? 'Editar alumno' : 'Agregar alumno'}>
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-3">
          <div><label className="label">Nombre completo *</label><input className="input" defaultValue={editing?.nombre_completo} {...register('nombre_completo', { required: true })} /></div>
          <div><label className="label">Promedio *</label><input className="input" type="number" step="0.01" min="0" max="100" defaultValue={editing?.promedio} {...register('promedio', { required: true })} /></div>
          <div><label className="label">Semestre actual</label><input className="input" type="number" defaultValue={editing?.semestre_actual} {...register('semestre_actual')} /></div>
          <div><label className="label">Gestión (ej: 2026-I) *</label><input className="input" defaultValue={editing?.gestion} {...register('gestion', { required: true })} /></div>
          <div><label className="label">Logros</label><textarea className="input h-20 resize-none" defaultValue={editing?.logros} {...register('logros')} /></div>
          <div><label className="label">URL de foto</label><input className="input" defaultValue={editing?.foto_url} {...register('foto_url')} /></div>
          <button type="submit" className="btn-primary w-full">Guardar</button>
        </form>
      </Modal>
    </div>
  )
}

// ============================================================
// EGRESADOS ADMIN
// ============================================================
export function AdminEgresadosPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['egresados-admin'], queryFn: egresadosService.getAll })
  const list = data?.data?.data || []
  const { register, handleSubmit, reset } = useForm()
  const saveMut = useMutation({
    mutationFn: (d) => editing ? egresadosService.update(editing.id, d) : egresadosService.create(d),
    onSuccess: () => { qc.invalidateQueries(['egresados-admin']); toast.success('Guardado'); setModal(false); reset(); setEditing(null) }
  })
  return (
    <div>
      <SectionHeader title="Egresados destacados" subtitle="Perfiles de egresados de la carrera">
        <button onClick={() => { setEditing(null); reset(); setModal(true) }} className="btn-primary text-sm">+ Agregar egresado</button>
      </SectionHeader>
      {isLoading ? <LoadingCenter /> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {list.length === 0 && <EmptyState icon="🎓" title="Sin egresados" />}
          {list.map(e => (
            <div key={e.id} className="card p-4 flex gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-white font-bold">{e.nombre_completo.charAt(0)}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{e.nombre_completo}</p>
                <p className="text-xs text-gray-500">{e.ocupacion_actual}</p>
                <p className="text-xs text-gray-400">{e.anio_egreso}</p>
                <button onClick={() => { setEditing(e); setModal(true) }} className="text-secondary hover:underline text-xs mt-1">Editar</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null) }} title={editing ? 'Editar egresado' : 'Nuevo egresado'} size="lg">
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><label className="label">Nombre completo *</label><input className="input" defaultValue={editing?.nombre_completo} {...register('nombre_completo', { required: true })} /></div>
          <div><label className="label">Año de egreso</label><input className="input" type="number" defaultValue={editing?.anio_egreso} {...register('anio_egreso')} /></div>
          <div><label className="label">Ocupación actual</label><input className="input" defaultValue={editing?.ocupacion_actual} {...register('ocupacion_actual')} /></div>
          <div className="sm:col-span-2"><label className="label">Empresa / Institución</label><input className="input" defaultValue={editing?.empresa_institucion} {...register('empresa_institucion')} /></div>
          <div className="sm:col-span-2"><label className="label">Testimonio</label><textarea className="input h-20 resize-none" defaultValue={editing?.testimonio} {...register('testimonio')} /></div>
          <div><label className="label">LinkedIn URL</label><input className="input" defaultValue={editing?.linkedin_url} {...register('linkedin_url')} /></div>
          <div><label className="label">URL de foto</label><input className="input" defaultValue={editing?.foto_url} {...register('foto_url')} /></div>
          <div className="sm:col-span-2"><button type="submit" className="btn-primary w-full">Guardar</button></div>
        </form>
      </Modal>
    </div>
  )
}

// ============================================================
// WHATSAPP ADMIN
// ============================================================
export function AdminWhatsappPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['wa-admin'], queryFn: whatsappService.getAll })
  const list = data?.data?.data || []
  const { register, handleSubmit, reset } = useForm()
  const saveMut = useMutation({
    mutationFn: (d) => editing ? whatsappService.update(editing.id, d) : whatsappService.create(d),
    onSuccess: () => { qc.invalidateQueries(['wa-admin']); toast.success('Guardado'); setModal(false); reset(); setEditing(null) }
  })
  const delMut = useMutation({ mutationFn: whatsappService.delete, onSuccess: () => { qc.invalidateQueries(['wa-admin']); toast.success('Desactivado') } })

  return (
    <div>
      <SectionHeader title="Grupos de WhatsApp" subtitle="Directorio de grupos por materia y semestre">
        <button onClick={() => { setEditing(null); reset(); setModal(true) }} className="btn-primary text-sm">+ Agregar grupo</button>
      </SectionHeader>
      {isLoading ? <LoadingCenter /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">MATERIA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">SEM.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">GESTIÓN</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ESTADO</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(g => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{g.materia_nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{g.semestre}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{g.gestion}</td>
                  <td className="px-4 py-3"><span className={`badge text-xs px-2 py-0.5 ${g.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{g.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(g); setModal(true) }} className="text-secondary hover:underline text-xs mr-2">Editar</button>
                    <button onClick={() => delMut.mutate(g.id)} className="text-red-500 hover:underline text-xs">Desactivar</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Sin grupos</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null) }} title={editing ? 'Editar grupo' : 'Nuevo grupo'}>
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-3">
          <div><label className="label">Nombre de la materia *</label><input className="input" defaultValue={editing?.materia_nombre} {...register('materia_nombre', { required: true })} /></div>
          <div><label className="label">Semestre (1-10) *</label><input className="input" type="number" min="1" max="10" defaultValue={editing?.semestre || 1} {...register('semestre', { required: true })} /></div>
          <div><label className="label">Gestión (ej: 2026-I) *</label><input className="input" defaultValue={editing?.gestion} {...register('gestion', { required: true })} /></div>
          <div><label className="label">Enlace de WhatsApp *</label><input className="input" type="url" defaultValue={editing?.enlace_wa} {...register('enlace_wa', { required: true })} placeholder="https://chat.whatsapp.com/..." /></div>
          <button type="submit" className="btn-primary w-full">Guardar</button>
        </form>
      </Modal>
    </div>
  )
}

// ============================================================
// GALERÍA ADMIN
// ============================================================
export function AdminGaleriaPage() {
  const qc = useQueryClient()
  const [albumId, setAlbumId] = useState(null)
  const [albumModal, setAlbumModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { data: albumesData } = useQuery({ queryKey: ['albumes-admin'], queryFn: galeriaService.getAlbumes })
  const albumes = albumesData?.data?.data || []
  const { data: imgData, isLoading } = useQuery({
    queryKey: ['imagenes-admin', albumId], enabled: !!albumId,
    queryFn: () => galeriaService.getImagenes(albumId)
  })
  const imagenes = imgData?.data?.data || []
  const { register: regAlbum, handleSubmit: hsAlbum, reset: resetAlbum } = useForm()
  const albumMut = useMutation({
    mutationFn: galeriaService.crearAlbum,
    onSuccess: () => { qc.invalidateQueries(['albumes-admin']); setAlbumModal(false); resetAlbum(); toast.success('Álbum creado') }
  })
  const delImgMut = useMutation({
    mutationFn: galeriaService.eliminar,
    onSuccess: () => { qc.invalidateQueries(['imagenes-admin', albumId]); toast.success('Imagen eliminada') }
  })

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('imagen', file)
      fd.append('album_id', albumId)
      try { await galeriaService.subirImagen(fd); } catch { toast.error(`Error subiendo ${file.name}`) }
    }
    qc.invalidateQueries(['imagenes-admin', albumId])
    setUploading(false)
    toast.success('Imágenes subidas')
  }

  return (
    <div>
      <SectionHeader title="Galería fotográfica" subtitle="Gestiona álbumes e imágenes de la carrera">
        <button onClick={() => setAlbumModal(true)} className="btn-primary text-sm">+ Nuevo álbum</button>
      </SectionHeader>
      <div className="flex flex-wrap gap-2 mb-4">
        {albumes.map(a => (
          <button key={a.id} onClick={() => setAlbumId(a.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${albumId===a.id?'bg-primary text-white':'card hover:shadow-sm'}`}>
            {a.nombre}
          </button>
        ))}
        {albumes.length === 0 && <p className="text-gray-400 text-sm">Crea un álbum primero.</p>}
      </div>
      {albumId && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <label className={`btn-secondary text-sm cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
              {uploading ? 'Subiendo...' : '+ Subir fotos'}
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            <p className="text-xs text-gray-400">JPG, PNG o WebP · Máx. 10MB por imagen</p>
          </div>
          {isLoading ? <LoadingCenter /> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {imagenes.map(img => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden">
                  <img src={img.thumbnail_url || img.url} alt={img.titulo || ''} className="w-full h-36 object-cover" />
                  <button onClick={() => delImgMut.mutate(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                </div>
              ))}
              {imagenes.length === 0 && <p className="col-span-full text-gray-400 text-sm py-4">Sube imágenes a este álbum.</p>}
            </div>
          )}
        </>
      )}
      <Modal open={albumModal} onClose={() => setAlbumModal(false)} title="Nuevo álbum">
        <form onSubmit={hsAlbum(d => albumMut.mutate(d))} className="space-y-3">
          <div><label className="label">Nombre del álbum *</label><input className="input" {...regAlbum('nombre', { required: true })} /></div>
          <div><label className="label">Descripción</label><textarea className="input h-20 resize-none" {...regAlbum('descripcion')} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="pub_album" {...regAlbum('publicado')} defaultChecked /><label htmlFor="pub_album" className="text-sm">Publicar inmediatamente</label></div>
          <button type="submit" className="btn-primary w-full">Crear álbum</button>
        </form>
      </Modal>
    </div>
  )
}

// ============================================================
// MULTIMEDIA ADMIN
// ============================================================
export function AdminMultimediaPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['multimedia-admin'], queryFn: () => multimediaService.getAll({}) })
  const list = data?.data?.data || []
  const { register, handleSubmit, reset } = useForm()
  const saveMut = useMutation({
    mutationFn: multimediaService.create,
    onSuccess: () => { qc.invalidateQueries(['multimedia-admin']); toast.success('Registrado'); setModal(false); reset() }
  })
  const pubMut = useMutation({
    mutationFn: multimediaService.publicar,
    onSuccess: () => { qc.invalidateQueries(['multimedia-admin']); toast.success('Estado actualizado') }
  })

  return (
    <div>
      <SectionHeader title="Multimedia estudiantil" subtitle="Videos, podcasts, fotografías y reportajes">
        <button onClick={() => { reset(); setModal(true) }} className="btn-primary text-sm">+ Registrar trabajo</button>
      </SectionHeader>
      {isLoading ? <LoadingCenter /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">TÍTULO</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">AUTOR</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">TIPO</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium truncate max-w-xs">{m.titulo}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{m.autor_nombre}</td>
                  <td className="px-4 py-3"><Badge color="#1A5276">{m.tipo}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => pubMut.mutate(m.id)}
                      className={`badge text-xs px-2 py-0.5 cursor-pointer ${m.publicado?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                      {m.publicado ? 'Publicado' : 'Borrador'}
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Sin trabajos</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Registrar trabajo multimedia" size="lg">
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><label className="label">Título *</label><input className="input" {...register('titulo', { required: true })} /></div>
          <div><label className="label">Tipo</label>
            <select className="input" {...register('tipo')}>
              {['video','podcast','fotografia','reportaje','otro'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Nombre del autor *</label><input className="input" {...register('autor_nombre', { required: true })} /></div>
          <div className="sm:col-span-2"><label className="label">URL del contenido (YouTube, Cloudinary...) *</label><input className="input" type="url" {...register('url_contenido', { required: true })} /></div>
          <div><label className="label">Materia de origen</label><input className="input" {...register('materia_origen')} /></div>
          <div><label className="label">Gestión</label><input className="input" {...register('gestion')} placeholder="2026-I" /></div>
          <div className="sm:col-span-2"><label className="label">Descripción</label><textarea className="input h-20 resize-none" {...register('descripcion')} /></div>
          <div className="sm:col-span-2 flex items-center gap-2"><input type="checkbox" id="dest" {...register('destacado')} /><label htmlFor="dest" className="text-sm">Marcar como destacado</label></div>
          <div className="sm:col-span-2"><button type="submit" className="btn-primary w-full">Registrar</button></div>
        </form>
      </Modal>
    </div>
  )
}

// ============================================================
// CONTENIDO INSTITUCIONAL ADMIN
// ============================================================
export function AdminInstitucionalPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const claves = ['mision','vision','historia','pensum_info']
  const queries = claves.map(c => useQuery({ queryKey: ['inst-admin', c], queryFn: () => institucionalService.get(c) }))
  const { register, handleSubmit, setValue } = useForm()
  const saveMut = useMutation({
    mutationFn: ({ clave, ...data }) => institucionalService.update(clave, data),
    onSuccess: () => { claves.forEach(c => qc.invalidateQueries(['inst-admin', c])); toast.success('Actualizado'); setEditing(null) }
  })
  const openEdit = (item) => { setEditing(item); setValue('titulo', item.titulo); setValue('contenido', item.contenido) }

  return (
    <div>
      <SectionHeader title="Contenido institucional" subtitle="Edita misión, visión, historia y pensum" />
      <div className="grid sm:grid-cols-2 gap-4">
        {queries.map((q, i) => {
          const item = q.data?.data?.data
          if (!item) return null
          return (
            <div key={claves[i]} className="card p-4">
              <h3 className="font-semibold text-secondary mb-1">{item.titulo || claves[i]}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{item.contenido}</p>
              <p className="text-xs text-gray-400 mt-2">Actualizado: {formatDate(item.actualizado_en)}</p>
              <button onClick={() => openEdit({ ...item, clave: claves[i] })} className="btn-outline text-xs mt-2">Editar</button>
            </div>
          )
        })}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Editar: ${editing?.titulo || editing?.clave}`} size="lg">
        <form onSubmit={handleSubmit(d => saveMut.mutate({ ...d, clave: editing.clave }))} className="space-y-3">
          <div><label className="label">Título de la sección</label><input className="input" {...register('titulo')} /></div>
          <div><label className="label">Contenido *</label><textarea className="input h-48 resize-y" {...register('contenido', { required: true })} /></div>
          <button type="submit" className="btn-primary w-full">Guardar cambios</button>
        </form>
      </Modal>
    </div>
  )
}

// ============================================================
// USUARIOS ADMIN (solo superadmin)
// ============================================================
export function AdminUsuariosPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['usuarios-admin'], queryFn: usuariosService.getAll })
  const list = data?.data?.data || []
  const { register, handleSubmit, reset } = useForm()
  const createMut = useMutation({
    mutationFn: usuariosService.create,
    onSuccess: () => { qc.invalidateQueries(['usuarios-admin']); toast.success('Usuario creado. Se envió el correo.'); setModal(false); reset() },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al crear usuario')
  })
  const updateMut = useMutation({
    mutationFn: ({ id, ...d }) => usuariosService.update(id, d),
    onSuccess: () => { qc.invalidateQueries(['usuarios-admin']); toast.success('Actualizado') }
  })

  return (
    <div>
      <SectionHeader title="Gestión de usuarios" subtitle="Administra cuentas y roles del panel">
        <button onClick={() => { reset(); setModal(true) }} className="btn-primary text-sm">+ Nuevo usuario</button>
      </SectionHeader>
      {isLoading ? <LoadingCenter /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">USUARIO</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">CORREO</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ROL</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ESTADO</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{u.nombre}</p>
                    <p className="text-xs text-gray-400">{formatDate(u.creado_en)}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3"><span className={`badge text-xs px-2 py-0.5 ${rolColor(u.rol)}`}>{u.rol}</span></td>
                  <td className="px-4 py-3"><span className={`badge text-xs px-2 py-0.5 ${u.activo?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{u.activo?'Activo':'Inactivo'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <select className="text-xs border rounded px-1 py-0.5"
                      defaultValue={u.rol}
                      onChange={(e) => updateMut.mutate({ id: u.id, rol: e.target.value })}>
                      {['superadmin','admin','editor'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button onClick={() => updateMut.mutate({ id: u.id, activo: !u.activo })}
                      className="ml-2 text-xs text-red-500 hover:underline">
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Nuevo usuario administrador">
        <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-3">
          <div><label className="label">Nombre completo *</label><input className="input" {...register('nombre', { required: true })} /></div>
          <div><label className="label">Correo electrónico *</label><input className="input" type="email" {...register('email', { required: true })} /></div>
          <div>
            <label className="label">Rol *</label>
            <select className="input" {...register('rol', { required: true })}>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <p className="text-xs text-gray-400 bg-blue-50 p-2 rounded">Se enviará un correo al usuario con sus credenciales temporales.</p>
          <button type="submit" className="btn-primary w-full">Crear y enviar correo</button>
        </form>
      </Modal>
    </div>
  )
}

// ============================================================
// EVENTOS ADMIN
// ============================================================
export function AdminEventosPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['eventos-admin'], queryFn: () => eventosService.getAll({}) })
  const list = data?.data?.data || []
  const { register, handleSubmit, reset } = useForm()
  const saveMut = useMutation({
    mutationFn: (d) => editing ? eventosService.update(editing.id, d) : eventosService.create(d),
    onSuccess: () => { qc.invalidateQueries(['eventos-admin']); toast.success('Guardado'); setModal(false); reset(); setEditing(null) }
  })
  const delMut = useMutation({ mutationFn: eventosService.delete, onSuccess: () => { qc.invalidateQueries(['eventos-admin']); toast.success('Eliminado') } })

  return (
    <div>
      <SectionHeader title="Eventos y calendario" subtitle="Gestiona el calendario académico">
        <button onClick={() => { setEditing(null); reset(); setModal(true) }} className="btn-primary text-sm">+ Nuevo evento</button>
      </SectionHeader>
      {isLoading ? <LoadingCenter /> : (
        <div className="space-y-2">
          {list.length === 0 && <EmptyState icon="📅" title="Sin eventos" />}
          {list.map(e => (
            <div key={e.id} className="card p-3 flex items-center gap-3">
              <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: e.color || '#C0392B' }} />
              <div className="flex-1">
                <p className="font-medium text-sm">{e.titulo}</p>
                <p className="text-xs text-gray-500">{formatDate(e.fecha_inicio)} · {e.lugar || 'Sin lugar'}</p>
              </div>
              <Badge color={e.color || '#C0392B'}>{e.tipo}</Badge>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(e); setModal(true) }} className="text-secondary hover:underline text-xs">Editar</button>
                <button onClick={() => delMut.mutate(e.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null) }} title={editing ? 'Editar evento' : 'Nuevo evento'} size="lg">
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><label className="label">Título *</label><input className="input" defaultValue={editing?.titulo} {...register('titulo', { required: true })} /></div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" defaultValue={editing?.tipo || 'otro'} {...register('tipo')}>
              {['taller','seminario','defensa','examen','fecha_admin','otro'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><label className="label">Color</label><input className="input" type="color" defaultValue={editing?.color || '#C0392B'} {...register('color')} /></div>
          <div><label className="label">Fecha inicio *</label><input className="input" type="datetime-local" defaultValue={editing?.fecha_inicio?.slice(0,16)} {...register('fecha_inicio', { required: true })} /></div>
          <div><label className="label">Fecha fin</label><input className="input" type="datetime-local" defaultValue={editing?.fecha_fin?.slice(0,16)} {...register('fecha_fin')} /></div>
          <div><label className="label">Lugar</label><input className="input" defaultValue={editing?.lugar} {...register('lugar')} /></div>
          <div><label className="label">Enlace virtual</label><input className="input" defaultValue={editing?.enlace_virtual} {...register('enlace_virtual')} /></div>
          <div className="sm:col-span-2"><label className="label">Descripción</label><textarea className="input h-20 resize-none" defaultValue={editing?.descripcion} {...register('descripcion')} /></div>
          <div className="sm:col-span-2 flex items-center gap-2"><input type="checkbox" id="pub_ev" defaultChecked={editing?.publicado !== false} {...register('publicado')} /><label htmlFor="pub_ev" className="text-sm">Publicar en el calendario</label></div>
          <div className="sm:col-span-2"><button type="submit" className="btn-primary w-full">Guardar evento</button></div>
        </form>
      </Modal>
    </div>
  )
}

// ============================================================
// CONVOCATORIAS ADMIN
// ============================================================
export function AdminConvocatoriasPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['conv-admin'], queryFn: convocatoriasService.getAll })
  const list = data?.data?.data || []
  const { register, handleSubmit, reset } = useForm()
  const saveMut = useMutation({ mutationFn: convocatoriasService.create, onSuccess: () => { qc.invalidateQueries(['conv-admin']); toast.success('Convocatoria creada'); setModal(false); reset() } })

  return (
    <div>
      <SectionHeader title="Convocatorias" subtitle="Pasantías, docentes, investigación y becas">
        <button onClick={() => { reset(); setModal(true) }} className="btn-primary text-sm">+ Nueva convocatoria</button>
      </SectionHeader>
      {isLoading ? <LoadingCenter /> : (
        <div className="space-y-3">
          {list.length === 0 && <EmptyState icon="📢" title="Sin convocatorias" />}
          {list.map(c => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge color="#C0392B">{c.tipo}</Badge>
                  <p className="font-semibold mt-1">{c.titulo}</p>
                  {c.fecha_limite && <p className="text-xs text-primary">Hasta: {formatDate(c.fecha_limite)}</p>}
                </div>
                <span className={`badge text-xs px-2 py-0.5 flex-shrink-0 ${c.publicado?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{c.publicado?'Publicada':'Borrador'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Nueva convocatoria" size="lg">
        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-3">
          <div><label className="label">Título *</label><input className="input" {...register('titulo', { required: true })} /></div>
          <div><label className="label">Tipo</label><select className="input" {...register('tipo')}>{['docentes','pasantias','investigacion','becas','otro'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="label">Descripción *</label><textarea className="input h-32 resize-none" {...register('descripcion', { required: true })} /></div>
          <div><label className="label">Fecha límite</label><input className="input" type="date" {...register('fecha_limite')} /></div>
          <div><label className="label">URL del archivo (PDF)</label><input className="input" {...register('archivo_url')} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="pub_c" {...register('publicado')} defaultChecked /><label htmlFor="pub_c" className="text-sm">Publicar inmediatamente</label></div>
          <button type="submit" className="btn-primary w-full">Crear convocatoria</button>
        </form>
      </Modal>
    </div>
  )
}

// ============================================================
// MALLA CURRICULAR ADMIN
// ============================================================
export function AdminMallaPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const { data, isLoading } = useQuery({ queryKey: ['materias-admin'], queryFn: () => materiasService.getAll('2023') })
  const materias = data?.data?.data || []
  const bySem = {}
  for (let i = 1; i <= 10; i++) bySem[i] = materias.filter(m => m.semestre === i)
  const { register, handleSubmit } = useForm()
  const saveMut = useMutation({
    mutationFn: ({ id, ...d }) => materiasService.update(id, d),
    onSuccess: () => { qc.invalidateQueries(['materias-admin']); toast.success('Materia actualizada'); setEditing(null) }
  })

  return (
    <div>
      <SectionHeader title="Malla curricular" subtitle="Edita el plan de estudios — Pensum 2023" />
      {isLoading ? <LoadingCenter /> : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 min-w-[600px]">
            {Object.entries(bySem).map(([sem, ms]) => (
              <div key={sem}>
                <div className="bg-secondary text-white text-center text-xs font-bold py-2 rounded-t-lg">Semestre {sem}</div>
                <div className="space-y-1">
                  {ms.map(m => (
                    <button key={m.id} onClick={() => setEditing(m)}
                      className="w-full card p-2 text-left hover:border-primary hover:shadow-sm transition-all">
                      <p className="text-xs font-medium text-gray-700 line-clamp-2">{m.nombre}</p>
                      {m.creditos && <p className="text-xs text-gray-400">{m.creditos} cred.</p>}
                    </button>
                  ))}
                  {ms.length === 0 && <div className="card p-2 text-center text-xs text-gray-300">Vacío</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {editing && (
        <Modal open={!!editing} onClose={() => setEditing(null)} title={`Editar: ${editing.nombre}`}>
          <form onSubmit={handleSubmit(d => saveMut.mutate({ id: editing.id, ...d }))} className="space-y-3">
            <div><label className="label">Nombre</label><input className="input" defaultValue={editing.nombre} {...register('nombre')} /></div>
            <div><label className="label">Créditos</label><input className="input" type="number" defaultValue={editing.creditos} {...register('creditos')} /></div>
            <div><label className="label">Área</label><input className="input" defaultValue={editing.area} {...register('area')} /></div>
            <div><label className="label">Tipo</label><select className="input" defaultValue={editing.tipo} {...register('tipo')}><option value="obligatoria">Obligatoria</option><option value="electiva">Electiva</option><option value="taller">Taller</option></select></div>
            <button type="submit" className="btn-primary w-full">Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
