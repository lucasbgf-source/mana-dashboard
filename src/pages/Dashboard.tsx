import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Receipt,
  DollarSign,
  TrendingUp,
  Activity,
  UserCheck
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import MetricCard from '../components/MetricCard'
import {
  getOverviewMetrics,
  getUsersMetrics,
  getCommandsMetrics,
  getEntriesMetrics
} from '../services/api'

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ef4444']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export default function Dashboard() {
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['overview'],
    queryFn: getOverviewMetrics,
    refetchInterval: 60000 // Refresh every minute
  })

  const { data: usersMetrics } = useQuery({
    queryKey: ['usersMetrics'],
    queryFn: () => getUsersMetrics(30)
  })

  const { data: commandsMetrics } = useQuery({
    queryKey: ['commandsMetrics'],
    queryFn: () => getCommandsMetrics(30)
  })

  const { data: entriesMetrics } = useQuery({
    queryKey: ['entriesMetrics'],
    queryFn: () => getEntriesMetrics(30)
  })

  if (loadingOverview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Prepare chart data
  const usersChartData = usersMetrics?.data?.slice(-14).map((d: any) => ({
    date: d.date.slice(5), // MM-DD
    novos: d.new_users,
    ativos: d.active_users
  })) || []

  const entriesChartData = entriesMetrics?.by_day?.slice(-14).map((d: any) => ({
    date: d.date.slice(5),
    count: d.count,
    total: d.total
  })) || []

  const commandsChartData = commandsMetrics?.data?.slice(0, 8) || []

  const typesPieData = entriesMetrics?.by_type?.map((d: any) => ({
    name: d.type === 'expense' ? 'Despesa' : d.type === 'income' ? 'Receita' : 'Investimento',
    value: d.count
  })) || []

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Usuários"
          value={overview?.total_users || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Ativos (7 dias)"
          value={overview?.active_users_7d || 0}
          subtitle={`${Math.round((overview?.active_users_7d / overview?.total_users) * 100) || 0}% do total`}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Lançamentos Hoje"
          value={overview?.entries_today || 0}
          subtitle={`${overview?.entries_month || 0} no mês`}
          icon={<Receipt className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Volume do Mês"
          value={formatCurrency(overview?.volume_month || 0)}
          icon={<DollarSign className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Users by Plan */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuários por Plano</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(overview?.users_by_plan || {}).map(([plan, count]) => (
            <div key={plan} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{count as number}</p>
              <p className="text-sm text-gray-500 capitalize">{plan}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Usuários (últimos 14 dias)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usersChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="ativos"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Ativos"
                />
                <Line
                  type="monotone"
                  dataKey="novos"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Novos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Entries Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lançamentos (últimos 14 dias)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entriesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} name="Qtd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commands Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comandos Mais Usados
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commandsChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="command" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Types Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tipos de Lançamento
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typesPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {typesPieData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Categorias
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Categoria</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Qtd</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {entriesMetrics?.by_category?.map((cat: any, index: number) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-3 px-4 text-sm text-gray-900">{cat.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">{cat.count}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(cat.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
