import React from 'react';
import Link from 'next/link';

export default function ONLOVELanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900">
      <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">🎮 OnGame</div>
          <Link href="/game/onlove" className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700">
            Começar Agora
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-4">💘 Find Your Match, Win Real Money</h1>
        <p className="text-xl text-gray-400 mb-8">Swipe, match, ganhe. É isso mesmo!</p>
        
        <div className="flex gap-4 justify-center mb-12">
          <Link href="/game/onlove" className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:scale-105 transition">
            ❤️ Começar a Dar Match
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">❤️</div>
            <div className="text-white font-semibold">Love</div>
            <div className="text-sm text-green-400">2x Reward</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">👍</div>
            <div className="text-white font-semibold">Like</div>
            <div className="text-sm text-gray-400">1x Reward</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">🤷</div>
            <div className="text-white font-semibold">Maybe</div>
            <div className="text-sm text-yellow-400">0.5x Reward</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">👎</div>
            <div className="text-white font-semibold">Pass</div>
            <div className="text-sm text-gray-400">0x Reward</div>
          </div>
        </div>
      </section>

      <section className="bg-black/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Como Funciona</h2>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Swipe</h3>
              <p className="text-gray-400">Love, Like, Maybe, Pass ou Block profiles</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Match</h3>
              <p className="text-gray-400">Se ambos se amarem = Mutual Match! 💕</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Ganhe</h3>
              <p className="text-gray-400">R$ 0.50 por match + R$ 0.01 por ponto</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Features Incríveis</h2>
        
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white/10 rounded-lg p-6 border border-pink-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">❤️ Reaction Types</h3>
            <p className="text-gray-400">5 tipos de reação com rewards diferentes</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 border border-pink-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">👥 Mutual Matches</h3>
            <p className="text-gray-400">Ver seu matches collection e quem te amou</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 border border-pink-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">📱 Rich Profiles</h3>
            <p className="text-gray-400">Bios, interests, age, location real</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 border border-pink-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">🌟 Themed Profiles</h3>
            <p className="text-gray-400">5% celebridades + limited edition perfis</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 border border-pink-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">📊 Leaderboard</h3>
            <p className="text-gray-400">Most matches, longest streak, popular profiles</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 border border-pink-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">🎁 Daily Challenges</h3>
            <p className="text-gray-400">Ganhe bônus completando desafios diários</p>
          </div>
        </div>
      </section>

      <section className="bg-black/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Quanto Você Ganha?</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center border border-pink-500/30">
              <div className="text-2xl font-bold text-white">10 matches</div>
              <div className="text-sm text-gray-400">Game médio</div>
              <div className="text-lg font-bold text-green-400">R$ 5-10</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center border border-pink-500/30">
              <div className="text-2xl font-bold text-white">3 games/dia</div>
              <div className="text-sm text-gray-400">Casual</div>
              <div className="text-lg font-bold text-green-400">R$ 45-90/dia</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center border border-pink-500/30">
              <div className="text-2xl font-bold text-white">30 dias</div>
              <div className="text-sm text-gray-400">Por mês</div>
              <div className="text-lg font-bold text-green-400">R$ 1.3K-2.7K</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Top Matchers de Hoje</h2>
        
        <div className="space-y-4">
          {[
            { pos: 1, name: 'Ana Silva', matches: 45, reward: 'R$ 325' },
            { pos: 2, name: 'Carlos Lima', matches: 38, reward: 'R$ 268' },
            { pos: 3, name: 'Beatriz Santos', matches: 32, reward: 'R$ 225' },
          ].map((player) => (
            <div key={player.pos} className="bg-white/10 rounded-lg p-4 flex justify-between items-center border border-pink-500/30">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-pink-400">#{player.pos}</div>
                <div>
                  <div className="text-white font-semibold">{player.name}</div>
                  <div className="text-gray-400 text-sm">{player.matches} matches</div>
                </div>
              </div>
              <div className="text-xl font-bold text-green-400">{player.reward}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-8">Pronto para Matches?</h2>
        <Link href="/game/onlove" className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:scale-105 transition">
          💘 Começar Agora
        </Link>
      </section>

      <footer className="bg-black py-8 text-center text-gray-400 border-t border-pink-500/30">
        <p>© 2026 OnGame. Find matches, win money! | <a href="#" className="text-pink-400">Termos</a> | <a href="#" className="text-pink-400">Privacidade</a></p>
      </footer>
    </div>
  );
}
