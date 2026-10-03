import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ResultsPage() {
  const router = useRouter();
  const { game, score, reward, points, matches, waves } = router.query;
  const [walletUpdated, setWalletUpdated] = useState(false);

  useEffect(() => {
    if (reward && !walletUpdated) {
      // Simulate wallet update (in production, this would be done by backend)
      setTimeout(() => {
        setWalletUpdated(true);
      }, 1500);
    }
  }, [reward, walletUpdated]);

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'onzap':
        return '💬';
      case 'onlove':
        return '💘';
      case 'onmail':
        return '🛡️';
      default:
        return '🎮';
    }
  };

  const getGameName = (gameType: string) => {
    switch (gameType) {
      case 'onzap':
        return 'ONZAP';
      case 'onlove':
        return 'ONLOVE';
      case 'onmail':
        return 'ONMAIL';
      default:
        return 'Jogo';
    }
  };

  const getGameColor = (gameType: string) => {
    switch (gameType) {
      case 'onzap':
        return 'from-purple-600 to-blue-600';
      case 'onlove':
        return 'from-pink-600 to-rose-600';
      case 'onmail':
        return 'from-orange-600 to-amber-600';
      default:
        return 'from-purple-600 to-pink-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Success Animation */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 animate-bounce">{getGameIcon(game as string)}</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {game === 'onzap' ? '🎉 Jogo Completo!' : game === 'onlove' ? '🎉 Rodada Finalizada!' : '🎉 Inbox Defendido!'}
          </h1>
          <p className="text-gray-400 text-lg">
            {walletUpdated ? '✅ Prêmios adicionados à sua carteira!' : 'Processando recompensas...'}
          </p>
        </div>

        {/* Results Card */}
        <div className={`bg-gradient-to-br ${getGameColor(game as string)} rounded-3xl p-12 text-white shadow-2xl mb-8`}>
          <h2 className="text-3xl font-bold mb-8 text-center">{getGameName(game as string)}</h2>

          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Score */}
            <div className="bg-white/10 rounded-xl p-6 text-center backdrop-blur">
              <p className="text-sm opacity-80 mb-2">Score</p>
              <p className="text-4xl font-bold">{score}</p>
            </div>

            {/* Points */}
            <div className="bg-white/10 rounded-xl p-6 text-center backdrop-blur">
              <p className="text-sm opacity-80 mb-2">Pontos Ganhos</p>
              <p className="text-4xl font-bold">+{points}</p>
            </div>

            {/* Game-specific stats */}
            {matches && (
              <div className="bg-white/10 rounded-xl p-6 text-center backdrop-blur">
                <p className="text-sm opacity-80 mb-2">Matches</p>
                <p className="text-4xl font-bold">💘 {matches}</p>
              </div>
            )}

            {waves && (
              <div className="bg-white/10 rounded-xl p-6 text-center backdrop-blur">
                <p className="text-sm opacity-80 mb-2">Ondas</p>
                <p className="text-4xl font-bold">📈 {waves}/20</p>
              </div>
            )}

            {/* Reward Box */}
            <div className="col-span-2 bg-white/20 rounded-xl p-6 text-center backdrop-blur border-2 border-white/40">
              <p className="text-sm opacity-80 mb-2">💰 Recompensa</p>
              <p className="text-5xl font-bold">R$ {reward}</p>
              <p className="text-xs opacity-70 mt-2">{walletUpdated ? '✅ Adicionado ao Wallet' : '⏳ Processando...'}</p>
            </div>
          </div>

          {/* Cosmetics Earned */}
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
            <p className="text-sm opacity-80 mb-4">🎁 Cosmetics Desbloqueados</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 rounded-lg p-4 text-center">🥷 Skin Ninja</div>
              <div className="bg-white/20 rounded-lg p-4 text-center">✨ Efeito Glow</div>
              <div className="bg-white/20 rounded-lg p-4 text-center">🌟 Ícone Status</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="flex-1">
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition transform hover:scale-105">
              📊 Ir ao Dashboard
            </button>
          </Link>

          <button
            onClick={() => router.push('/game/' + (game === 'onzap' ? 'onzap' : game === 'onlove' ? 'onlove' : 'onmail'))}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-4 rounded-xl transition backdrop-blur border border-white/40"
          >
            🔄 Jogar Novamente
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>🏆 Você está subindo no ranking! Volte amanhã para novos desafios.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}
