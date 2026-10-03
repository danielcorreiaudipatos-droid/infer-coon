import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const PhaserGame = dynamic(() => import('@/components/games/ONLOVEGame'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white">Carregando ONLOVE...</div>
});

interface GameStats {
  score: number;
  matches: number;
  combo: number;
  profilesViewed: number;
}

export default function ONLOVEPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    matches: 0,
    combo: 0,
    profilesViewed: 0
  });
  const [gameActive, setGameActive] = useState(false);
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleGameStart = () => {
    setGameActive(true);
  };

  const handleGameEnd = async (finalScore: number, matches: number) => {
    setGameActive(false);
    try {
      const response = await fetch('/api/games/onlove/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScore,
          matches,
          profilesViewed: gameStats.profilesViewed,
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push({
          pathname: '/game/results',
          query: {
            game: 'onlove',
            score: finalScore,
            matches,
            reward: data.reward,
            points: data.points
          }
        });
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  const handleQuit = () => {
    if (confirm('Sair do jogo? Seu score será salvo.')) {
      handleGameEnd(gameStats.score, gameStats.matches);
    }
  };

  if (status === 'loading') {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-white">💘 ONLOVE</h1>
          <div className="flex gap-6">
            <div className="text-white">
              <p className="text-sm opacity-80">Matches</p>
              <p className="text-2xl font-bold">{gameStats.matches}</p>
            </div>
            <div className="text-white">
              <p className="text-sm opacity-80">Score</p>
              <p className="text-2xl font-bold">{gameStats.score}</p>
            </div>
            <div className="text-white">
              <p className="text-sm opacity-80">Combo</p>
              <p className="text-2xl font-bold">x{gameStats.combo}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleQuit}
          className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition"
        >
          ❌ Sair
        </button>
      </div>

      {/* Game Container */}
      <div className="flex-1 relative overflow-hidden">
        <PhaserGame
          ref={gameRef}
          onStart={handleGameStart}
          onEnd={handleGameEnd}
          onStats={setGameStats}
        />
      </div>

      {/* Tutorial */}
      {!gameActive && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md text-white text-center">
            <h2 className="text-3xl font-bold mb-4">💘 ONLOVE</h2>
            <p className="text-lg mb-6">Swipe para fazer matches!</p>
            <ul className="text-left space-y-3 mb-8">
              <li>👈 <strong>Swipe LEFT</strong> para não gostar</li>
              <li>👉 <strong>Swipe RIGHT</strong> para gostar</li>
              <li>💘 <strong>Match</strong> = ambos gostaram!</li>
              <li>🔥 <strong>Combo</strong> = múltiplos matches seguidos</li>
            </ul>
            <button
              onClick={handleGameStart}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-3 rounded-lg hover:scale-105 transition"
            >
              🚀 COMEÇAR JOGO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
