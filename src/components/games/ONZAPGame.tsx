import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';

interface GameStats {
  score: number;
  time: number;
  obstacles: number;
  combo: number;
}

interface ONZAPGameProps {
  onStart: () => void;
  onEnd: (score: number) => void;
  onStats: (stats: GameStats) => void;
  isPaused: boolean;
}

const ONZAPGame = forwardRef<any, ONZAPGameProps>(
  ({ onStart, onEnd, onStats, isPaused }, ref) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<Phaser.Scene | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useImperativeHandle(ref, () => ({
      togglePause: () => {
        if (sceneRef.current) {
          sceneRef.current.physics.world.isPaused = !sceneRef.current.physics.world.isPaused;
        }
      }
    }));

    useEffect(() => {
      if (!gameContainerRef.current || isInitialized) return;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameContainerRef.current,
        width: gameContainerRef.current.clientWidth,
        height: gameContainerRef.current.clientHeight,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 300 },
            debug: false,
          },
        },
        scene: {
          preload: preload,
          create: create,
          update: update,
        },
      };

      gameRef.current = new Phaser.Game(config);
      setIsInitialized(true);

      // Game state
      const gameState = {
        score: 0,
        time: 0,
        obstacles: 0,
        combo: 0,
        gameOver: false,
        speed: 100,
        lastObstacleTime: 0,
        player: null as any,
        obstacles: [] as any[],
        velocityX: 0,
        maxVelocity: 400,
        onStart,
        onEnd,
        onStats,
      };

      function preload(this: Phaser.Scene) {
        // Preload assets if needed
        sceneRef.current = this;
      }

      function create(this: Phaser.Scene) {
        const scene = this as any;
        scene.gameState = gameState;

        // Create player (bird-like character)
        const player = scene.add.rectangle(100, scene.sys.game.canvas.height / 2, 40, 40, 0x9333EA);
        scene.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);
        player.body.setBounce(0.2);
        player.body.setGravityY(1);
        gameState.player = player;

        // Input handling
        scene.input.on('pointerdown', () => {
          player.body.setVelocityY(-300);
        });

        scene.input.keyboard.on('keydown-SPACE', () => {
          player.body.setVelocityY(-300);
        });

        // Start game
        gameState.score = 0;
        gameState.time = 0;
        gameState.obstacles = 0;
        gameState.combo = 0;
        gameState.lastObstacleTime = scene.time.now;
        onStart();
      }

      function update(this: Phaser.Scene) {
        const scene = this as any;
        const state = scene.gameState;

        if (state.gameOver) return;

        // Update time
        state.time = scene.time.now;

        // Increase score over time
        if (state.time % 100 === 0) {
          state.score += 1;
          state.combo += 1;
        }

        // Increase difficulty (speed)
        state.speed = 100 + (state.time * 0.02);

        // Generate obstacles
        if (scene.time.now - state.lastObstacleTime > Math.max(500, 2000 - state.time * 0.5)) {
          createObstacle(scene, state);
          state.lastObstacleTime = scene.time.now;
          state.obstacles += 1;
        }

        // Remove off-screen obstacles
        state.obstacles = state.obstacles.filter((obstacle: any) => {
          if (obstacle.x < -100) {
            obstacle.destroy();
            return false;
          }
          return true;
        });

        // Check collision with obstacles
        state.obstacles.forEach((obstacle: any) => {
          if (
            Phaser.Geom.Intersects.RectangleToRectangle(
              state.player.getBounds(),
              obstacle.getBounds()
            )
          ) {
            endGame(scene, state);
          }
        });

        // Check if player fell
        if (state.player.y > scene.sys.game.canvas.height + 100) {
          endGame(scene, state);
        }

        // Update stats callback
        onStats({
          score: state.score,
          time: state.time,
          obstacles: state.obstacles,
          combo: state.combo,
        });
      }

      function createObstacle(scene: any, state: any) {
        const y = Phaser.Math.Between(50, scene.sys.game.canvas.height - 50);
        const obstacle = scene.add.rectangle(scene.sys.game.canvas.width, y, 30, 60, 0xEF4444);
        scene.physics.add.existing(obstacle);
        obstacle.body.setVelocityX(-state.speed);
        obstacle.body.setImmovable(true);
        state.obstacles.push(obstacle);
      }

      function endGame(scene: any, state: any) {
        state.gameOver = true;
        state.player.body.setVelocity(0);
        state.obstacles.forEach((obstacle: any) => obstacle.destroy());
        onEnd(state.score);
      }

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
        }
      };
    }, [isInitialized, onStart, onEnd, onStats]);

    return <div ref={gameContainerRef} className="w-full h-full bg-gradient-to-b from-blue-300 to-blue-100" />;
  }
);

ONZAPGame.displayName = 'ONZAPGame';

export default ONZAPGame;
