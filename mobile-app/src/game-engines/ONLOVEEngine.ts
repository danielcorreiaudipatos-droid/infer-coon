// ONLOVE Game Engine - Matching/Swiping Game

export interface ONLOVEProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  bio: string;
}

export interface ONLOVEGameState {
  currentProfile: ONLOVEProfile | null;
  profiles: ONLOVEProfile[];
  score: number;
  matches: string[];
  reactions: {
    love: number; // 2x multiplier
    like: number; // 1x multiplier
    maybe: number; // 0.5x multiplier
    pass: number; // 0x
    block: number;
  };
  reward: number;
  swipesLeft: number;
}

export class ONLOVEEngine {
  private state: ONLOVEGameState;
  private reactionMultipliers = {
    love: 2,
    like: 1,
    maybe: 0.5,
    pass: 0,
    block: 0,
  };

  constructor() {
    this.state = {
      currentProfile: null,
      profiles: this.generateProfiles(),
      score: 0,
      matches: [],
      reactions: { love: 0, like: 0, maybe: 0, pass: 0, block: 0 },
      reward: 0,
      swipesLeft: 100,
    };
    this.nextProfile();
  }

  private generateProfiles(): ONLOVEProfile[] {
    const names = ['Ana', 'Maria', 'Sofia', 'Laura', 'Julia', 'Carolina'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: `profile-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      age: Math.floor(Math.random() * 15) + 18,
      avatar: `👩‍🦰`,
      bio: 'Looking for meaningful connections',
    }));
  }

  public react(type: 'love' | 'like' | 'maybe' | 'pass' | 'block') {
    if (!this.state.currentProfile || this.state.swipesLeft <= 0) return;

    const multiplier = this.reactionMultipliers[type];
    const reward = 0.1 * multiplier;

    this.state.score += 10 * multiplier;
    this.state.reactions[type]++;
    this.state.swipesLeft--;

    if (type === 'love' || type === 'like') {
      this.state.matches.push(this.state.currentProfile.id);
    }

    this.nextProfile();
    this.calculateReward();
  }

  private nextProfile() {
    if (this.state.profiles.length > 0) {
      this.state.currentProfile = this.state.profiles.pop() || null;
    }
  }

  private calculateReward() {
    const reactionScore =
      this.state.reactions.love * 0.2 +
      this.state.reactions.like * 0.1 +
      this.state.reactions.maybe * 0.05;

    const baseReward = reactionScore;
    this.state.reward = Math.min(Math.max(baseReward, 0.05), 5.0);
  }

  public getState(): ONLOVEGameState {
    return { ...this.state };
  }

  public getReward(): number {
    return parseFloat(this.state.reward.toFixed(2));
  }
}
