import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight, User, Calendar, Receipt } from 'lucide-react'
import { getUsers } from '../services/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Users() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, status],
    queryFn: () => getUsers(page, 20, status)
  })

  const users = data?.data || []
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  // Filter by search (client-side)
  const filteredUsers = users.filter((user: any) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.telegram_username?.toLowerCase().includes(searchLower) ||
      String(user.telegram_id).includes(search)
    )
  })

  const getPlanBadgeColor = (slug: string) => {
    switch (slug) {
      case 'vip':
        return 'bg-yellow-100 text-yellow-800'
      case 'beta':
        return 'bg-purple-100 text-purple-800'
      case 'premium':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, username ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status filter */}
          <select
            value={status || ''}
            onChange={(e) => {
              setStatus(e.target.value || undefined)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="">Todos</option>
            <option value="active">Com plano</option>
            <option value="inactive">Sem plano</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
          <p className="text-sm text-gray-500">Total de usuários</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u: any) => u.plan_slug !== 'none').length}
          </p>
          <p className="text-sm text-gray-500">Com plano ativo</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold text-purple-600">
            {users.filter((u: any) => u.plan_slug === 'beta').length}
          </p>
          <p className="text-sm text-gray-500">Beta testers</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-2xl font-bold text-yellow-600">
            {users.filter((u: any) => u.plan_slug === 'vip').length}
          </p>
          <p className="text-sm text-gray-500">VIP</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Usuário</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Telegram</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Plano</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Lançamentos</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cadastro</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Última Atividade</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user: any) => (
                    <tr key={user.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-gray-500">ID: {user.telegram_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.telegram_username ? (
                          <span className="text-blue-600">@{user.telegram_username}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(user.plan_slug)}`}>
                          {user.plan || 'Nenhum'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Receipt className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{user.entries_count}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.last_interaction
                          ? format(new Date(user.last_interaction), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <p className="text-sm text-gray-500">
                Mostrando {filteredUsers.length} de {pagination.total} usuários
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Página {page} de {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
