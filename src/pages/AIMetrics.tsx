import { useQuery } from '@tanstack/react-query'
import { 
  Brain, 
  CheckCircle, 
  Edit3, 
  XCircle, 
  TrendingUp, 
  Sparkles,
  Target,
  BookOpen
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import MetricCard from '../components/MetricCard'
import { getAIMetrics } from '../services/api'

const COLORS = ['#22c55e', '#f97316', '#ef4444', '#3b82f6']

export default function AIMetrics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['aiMetrics'],
    queryFn: () => getAIMetrics(30),
    refetchInterval: 60000
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar métricas</h3>
        <p className="text-red-600 mb-4">Não foi possível carregar as métricas de IA.</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const metrics = data || {
    total_classifications: 0,
    confirmed_without_edit: 0,
    edited_before_confirm: 0,
    cancelled: 0,
    accuracy_rate: 0,
    patterns_learned: 0,
    fixed_rules_used: 0,
    ai_calls: 0,
    by_day: [],
    provider: 'anthropic'
  }

  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'Aceito', value: metrics.confirmed_without_edit, color: '#22c55e' },
    { name: 'Editado', value: metrics.edited_before_confirm, color: '#f97316' },
    { name: 'Cancelado', value: metrics.cancelled, color: '#ef4444' }
  ].filter(d => d.value > 0)

  // CORREÇÃO: Backend retorna 'confirmed', não 'accurate'
  // Também usar accuracy_rate do backend se disponível
  const lineData = (metrics.by_day || []).slice(-14).map((d: any) => ({
    date: d.date?.slice(5) || '', // MM-DD
    total: d.total || 0,
    confirmed: d.confirmed || 0,
    edited: d.edited || 0,
    rate: d.accuracy_rate || (d.total > 0 ? Math.round(((d.confirmed || 0) / d.total) * 100) : 0)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Métricas de IA</h2>
            <p className="text-sm text-gray-500">
              Precisão da classificação automática • Provider: {metrics.provider}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Taxa de Acerto"
          value={`${metrics.accuracy_rate?.toFixed(1) || 0}%`}
          subtitle={`${metrics.confirmed_without_edit} aceitos sem edição`}
          icon={<Target className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Total Classificações"
          value={metrics.total_classifications || 0}
          subtitle="Últimos 30 dias"
          icon={<Brain className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Padrões Aprendidos"
          value={metrics.patterns_learned || 0}
          subtitle="Regras personalizadas"
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Chamadas IA"
          value={metrics.ai_calls || 0}
          subtitle="Requisições ao modelo"
          icon={<Sparkles className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resultado das Classificações
          </h3>
          
          <div className="space-y-4">
            {/* Accepted without edit */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Aceitos sem edição</p>
                  <p className="text-sm text-green-600">IA classificou corretamente</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-900">
                {metrics.confirmed_without_edit || 0}
              </span>
            </div>

            {/* Edited before confirm */}
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Edit3 className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Editados antes de confirmar</p>
                  <p className="text-sm text-orange-600">Usuário corrigiu a classificação</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-orange-900">
                {metrics.edited_before_confirm || 0}
              </span>
            </div>

            {/* Cancelled */}
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Cancelados</p>
                  <p className="text-sm text-red-600">Usuário rejeitou a sugestão</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-900">
                {metrics.cancelled || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Resultados
          </h3>
          
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Ainda não há dados suficientes</p>
                <p className="text-sm">Faça alguns lançamentos para ver as métricas</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Line Chart - Accuracy over time */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Taxa de Acerto (últimos 14 dias)
        </h3>
        
        {lineData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'rate') return [`${value}%`, 'Taxa de Acerto']
                    if (name === 'confirmed') return [value, 'Confirmados']
                    if (name === 'total') return [value, 'Total']
                    return [value, name]
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Taxa de Acerto"
                  dot={{ fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ainda não há dados suficientes</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Como funcionam as métricas?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Taxa de Acerto:</strong> % de lançamentos aceitos sem edição do usuário</li>
              <li><strong>Padrões Aprendidos:</strong> Regras criadas a partir do comportamento do usuário</li>
              <li><strong>Editados:</strong> Classificações que o usuário precisou corrigir antes de confirmar</li>
              <li><strong>Cancelados:</strong> Sugestões rejeitadas completamente pelo usuário</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
