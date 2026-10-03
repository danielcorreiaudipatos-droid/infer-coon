import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';

interface GameStats {
  score: number;
  wave: number;
  gold: number;
  health: number;
  towers: number;
}

interface ONMAILGameProps {
  onStart: () => void;
  onEnd: (score: number, waves: number) => void;
  onStats: (stats: GameStats) => void;
}

const ONMAILGame = forwardRef<any, ONMAILGameProps>(
  ({ onStart, onEnd, onStats }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useImperativeHandle(ref, () => ({}));

    useEffect(() => {
      if (!containerRef.current || isInitialized) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

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

      const GRID_SIZE = 8;
      const CELL_SIZE = 50;
      const MAX_WAVES = 20;

      const gameState = {
        score: 0,
        wave: 1,
        gold: 500,
        health: 100,
        towers: 0,
        gameOver: false,
        grid: Array(GRID_SIZE * GRID_SIZE).fill(0),
        enemies: [] as any[],
        towerCosts: {
          firewall: 100,
          filter: 150,
          scanner: 200,
          trap: 75
        },
        towerDamage: {
          firewall: 2,
          filter: 4,
          scanner: 6,
          trap: 8
        },
        selectedTowerType: 'firewall',
        currentWaveEnemies: 5 + (5 * gameState.wave),
        onStart,
        onEnd,
        onStats,
      };

      function create(this: Phaser.Scene) {
        const scene = this as any;
        scene.gameState = gameState;

        // Draw grid
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x1f2937, 0.5);
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            graphics.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
        graphics.strokeStyle(0x374151, 1);
        for (let i = 0; i <= GRID_SIZE; i++) {
          graphics.beginPath();
          graphics.moveTo(i * CELL_SIZE, 0);
          graphics.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
          graphics.strokePath();
          graphics.beginPath();
          graphics.moveTo(0, i * CELL_SIZE);
          graphics.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
          graphics.strokePath();
        }

        // Tower selection (keyboard)
        scene.input.keyboard.on('keydown-1', () => { gameState.selectedTowerType = 'firewall'; });
        scene.input.keyboard.on('keydown-2', () => { gameState.selectedTowerType = 'filter'; });
        scene.input.keyboard.on('keydown-3', () => { gameState.selectedTowerType = 'scanner'; });
        scene.input.keyboard.on('keydown-4', () => { gameState.selectedTowerType = 'trap'; });

        // Grid click to place tower
        scene.input.on('pointerdown', (pointer: any) => {
          const gridX = Math.floor(pointer.x / CELL_SIZE);
          const gridY = Math.floor(pointer.y / CELL_SIZE);

          if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
            const index = gridY * GRID_SIZE + gridX;
            if (gameState.grid[index] === 0) {
              const cost = gameState.towerCosts[gameState.selectedTowerType];
              if (gameState.gold >= cost) {
                gameState.grid[index] = 1;
                gameState.gold -= cost;
                gameState.towers += 1;

                // Draw tower
                const tower = scene.add.circle(
                  gridX * CELL_SIZE + CELL_SIZE / 2,
                  gridY * CELL_SIZE + CELL_SIZE / 2,
                  CELL_SIZE / 3,
                  0x9333EA
                );
              }
            }
          }
        });

        // Start first wave
        setTimeout(() => spawnWave(scene, gameState), 1000);
        onStart();
      }

      function update(this: Phaser.Scene) {
        const scene = this as any;
        const state = scene.gameState;

        if (state.gameOver) return;

        // Spawn enemies during wave
        if (state.enemies.length === 0 && state.wave <= MAX_WAVES) {
          setTimeout(() => spawnWave(scene, state), 2000);
        }

        // Check win condition
        if (state.wave > MAX_WAVES && state.enemies.length === 0) {
          state.gameOver = true;
          onEnd(state.score, state.wave - 1);
        }

        // Check lose condition
        if (state.health <= 0) {
          state.gameOver = true;
          onEnd(state.score, state.wave - 1);
        }

        onStats({
          score: state.score,
          wave: state.wave,
          gold: state.gold,
          health: Math.max(0, state.health),
          towers: state.towers
        });
      }

      function spawnWave(scene: any, state: any) {
        const enemyCount = 5 + (3 * (state.wave - 1)); // Increases per wave
        for (let i = 0; i < enemyCount; i++) {
          const enemy = scene.add.circle(0, 100 + i * 20, 10, 0xEF4444);
          scene.physics.add.existing(enemy);
          enemy.body.setVelocityX(100 + state.wave * 20); // Faster each wave
          state.enemies.push(enemy);
        }
        state.wave += 1;
      }

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
        }
      };
    }, [isInitialized, onStart, onEnd, onStats]);

    return <div ref={containerRef} className="w-full h-full bg-gradient-to-b from-orange-300 to-amber-200" />;
  }
);

ONMAILGame.displayName = 'ONMAILGame';

export default ONMAILGame;
