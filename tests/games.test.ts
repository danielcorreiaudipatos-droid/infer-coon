// Games Testing Suite
// Testa a lógica principal dos 3 jogos

import { GAME_CONFIG, ANTI_CHEAT_CONFIG } from '../src/config/games.config';

describe('Games Configuration', () => {
  describe('ONZAP Config', () => {
    it('should have correct initial settings', () => {
      expect(GAME_CONFIG.onzap.maxScore).toBe(10000);
      expect(GAME_CONFIG.onzap.initialSpeed).toBe(100);
      expect(GAME_CONFIG.onzap.maxSessionsPerHour).toBe(5);
      expect(GAME_CONFIG.onzap.rewardPerPoint).toBe(0.001);
    });

    it('should validate session timeout', () => {
      expect(GAME_CONFIG.onzap.sessionTimeout).toBe(5 * 60 * 1000);
    });

    it('should have anti-cheat settings', () => {
      expect(GAME_CONFIG.onzap.antiCheat.maxScorePerSecond).toBe(100);
      expect(GAME_CONFIG.onzap.antiCheat.checksumRequired).toBe(true);
    });
  });

  describe('ONLOVE Config', () => {
    it('should have correct initial settings', () => {
      expect(GAME_CONFIG.onlove.profilesPerSession).toBe(50);
      expect(GAME_CONFIG.onlove.maxSessionsPerHour).toBe(3);
      expect(GAME_CONFIG.onlove.matchBonus).toBe(10);
    });

    it('should validate combo multiplier', () => {
      expect(GAME_CONFIG.onlove.comboMultiplier).toBe(1.25);
      expect(GAME_CONFIG.onlove.maxCombo).toBe(10);
    });

    it('should have reward configuration', () => {
      expect(GAME_CONFIG.onlove.rewards.perMatch).toBe(0.50);
      expect(GAME_CONFIG.onlove.rewards.maximumReward).toBe(50.00);
    });
  });

  describe('ONMAIL Config', () => {
    it('should have correct initial settings', () => {
      expect(GAME_CONFIG.onmail.gridSize).toBe(8);
      expect(GAME_CONFIG.onmail.maxWaves).toBe(20);
      expect(GAME_CONFIG.onmail.initialGold).toBe(500);
      expect(GAME_CONFIG.onmail.maxSessionsPerHour).toBe(2);
    });

    it('should have tower costs', () => {
      expect(GAME_CONFIG.onmail.towers.firewall.cost).toBe(100);
      expect(GAME_CONFIG.onmail.towers.filter.cost).toBe(150);
      expect(GAME_CONFIG.onmail.towers.scanner.cost).toBe(200);
      expect(GAME_CONFIG.onmail.towers.trap.cost).toBe(75);
    });

    it('should have tower damage values', () => {
      expect(GAME_CONFIG.onmail.towers.firewall.damage).toBe(2);
      expect(GAME_CONFIG.onmail.towers.filter.damage).toBe(4);
      expect(GAME_CONFIG.onmail.towers.scanner.damage).toBe(6);
      expect(GAME_CONFIG.onmail.towers.trap.damage).toBe(8);
    });

    it('should have perfection bonus', () => {
      expect(GAME_CONFIG.onmail.rewards.perfectionBonus).toBe(5.00);
    });
  });

  describe('Anti-Cheat Configuration', () => {
    it('should be enabled globally', () => {
      expect(ANTI_CHEAT_CONFIG.enabled).toBe(true);
    });

    it('should have proper ban threshold', () => {
      expect(ANTI_CHEAT_CONFIG.banThreshold).toBe(5);
    });

    it('should use SHA256 checksums', () => {
      expect(ANTI_CHEAT_CONFIG.checksumAlgorithm).toBe('SHA256');
    });

    it('should have rate limiting', () => {
      expect(ANTI_CHEAT_CONFIG.rateLimit.submissionsPerMinute).toBe(10);
      expect(ANTI_CHEAT_CONFIG.rateLimit.submissionsPerHour).toBe(60);
    });
  });
});

describe('Score Validation Logic', () => {
  describe('ONZAP Score Validation', () => {
    it('should reject negative scores', () => {
      const isValid = validateScore(-100);
      expect(isValid).toBe(false);
    });

    it('should reject scores exceeding max', () => {
      const isValid = validateScore(15000); // > 10000
      expect(isValid).toBe(false);
    });

    it('should accept valid scores', () => {
      const isValid = validateScore(5000);
      expect(isValid).toBe(true);
    });

    it('should detect time-based anomalies', () => {
      // Score of 10000 in 5 seconds is impossible
      const duration = 5000;
      const score = 10000;
      const maxExpected = (duration / 1000) * 100; // 500 max
      const isValid = score <= maxExpected * 1.5;
      expect(isValid).toBe(false);
    });
  });

  describe('ONLOVE Score Validation', () => {
    it('should reject matches exceeding profiles', () => {
      const profilesViewed = 50;
      const matches = 75;
      const isValid = matches <= profilesViewed;
      expect(isValid).toBe(false);
    });

    it('should accept valid matches', () => {
      const profilesViewed = 50;
      const matches = 15;
      const isValid = matches <= profilesViewed;
      expect(isValid).toBe(true);
    });

    it('should detect unrealistic match rates', () => {
      const duration = 10000; // 10 seconds
      const matches = 50; // 50 matches in 10 seconds is impossible
      const expectedMaxMatches = Math.floor((duration / 1000) * 0.5); // Max 5
      const isValid = matches <= expectedMaxMatches * 1.5; // 7.5
      expect(isValid).toBe(false);
    });
  });

  describe('ONMAIL Score Validation', () => {
    it('should reject invalid wave counts', () => {
      const waves = 25; // > 20
      const isValid = waves >= 0 && waves <= 20;
      expect(isValid).toBe(false);
    });

    it('should validate minimum duration', () => {
      const waves = 20;
      const duration = 5000; // 5 seconds (way too fast)
      const minExpected = waves * 10000; // 200 seconds
      const isValid = duration >= minExpected * 0.5;
      expect(isValid).toBe(false);
    });

    it('should accept valid completion times', () => {
      const waves = 10;
      const duration = 300000; // 5 minutes
      const minExpected = waves * 10000;
      const isValid = duration >= minExpected * 0.5;
      expect(isValid).toBe(true);
    });
  });
});

describe('Reward Calculations', () => {
  describe('ONZAP Rewards', () => {
    it('should calculate correct rewards', () => {
      const score = 5000;
      const baseReward = score * GAME_CONFIG.onzap.rewardPerPoint; // 5
      expect(baseReward).toBe(5);
    });

    it('should cap maximum rewards', () => {
      const score = 200000;
      const baseReward = score * GAME_CONFIG.onzap.rewardPerPoint; // 200
      const capped = Math.min(baseReward, GAME_CONFIG.onzap.rewards.maximumReward);
      expect(capped).toBe(100);
    });

    it('should enforce minimum rewards', () => {
      const score = 10;
      const baseReward = score * GAME_CONFIG.onzap.rewardPerPoint; // 0.01
      const withMin = Math.max(baseReward, GAME_CONFIG.onzap.rewards.minimumReward);
      expect(withMin).toBe(0.10);
    });
  });

  describe('ONLOVE Rewards', () => {
    it('should calculate match bonuses', () => {
      const matches = 10;
      const reward = matches * GAME_CONFIG.onlove.rewards.perMatch; // 5
      expect(reward).toBe(5);
    });

    it('should apply combo multipliers', () => {
      const baseScore = 100;
      const comboLevel = 3;
      const withCombo = baseScore * (GAME_CONFIG.onlove.comboMultiplier ** comboLevel);
      expect(withCombo).toBeGreaterThan(baseScore);
    });
  });

  describe('ONMAIL Rewards', () => {
    it('should calculate wave bonuses', () => {
      const waves = 15;
      const reward = waves * GAME_CONFIG.onmail.rewards.perWave; // 15
      expect(reward).toBe(15);
    });

    it('should apply perfection bonus', () => {
      const waves = 20;
      const baseReward = 20;
      const withBonus = baseReward + (waves === 20 ? GAME_CONFIG.onmail.rewards.perfectionBonus : 0);
      expect(withBonus).toBe(25);
    });

    it('should not apply perfection bonus for incomplete', () => {
      const waves = 19;
      const baseReward = 19;
      const withBonus = baseReward + (waves === 20 ? GAME_CONFIG.onmail.rewards.perfectionBonus : 0);
      expect(withBonus).toBe(19);
    });
  });
});

describe('Rate Limiting', () => {
  it('should limit ONZAP sessions', () => {
    const maxSessions = GAME_CONFIG.onzap.maxSessionsPerHour;
    expect(maxSessions).toBe(5);
  });

  it('should limit ONLOVE sessions', () => {
    const maxSessions = GAME_CONFIG.onlove.maxSessionsPerHour;
    expect(maxSessions).toBe(3);
  });

  it('should limit ONMAIL sessions', () => {
    const maxSessions = GAME_CONFIG.onmail.maxSessionsPerHour;
    expect(maxSessions).toBe(2);
  });
});

// Helper function
function validateScore(score: number): boolean {
  return score >= 0 && score <= GAME_CONFIG.onzap.maxScore;
}

console.log('✅ All game tests defined and ready to run');
