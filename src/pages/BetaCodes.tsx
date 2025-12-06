import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ticket, Copy, Check, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { getBetaCodes, generateBetaCodes } from '../services/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function BetaCodes() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [generateCount, setGenerateCount] = useState(10)

  const { data, isLoading } = useQuery({
    queryKey: ['betaCodes', page, status],
    queryFn: () => getBetaCodes(page, 50, status)
  })

  const generateMutation = useMutation({
    mutationFn: (count: number) => generateBetaCodes(count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['betaCodes'] })
    }
  })

  const codes = data?.data || []
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  const usedCount = codes.filter((c: any) => c.used_by_user_id).length
  const availableCount = codes.filter((c: any) => !c.used_by_user_id).length

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const copyAllAvailable = async () => {
    const availableCodes = codes
      .filter((c: any) => !c.used_by_user_id)
      .map((c: any) => c.code)
      .join('\n')
    
    await navigator.clipboard.writeText(availableCodes)
    setCopiedCode('all')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Códigos Beta</h2>
          <p className="text-sm text-gray-500">Gerencie os códigos de acesso beta</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="100"
            value={generateCount}
            onChange={(e) => setGenerateCount(Number(e.target.value))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
          />
          <button
            onClick={() => generateMutation.mutate(generateCount)}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {generateMutation.isPending ? 'Gerando...' : 'Gerar Códigos'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              <p className="text-sm text-gray-500">Total de códigos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{availableCount}</p>
              <p className="text-sm text-gray-500">Disponíveis</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Ticket className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{usedCount}</p>
              <p className="text-sm text-gray-500">Utilizados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <select
            value={status || ''}
            onChange={(e) => {
              setStatus(e.target.value || undefined)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">Todos os códigos</option>
            <option value="available">Disponíveis</option>
            <option value="used">Utilizados</option>
          </select>

          <button
            onClick={copyAllAvailable}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {copiedCode === 'all' ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copiados!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Disponíveis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Codes Table */}
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Código</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Criado em</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Usado em</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Expira em</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code: any) => (
                    <tr key={code.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {code.code}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        {code.used_by_user_id ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Utilizado
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Disponível
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {code.created_at
                          ? format(new Date(code.created_at), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {code.used_at
                          ? format(new Date(code.used_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {code.expires_at
                          ? format(new Date(code.expires_at), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copiar código"
                        >
                          {copiedCode === code.code ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <p className="text-sm text-gray-500">
                Mostrando {codes.length} de {pagination.total} códigos
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Página {page} de {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Generated Codes Modal */}
      {generateMutation.isSuccess && generateMutation.data?.codes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ✅ Códigos Gerados!
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {generateMutation.data.codes.map((code: string) => (
                <div key={code} className="flex items-center justify-between py-1">
                  <code className="font-mono text-sm">{code}</code>
                  <button
                    onClick={() => copyToClipboard(code)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {copiedCode === code ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => generateMutation.reset()}
              className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
