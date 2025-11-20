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
  lives: number
  isExploding: boolean
  explosionStartTime: number | null
  explosionRadius: number
}

export interface EnemyShip extends GameObject {
  points: number
  formationId: string
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
}
