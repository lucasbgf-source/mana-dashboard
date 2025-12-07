import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Copy,
  RefreshCw,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import api from '../services/api';

interface BetaCode {
  id: string;
  code: string;
  created_at: string;
  used_at: string | null;
  expires_at: string | null;
  used_by_user_id: string | null;
  user_name: string | null;
  user_username: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const BetaCodes: React.FC = () => {
  const [codes, setCodes] = useState<BetaCode[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'used' | 'available'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchCodes = async (page = 1) => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await api.getBetaCodes(page, 50, status);
      setCodes(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching beta codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [filter]);

  const handleGenerateCodes = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      await api.generateBetaCodes(generateCount);
      await fetchCodes();
    } catch (error) {
      console.error('Error generating codes:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar por busca
  const filteredCodes = codes.filter(code => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      code.code.toLowerCase().includes(search) ||
      (code.user_name && code.user_name.toLowerCase().includes(search)) ||
      (code.user_username && code.user_username.toLowerCase().includes(search))
    );
  });

  // Stats
  const totalCodes = pagination?.total || 0;
  const usedCodes = codes.filter(c => c.used_by_user_id).length;
  const availableCodes = codes.filter(c => !c.used_by_user_id).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Códigos Beta</h1>
          <p className="text-gray-600 mt-1">Gerencie os códigos de acesso ao sistema</p>
        </div>
        <button
          onClick={() => fetchCodes()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Códigos</p>
              <p className="text-2xl font-bold text-gray-900">{totalCodes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Utilizados</p>
              <p className="text-2xl font-bold text-green-600">{usedCodes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <XCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Disponíveis</p>
              <p className="text-2xl font-bold text-yellow-600">{availableCodes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar código ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'used' | 'available')}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="used">Utilizados</option>
                <option value="available">Disponíveis</option>
              </select>
            </div>
          </div>

          {/* Generate */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={generateCount}
              onChange={(e) => setGenerateCount(parseInt(e.target.value) || 10)}
              className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleGenerateCodes}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {generating ? 'Gerando...' : 'Gerar Códigos'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Usado em
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Carregando...
                  </td>
                </tr>
              ) : filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhum código encontrado
                  </td>
                </tr>
              ) : (
                filteredCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {code.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {code.used_by_user_id ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Utilizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          Disponível
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {code.user_name || code.user_username ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {code.user_name || 'Sem nome'}
                            </p>
                            {code.user_username && (
                              <p className="text-xs text-gray-500">@{code.user_username}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(code.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(code.used_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copiar código"
                      >
                        {copiedCode === code.code ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Mostrando {filteredCodes.length} de {pagination.total} códigos
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchCodes(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => fetchCodes(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetaCodes;
