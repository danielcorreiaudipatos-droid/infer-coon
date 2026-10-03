import React from 'react';

export const OnloveMonetization: React.FC<{ creatorId: string }> = () => {
  return (
    <div className="monetization-hero">
      <h1>🚀 Ganhe com sua Comunidade</h1>

      <div className="earnings-showcase">
        <div className="stat">
          <span className="label">Creators Ganham em Média</span>
          <span className="value">R$ 2.500/mês</span>
          <span className="trend">4x renda atual (fonte: 100+ creators)</span>
        </div>

        <div className="stat">
          <span className="label">Maior Ganho</span>
          <span className="value">R$ 45.000/mês</span>
          <span className="trend">Com 250 membros premium</span>
        </div>

        <div className="stat">
          <span className="label">Tempo p/ Primeiro R$1000</span>
          <span className="value">30 dias</span>
          <span className="trend">Com 50 membros ativos</span>
        </div>
      </div>

      <div className="success-stories">
        <h3>✅ Casos de Sucesso</h3>

        <div className="story">
          <div className="story-avatar">👩‍🏫</div>
          <div>
            <h4>Maria Silva - Fitness</h4>
            <p>"Passei de R$ 0 a R$ 5k/mês em 60 dias!"</p>
            <span className="metric">250 members | 80% retention</span>
          </div>
        </div>

        <div className="story">
          <div className="story-avatar">👨‍💻</div>
          <div>
            <h4>João Costa - Educação</h4>
            <p>"Agora ganho mais que meu emprego anterior"</p>
            <span className="metric">180 members | 4.9★ rating</span>
          </div>
        </div>

        <div className="story">
          <div className="story-avatar">👩‍🎨</div>
          <div>
            <h4>Ana Paula - Lifestyle</h4>
            <p>"Comunidade pagou meu aluguel este mês"</p>
            <span className="metric">320 members | R$ 8k/mês</span>
          </div>
        </div>
      </div>

      <div className="monetization-methods">
        <h3>💰 4 Formas de Ganhar</h3>

        <div className="method">
          <div className="icon">👥</div>
          <h4>Assinaturas (50-80%)</h4>
          <p>Defina seu preço mensal (R$ 9-99)</p>
          <span className="example">R$ 29/mês × 50 membros = R$ 1.450</span>
        </div>

        <div className="method">
          <div className="icon">🛍️</div>
          <h4>Produtos Digitais (20-30%)</h4>
          <p>Venda cursos, e-books, templates</p>
          <span className="example">1 venda × R$ 197 = R$ 197</span>
        </div>

        <div className="method">
          <div className="icon">🎁</div>
          <h4>Doações & Tips (5-10%)</h4>
          <p>Membros enviam tips quando gostam</p>
          <span className="example">10 tips × R$ 50 = R$ 500</span>
        </div>

        <div className="method">
          <div className="icon">🤝</div>
          <h4>Afiliações (5-15%)</h4>
          <p>Comissão em produtos recomendados</p>
          <span className="example">20% em vendas de seus produtos</span>
        </div>
      </div>

      <div className="cta-section">
        <button className="cta-primary">💰 Começar a Ganhar Agora</button>
        <span className="trust-badge">✅ 100% grátis • 🚀 1º membro em 5 min</span>
      </div>

      <style>{`
        .monetization-hero {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          padding: 40px 24px;
          border-radius: 16px;
          text-align: center;
        }

        .monetization-hero h1 {
          font-size: 32px;
          margin-bottom: 40px;
          color: #fff;
        }

        .earnings-showcase {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 60px;
        }

        .stat {
          background: #333;
          padding: 24px;
          border-radius: 12px;
          border-left: 4px solid #ff006e;
        }

        .stat .label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
        }

        .stat .value {
          font-size: 28px;
          font-weight: 700;
          color: #00d084;
          display: block;
          margin: 8px 0;
        }

        .stat .trend {
          font-size: 12px;
          color: #999;
        }

        .success-stories {
          margin: 60px 0;
          text-align: left;
        }

        .success-stories h3 {
          text-align: center;
          margin-bottom: 30px;
          color: #fff;
        }

        .story {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          padding: 20px;
          background: #333;
          border-radius: 12px;
        }

        .story-avatar {
          font-size: 48px;
          flex-shrink: 0;
        }

        .story h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #fff;
        }

        .story p {
          margin: 0 0 8px 0;
          color: #fff;
          font-style: italic;
        }

        .story .metric {
          font-size: 12px;
          color: #00d084;
        }

        .monetization-methods {
          margin: 60px 0;
          text-align: left;
        }

        .monetization-methods h3 {
          text-align: center;
          margin-bottom: 30px;
          color: #fff;
        }

        .method {
          background: #333;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          gap: 20px;
        }

        .method .icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .method h4 {
          margin: 0 0 8px 0;
          color: #fff;
        }

        .method p {
          margin: 0 0 12px 0;
          color: #999;
          font-size: 14px;
        }

        .method .example {
          display: block;
          background: #1a1a1a;
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
          color: #00d084;
          font-weight: 600;
        }

        .cta-section {
          margin-top: 40px;
          text-align: center;
        }

        .cta-primary {
          background: #ff006e;
          color: #fff;
          border: none;
          padding: 16px 40px;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-block;
        }

        .cta-primary:hover {
          background: #c70052;
          transform: translateY(-2px);
        }

        .trust-badge {
          display: block;
          margin-top: 16px;
          font-size: 14px;
          color: #00d084;
        }

        @media (max-width: 768px) {
          .monetization-hero h1 {
            font-size: 24px;
          }
          .method {
            flex-direction: column;
          }
          .earnings-showcase {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
