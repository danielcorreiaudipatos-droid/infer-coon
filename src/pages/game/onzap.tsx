import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const PhaserGame = dynamic(() => import('@/components/games/ONZAPGame'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-slate-900 flex items-center justify-center text-white">Carregando ONZAP...</div>
});

interface GameStats {
  score: number;
  time: number;
  obstacles: number;
  combo: number;
}

export default function ONZAPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    time: 0,
    obstacles: 0,
    combo: 0
  });
  const [isPaused, setIsPaused] = useState(false);
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

  const handleGameEnd = async (finalScore: number) => {
    setGameActive(false);
    // Submit score to backend
    try {
      const response = await fetch('/api/games/onzap/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScore,
          time: gameStats.time,
          obstacles: gameStats.obstacles,
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to results page with reward info
        router.push({
          pathname: '/game/results',
          query: {
            game: 'onzap',
            score: finalScore,
            reward: data.reward,
            points: data.points
          }
        });
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (gameRef.current) {
      gameRef.current.togglePause();
    }
  };

  const handleQuit = () => {
    if (confirm('Sair do jogo? Seu score será salvo.')) {
      handleGameEnd(gameStats.score);
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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">💬 ONZAP</h1>
          <div className="text-white">
            <p className="text-sm opacity-80">Score</p>
            <p className="text-2xl font-bold">{gameStats.score}</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="text-white text-center">
            <p className="text-sm opacity-80">Tempo</p>
            <p className="text-xl font-bold">{Math.floor(gameStats.time / 1000)}s</p>
          </div>
          <button
            onClick={handlePause}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
          >
            {isPaused ? '▶ Continuar' : '⏸ Pausar'}
          </button>
          <button
            onClick={handleQuit}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            ❌ Sair
          </button>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <PhaserGame
          ref={gameRef}
          onStart={handleGameStart}
          onEnd={handleGameEnd}
          onStats={setGameStats}
          isPaused={isPaused}
        />
      </div>

      {/* Tutorial Overlay (first time) */}
      {!gameActive && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md text-white text-center">
            <h2 className="text-3xl font-bold mb-4">💬 ONZAP</h2>
            <p className="text-lg mb-6">Desvie das mensagens ruins!</p>
            <ul className="text-left space-y-3 mb-8">
              <li>🎮 <strong>Toque/Clique</strong> para pular</li>
              <li>⚡ Evite as mensagens vermelhas</li>
              <li>📈 Ganhe pontos a cada segundo</li>
              <li>🎯 Quanto mais tempo, mais rápido!</li>
            </ul>
            <button
              onClick={handleGameStart}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:scale-105 transition"
            >
              🚀 COMEÇAR JOGO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
