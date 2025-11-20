export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // Player ship
  PLAYER_RADIUS: 15,
  PLAYER_SPEED: 5,
  PLAYER_INITIAL_LIVES: 3,

  // Explosion mechanics
  EXPLOSION_DURATION: 2000, // ms
  EXPLOSION_MAX_RADIUS: 100,
  EXPLOSION_GROWTH_RATE: 50, // pixels per second

  // Enemy ships
  ENEMY_RADIUS: 12,
  ENEMY_BASE_SPEED: 2,
  ENEMY_SPAWN_INTERVAL: 2000, // ms
  ENEMIES_PER_FORMATION: 5,

  // Scoring
  BASE_ENEMY_POINTS: 100,
  CHAIN_MULTIPLIER: 1.5,
  LIFE_BONUS_THRESHOLD: 10000,

  // Physics
  FRAME_RATE: 60,
  COLLISION_DETECTION_THRESHOLD: 5
} as const

export const KEYBOARD_CONTROLS = {
  MOVE_UP: ['w', 'W', 'ArrowUp'],
  MOVE_DOWN: ['s', 'S', 'ArrowDown'],
  MOVE_LEFT: ['a', 'A', 'ArrowLeft'],
  MOVE_RIGHT: ['d', 'D', 'ArrowRight'],
  EXPLODE: [' ']
} as const
