import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Wallet, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';

const RevenueShareDashboard = ({ varejoId }) => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`/api/revenue-share/dashboard/${varejoId}`);
      const data = await response.json();
      setDashboard(data);

      // Buscar vendas recentes
      const historyResponse = await fetch(
        `/api/revenue-share/history/${varejoId}?limit=5`
      );
      const historyData = await historyResponse.json();
      setRecentSales(historyData.sales || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-6 bg-slate-900 text-slate-100 min-h-screen">
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <p className="text-red-200">Erro ao carregar dashboard</p>
        </div>
      </div>
    );
  }

  const { summary, actions } = dashboard;

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🎉 ADS Lucrativo</h1>
        <p className="text-slate-400">Você só paga quando vende. Acompanhe seus ganhos em tempo real.</p>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Saldo Confirmado */}
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-200 text-sm font-semibold mb-2">Saldo Disponível ✅</p>
              <p className="text-4xl font-bold">R$ {summary.balance.confirmed.toFixed(2)}</p>
              <p className="text-green-300 text-xs mt-2">Pronto para sacar</p>
            </div>
            <Wallet className="text-green-200" size={32} />
          </div>
        </div>

        {/* Saldo Pendente */}
        <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-200 text-sm font-semibold mb-2">Saldo Pendente ⏳</p>
              <p className="text-4xl font-bold">R$ {summary.balance.pending.toFixed(2)}</p>
              <p className="text-amber-300 text-xs mt-2">Confirmação em 30 dias</p>
            </div>
            <AlertCircle className="text-amber-200" size={32} />
          </div>
        </div>

        {/* Total Vendas */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-200 text-sm font-semibold mb-2">Total de Vendas 💰</p>
              <p className="text-4xl font-bold">R$ {summary.stats.total_revenue.toFixed(2)}</p>
              <p className="text-blue-300 text-xs mt-2">{summary.stats.total_sales} vendas</p>
            </div>
            <DollarSign className="text-blue-200" size={32} />
          </div>
        </div>

        {/* Projeção */}
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-200 text-sm font-semibold mb-2">Projeção 30 dias 📈</p>
              <p className="text-4xl font-bold">R$ {summary.projection.next_30_days_earnings.toFixed(2)}</p>
              <p className="text-purple-300 text-xs mt-2">{summary.projection.trend}</p>
            </div>
            <TrendingUp className="text-purple-200" size={32} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {actions.map((action) => (
          <button
            key={action.button}
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition"
          >
            <p className="font-semibold text-lg mb-2">{action.action}</p>
            <p className="text-slate-400 text-sm">
              {action.min_amount ? `Mínimo R$ ${action.min_amount}` : 'Ver detalhes'}
            </p>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-700">
        {['overview', 'history', 'commission'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 font-semibold transition ${
              selectedTab === tab
                ? 'border-b-2 border-blue-600 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'overview' && '📊 Visão Geral'}
            {tab === 'history' && '📜 Histórico'}
            {tab === 'commission' && '🤝 Comissões'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Breakdown */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">📊 Resumo Financeiro</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Total de Vendas:</span>
                <span className="font-semibold">R$ {summary.stats.total_revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Você Ganhou:</span>
                <span className="font-semibold text-green-400">R$ {summary.stats.total_earned.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Comissão ADS (15%):</span>
                <span className="font-semibold text-slate-300">
                  R$ {(summary.stats.total_revenue * 0.15).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-600 pt-3 mt-3 flex justify-between">
                <span className="text-slate-400">Ticket Médio:</span>
                <span className="font-semibold">R$ {summary.stats.avg_sale.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Como Funciona */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4">🎯 Como Funciona</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold">Venda via anúncio ADS</p>
                  <p className="text-slate-400">Cliente clica e compra</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold">Vendas são rastreadas</p>
                  <p className="text-slate-400">IA calcula lucro e comissão</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold">Seu saldo cresce</p>
                  <p className="text-slate-400">Você fica com 85% do lucro</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <p className="font-semibold">Saque quando quiser</p>
                  <p className="text-slate-400">Deposita em sua conta em 2-3 dias</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'history' && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">📜 Últimas Vendas</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.sale_id} className="flex justify-between items-center p-4 bg-slate-700/50 rounded">
                  <div className="flex-1">
                    <p className="font-semibold">Venda #{sale.sale_id.slice(-6)}</p>
                    <p className="text-slate-400 text-sm">{new Date(sale.timestamp).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">+R$ {sale.earnings.toFixed(2)}</p>
                    <p className="text-slate-400 text-sm">
                      {sale.status === 'confirmed' && '✅ Confirmada'}
                      {sale.status === 'pending' && '⏳ Pendente'}
                      {sale.status === 'chargedback' && '❌ Devolvida'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">Nenhuma venda rastreada ainda</p>
                <p className="text-slate-500 text-sm">Ative seus anúncios para começar a ganhar!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTab === 'commission' && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">🤝 Estrutura de Comissão</h3>
          <div className="space-y-6">
            {/* Breakdown Visual */}
            <div>
              <h4 className="font-semibold mb-4">Exemplo: Você vende R$ 1.000</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Valor da Venda:</span>
                    <span className="font-semibold">R$ 1.000</span>
                  </div>
                  <div className="h-2 bg-slate-600 rounded overflow-hidden">
                    <div className="h-full bg-blue-500 w-full"></div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Seu Lucro (50%):</span>
                    <span className="font-semibold">R$ 500</span>
                  </div>
                  <div className="h-2 bg-slate-600 rounded overflow-hidden">
                    <div className="h-full bg-blue-400 w-1/2"></div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-green-900/30 border border-green-600 rounded p-4">
                    <p className="text-green-200 text-sm mb-1">Você Recebe (85%):</p>
                    <p className="text-2xl font-bold text-green-400">R$ 425</p>
                  </div>
                  <div className="bg-slate-700/30 border border-slate-600 rounded p-4">
                    <p className="text-slate-300 text-sm mb-1">ADS Fica (15%):</p>
                    <p className="text-2xl font-bold text-slate-300">R$ 75</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-600 rounded p-4">
              <p className="text-blue-200 text-sm">
                ℹ️ Você só paga comissão quando vende. Se não houver vendas, não há comissão.
                Cada venda é rastreada automaticamente e a comissão é calculada sobre seu lucro real.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-slate-400 text-sm">
        <p>Última atualização: {new Date(dashboard.updated_at).toLocaleTimeString('pt-BR')}</p>
      </div>
    </div>
  );
};

export default RevenueShareDashboard;
