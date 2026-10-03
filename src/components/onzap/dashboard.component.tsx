import React, { useState, useEffect } from 'react';

interface DashboardMetrics {
  activeContacts: number;
  unreadMessages: number;
  responseStreak: number;
  rating: number;
  responseRate: number;
  messagesCount: number;
  autoResponses: number;
  avgResponseTime: number;
  newContacts: number;
}

export const OnzapDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeContacts: 127,
    unreadMessages: 42,
    responseStreak: 5,
    rating: 4.8,
    responseRate: 94,
    messagesCount: 23,
    autoResponses: 18,
    avgResponseTime: 47,
    newContacts: 3,
  });

  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/onzap/metrics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🟢 ONZAP - {metrics.activeContacts} Contatos Ativos</h1>
        <button className="refresh-btn" onClick={fetchMetrics} disabled={loading}>
          {loading ? '⏳' : '🔄'}
        </button>
      </header>

      <div className="metrics-grid">
        <div className="metric-card unread-card">
          <div className="metric-icon">💬</div>
          <div className="metric-content">
            <span className="metric-label">Mensagens Não Lidas</span>
            <span className="metric-value">{metrics.unreadMessages}</span>
            <span className="metric-trend">Clique para responder</span>
          </div>
        </div>

        <div className="metric-card streak-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-content">
            <span className="metric-label">Streak Ativo</span>
            <span className="metric-value">{metrics.responseStreak} dias</span>
            <span className="metric-trend">Respostas &lt; 2min</span>
          </div>
        </div>

        <div className="metric-card rating-card">
          <div className="metric-icon">⭐</div>
          <div className="metric-content">
            <span className="metric-label">Avaliação</span>
            <span className="metric-value">{metrics.rating.toFixed(1)}/5</span>
            <span className="metric-trend">2.3k reviews</span>
          </div>
        </div>

        <div className="metric-card response-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <span className="metric-label">Taxa Resposta</span>
            <span className="metric-value">{metrics.responseRate}%</span>
            <span className="metric-trend">↑ 12% vs semana</span>
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h2>📊 Atividade Hoje</h2>
        <ul className="activity-list">
          <li>
            <span className="activity-label">Mensagens</span>
            <span className="activity-value">{metrics.messagesCount} (+5 vs ontem) 📈</span>
          </li>
          <li>
            <span className="activity-label">Respostas Automáticas</span>
            <span className="activity-value">{metrics.autoResponses}/{metrics.messagesCount} ✅</span>
          </li>
          <li>
            <span className="activity-label">Tempo Médio Resposta</span>
            <span className="activity-value">{metrics.avgResponseTime}s 🚀</span>
          </li>
          <li>
            <span className="activity-label">Contatos Novos</span>
            <span className="activity-value">{metrics.newContacts} 🎉</span>
          </li>
        </ul>
      </div>

      <div className="dashboard-actions">
        <button className="btn-primary">👥 Contatos</button>
        <button className="btn-secondary">💬 Chat</button>
        <button className="btn-secondary">📊 Relatório</button>
      </div>

      <style>{`
        .dashboard-container {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: #fff;
          padding: 32px 24px;
          border-radius: 16px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #00d084;
        }

        .dashboard-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }

        .refresh-btn {
          background: #00d084;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #00b86a;
          transform: scale(1.05);
        }

        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: #2d2d2d;
          border: 1px solid #444;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 16px;
          transition: all 0.3s;
          cursor: pointer;
        }

        .metric-card:hover {
          border-color: #00d084;
          box-shadow: 0 8px 24px rgba(0, 208, 132, 0.15);
          transform: translateY(-4px);
        }

        .metric-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .metric-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .metric-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
        }

        .metric-trend {
          font-size: 12px;
          color: #00d084;
        }

        .unread-card { border-left: 4px solid #ff6b35; }
        .streak-card { border-left: 4px solid #ffc107; }
        .rating-card { border-left: 4px solid #4caf50; }
        .response-card { border-left: 4px solid #00d084; }

        .activity-section {
          background: #2d2d2d;
          border: 1px solid #444;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .activity-section h2 {
          font-size: 18px;
          margin: 0 0 16px 0;
          font-weight: 600;
        }

        .activity-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .activity-list li {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #444;
          font-size: 14px;
        }

        .activity-list li:last-child {
          border-bottom: none;
        }

        .activity-label {
          color: #999;
        }

        .activity-value {
          color: #fff;
          font-weight: 600;
        }

        .dashboard-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary {
          flex: 1;
          background: #00d084;
          color: #1a1a1a;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary:hover {
          background: #00b86a;
          transform: translateY(-2px);
        }

        .btn-secondary {
          flex: 1;
          background: transparent;
          color: #00d084;
          border: 1px solid #00d084;
          padding: 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          background: #00d084;
          color: #1a1a1a;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 16px;
          }
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
