import api from './api'

// NOTICIAS
export const noticiasService = {
  getAll:    (params) => api.get('/noticias', { params }),
  getBySlug: (slug)   => api.get(`/noticias/${slug}`),
  create:    (data)   => api.post('/noticias', data),
  update:    (id, d)  => api.put(`/noticias/${id}`, d),
  publicar:  (id)     => api.patch(`/noticias/${id}/publicar`),
  delete:    (id)     => api.delete(`/noticias/${id}`),
}

// CATEGORIAS
export const categoriasService = {
  getAll: (tipo) => api.get('/categorias', { params: tipo ? { tipo } : {} }),
  create: (data) => api.post('/categorias', data),
}

// EVENTOS
export const eventosService = {
  getAll:  (params) => api.get('/eventos', { params }),
  create:  (data)   => api.post('/eventos', data),
  update:  (id, d)  => api.put(`/eventos/${id}`, d),
  delete:  (id)     => api.delete(`/eventos/${id}`),
}

// CONVOCATORIAS
export const convocatoriasService = {
  getAll: (params) => api.get('/convocatorias', { params }),
  create: (data)   => api.post('/convocatorias', data),
}

// DOCENTES
export const docentesService = {
  getAll:  ()      => api.get('/docentes'),
  create:  (data)  => api.post('/docentes', data),
  update:  (id, d) => api.put(`/docentes/${id}`, d),
  delete:  (id)    => api.delete(`/docentes/${id}`),
}

// MEJORES ALUMNOS
export const alumnosService = {
  getAll:  (params) => api.get('/mejores-alumnos', { params }),
  create:  (data)   => api.post('/mejores-alumnos', data),
  update:  (id, d)  => api.put(`/mejores-alumnos/${id}`, d),
  delete:  (id)     => api.delete(`/mejores-alumnos/${id}`),
}

// EGRESADOS
export const egresadosService = {
  getAll:  ()      => api.get('/egresados'),
  create:  (data)  => api.post('/egresados', data),
  update:  (id, d) => api.put(`/egresados/${id}`, d),
}

// MULTIMEDIA
export const multimediaService = {
  getAll:    (params) => api.get('/multimedia', { params }),
  create:    (data)   => api.post('/multimedia', data),
  publicar:  (id)     => api.patch(`/multimedia/${id}/publicar`),
}

// GALERÍA
export const galeriaService = {
  getAlbumes:   ()       => api.get('/galeria/albumes'),
  crearAlbum:   (data)   => api.post('/galeria/albumes', data),
  getImagenes:  (albumId)=> api.get(`/galeria/albumes/${albumId}/imagenes`),
  subirImagen:  (fd)     => api.post('/galeria/imagenes', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  eliminar:     (id)     => api.delete(`/galeria/imagenes/${id}`),
}

// STREAMING
export const streamingService = {
  getAll: ()     => api.get('/streaming'),
  create: (data) => api.post('/streaming', data),
}

// WHATSAPP
export const whatsappService = {
  getAll:  ()      => api.get('/whatsapp'),
  create:  (data)  => api.post('/whatsapp', data),
  update:  (id, d) => api.put(`/whatsapp/${id}`, d),
  delete:  (id)    => api.delete(`/whatsapp/${id}`),
}

// MATERIAS
export const materiasService = {
  getAll:  (pensum) => api.get('/materias', { params: { pensum: pensum || '2023' } }),
  update:  (id, d)  => api.put(`/materias/${id}`, d),
}

// INSTITUCIONAL
export const institucionalService = {
  get:    (clave) => api.get(`/institucional/${clave}`),
  update: (clave, data) => api.put(`/institucional/${clave}`, data),
}

// TRÁMITES
export const tramitesService = {
  getAll:  ()      => api.get('/tramites'),
  create:  (data)  => api.post('/tramites', data),
  update:  (id, d) => api.put(`/tramites/${id}`, d),
}

// USUARIOS
export const usuariosService = {
  getAll:  ()      => api.get('/usuarios'),
  create:  (data)  => api.post('/usuarios', data),
  update:  (id, d) => api.put(`/usuarios/${id}`, d),
  delete:  (id)    => api.delete(`/usuarios/${id}`),
}

// AUTH
export const authService = {
  login:           (email, pass)     => api.post('/auth/login', { email, password: pass }),
  me:              ()                => api.get('/auth/me'),
  cambiarPassword: (data)            => api.post('/auth/cambiar-password', data),
  recuperar:       (email)           => api.post('/auth/recuperar', { email }),
  resetPassword:   (token, password) => api.post('/auth/reset-password', { token, password }),
}

// CONTACTO
export const contactoService = {
  enviar: (data) => api.post('/contacto', data),
}
