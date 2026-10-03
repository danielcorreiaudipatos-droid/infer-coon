import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

interface UserStats {
  totalPoints: number;
  badges: number;
  skinsUnlocked: number;
  walletBalance: number;
}

interface GameScore {
  gameId: string;
  gameName: string;
  score: number;
  lastPlayed: string;
  icon: string;
  color: string;
}

interface Cosmetic {
  id: string;
  name: string;
  price: number;
  icon: string;
  owned: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    badges: 5,
    skinsUnlocked: 3,
    walletBalance: 100.00
  });

  const [gameScores, setGameScores] = useState<GameScore[]>([
    {
      gameId: 'onzap',
      gameName: 'ONZAP',
      score: 1500,
      lastPlayed: 'há 2 horas',
      icon: '💬',
      color: 'from-purple-600 to-blue-600'
    },
    {
      gameId: 'onlove',
      gameName: 'ONLOVE',
      score: 850,
      lastPlayed: 'há 4 horas',
      icon: '💘',
      color: 'from-pink-600 to-rose-600'
    },
    {
      gameId: 'onmail',
      gameName: 'ONMAIL',
      score: 420,
      lastPlayed: 'ontem',
      icon: '🛡️',
      color: 'from-orange-600 to-amber-600'
    }
  ]);

  const [cosmetics] = useState<Cosmetic[]>([
    { id: 'skin_ninja', name: 'Skin Ninja', price: 4.99, icon: '🥷', owned: true },
    { id: 'skin_gold', name: 'Skin Gold', price: 4.99, icon: '👑', owned: false },
    { id: 'skin_cyber', name: 'Skin Cyberpunk', price: 9.99, icon: '🤖', owned: false },
    { id: 'effect_glow', name: 'Efeito Glow', price: 2.99, icon: '✨', owned: true },
    { id: 'effect_fire', name: 'Efeito Fire', price: 2.99, icon: '🔥', owned: false },
    { id: 'theme_dark', name: 'Theme Escuro', price: 1.99, icon: '🌙', owned: true }
  ]);

  const [loadingPurchase, setLoadingPurchase] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleBuyCosmeticWithWallet = async (cosmeticId: string, price: number) => {
    setLoadingPurchase(cosmeticId);

    // Simular compra com wallet
    if (stats.walletBalance >= price) {
      setStats(prev => ({
        ...prev,
        walletBalance: prev.walletBalance - price
      }));

      // Marcar cosmético como owned
      // await fetch('/api/cosmetics/purchase', { ... })

      setTimeout(() => {
        setLoadingPurchase(null);
        alert(`✅ ${cosmeticId} comprado com sucesso!`);
      }, 800);
    } else {
      setLoadingPurchase(null);
      alert('❌ Saldo insuficiente no wallet');
    }
  };

  const handlePlayGame = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  const handleAddFunds = async () => {
    // Redirecionar para página de carregamento de wallet
    router.push('/wallet/deposit');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/dashboard">
            <div className="text-2xl font-bold text-white cursor-pointer">🎮 COON Games</div>
          </Link>

          <div className="hidden md:flex gap-8">
            <Link href="/dashboard" className="text-white hover:text-yellow-300 transition">Dashboard</Link>
            <Link href="/games" className="text-white hover:text-yellow-300 transition">Jogos</Link>
            <Link href="/studio" className="text-white hover:text-yellow-300 transition">Studio</Link>
          </div>

          <div className="flex gap-4 items-center">
            <div className="text-white font-semibold hidden sm:block">
              R$ {stats.walletBalance.toFixed(2)}
            </div>
            <button
              onClick={() => signOut()}
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:scale-105 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Olá, {session?.user?.name || 'Jogador'}! 👋
          </h1>
          <p className="text-gray-400">Bem-vindo de volta ao COON Games</p>
        </div>

        {/* Wallet Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-12 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-80 mb-2">Saldo do Wallet</p>
              <h2 className="text-4xl font-bold">R$ {stats.walletBalance.toFixed(2)}</h2>
            </div>
            <div className="text-4xl">💰</div>
          </div>
          <button
            onClick={handleAddFunds}
            className="bg-white text-pink-600 font-bold px-6 py-2 rounded-lg hover:scale-105 transition"
          >
            + Carregar Wallet
          </button>
        </div>

        {/* Meus Jogos Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-8">🎮 Meus Jogos</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gameScores.map((game) => (
              <div key={game.gameId} className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${game.color} p-6 text-white cursor-pointer hover:shadow-2xl transition-all duration-300`}>
                <div className="relative z-10">
                  <div className="text-4xl mb-2">{game.icon}</div>
                  <h4 className="text-2xl font-bold mb-2">{game.gameName}</h4>

                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-sm opacity-80">Score</p>
                      <p className="text-3xl font-bold">{game.score}</p>
                    </div>
                    <p className="text-xs opacity-70">{game.lastPlayed}</p>
                  </div>

                  <button
                    onClick={() => handlePlayGame(game.gameId)}
                    className="w-full bg-white text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    ▶ Jogar Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-8">📊 Minhas Estatísticas</h3>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <div className="text-sm opacity-80">Pontos Totais</div>
            </div>

            <div className="bg-gradient-to-br from-pink-600 to-orange-600 rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold">{stats.badges}</div>
              <div className="text-sm opacity-80">Badges</div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-yellow-600 rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-2xl font-bold">{stats.skinsUnlocked}</div>
              <div className="text-sm opacity-80">Skins Desbloqueadas</div>
            </div>
          </div>
        </div>

        {/* Cosmetics Shop Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-white">🛍️ Loja de Cosmetics</h3>
            <Link href="/marketplace">
              <p className="text-purple-400 hover:text-purple-300 cursor-pointer">Ver mais →</p>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cosmetics.map((item) => (
              <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center hover:border-purple-500 transition">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h5 className="text-white font-semibold text-sm mb-2">{item.name}</h5>

                {item.owned ? (
                  <div className="bg-green-600 text-white text-xs font-bold py-2 rounded-lg">
                    ✓ Desbloqueado
                  </div>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm mb-2">R$ {item.price.toFixed(2)}</p>
                    <button
                      onClick={() => handleBuyCosmeticWithWallet(item.id, item.price)}
                      disabled={loadingPurchase === item.id || stats.walletBalance < item.price}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold py-2 rounded-lg transition disabled:opacity-50"
                    >
                      {loadingPurchase === item.id ? '...' : 'Comprar'}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Studio CTA */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">✨ Crie Seus Próprios Jogos</h3>
          <p className="text-lg mb-6 opacity-90">
            Use nosso Game Builder Studio para criar e monetizar seus próprios jogos
          </p>
          <Link href="/studio">
            <button className="bg-white text-green-600 font-bold px-8 py-3 rounded-lg hover:scale-105 transition">
              Ir para Studio
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-8 px-6 border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center">
          <p>© 2026 COON Games. Divirta-se, jogue, ganhe!</p>
        </div>
      </footer>
    </div>
  );
}
