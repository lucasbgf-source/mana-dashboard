import { useQuery } from '@tanstack/react-query'
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
import { Receipt, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import { getEntriesMetrics } from '../services/api'

const COLORS = ['#ef4444', '#22c55e', '#3b82f6']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export default function Entries() {
  const { data, isLoading } = useQuery({
    queryKey: ['entriesMetrics'],
    queryFn: () => getEntriesMetrics(30)
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const byDay = data?.by_day || []
  const byType = data?.by_type || []
  const byCategory = data?.by_category || []

  // Calculate totals
  const totalEntries = byDay.reduce((sum: number, d: any) => sum + d.count, 0)
  const totalValue = byDay.reduce((sum: number, d: any) => sum + d.total, 0)
  
  const expenses = byType.find((t: any) => t.type === 'expense')?.count || 0
  const incomes = byType.find((t: any) => t.type === 'income')?.count || 0
  const investments = byType.find((t: any) => t.type === 'investment')?.count || 0

  // Chart data
  const chartData = byDay.slice(-14).map((d: any) => ({
    date: d.date.slice(5),
    count: d.count,
    total: d.total
  }))

  const pieData = byType.map((d: any) => ({
    name: d.type === 'expense' ? 'Despesas' : d.type === 'income' ? 'Receitas' : 'Investimentos',
    value: d.count
  }))

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Lançamentos"
          value={totalEntries}
          subtitle="Últimos 30 dias"
          icon={<Receipt className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Despesas"
          value={expenses}
          subtitle={`${Math.round((expenses / totalEntries) * 100) || 0}% do total`}
          icon={<TrendingDown className="w-6 h-6" />}
          color="red"
        />
        <MetricCard
          title="Receitas"
          value={incomes}
          subtitle={`${Math.round((incomes / totalEntries) * 100) || 0}% do total`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Investimentos"
          value={investments}
          subtitle={`${Math.round((investments / totalEntries) * 100) || 0}% do total`}
          icon={<Wallet className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Entries per day */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lançamentos por Dia
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Quantidade"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - By Type */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição por Tipo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Volume Financeiro (R$)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Volume" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 Categorias
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Categoria</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Quantidade</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">%</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.map((cat: any, index: number) => (
                <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{cat.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 text-right">{cat.count}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(cat.total)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 text-right">
                    {((cat.count / totalEntries) * 100).toFixed(1)}%
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
