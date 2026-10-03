export const GAME_CONFIG = {
  onzap: {
    name: 'ONZAP',
    description: 'WhatsApp Battle Royale',
    maxScore: 10000,
    initialSpeed: 100,
    speedIncrement: 2,
    difficultyScaling: 0.05, // 5% increase per 10 seconds
    rewardPerPoint: 0.001, // R$ per point
    bonusMultiplier: 1.25,
    sessionTimeout: 5 * 60 * 1000, // 5 minutes
    maxSessionsPerHour: 5,
    antiCheat: {
      maxScorePerSecond: 100,
      maxPointsPerFrame: 50,
      checksumRequired: true,
    },
    rewards: {
      minimumScore: 50,
      minimumReward: 0.10,
      maximumReward: 100.00,
    }
  },

  onlove: {
    name: 'ONLOVE',
    description: 'Tinder Simulator',
    profilesPerSession: 50,
    matchBonus: 10,
    comboMultiplier: 1.25,
    maxCombo: 10,
    sessionTimeout: 10 * 60 * 1000, // 10 minutes
    maxSessionsPerHour: 3,
    antiCheat: {
      minSwipeTime: 500, // milliseconds
      maxSwipesPerSecond: 2,
      checksumRequired: true,
    },
    rewards: {
      perMatch: 0.50,
      comboBonus: 0.10,
      sessionBonus: 1.00,
      maximumReward: 50.00,
    }
  },

  onmail: {
    name: 'ONMAIL',
    description: 'Tower Defense',
    gridSize: 8,
    maxWaves: 20,
    initialGold: 500,
    goldPerKill: 10,
    rewardPerWave: 100,
    sessionTimeout: 15 * 60 * 1000, // 15 minutes
    maxSessionsPerHour: 2,
    antiCheat: {
      maxGoldPerWave: 5000,
      towerCostValidation: true,
      checksumRequired: true,
    },
    rewards: {
      perWave: 1.00,
      perfectionBonus: 5.00,
      maximumReward: 100.00,
    },
    towers: {
      firewall: { cost: 100, damage: 2, range: 3 },
      filter: { cost: 150, damage: 4, range: 2 },
      scanner: { cost: 200, damage: 6, range: 1 },
      trap: { cost: 75, damage: 8, range: 2 }
    }
  }
};

export const ANTI_CHEAT_CONFIG = {
  enabled: true,
  logSuspiciousActivity: true,
  banThreshold: 5, // number of flags before auto-ban
  flagExpiryTime: 24 * 60 * 60 * 1000, // 24 hours
  checksumAlgorithm: 'SHA256',
  deviceFingerprinting: true,
  ipTracking: true,
  rateLimit: {
    submissionsPerMinute: 10,
    submissionsPerHour: 60,
  }
};

export const REWARDS_CONFIG = {
  conversionRate: 1, // 1 point = R$ 0.001
  minimumWithdrawal: 10.00,
  maximumDailyReward: 500.00,
  paymentProcessor: 'stripe',
  currency: 'BRL',
  taxPercentage: 0,
};

export const LEADERBOARD_CONFIG = {
  updateFrequency: 60000, // 1 minute
  topPlayersCount: 100,
  includeWeekly: true,
  includeMonthly: true,
  includeAllTime: true,
  resetWeeklyOn: 'Monday',
  resetMonthlyOn: 1, // Day of month
};

export const COSMETICS_CONFIG = {
  defaultSkin: 'default',
  defaultEffect: 'none',
  purchasable: {
    skins: [
      { id: 'ninja', price: 4.99, game: 'all' },
      { id: 'gold', price: 4.99, game: 'all' },
      { id: 'cyber', price: 9.99, game: 'all' },
    ],
    effects: [
      { id: 'glow', price: 2.99, game: 'all' },
      { id: 'fire', price: 2.99, game: 'all' },
      { id: 'rainbow', price: 3.99, game: 'all' },
    ]
  },
  freeRewards: [
    { id: 'starter_skin', unlockAt: 100 },
    { id: 'starter_effect', unlockAt: 500 },
  ]
};

export function getGameConfig(gameType: string) {
  const config = GAME_CONFIG[gameType];
  if (!config) {
    throw new Error(`Unknown game type: ${gameType}`);
  }
  return config;
}
