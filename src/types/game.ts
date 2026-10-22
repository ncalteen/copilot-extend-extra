export interface Position {
  x: number
  y: number
}

export interface Velocity {
  dx: number
  dy: number
}

export interface GameObject {
  id: string
  position: Position
  velocity: Velocity
  radius: number
  active: boolean
}

export interface PlayerShip extends GameObject {
  isExploding: boolean
  explosionStartTime: number | null
  invulnerableUntil: number
  chargeStart: number | null
}

export type EnemyKind = 'normal' | 'bonus' | 'quicken' | 'time' | 'pulse'
export type GameMode = 'standard' | 'overdrive'

export interface EnemyShip extends GameObject {
  points: number
  formationId: string
  kind: EnemyKind
}

export interface Explosion {
  id: string
  position: Position
  radius: number
  maxRadius: number
  startTime: number
  duration: number
  chainDepth: number
}

export interface Pickup {
  id: string
  position: Position
  kind: 'bonus' | 'quicken' | 'time'
  expiresAt: number
}

export interface GameState {
  player: PlayerShip
  enemies: EnemyShip[]
  explosions: Explosion[]
  score: number
  lives: number
  level: number
  isPaused: boolean
  isGameOver: boolean
  chainMultiplier: number
  maxChainDepth: number
  lastEnemySpawn: number
  hasStarted: boolean
  mode: GameMode
  elapsed: number
  timeLeft: number
  chainCount: number
  bestChain: number
  nextExtend: number
  extendCount: number
  quicken: number
  bonusStreak: number
  pickups: Pickup[]
  notice: string
  noticeUntil: number
}
