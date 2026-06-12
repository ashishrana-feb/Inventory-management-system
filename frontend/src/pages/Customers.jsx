import React from 'react'
import toast from 'react-hot-toast'
import { customersApi } from '../services/api'
import { Plus, Trash2, Search, X, Users } from 'lucide-react'

const emptyForm = { full_name: '', email: '', phone: '', address: '' }

function CustomerModal({ onClose, onSave }) {
  const [form, setForm] = React.useState(emptyForm)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState({})

  const validate = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await customersApi.create(form)
      toast.success('Customer added')
      onSave()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className={`input ${errors[key] ? 'border-rose-500' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })) }}
      />
      {errors[key] && <p className="text-rose-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Add Customer</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {field('full_name', 'Full Name', 'text', 'e.g. Jane Smith')}
          {field('email', 'Email Address', 'email', 'jane@example.com')}
          {field('phone', 'Phone Number', 'tel', '+1 (555) 000-0000')}
          <div>
            <label className="label">Address</label>
            <textarea
              className="input resize-none h-20"
              placeholder="Optional address"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? 'Saving…' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const colors = ['bg-blue-600', 'bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-indigo-600']
function avatarColor(name) { return colors[name.charCodeAt(0) % colors.length] }

export default function Customers() {
  const [customers, setCustomers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [showModal, setShowModal] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    customersApi.getAll()
      .then(setCustomers)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.full_name}"? This cannot be undone.`)) return
    try {
      await customersApi.delete(c.id)
      toast.success('Customer deleted')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Customers</h2>
          <p className="text-sm text-slate-500">{customers.length} customers total</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="table-header">Customer</th>
                <th className="table-header">Email</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Joined</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12">
                  <Users size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-slate-500 text-sm">{search ? 'No customers match your search' : 'No customers yet. Add one to get started.'}</p>
                </td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColor(c.full_name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {getInitials(c.full_name)}
                      </div>
                      <span className="font-medium text-white">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-slate-400">{c.email}</td>
                  <td className="table-cell">{c.phone || <span className="text-slate-600">—</span>}</td>
                  <td className="table-cell text-slate-500 text-xs">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="table-cell text-right">
                    <button
                      className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded hover:bg-slate-800"
                      onClick={() => handleDelete(c)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}
