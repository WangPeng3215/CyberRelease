export const RARITY = {
  N: { name: 'N', color: 'white', borderColor: '#ffffff', glowColor: 'rgba(255, 255, 255, 0.3)' },
  R: { name: 'R', color: 'blue', borderColor: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.3)' },
  SR: { name: 'SR', color: 'purple', borderColor: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.3)' },
  SSR: { name: 'SSR', color: 'pink', borderColor: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.3)' },
  UR: { name: 'UR', color: 'orange', borderColor: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.3)' },
  EX: { name: 'EX', color: 'rainbow', borderColor: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)', glowColor: 'rgba(255, 100, 100, 0.3)' }
}

export const UNLOCK_TYPES = {
  DEFAULT: 'default',
  RELEASE_COUNT: 'release_count',
  RELEASE_LOCATION: 'release_location',
  RANDOM: 'random',
  EVENT: 'event',
  MERIT: 'merit'
}

export function getRarityInfo(rarity) {
  return RARITY[rarity] || RARITY.N
}
