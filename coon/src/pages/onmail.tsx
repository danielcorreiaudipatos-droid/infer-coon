import React from 'react';
import Link from 'next/link';

export default function ONMAILLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900">
      <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">🎮 OnGame</div>
          <Link href="/game/onmail" className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700">
            Jogar Agora
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-4">🛡️ Defend Your Tower, Earn Rewards</h1>
        <p className="text-xl text-gray-400 mb-8">Tower Defense estratégico com recompensas reais</p>
        
        <div className="flex gap-4 justify-center mb-12">
          <Link href="/game/onmail" className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:scale-105 transition">
            ⚔️ Começar a Defender
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">⚔️</div>
            <div className="text-white font-semibold">Stratégico</div>
            <div className="text-sm text-gray-400">Pense antes de agir</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">💪</div>
            <div className="text-white font-semibold">Desafiador</div>
            <div className="text-sm text-gray-400">Skill matters</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-white font-semibold">Lucrativo</div>
            <div className="text-sm text-gray-400">R$ 20-100/game</div>
          </div>
        </div>
      </section>

      <section className="bg-black/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Dificuldades</h2>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🟢</div>
              <h3 className="text-xl font-bold text-white mb-2">Easy</h3>
              <p className="text-gray-400">Pra começar</p>
              <div className="text-lg font-bold text-green-400 mt-2">R$ 0.50/wave</div>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🟡</div>
              <h3 className="text-xl font-bold text-white mb-2">Normal</h3>
              <p className="text-gray-400">Balanced</p>
              <div className="text-lg font-bold text-green-400 mt-2">R$ 1.00/wave</div>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🔴</div>
              <h3 className="text-xl font-bold text-white mb-2">Hard</h3>
              <p className="text-gray-400">Pra experts</p>
              <div className="text-lg font-bold text-green-400 mt-2">R$ 2.00/wave</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">4 Tower Types</h2>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 border border-amber-500/30">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-white font-bold">Firewall</div>
            <div className="text-sm text-gray-400">100g, 5 dps</div>
            <div className="text-xs text-yellow-400 mt-2">Area damage</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 border border-amber-500/30">
            <div className="text-3xl mb-2">❄️</div>
            <div className="text-white font-bold">Filter</div>
            <div className="text-sm text-gray-400">150g, 8 dps</div>
            <div className="text-xs text-blue-400 mt-2">Slow enemies</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 border border-amber-500/30">
            <div className="text-3xl mb-2">🖥️</div>
            <div className="text-white font-bold">Scanner</div>
            <div className="text-sm text-gray-400">200g, 12 dps</div>
            <div className="text-xs text-purple-400 mt-2">See incoming</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 border border-amber-500/30">
            <div className="text-3xl mb-2">💣</div>
            <div className="text-white font-bold">Trap</div>
            <div className="text-sm text-gray-400">75g, special</div>
            <div className="text-xs text-red-400 mt-2">Stun enemies</div>
          </div>
        </div>
      </section>

      <section className="bg-black/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Tower Upgrades & Synergies</h2>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white/10 rounded-lg p-6 border border-amber-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">📈 Upgrades</h3>
              <p className="text-gray-400">Nível cada torre de 1-5, unlock abilities especiais</p>
              <div className="text-sm text-amber-400 mt-2">Level 5 = Super poder!</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6 border border-amber-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">🔗 Synergies</h3>
              <p className="text-gray-400">Coloque towers lado a lado pra bonuses</p>
              <div className="text-sm text-amber-400 mt-2">All 4 = +50% dps!</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Wave Themes</h2>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 border border-amber-500/30 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-white font-bold">Fire</div>
            <div className="text-sm text-gray-400">Waves 1-5</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-amber-500/30 text-center">
            <div className="text-3xl mb-2">❄️</div>
            <div className="text-white font-bold">Ice</div>
            <div className="text-sm text-gray-400">Waves 6-10</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-amber-500/30 text-center">
            <div className="text-3xl mb-2">🖥️</div>
            <div className="text-white font-bold">Cyber</div>
            <div className="text-sm text-gray-400">Waves 11-15</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-amber-500/30 text-center">
            <div className="text-3xl mb-2">🧬</div>
            <div className="text-white font-bold">Bio</div>
            <div className="text-sm text-gray-400">Waves 16-20</div>
          </div>
        </div>
      </section>

      <section className="bg-black/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Earnings</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center border border-amber-500/30">
              <div className="text-2xl font-bold text-white">Easy: 10 waves</div>
              <div className="text-sm text-gray-400">~5 minutos</div>
              <div className="text-lg font-bold text-green-400">R$ 5-10</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center border border-amber-500/30">
              <div className="text-2xl font-bold text-white">Normal: 20 waves</div>
              <div className="text-sm text-gray-400">~15 minutos</div>
              <div className="text-lg font-bold text-green-400">R$ 20-30</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center border border-amber-500/30">
              <div className="text-2xl font-bold text-white">Hard: 20+ waves</div>
              <div className="text-sm text-gray-400">~20 minutos</div>
              <div className="text-lg font-bold text-green-400">R$ 50-100</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-8">Pronto para Defender?</h2>
        <Link href="/game/onmail" className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:scale-105 transition">
          🛡️ Começar Agora
        </Link>
      </section>

      <footer className="bg-black py-8 text-center text-gray-400 border-t border-amber-500/30">
        <p>© 2026 OnGame. Defend, strategize, earn! | <a href="#" className="text-amber-400">Termos</a> | <a href="#" className="text-amber-400">Privacidade</a></p>
      </footer>
    </div>
  );
}
