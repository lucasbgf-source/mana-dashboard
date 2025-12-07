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
import { Brain, CheckCircle, Edit, TrendingUp, Zap, BookOpen } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import { getAIMetrics } from '../services/api'

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6']

export default function AIMetrics() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['aiMetrics'],
    queryFn: getAIMetrics,
    refetchInterval: 60000
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
    top_edits: [],
    provider: 'anthropic'
  }

  const accuracyRate = metrics.accuracy_rate || 0
  const editRate = metrics.total_classifications > 0 
    ? ((metrics.edited_before_confirm / metrics.total_classifications) * 100).toFixed(1)
    : 0

  // Dados para gráfico de pizza
  const pieData = [
    { name: 'Confirmados', value: metrics.confirmed_without_edit },
    { name: 'Editados', value: metrics.edited_before_confirm },
    { name: 'Cancelados', value: metrics.cancelled }
  ].filter(d => d.value > 0)

  // Dados para gráfico de evolução
  const evolutionData = (metrics.by_day || []).slice(-14).map((d: any) => ({
    date: d.date?.slice(5) || '',
    taxa_acerto: d.accuracy_rate || 0,
    total: d.total || 0
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Métricas de IA</h2>
          <p className="text-sm text-gray-500">
            Acompanhe a eficiência da classificação automática
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            metrics.provider === 'anthropic' 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {metrics.provider === 'anthropic' ? '🤖 Claude (Anthropic)' : '🤖 GPT-4 (OpenAI)'}
          </span>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Taxa de Acerto"
          value={`${accuracyRate}%`}
          subtitle="Confirmados sem edição"
          icon={<CheckCircle className="w-6 h-6" />}
          color={accuracyRate >= 80 ? 'green' : accuracyRate >= 60 ? 'orange' : 'red'}
        />
        <MetricCard
          title="Taxa de Edição"
          value={`${editRate}%`}
          subtitle="Precisaram de correção"
          icon={<Edit className="w-6 h-6" />}
          color="orange"
        />
        <MetricCard
          title="Padrões Aprendidos"
          value={metrics.patterns_learned}
          subtitle="Classificações salvas"
          icon={<BookOpen className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Regras Fixas Usadas"
          value={`${metrics.fixed_rules_used}%`}
          subtitle="Economia de tokens"
          icon={<Zap className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Totais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{metrics.total_classifications}</p>
          <p className="text-sm text-gray-500">Total Classificações</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{metrics.confirmed_without_edit}</p>
          <p className="text-sm text-gray-500">Confirmados ✓</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{metrics.edited_before_confirm}</p>
          <p className="text-sm text-gray-500">Editados ✏️</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{metrics.cancelled}</p>
          <p className="text-sm text-gray-500">Cancelados ✗</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução da taxa de acerto */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução da Taxa de Acerto
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taxa de Acerto']}
                />
                <Line
                  type="monotone"
                  dataKey="taxa_acerto"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Resultados
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
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top edições por categoria */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Categorias Mais Editadas
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Essas categorias precisam de mais regras ou ajustes no prompt
        </p>
        
        {(metrics.top_edits || []).length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma edição registrada ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(metrics.top_edits || []).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.original_category} → {item.edited_category}
                    </p>
                    <p className="text-sm text-gray-500">
                      Editado {item.count}x
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    {((item.count / metrics.total_classifications) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dicas de otimização */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Dicas para Melhorar
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {accuracyRate < 80 && (
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">⚠️</span>
              Taxa de acerto abaixo de 80%. Considere adicionar mais regras fixas para categorias frequentes.
            </li>
          )}
          {metrics.fixed_rules_used < 70 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-500">💡</span>
              Regras fixas estão cobrindo apenas {metrics.fixed_rules_used}% dos casos. Analise os padrões mais comuns para adicionar novas regras.
            </li>
          )}
          {metrics.patterns_learned < 50 && (
            <li className="flex items-start gap-2">
              <span className="text-green-500">📚</span>
              Sistema ainda está aprendendo ({metrics.patterns_learned} padrões). A precisão deve melhorar com o uso.
            </li>
          )}
          {accuracyRate >= 85 && (
            <li className="flex items-start gap-2">
              <span className="text-green-500">✅</span>
              Excelente! Taxa de acerto acima de 85%. O sistema está funcionando bem!
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
