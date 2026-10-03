import React, { useState } from 'react';

export const OnloveQuickSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    price: 29,
  });

  const steps = [
    {
      num: 1,
      title: 'Nome da Comunidade',
      description: 'Algo criativo e memorável',
      example: 'Ex: "Fitness com Maria" ou "Dev Tips"',
    },
    {
      num: 2,
      title: 'Escolha um Tópico',
      description: 'Ajuda a encontrar seus membros',
      options: [
        '💪 Fitness',
        '🎓 Educação',
        '🎨 Design',
        '💰 Finanças',
        '🍕 Lifestyle',
      ],
    },
    {
      num: 3,
      title: 'Defina seu Preço',
      description: 'Você pode mudar depois',
      price: formData.price,
      projection: `Com 50 membros: R$ ${formData.price * 50}/mês`,
    },
    {
      num: 4,
      title: 'Pronto! 🎉',
      description: 'Sua comunidade está online',
      cta: 'Começar',
    },
  ];

  return (
    <div className="quick-setup">
      <div className="progress-bar">
        {steps.map((s) => (
          <div
            key={s.num}
            className={`step ${step >= s.num ? 'active' : ''}`}
          >
            {s.num}
          </div>
        ))}
      </div>

      <div className="setup-card">
        <h2>{steps[step - 1].title}</h2>
        <p>{steps[step - 1].description}</p>

        {step === 1 && (
          <input
            type="text"
            placeholder="Nome da comunidade"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            autoFocus
          />
        )}

        {step === 2 && (
          <div className="options">
            {steps[1].options?.map((option) => (
              <button
                key={option}
                className={`option ${formData.topic === option ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, topic: option })}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div>
            <input
              type="range"
              min="9"
              max="99"
              step="10"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              className="price-slider"
            />
            <div className="price-display">
              <span className="price">R$ {formData.price}/mês</span>
              <span className="projection">{steps[2].projection}</span>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="success">
            <h3>✅ Comunidade criada!</h3>
            <p>"{formData.name}" está pronta para receber membros</p>
            <div className="summary">
              <div>Tópico: {formData.topic}</div>
              <div>Preço: R$ {formData.price}/mês</div>
            </div>
          </div>
        )}

        <div className="buttons">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary">
              Voltar
            </button>
          )}
          <button
            onClick={() => {
              if (step === 4) {
                // Submit to backend
                console.log('Create community:', formData);
              } else {
                setStep(step + 1);
              }
            }}
            disabled={step === 4 && !formData.name}
            className="btn-primary"
          >
            {step === 4 ? 'Começar' : 'Próximo'}
          </button>
        </div>
      </div>

      <style>{`
        .quick-setup {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          padding: 40px 24px;
          border-radius: 16px;
          max-width: 500px;
          margin: 0 auto;
        }

        .progress-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 40px;
          justify-content: center;
        }

        .step {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #333;
          border: 2px solid #444;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.3s;
          cursor: pointer;
        }

        .step.active {
          background: #ff006e;
          border-color: #ff006e;
          color: #fff;
        }

        .setup-card {
          background: #2d2d2d;
          padding: 40px 32px;
          border-radius: 12px;
          border: 1px solid #444;
        }

        .setup-card h2 {
          font-size: 24px;
          margin: 0 0 12px 0;
          color: #fff;
        }

        .setup-card p {
          font-size: 14px;
          color: #999;
          margin: 0 0 24px 0;
        }

        .input {
          width: 100%;
          padding: 14px 16px;
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 8px;
          color: #fff;
          font-size: 16px;
          margin-bottom: 24px;
          box-sizing: border-box;
        }

        .input:focus {
          outline: none;
          border-color: #ff006e;
          box-shadow: 0 0 8px rgba(255, 0, 110, 0.3);
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .option {
          padding: 14px 16px;
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          transition: all 0.3s;
          text-align: left;
          font-size: 14px;
        }

        .option:hover {
          border-color: #ff006e;
          background: #333;
        }

        .option.selected {
          background: #ff006e;
          border-color: #ff006e;
          color: #fff;
        }

        .price-slider {
          width: 100%;
          height: 6px;
          margin-bottom: 24px;
          cursor: pointer;
          appearance: none;
          background: #444;
          border-radius: 5px;
          outline: none;
        }

        .price-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ff006e;
          cursor: pointer;
        }

        .price-display {
          text-align: center;
          margin-bottom: 24px;
        }

        .price {
          display: block;
          font-size: 32px;
          font-weight: 700;
          color: #ff006e;
          margin-bottom: 8px;
        }

        .projection {
          display: block;
          font-size: 14px;
          color: #999;
        }

        .success {
          text-align: center;
        }

        .success h3 {
          font-size: 24px;
          margin: 0 0 12px 0;
          color: #00d084;
        }

        .success p {
          margin: 0 0 24px 0;
          color: #fff;
        }

        .summary {
          background: #1a1a1a;
          padding: 16px;
          border-radius: 8px;
          text-align: left;
          margin-bottom: 24px;
        }

        .summary div {
          padding: 8px 0;
          color: #fff;
          font-size: 14px;
        }

        .buttons {
          display: flex;
          gap: 12px;
        }

        .btn-primary {
          flex: 1;
          background: #ff006e;
          color: #fff;
          border: none;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #c70052;
          transform: translateY(-2px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          flex: 1;
          background: transparent;
          color: #ff006e;
          border: 1px solid #ff006e;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          background: #ff006e;
          color: #fff;
        }

        @media (max-width: 768px) {
          .quick-setup {
            padding: 24px 16px;
          }
          .setup-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
};
