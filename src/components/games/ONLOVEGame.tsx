import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';

interface Profile {
  id: number;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  liked: boolean;
}

interface GameStats {
  score: number;
  matches: number;
  combo: number;
  profilesViewed: number;
}

interface ONLOVEGameProps {
  onStart: () => void;
  onEnd: (score: number, matches: number) => void;
  onStats: (stats: GameStats) => void;
}

const ONLOVEGame = forwardRef<any, ONLOVEGameProps>(
  ({ onStart, onEnd, onStats }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Mock profiles (in production, these would come from backend)
    const generateProfiles = (): Profile[] => {
      const names = ['Anna', 'Julia', 'Marina', 'Sofia', 'Laura', 'Carla', 'Diego', 'Lucas', 'Rafael', 'Pedro'];
      const ages = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
      const bios = ['Love to travel ✈️', 'Fitness enthusiast 💪', 'Music lover 🎵', 'Coffee addict ☕', 'Dog mom 🐕', 'Photographer 📸', 'Foodie 🍕', 'Gamer 🎮', 'Yoga 🧘', 'Adventure seeker 🏔️'];

      return Array.from({ length: 50 }, (_, i) => ({
        id: i,
        name: names[i % names.length],
        age: ages[i % ages.length],
        bio: bios[i % bios.length],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        liked: false
      }));
    };

    useImperativeHandle(ref, () => ({}));

    useEffect(() => {
      if (!containerRef.current || isInitialized) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const profiles = generateProfiles();

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width,
        height,
        physics: {
          default: 'arcade',
          arcade: { debug: false }
        },
        scene: {
          create: create,
          update: update,
        }
      };

      gameRef.current = new Phaser.Game(config);
      setIsInitialized(true);

      const gameState = {
        score: 0,
        matches: 0,
        combo: 0,
        profilesViewed: 0,
        currentProfileIndex: 0,
        gameOver: false,
        profiles,
        cards: [] as any[],
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        swipeThreshold: 100,
        onStart,
        onEnd,
        onStats,
      };

      function create(this: Phaser.Scene) {
        const scene = this as any;
        scene.gameState = gameState;

        // Create initial card
        if (gameState.profiles.length > 0) {
          createCard(scene, gameState, 0);
        }

        // Input handling
        scene.input.on('pointerdown', (pointer: any) => {
          gameState.isDragging = true;
          gameState.dragStartX = pointer.x;
          gameState.dragStartY = pointer.y;
        });

        scene.input.on('pointerup', (pointer: any) => {
          if (gameState.isDragging) {
            const deltaX = pointer.x - gameState.dragStartX;
            const deltaY = pointer.y - gameState.dragStartY;

            if (Math.abs(deltaX) > gameState.swipeThreshold) {
              const isMatch = deltaX > 0; // Right = like
              handleSwipe(scene, gameState, isMatch);
            }
          }
          gameState.isDragging = false;
        });

        onStart();
      }

      function update(this: Phaser.Scene) {
        const scene = this as any;
        const state = scene.gameState;

        if (state.gameOver || state.cards.length === 0) return;

        // Update card position if dragging
        if (state.isDragging && state.cards.length > 0) {
          const card = state.cards[0];
          const currentPointer = scene.input.activePointer;
          card.x = currentPointer.x;
          card.y = currentPointer.y;
        }

        onStats({
          score: state.score,
          matches: state.matches,
          combo: state.combo,
          profilesViewed: state.profilesViewed
        });
      }

      function createCard(scene: any, state: any, index: number) {
        if (index >= state.profiles.length) {
          state.gameOver = true;
          onEnd(state.score, state.matches);
          return;
        }

        const profile = state.profiles[index];
        const width = scene.sys.game.canvas.width;
        const height = scene.sys.game.canvas.height;

        // Card background
        const card = scene.add.rectangle(
          width / 2,
          height / 2,
          width - 40,
          height - 120,
          0x374151
        );
        card.setStrokeStyle(2, 0x9333EA);
        card.setInteractive();

        // Profile text
        const text = scene.add.text(width / 2, height / 2 + 80, `${profile.name}, ${profile.age}\n${profile.bio}`, {
          fontSize: '24px',
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: width - 80 }
        });
        text.setOrigin(0.5);

        state.cards.push(card);
        state.profilesViewed += 1;
      }

      function handleSwipe(scene: any, state: any, isMatch: boolean) {
        const card = state.cards[0];
        if (card) {
          card.destroy();
          state.cards.shift();

          state.score += isMatch ? 10 : 1;

          // Check for matching (simplified - in production would call backend)
          const isActualMatch = Math.random() < 0.3; // 30% match rate
          if (isMatch && isActualMatch) {
            state.matches += 1;
            state.combo += 1;
            state.score += 50 * state.combo; // Combo bonus
          } else {
            state.combo = 0;
          }

          // Create next card
          createCard(scene, state, state.currentProfileIndex + 1);
          state.currentProfileIndex += 1;
        }
      }

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
        }
      };
    }, [isInitialized, onStart, onEnd, onStats]);

    return <div ref={containerRef} className="w-full h-full bg-gradient-to-b from-pink-300 to-rose-200" />;
  }
);

ONLOVEGame.displayName = 'ONLOVEGame';

export default ONLOVEGame;
