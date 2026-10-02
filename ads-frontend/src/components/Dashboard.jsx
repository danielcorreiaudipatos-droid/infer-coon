/**
 * Dashboard - Visão geral de performance
 * Minimalista, clean, sem agressividade
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch KPIs do backend
    const mockKpis = {
      total_spend: 15000.0,
      total_conversions: 500,
      avg_roi: 2.8,
      total_revenue: 42000.0,
      active_campaigns: 12,
      campaigns_status: {
        active: 8,
        paused: 3,
        ended: 1
      }
    };

    const mockDailyData = [
      { date: '01', spend: 500, conversions: 20, revenue: 1500 },
      { date: '02', spend: 480, conversions: 19, revenue: 1400 },
      { date: '03', spend: 520, conversions: 22, revenue: 1600 },
      { date: '04', spend: 550, conversions: 25, revenue: 1800 },
      { date: '05', spend: 600, conversions: 28, revenue: 2000 },
      { date: '06', spend: 580, conversions: 26, revenue: 1900 },
      { date: '07', spend: 620, conversions: 30, revenue: 2200 },
    ];

    setKpis(mockKpis);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral de suas campanhas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-slate-400 text-sm font-medium">Gasto Total</div>
          <div className="text-3xl font-bold text-blue-400 mt-2">
            R$ {kpis?.total_spend?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-2">Este mês</div>
        </div>

        {/* Conversions */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-slate-400 text-sm font-medium">Conversões</div>
          <div className="text-3xl font-bold text-green-400 mt-2">
            {kpis?.total_conversions}
          </div>
          <div className="text-xs text-slate-500 mt-2">Total</div>
        </div>

        {/* ROI */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-slate-400 text-sm font-medium">ROI Médio</div>
          <div className="text-3xl font-bold text-amber-400 mt-2">
            {kpis?.avg_roi?.toFixed(2)}x
          </div>
          <div className="text-xs text-slate-500 mt-2">Retorno</div>
        </div>

        {/* Revenue */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="text-slate-400 text-sm font-medium">Receita</div>
          <div className="text-3xl font-bold text-purple-400 mt-2">
            R$ {kpis?.total_revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-slate-500 mt-2">Total</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend Over Time */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Gastos Diários</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { date: '01', spend: 500 },
              { date: '02', spend: 480 },
              { date: '03', spend: 520 },
              { date: '04', spend: 550 },
              { date: '05', spend: 600 },
              { date: '06', spend: 580 },
              { date: '07', spend: 620 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="spend"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conversions Over Time */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Conversões Diárias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { date: '01', conversions: 20 },
              { date: '02', conversions: 19 },
              { date: '03', conversions: 22 },
              { date: '04', conversions: 25 },
              { date: '05', conversions: 28 },
              { date: '06', conversions: 26 },
              { date: '07', conversions: 30 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569'
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="conversions" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campanhas Status */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Status das Campanhas</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400">{kpis?.campaigns_status?.active}</div>
            <div className="text-slate-400 text-sm mt-1">Ativas</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-400">{kpis?.campaigns_status?.paused}</div>
            <div className="text-slate-400 text-sm mt-1">Pausadas</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-400">{kpis?.campaigns_status?.ended}</div>
            <div className="text-slate-400 text-sm mt-1">Finalizadas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
