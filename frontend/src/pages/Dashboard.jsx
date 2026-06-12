import React from 'react'
import { dashboardApi } from '../services/api'
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle, Clock } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Dashboard() {
  const [stats, setStats] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="card p-6 text-center">
      <AlertTriangle className="text-rose-400 mx-auto mb-2" size={32} />
      <p className="text-slate-400">{error}</p>
    </div>
  )

  const statusColor = (s) => ({
    pending: 'badge-yellow',
    completed: 'badge-green',
    cancelled: 'badge-red',
  }[s] || 'badge-blue')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white">Overview</h2>
        <p className="text-sm text-slate-500 mt-0.5">Business metrics at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Package}
          label="Products"
          value={stats.total_products}
          color="bg-blue-600/20 text-blue-400"
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={stats.total_customers}
          color="bg-violet-600/20 text-violet-400"
        />
        <StatCard
          icon={ShoppingCart}
          label="Orders"
          value={stats.total_orders}
          color="bg-emerald-600/20 text-emerald-400"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={formatCurrency(stats.total_revenue)}
          color="bg-amber-600/20 text-amber-400"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="card">
          <div className="flex items-center gap-2 p-4 border-b border-slate-800">
            <AlertTriangle size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Low Stock Alert</h3>
            <span className="ml-auto badge badge-yellow">{stats.low_stock_products.length}</span>
          </div>
          <div className="divide-y divide-slate-800">
            {stats.low_stock_products.length === 0 ? (
              <p className="text-slate-500 text-sm p-4 text-center">All products are well-stocked</p>
            ) : stats.low_stock_products.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-slate-200">{p.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{p.sku}</p>
                </div>
                <span className={`badge ${p.quantity === 0 ? 'badge-red' : 'badge-yellow'}`}>
                  {p.quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center gap-2 p-4 border-b border-slate-800">
            <Clock size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {stats.recent_orders.length === 0 ? (
              <p className="text-slate-500 text-sm p-4 text-center">No orders yet</p>
            ) : stats.recent_orders.map(o => (
              <div key={o.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-slate-200">#{o.id} — {o.customer?.full_name}</p>
                  <p className="text-xs text-slate-500">{formatDate(o.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatCurrency(o.total_amount)}</p>
                  <span className={`badge ${statusColor(o.status)}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
