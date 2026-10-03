// ONMAIL Game Engine - Tower Defense

export interface Tower {
  id: string;
  type: 'firewall' | 'filter' | 'scanner' | 'trap';
  x: number;
  y: number;
  level: number;
  health: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  speed: number;
}

export interface ONMAILGameState {
  wave: number;
  gold: number;
  towers: Tower[];
  enemies: Enemy[];
  lives: number;
  score: number;
  gameOver: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  reward: number;
}

export class ONMAILEngine {
  private state: ONMAILGameState;
  private towerCosts = {
    firewall: 150,
    filter: 200,
    scanner: 250,
    trap: 300,
  };
  private rewardPerWave = {
    easy: 0.5,
    normal: 1.0,
    hard: 2.0,
  };

  constructor(difficulty: 'easy' | 'normal' | 'hard' = 'normal') {
    this.state = {
      wave: 1,
      gold: 600,
      towers: [],
      enemies: [],
      lives: 20,
      score: 0,
      gameOver: false,
      difficulty,
      reward: 0,
    };
  }

  public buildTower(type: keyof typeof this.towerCosts, x: number, y: number): boolean {
    const cost = this.towerCosts[type];
    if (this.state.gold < cost) return false;

    this.state.towers.push({
      id: `tower-${Date.now()}`,
      type: type as any,
      x,
      y,
      level: 1,
      health: 100,
    });
    this.state.gold -= cost;
    return true;
  }

  public upgradeTower(towerId: string): boolean {
    const tower = this.state.towers.find((t) => t.id === towerId);
    if (!tower || tower.level >= 5) return false;

    const upgradeCost = tower.level * 100;
    if (this.state.gold < upgradeCost) return false;

    tower.level++;
    tower.health = 100;
    this.state.gold -= upgradeCost;
    return true;
  }

  public startWave() {
    const enemyCount = 5 + this.state.wave * 2;
    for (let i = 0; i < enemyCount; i++) {
      this.state.enemies.push({
        id: `enemy-${Date.now()}-${i}`,
        x: Math.random() * 400,
        y: -50,
        health: 100,
        speed: 2 + this.state.wave * 0.5,
      });
    }
  }

  public update() {
    // Move enemies
    this.state.enemies.forEach((enemy) => {
      enemy.y += enemy.speed;
      if (enemy.y > 800) {
        this.state.lives--;
        if (this.state.lives <= 0) {
          this.state.gameOver = true;
          this.calculateReward();
        }
      }
    });

    // Check if wave complete
    if (this.state.enemies.length === 0 && this.state.wave < 20) {
      this.state.wave++;
      this.state.gold += this.rewardPerWave[this.state.difficulty] * 100;
      this.startWave();
      this.state.score += 1000;
    }

    if (this.state.wave === 20 && this.state.enemies.length === 0) {
      this.state.gameOver = true;
      this.calculateReward();
    }
  }

  private calculateReward() {
    const baseReward = this.state.wave * this.rewardPerWave[this.state.difficulty];
    const bonusReward = this.state.score * 0.01;
    const totalReward = baseReward + bonusReward;
    this.state.reward = Math.min(Math.max(totalReward, 0.5), 200.0);
  }

  public getState(): ONMAILGameState {
    return { ...this.state };
  }

  public getReward(): number {
    return parseFloat(this.state.reward.toFixed(2));
  }
}
