// ONZAP Game Engine - Jumping Game

export interface ONZAPGameState {
  playerY: number;
  playerX: number;
  velocity: number;
  score: number;
  obstacles: Obstacle[];
  gameOver: boolean;
  multiplier: number;
  reward: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ONZAPEngine {
  private state: ONZAPGameState;
  private gameWidth = 400;
  private gameHeight = 800;
  private playerSize = 30;
  private gravity = 0.6;
  private jumpForce = -15;

  constructor() {
    this.state = {
      playerY: this.gameHeight - 100,
      playerX: this.gameWidth / 2 - this.playerSize / 2,
      velocity: 0,
      score: 0,
      obstacles: [],
      gameOver: false,
      multiplier: 1,
      reward: 0,
    };
    this.generateObstacles();
  }

  private generateObstacles() {
    for (let i = 0; i < 5; i++) {
      this.state.obstacles.push({
        id: `obstacle-${i}`,
        x: Math.random() * (this.gameWidth - 80),
        y: this.gameHeight - (i * 200) - 100,
        width: 80,
        height: 20,
      });
    }
  }

  public jump() {
    if (this.state.playerY >= this.gameHeight - this.playerSize - 10) {
      this.state.velocity = this.jumpForce;
    }
  }

  public moveLeft() {
    this.state.playerX = Math.max(0, this.state.playerX - 30);
  }

  public moveRight() {
    this.state.playerX = Math.min(
      this.gameWidth - this.playerSize,
      this.state.playerX + 30
    );
  }

  public update() {
    if (this.state.gameOver) return;

    // Apply gravity
    this.state.velocity += this.gravity;
    this.state.playerY += this.state.velocity;

    // Check collision with obstacles
    for (const obstacle of this.state.obstacles) {
      if (this.checkCollision(obstacle)) {
        this.state.score += 100;
        this.state.multiplier = Math.min(10, this.state.multiplier + 0.5);
        obstacle.y = this.gameHeight + 100;
        this.generateNewObstacle();
      }
    }

    // Check game over
    if (this.state.playerY > this.gameHeight) {
      this.state.gameOver = true;
      this.calculateReward();
    }

    // Move obstacles up
    this.state.obstacles.forEach((obs) => {
      obs.y += 2;
    });
  }

  private checkCollision(obstacle: Obstacle): boolean {
    return (
      this.state.playerX < obstacle.x + obstacle.width &&
      this.state.playerX + this.playerSize > obstacle.x &&
      this.state.playerY + this.playerSize >= obstacle.y &&
      this.state.playerY <= obstacle.y + obstacle.height &&
      this.state.velocity > 0
    );
  }

  private generateNewObstacle() {
    const lastObstacle = this.state.obstacles[this.state.obstacles.length - 1];
    this.state.obstacles.push({
      id: `obstacle-${Date.now()}`,
      x: Math.random() * (this.gameWidth - 80),
      y: lastObstacle.y - 200,
      width: 80,
      height: 20,
    });
  }

  private calculateReward() {
    // Base: R$ 0.001 per point
    const baseReward = this.state.score * 0.001;
    // Multiplier bonus
    const multipliedReward = baseReward * this.state.multiplier;
    // Cap at maximum
    this.state.reward = Math.min(Math.max(multipliedReward, 0.1), 2.5);
  }

  public getState(): ONZAPGameState {
    return { ...this.state };
  }

  public getReward(): number {
    return parseFloat(this.state.reward.toFixed(2));
  }
}
