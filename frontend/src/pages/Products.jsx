import React from 'react'
import toast from 'react-hot-toast'
import { productsApi } from '../services/api'
import { Plus, Pencil, Trash2, Search, X, Package } from 'lucide-react'

const emptyForm = { name: '', sku: '', description: '', price: '', quantity: '', category: '' }

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = React.useState(product ? {
    name: product.name,
    sku: product.sku,
    description: product.description || '',
    price: product.price,
    quantity: product.quantity,
    category: product.category || '',
  } : emptyForm)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.sku.trim()) e.sku = 'SKU is required'
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required'
    if (form.quantity === '' || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Valid quantity required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) }
      if (product) {
        await productsApi.update(product.id, payload)
        toast.success('Product updated')
      } else {
        await productsApi.create(payload)
        toast.success('Product created')
      }
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
          <h2 className="text-base font-semibold text-white">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {field('name', 'Product Name', 'text', 'e.g. Wireless Keyboard')}
          <div className="grid grid-cols-2 gap-4">
            {field('sku', 'SKU', 'text', 'e.g. WK-001')}
            {field('category', 'Category', 'text', 'e.g. Electronics')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('price', 'Price ($)', 'number', '0.00')}
            {field('quantity', 'Quantity', 'number', '0')}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none h-20"
              placeholder="Optional product description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? 'Saving…' : (product ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [modal, setModal] = React.useState(null) // null | 'create' | product object

  const load = React.useCallback(() => {
    setLoading(true)
    productsApi.getAll()
      .then(setProducts)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    try {
      await productsApi.delete(product.id)
      toast.success('Product deleted')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const stockBadge = (qty) => {
    if (qty === 0) return <span className="badge-red badge">Out of stock</span>
    if (qty <= 10) return <span className="badge-yellow badge">Low: {qty}</span>
    return <span className="badge-green badge">{qty} in stock</span>
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Products</h2>
          <p className="text-sm text-slate-500">{products.length} products total</p>
        </div>
        <button className="btn-primary" onClick={() => setModal('create')}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card">
        {/* Search */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Search by name, SKU, or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="table-header">Product</th>
                <th className="table-header">SKU</th>
                <th className="table-header">Category</th>
                <th className="table-header">Price</th>
                <th className="table-header">Stock</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <Package size={32} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-slate-500 text-sm">{search ? 'No products match your search' : 'No products yet. Add one to get started.'}</p>
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell font-medium text-white">{p.name}</td>
                  <td className="table-cell font-mono text-xs text-slate-400">{p.sku}</td>
                  <td className="table-cell">{p.category || <span className="text-slate-600">—</span>}</td>
                  <td className="table-cell font-semibold">${Number(p.price).toFixed(2)}</td>
                  <td className="table-cell">{stockBadge(p.quantity)}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="text-slate-400 hover:text-blue-400 transition-colors p-1.5 rounded hover:bg-slate-800"
                        onClick={() => setModal(p)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded hover:bg-slate-800"
                        onClick={() => handleDelete(p)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
