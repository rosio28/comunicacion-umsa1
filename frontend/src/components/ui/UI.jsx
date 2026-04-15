// ============================================================
// SPINNER
// ============================================================
export function Spinner({ size = 'md' }) {
  const s = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }[size]
  return (
    <div className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${s}`} />
  )
}

export function LoadingCenter() {
  return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
}

// ============================================================
// BADGE
// ============================================================
export function Badge({ children, color = '#1A5276' }) {
  return (
    <span className="badge text-white text-xs px-2 py-0.5 rounded"
          style={{ backgroundColor: color }}>
      {children}
    </span>
  )
}

// ============================================================
// EMPTY STATE
// ============================================================
export function EmptyState({ icon = '📭', title = 'Sin contenido', subtitle = '' }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-medium text-gray-600">{title}</p>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

// ============================================================
// PAGINATION
// ============================================================
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <div className="flex justify-center gap-2 mt-8">
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            p === page ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}>
          {p}
        </button>
      ))}
    </div>
  )
}

// ============================================================
// MODAL
// ============================================================
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.5)' }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`bg-white rounded-xl shadow-xl w-full ${widths[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none">×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

// ============================================================
// CONFIRM DIALOG
// ============================================================
export function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirmar acción'} size="sm">
      <p className="text-gray-600 mb-4">{message || '¿Estás seguro de que deseas continuar?'}</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="btn-outline text-sm">Cancelar</button>
        <button onClick={onConfirm} className="btn-primary text-sm">Confirmar</button>
      </div>
    </Modal>
  )
}

// ============================================================
// SECTION HEADER
// ============================================================
export function SectionHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="section-title">{title}</h1>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ============================================================
// STAT CARD
// ============================================================
export function StatCard({ label, value, icon, color = 'bg-primary' }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`${color} rounded-xl p-3 text-white text-2xl`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}
