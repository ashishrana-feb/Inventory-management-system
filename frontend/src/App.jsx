import React from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, ShoppingCart, Menu, X, TrendingUp
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Orders from './pages/Orders'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
]

export default function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const location = useLocation()

  React.useEffect(() => {
    setSidebarOpen(false)
  }, [location])

  return (
    <div className="min-h-screen flex bg-[#080e1a]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-slate-900 border-r border-slate-800
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">InvenTrack</h1>
            <p className="text-xs text-slate-500">Management System</p>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider px-3 py-2">
            Navigation
          </p>
          {navItems.map(({ path, label, icon: Icon, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-600 text-center">v1.0.0 — Production</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-10">
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="text-sm text-slate-400">
            {navItems.find(n =>
              n.exact
                ? location.pathname === n.path
                : location.pathname.startsWith(n.path) && n.path !== '/'
            )?.label || 'Dashboard'}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
