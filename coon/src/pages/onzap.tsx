import React from 'react';
import Link from 'next/link';

export default function ONZAPLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">🎮 OnGame</div>
          <Link href="/game/onzap" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
            Jogar Agora
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-4">💬 Jump to Riches!</h1>
        <p className="text-xl text-gray-400 mb-8">Pula, ganha pontos, saca real. Tão simples quanto parece.</p>

        <div className="flex gap-4 justify-center mb-12">
          <Link href="/game/onzap" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:scale-105 transition">
            ▶ Jogar Agora
          </Link>
          <button className="border-2 border-purple-400 text-white px-8 py-4 rounded-lg hover:bg-purple-400/10 transition">
            📖 Ver Tutorial
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-white font-semibold">Instantâneo</div>
            <div className="text-sm text-gray-400">Jogue em segundos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-white font-semibold">Real Money</div>
            <div className="text-sm text-gray-400">Ganhe de verdade</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-white font-semibold">Ranking</div>
            <div className="text-sm text-gray-400">Compete globalmente</div>
          </div>
        </div>

        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%237c3aed' width='400' height='300'/%3E%3Ccircle cx='200' cy='150' r='50' fill='%23ec4899'/%3E%3C/svg%3E"
          alt="Game Screenshot"
          className="max-w-md mx-auto rounded-lg shadow-2xl mb-12"
        />
      </section>

      {/* How It Works */}
      <section className="bg-black/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Como Funciona</h2>

          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Pule!</h3>
              <p className="text-gray-400">Toque ou pressione spacebar para pular obstáculos</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Acumule Pontos</h3>
              <p className="text-gray-400">Quanto mais pula, mais pontos ganha</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold text-white mb-2">Saque Real</h3>
              <p className="text-gray-400">Converta pontos em dinheiro na hora</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Features</h2>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white/10 rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">⏱️ Multiplicadores até 10x</h3>
            <p className="text-gray-400">Quanto mais tempo sobreviver, maior seu multiplicador. Combos = mais R$</p>
          </div>

          <div className="bg-white/10 rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">👤 Personalização</h3>
            <p className="text-gray-400">Desbloqueie skins e efeitos especiais</p>
          </div>

          <div className="bg-white/10 rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">🎯 100 Níveis</h3>
            <p className="text-gray-400">Progressão contínua com recompensas a cada nível</p>
          </div>

          <div className="bg-white/10 rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">🏅 Leaderboard Real-time</h3>
            <p className="text-gray-400">Compete contra jogadores de todo o mundo</p>
          </div>

          <div className="bg-white/10 rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">💎 Cosmetics Shop</h3>
            <p className="text-gray-400">Compre skins, efeitos e muito mais</p>
          </div>

          <div className="bg-white/10 rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-4">⚡ Desafios Diários</h3>
            <p className="text-gray-400">Ganhe bônus completando desafios exclusivos</p>
          </div>
        </div>
      </section>

      {/* Monetization */}
      <section className="bg-black/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Quanto Você Ganha?</h2>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white mb-8">
            <h3 className="text-2xl font-bold mb-4">Reward Model</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-200">Base: R$ 0.001 por ponto</p>
                <p className="text-3xl font-bold">2500 pontos = R$ 2.50</p>
              </div>
              <div>
                <p className="text-gray-200">Com multiplicador 3x</p>
                <p className="text-3xl font-bold">2500 × 3 = R$ 7.50</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">3 min</div>
              <div className="text-sm text-gray-400">Game médio</div>
              <div className="text-lg font-bold text-green-400">R$ 2-5</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">5 games</div>
              <div className="text-sm text-gray-400">Por dia</div>
              <div className="text-lg font-bold text-green-400">R$ 50-75</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">30 dias</div>
              <div className="text-sm text-gray-400">Por mês</div>
              <div className="text-lg font-bold text-green-400">R$ 1.5K-2.2K</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">🎁</div>
              <div className="text-sm text-gray-400">Bônus Diários</div>
              <div className="text-lg font-bold text-green-400">+R$ 500/mês</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">O Que Nossos Jogadores Dizem</h2>

        <div className="grid grid-cols-3 gap-8">
          <div className="bg-white/10 rounded-lg p-6 border border-purple-500/30">
            <div className="flex gap-1 mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-white mb-4">"Paguei minhas contas com ONZAP em um mês!"</p>
            <div className="text-gray-400 font-semibold">João Silva</div>
          </div>

          <div className="bg-white/10 rounded-lg p-6 border border-purple-500/30">
            <div className="flex gap-1 mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-white mb-4">"Tô viciado, tá puxando meu dinheiro direto!"</p>
            <div className="text-gray-400 font-semibold">Maria Santos</div>
          </div>

          <div className="bg-white/10 rounded-lg p-6 border border-purple-500/30">
            <div className="flex gap-1 mb-4">⭐⭐⭐⭐⭐</div>
            <p className="text-white mb-4">"Já saquei R$ 500 e tô aqui ainda!"</p>
            <div className="text-gray-400 font-semibold">Pedro Costa</div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-400">
          <p>Rating: 4.8⭐ (1000+ reviews)</p>
        </div>
      </section>

      {/* Rankings */}
      <section className="bg-black/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Top Players de Hoje</h2>

          <div className="space-y-4">
            {[
              { pos: 1, name: 'João Silva', score: 8500, reward: 'R$ 245' },
              { pos: 2, name: 'Maria Santos', score: 7200, reward: 'R$ 198' },
              { pos: 3, name: 'Pedro Costa', score: 6800, reward: 'R$ 185' },
              { pos: 4, name: 'Ana Oliveira', score: 5900, reward: 'R$ 162' },
              { pos: 5, name: 'Lucas Ferreira', score: 5200, reward: 'R$ 142' },
            ].map((player) => (
              <div key={player.pos} className="bg-white/10 rounded-lg p-4 flex justify-between items-center border border-purple-500/30">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-purple-400">#{player.pos}</div>
                  <div>
                    <div className="text-white font-semibold">{player.name}</div>
                    <div className="text-gray-400 text-sm">{player.score} pontos</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-green-400">{player.reward}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 text-gray-400">
            <p>👆 Próximo poderia ser você! 👆</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-8">Pronto para Ganhar?</h2>
        <div className="flex gap-4 justify-center">
          <Link href="/game/onzap" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:scale-105 transition">
            🎮 Jogar Agora (Browser)
          </Link>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition">
            📱 Baixar App (iOS/Android)
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-black/50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Perguntas Frequentes</h2>

          <div className="space-y-6">
            <details className="bg-white/10 rounded-lg p-6 border border-purple-500/30 group">
              <summary className="cursor-pointer text-white font-semibold flex justify-between">
                Como faço para sacar o dinheiro?
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">Clique em "Sacar" no seu wallet, escolha banco/Pix, e receba em 1-24 horas. Sem taxas!</p>
            </details>

            <details className="bg-white/10 rounded-lg p-6 border border-purple-500/30 group">
              <summary className="cursor-pointer text-white font-semibold flex justify-between">
                É seguro? Preciso pagar para jogar?
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">100% seguro e GRÁTIS para jogar. Você ganha dinheiro, não perde. Que tal?</p>
            </details>

            <details className="bg-white/10 rounded-lg p-6 border border-purple-500/30 group">
              <summary className="cursor-pointer text-white font-semibold flex justify-between">
                Quanto posso ganhar por mês?
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-gray-400 mt-4">Depende de você! Média: R$ 1.5K-2.2K/mês com 5 games/dia. Top players ganham R$ 5K+</p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 text-center text-gray-400 border-t border-purple-500/30">
        <p>© 2026 OnGame. Divirta-se, jogue, ganhe! | <a href="#" className="text-purple-400 hover:text-purple-300">Termos</a> | <a href="#" className="text-purple-400 hover:text-purple-300">Privacidade</a></p>
      </footer>
    </div>
  );
}
