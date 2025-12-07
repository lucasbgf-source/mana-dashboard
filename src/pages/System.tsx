import { useQuery } from '@tanstack/react-query'
import { Database, Cpu, AlertTriangle, DollarSign, Server, HardDrive } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import { getSystemMetrics } from '../services/api'

export default function System() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['systemMetrics'],
    queryFn: getSystemMetrics,
    refetchInterval: 60000
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const database = data?.database || { tables: {}, total_rows: 0 }
  const ai = data?.ai || { calls_30d: 0, tokens_30d: 0, estimated_cost_usd: 0, provider: 'anthropic' }
  const errors = data?.errors || { count_7d: 0, by_type: {} }

  // Detectar provider
  const isAnthropic = ai.provider === 'anthropic'
  const providerName = isAnthropic ? 'Claude (Anthropic)' : 'GPT-4 (OpenAI)'
  const modelName = isAnthropic ? 'claude-3-5-haiku' : 'gpt-4o-mini'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Monitoramento do Sistema</h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Registros"
          value={database.total_rows.toLocaleString()}
          subtitle="No banco de dados"
          icon={<Database className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Chamadas IA (30d)"
          value={ai.calls_30d.toLocaleString()}
          subtitle={`${ai.tokens_30d.toLocaleString()} tokens`}
          icon={<Cpu className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Custo IA Estimado"
          value={`$${ai.estimated_cost_usd.toFixed(2)}`}
          subtitle="Últimos 30 dias"
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Erros (7d)"
          value={errors.count_7d}
          subtitle="Últimos 7 dias"
          icon={<AlertTriangle className="w-6 h-6" />}
          color={errors.count_7d > 10 ? 'red' : 'orange'}
        />
      </div>

      {/* Database Details */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Tabelas do Banco de Dados</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(database.tables).map(([table, count]) => (
            <div key={table} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{(count as number).toLocaleString()}</p>
              <p className="text-sm text-gray-500 truncate">{table}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Usage - ATUALIZADO */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Uso da IA</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isAnthropic ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
          }`}>
            🤖 {providerName}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${isAnthropic ? 'bg-purple-50' : 'bg-green-50'} rounded-lg p-4`}>
            <p className={`text-sm ${isAnthropic ? 'text-purple-600' : 'text-green-600'} font-medium`}>Chamadas</p>
            <p className={`text-3xl font-bold ${isAnthropic ? 'text-purple-900' : 'text-green-900'}`}>
              {ai.calls_30d.toLocaleString()}
            </p>
            <p className={`text-sm ${isAnthropic ? 'text-purple-600' : 'text-green-600'}`}>últimos 30 dias</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">Tokens Consumidos</p>
            <p className="text-3xl font-bold text-blue-900">{ai.tokens_30d.toLocaleString()}</p>
            <p className="text-sm text-blue-600">últimos 30 dias</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">Custo Estimado</p>
            <p className="text-3xl font-bold text-green-900">${ai.estimated_cost_usd.toFixed(4)}</p>
            <p className="text-sm text-green-600">{modelName} pricing</p>
          </div>
        </div>
      </div>

      {/* Errors */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Erros Recentes (7 dias)</h3>
        </div>
        
        {Object.keys(errors.by_type).length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-500">Nenhum erro registrado nos últimos 7 dias! 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tipo de Erro</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Ocorrências</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(errors.by_type).map(([errorType, count]) => (
                  <tr key={errorType} className="border-b last:border-0">
                    <td className="py-3 px-4 text-sm text-gray-900">{errorType}</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (count as number) > 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {count as number}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Status - ATUALIZADO */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Serviços</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Backend API</span>
            </div>
            <span className="text-sm text-green-600">Online</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Supabase Database</span>
            </div>
            <span className="text-sm text-green-600">Online</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Telegram Bot</span>
            </div>
            <span className="text-sm text-green-600">Online</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 ${isAnthropic ? 'bg-purple-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
              <span className="font-medium">{providerName}</span>
            </div>
            <span className={`text-sm ${isAnthropic ? 'text-purple-600' : 'text-green-600'}`}>Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}
