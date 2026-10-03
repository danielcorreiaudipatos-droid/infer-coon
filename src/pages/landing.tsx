import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="text-2xl font-bold text-white">🎮 COON Games</div>

          <div className="hidden md:flex gap-8">
            <a href="#" className="text-white hover:text-yellow-300 transition">Home</a>
            <a href="#games" className="text-white hover:text-yellow-300 transition">Games</a>
            <a href="/studio" className="text-white hover:text-yellow-300 transition">Studio</a>
          </div>

          <div className="flex gap-4">
            <Link href="/login">
              <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-bold hover:scale-105 transition">
                Entrar
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20 pb-20">
        <div className="max-w-4xl text-center">
          <div className="animate-float mb-8">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6">
              Games Platform
            </h1>
            <p className="text-2xl md:text-3xl text-purple-200 mb-8">
              Crie, Jogue, Ganhe Dinheiro
            </p>
          </div>

          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
            Plataforma completa de jogos casuais com integração de wallet,
            estúdio de criação e marketplace. Comece agora!
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center mb-20">
            <Link href="/signup">
              <button className="group relative overflow-hidden px-8 py-4 rounded-lg font-bold text-white text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:scale-105 transition-transform">
                🚀 Começar Agora
              </button>
            </Link>
            <button className="px-8 py-4 rounded-lg font-bold text-white text-lg border-2 border-purple-400 hover:bg-purple-600 transition">
              📚 Saber Mais
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-20">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">100k+</div>
              <div className="text-sm font-semibold">Usuários</div>
            </div>
            <div className="bg-gradient-to-br from-pink-600 to-orange-600 rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">R$10M</div>
              <div className="text-sm font-semibold">Potencial Ano 1</div>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-yellow-600 rounded-2xl p-6 text-white text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-2">500k+</div>
              <div className="text-sm font-semibold">Jogos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Shortcuts */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">⚡ Acesso Rápido</h2>
          <p className="text-gray-400 text-center mb-12">Comece a jogar ou criar agora mesmo</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* ONZAP Shortcut */}
            <Link href="/game/onzap">
              <div className="group relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="text-5xl mb-3">💬</div>
                  <h3 className="text-2xl font-bold mb-2">ONZAP</h3>
                  <p className="text-sm opacity-90 mb-4">WhatsApp Battle</p>
                  <div className="text-xs font-semibold opacity-75">▶ JOGAR</div>
                </div>
              </div>
            </Link>

            {/* ONLOVE Shortcut */}
            <Link href="/game/onlove">
              <div className="group relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl p-8 text-white text-center hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="text-5xl mb-3">💘</div>
                  <h3 className="text-2xl font-bold mb-2">ONLOVE</h3>
                  <p className="text-sm opacity-90 mb-4">Tinder Simulator</p>
                  <div className="text-xs font-semibold opacity-75">▶ JOGAR</div>
                </div>
              </div>
            </Link>

            {/* ONMAIL Shortcut */}
            <Link href="/game/onmail">
              <div className="group relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl p-8 text-white text-center hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="text-5xl mb-3">🛡️</div>
                  <h3 className="text-2xl font-bold mb-2">ONMAIL</h3>
                  <p className="text-sm opacity-90 mb-4">Tower Defense</p>
                  <div className="text-xs font-semibold opacity-75">▶ JOGAR</div>
                </div>
              </div>
            </Link>

            {/* Studio Shortcut */}
            <Link href="/studio">
              <div className="group relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="text-5xl mb-3">✨</div>
                  <h3 className="text-2xl font-bold mb-2">STUDIO</h3>
                  <p className="text-sm opacity-90 mb-4">Crie Jogos</p>
                  <div className="text-xs font-semibold opacity-75">→ CRIAR</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section id="games" className="py-20 px-6 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            🎮 Featured Games
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ONZAP */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-white hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">💬 ONZAP</h3>
                <p className="text-sm opacity-90 mb-6">WhatsApp Battle Royale. Esquive mensagens ruins, responda rápido!</p>
                <div className="flex gap-4">
                  <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition">
                    ▶ Play Free
                  </button>
                  <button className="border border-purple-400 hover:bg-purple-600/20 px-4 py-2 rounded-lg transition">
                    Pro R$ 9,99
                  </button>
                </div>
              </div>
            </div>

            {/* ONLOVE */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-white hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-600 opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">💘 ONLOVE</h3>
                <p className="text-sm opacity-90 mb-6">Tinder Simulator. Swipe left/right, faça matches, compete!</p>
                <div className="flex gap-4">
                  <button className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-lg transition">
                    ▶ Play Free
                  </button>
                  <button className="border border-pink-400 hover:bg-pink-600/20 px-4 py-2 rounded-lg transition">
                    Pro R$ 9,99
                  </button>
                </div>
              </div>
            </div>

            {/* ONMAIL */}
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-white hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-600 opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">🛡️ ONMAIL</h3>
                <p className="text-sm opacity-90 mb-6">Tower Defense. Defenda inbox de spam, ganhe ouro!</p>
                <div className="flex gap-4">
                  <button className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition">
                    ▶ Play Free
                  </button>
                  <button className="border border-orange-400 hover:bg-orange-600/20 px-4 py-2 rounded-lg transition">
                    Pro R$ 9,99
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ✨ Game Builder Studio
          </h2>
          <p className="text-lg text-gray-300 mb-12">
            Crie seus próprios jogos com nossa ferramenta intuitiva e IA integrada
          </p>

          <Link href="/studio">
            <button className="group relative overflow-hidden px-8 py-4 rounded-lg font-bold text-white text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-105 transition-transform">
              Ir para Studio
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-8 px-6 border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center">
          <p>© 2026 COON Games. Todos os direitos reservados.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
