import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface GameProject {
  id: string;
  name: string;
  template: string;
  published: boolean;
  createdAt: string;
  plays: number;
}

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  mechanics: string[];
}

export default function StudioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<'create' | 'my-games' | 'marketplace'>('create');

  const [newGame, setNewGame] = useState({
    name: '',
    template: 'flappy_bird',
    mechanics: [] as string[]
  });

  const [myGames] = useState<GameProject[]>([
    {
      id: 'proj_1',
      name: 'Meu Flappy Bird',
      template: 'flappy_bird',
      published: true,
      createdAt: '2 dias atrás',
      plays: 1250
    },
    {
      id: 'proj_2',
      name: 'Tinder dos Famosos',
      template: 'tinder',
      published: false,
      createdAt: '5 dias atrás',
      plays: 0
    }
  ]);

  const [marketplaceGames] = useState<GameProject[]>([
    {
      id: 'market_1',
      name: 'Super Flappy 2000',
      template: 'flappy_bird',
      published: true,
      createdAt: 'por user123',
      plays: 50000
    },
    {
      id: 'market_2',
      name: 'Dating Royale',
      template: 'tinder',
      published: true,
      createdAt: 'por player456',
      plays: 25000
    },
    {
      id: 'market_3',
      name: 'Tower of Spam',
      template: 'tower_defense',
      published: true,
      createdAt: 'por dev789',
      plays: 15000
    }
  ]);

  const templates: GameTemplate[] = [
    {
      id: 'flappy_bird',
      name: 'Flappy Bird',
      description: 'Jogo de esquiva simples e viciante',
      icon: '🐦',
      mechanics: ['Jump', 'Obstacles', 'Scoring', 'Leaderboard']
    },
    {
      id: 'tinder',
      name: 'Tinder',
      description: 'Jogo de swipe com matches',
      icon: '💘',
      mechanics: ['Swipe', 'Matches', 'Leaderboard', 'Profiles']
    },
    {
      id: 'tower_defense',
      name: 'Tower Defense',
      description: 'Defenda contra waves de inimigos',
      icon: '🛡️',
      mechanics: ['Build', 'Waves', 'Upgrade', 'Strategy']
    }
  ];

  const handleCreateGame = async () => {
    if (!newGame.name.trim()) {
      alert('Digite um nome para o jogo');
      return;
    }

    // Simular criação
    const gameId = `proj_${Date.now()}`;
    router.push(`/studio/editor/${gameId}`);
  };

  const handleEditGame = (gameId: string) => {
    router.push(`/studio/editor/${gameId}`);
  };

  const handlePlayGame = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  const handlePublishGame = async (gameId: string) => {
    alert(`✅ Jogo ${gameId} publicado! Custa R$ 4,99 para publicar.`);
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
          <Link href="/studio">
            <div className="text-2xl font-bold text-white cursor-pointer">✨ Studio</div>
          </Link>

          <div className="hidden md:flex gap-8">
            <Link href="/dashboard" className="text-white hover:text-yellow-300 transition">Dashboard</Link>
            <Link href="/games" className="text-white hover:text-yellow-300 transition">Jogos</Link>
            <a href="#" className="text-white hover:text-yellow-300 transition">Help</a>
          </div>

          <Link href="/dashboard">
            <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:scale-105 transition">
              Voltar
            </button>
          </Link>
        </div>
      </nav>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-4 mb-12 border-b border-slate-700">
          <button
            onClick={() => setTab('create')}
            className={`pb-4 font-bold text-lg transition ${
              tab === 'create'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ➕ Criar Novo
          </button>
          <button
            onClick={() => setTab('my-games')}
            className={`pb-4 font-bold text-lg transition ${
              tab === 'my-games'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📁 Meus Jogos ({myGames.length})
          </button>
          <button
            onClick={() => setTab('marketplace')}
            className={`pb-4 font-bold text-lg transition ${
              tab === 'marketplace'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏪 Marketplace ({marketplaceGames.length})
          </button>
        </div>

        {/* CREATE TAB */}
        {tab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Novo Jogo</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Nome do Jogo
                    </label>
                    <input
                      type="text"
                      value={newGame.name}
                      onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                      placeholder="Meu Jogo Incrível"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Template
                    </label>
                    <select
                      value={newGame.template}
                      onChange={(e) => setNewGame({ ...newGame, template: e.target.value })}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleCreateGame}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition"
                  >
                    Criar & Editar
                  </button>

                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition">
                    ✨ Gerar com IA
                  </button>
                </div>
              </div>
            </div>

            {/* Templates Preview */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-6">Templates Disponíveis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(template => (
                  <div key={template.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition">
                    <div className="text-5xl mb-3">{template.icon}</div>
                    <h4 className="text-xl font-bold text-white mb-2">{template.name}</h4>
                    <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.mechanics.map(m => (
                        <span key={m} className="bg-purple-600/20 text-purple-300 text-xs px-3 py-1 rounded-full">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MY GAMES TAB */}
        {tab === 'my-games' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Meus Projetos</h2>

            {myGames.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-gray-400 text-lg mb-4">Nenhum jogo criado ainda</p>
                <button onClick={() => setTab('create')} className="text-purple-400 hover:text-purple-300">
                  Criar seu primeiro jogo →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGames.map(game => (
                  <div key={game.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-white">{game.name}</h4>
                      {game.published && <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Live</span>}
                    </div>

                    <p className="text-gray-400 text-sm mb-4">Criado {game.createdAt}</p>
                    <p className="text-purple-400 text-sm mb-4">👀 {game.plays} plays</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGame(game.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handlePlayGame(game.id)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition text-sm"
                      >
                        Jogar
                      </button>
                      {!game.published && (
                        <button
                          onClick={() => handlePublishGame(game.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition text-sm"
                        >
                          Publicar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MARKETPLACE TAB */}
        {tab === 'marketplace' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">🏪 Marketplace - Jogos da Comunidade</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceGames.map(game => (
                <div key={game.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 hover:border-yellow-500 transition">
                  <h4 className="text-lg font-bold text-white mb-2">{game.name}</h4>
                  <p className="text-gray-400 text-sm mb-4">Por {game.createdAt}</p>
                  <p className="text-yellow-400 text-sm mb-4">⭐ {game.plays.toLocaleString()} plays</p>

                  <button
                    onClick={() => handlePlayGame(game.id)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    ▶ Jogar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-8 px-6 border-t border-slate-700 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <p>© 2026 COON Studio. Crie, Publique, Ganhe!</p>
        </div>
      </footer>
    </div>
  );
}
