import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Receipt,
  Server,
  Ticket,
  LogOut,
  Menu,
  X,
  Brain  // NOVO - ícone para IA
} from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  children: ReactNode
  onLogout: () => void
}

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Usuários', icon: Users },
  { path: '/entries', label: 'Lançamentos', icon: Receipt },
  { path: '/ai-metrics', label: 'Métricas IA', icon: Brain },  // NOVO
  { path: '/system', label: 'Sistema', icon: Server },
  { path: '/beta-codes', label: 'Códigos Beta', icon: Ticket },
]

export default function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-primary-600">
            🌾 Maná Admin
          </h1>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white shadow-sm h-16 flex items-center px-4">
          <button
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h2>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
