import React from 'react'
import toast from 'react-hot-toast'
import { ordersApi, customersApi, productsApi } from '../services/api'
import { Plus, Trash2, X, ShoppingCart, ChevronDown, ChevronUp, PlusCircle, MinusCircle } from 'lucide-react'

function OrderModal({ onClose, onSave }) {
  const [customers, setCustomers] = React.useState([])
  const [products, setProducts] = React.useState([])
  const [customerId, setCustomerId] = React.useState('')
  const [items, setItems] = React.useState([{ product_id: '', quantity: 1 }])
  const [notes, setNotes] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState({})

  React.useEffect(() => {
    customersApi.getAll().then(setCustomers)
    productsApi.getAll().then(setProducts)
  }, [])

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }])
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem = (idx, key, val) => setItems(i => i.map((item, j) => j === idx ? { ...item, [key]: val } : item))

  const getProduct = (id) => products.find(p => p.id === Number(id))

  const totalAmount = items.reduce((sum, item) => {
    const p = getProduct(item.product_id)
    return sum + (p ? p.price * (Number(item.quantity) || 0) : 0)
  }, 0)

  const validate = () => {
    const e = {}
    if (!customerId) e.customer = 'Select a customer'
    items.forEach((item, i) => {
      if (!item.product_id) e[`product_${i}`] = 'Select a product'
      if (!item.quantity || Number(item.quantity) < 1) e[`qty_${i}`] = 'Min 1'
      const p = getProduct(item.product_id)
      if (p && Number(item.quantity) > p.quantity) e[`qty_${i}`] = `Max ${p.quantity} available`
    })
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await ordersApi.create({
        customer_id: Number(customerId),
        items: items.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
        notes,
      })
      toast.success('Order created')
      onSave()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">Create Order</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Customer */}
          <div>
            <label className="label">Customer</label>
            <select
              className={`input ${errors.customer ? 'border-rose-500' : ''}`}
              value={customerId}
              onChange={e => { setCustomerId(e.target.value); setErrors(er => ({ ...er, customer: '' })) }}
            >
              <option value="">Select customer…</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
            </select>
            {errors.customer && <p className="text-rose-400 text-xs mt-1">{errors.customer}</p>}
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Order Items</label>
              <button type="button" onClick={addItem} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs font-medium">
                <PlusCircle size={14} /> Add item
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => {
                const prod = getProduct(item.product_id)
                return (
                  <div key={idx} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-start">
                      <div>
                        <select
                          className={`input text-xs ${errors[`product_${idx}`] ? 'border-rose-500' : ''}`}
                          value={item.product_id}
                          onChange={e => { updateItem(idx, 'product_id', e.target.value); setErrors(er => ({ ...er, [`product_${idx}`]: '' })) }}
                        >
                          <option value="">Select product…</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                              {p.name} — ${p.price} ({p.quantity} left)
                            </option>
                          ))}
                        </select>
                        {errors[`product_${idx}`] && <p className="text-rose-400 text-xs mt-0.5">{errors[`product_${idx}`]}</p>}
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          min={1}
                          max={prod?.quantity}
                          className={`input text-xs text-center ${errors[`qty_${idx}`] ? 'border-rose-500' : ''}`}
                          value={item.quantity}
                          onChange={e => { updateItem(idx, 'quantity', e.target.value); setErrors(er => ({ ...er, [`qty_${idx}`]: '' })) }}
                        />
                        {errors[`qty_${idx}`] && <p className="text-rose-400 text-xs mt-0.5 text-center">{errors[`qty_${idx}`]}</p>}
                      </div>
                      <button
                        type="button"
                        disabled={items.length === 1}
                        onClick={() => removeItem(idx)}
                        className="text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed mt-1.5"
                      >
                        <MinusCircle size={16} />
                      </button>
                    </div>
                    {prod && (
                      <p className="text-xs text-slate-500 mt-2">
                        Subtotal: <span className="text-slate-300 font-semibold">${(prod.price * (Number(item.quantity) || 0)).toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              className="input resize-none h-16"
              placeholder="Any additional notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3">
            <span className="text-sm text-slate-400">Order Total</span>
            <span className="text-lg font-bold text-white">${totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
              {loading ? 'Placing Order…' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OrderRow({ order, onDelete }) {
  const [expanded, setExpanded] = React.useState(false)

  const statusBadge = (s) => ({
    pending: 'badge-yellow',
    completed: 'badge-green',
    cancelled: 'badge-red',
  }[s] || 'badge-blue')

  return (
    <>
      <tr className="table-row cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <td className="table-cell font-mono text-xs text-slate-400">#{order.id}</td>
        <td className="table-cell font-medium text-white">{order.customer?.full_name}</td>
        <td className="table-cell text-slate-400 text-xs">{order.customer?.email}</td>
        <td className="table-cell">
          <span className="text-slate-400 text-xs">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
        </td>
        <td className="table-cell font-semibold text-white">${Number(order.total_amount).toFixed(2)}</td>
        <td className="table-cell">
          <span className={`badge ${statusBadge(order.status)}`}>{order.status}</span>
        </td>
        <td className="table-cell text-slate-500 text-xs">
          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td className="table-cell text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded hover:bg-slate-800"
              onClick={e => { e.stopPropagation(); onDelete(order) }}
              title="Cancel order"
            >
              <Trash2 size={14} />
            </button>
            <button className="text-slate-400 hover:text-slate-200 p-1.5">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-800/30">
          <td colSpan={8} className="px-6 py-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Order Items</p>
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.product?.name || `Product #${item.product_id}`}</span>
                  <span className="text-slate-500">×{item.quantity} @ ${Number(item.unit_price).toFixed(2)}</span>
                  <span className="text-white font-medium">${Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              {order.notes && (
                <p className="text-xs text-slate-500 mt-2 border-t border-slate-700 pt-2">
                  Notes: {order.notes}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function Orders() {
  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [showModal, setShowModal] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    ordersApi.getAll()
      .then(setOrders)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const handleDelete = async (order) => {
    if (!confirm(`Cancel order #${order.id}? Stock will be restored.`)) return
    try {
      await ordersApi.delete(order.id)
      toast.success('Order cancelled and stock restored')
      load()
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Orders</h2>
          <p className="text-sm text-slate-500">{orders.length} orders total</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Order
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="table-header">#</th>
              <th className="table-header">Customer</th>
              <th className="table-header">Email</th>
              <th className="table-header">Items</th>
              <th className="table-header">Total</th>
              <th className="table-header">Status</th>
              <th className="table-header">Date</th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-500">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12">
                <ShoppingCart size={32} className="mx-auto text-slate-700 mb-2" />
                <p className="text-slate-500 text-sm">No orders yet. Create one to get started.</p>
              </td></tr>
            ) : orders.map(o => (
              <OrderRow key={o.id} order={o} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <OrderModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}
