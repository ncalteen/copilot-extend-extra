import type { EnemyShip, Position, Velocity } from '@/types/game'
import { GAME_CONFIG } from './constants'

export type FormationType = 'line' | 'v-formation' | 'circle' | 'wave'

export interface FormationConfig {
  type: FormationType
  enemyCount: number
  speed: number
  startSide: 'top' | 'bottom' | 'left' | 'right'
}

export function createFormation(config: FormationConfig): EnemyShip[] {
  switch (config.type) {
    case 'line':
      return createLineFormation(config)
    case 'v-formation':
      return createVFormation(config)
    case 'circle':
      return createCircleFormation(config)
    case 'wave':
      return createWaveFormation(config)
    default:
      return []
  }
}

export function getRandomFormation(): FormationConfig {
  const types: FormationType[] = ['line', 'v-formation', 'circle', 'wave']
  const sides: ('top' | 'bottom' | 'left' | 'right')[] = [
    'top',
    'bottom',
    'left',
    'right'
  ]

  return {
    type: types[Math.floor(Math.random() * types.length)]!,
    enemyCount: GAME_CONFIG.ENEMIES_PER_FORMATION,
    speed: GAME_CONFIG.ENEMY_BASE_SPEED,
    startSide: sides[Math.floor(Math.random() * sides.length)]!
  }
}

function createLineFormation(config: FormationConfig): EnemyShip[] {
  const enemies: EnemyShip[] = []
  const formationId = `formation-${Date.now()}`
  const spacing = 40

  for (let i = 0; i < config.enemyCount; i++) {
    const position = getStartPosition(config.startSide, i, spacing)
    const velocity = getVelocityTowardCenter(position, config.speed)

    enemies.push({
      id: `enemy-${formationId}-${i}`,
      position,
      velocity,
      radius: GAME_CONFIG.ENEMY_RADIUS,
      active: true,
      points: GAME_CONFIG.BASE_ENEMY_POINTS,
      formationId
    })
  }

  return enemies
}

function createVFormation(config: FormationConfig): EnemyShip[] {
  const enemies: EnemyShip[] = []
  const formationId = `formation-${Date.now()}`
  const spacing = 30
  const vAngle = Math.PI / 6 // 30 degrees

  for (let i = 0; i < config.enemyCount; i++) {
    const side = i % 2 === 0 ? 1 : -1
    const offset = Math.floor(i / 2) * spacing

    const basePos = getStartPosition(config.startSide, 0, 0)
    const angle = side * vAngle

    const position: Position = {
      x: basePos.x + offset * Math.cos(angle),
      y: basePos.y + offset * Math.sin(angle)
    }

    const velocity = getVelocityTowardCenter(position, config.speed)

    enemies.push({
      id: `enemy-${formationId}-${i}`,
      position,
      velocity,
      radius: GAME_CONFIG.ENEMY_RADIUS,
      active: true,
      points: GAME_CONFIG.BASE_ENEMY_POINTS,
      formationId
    })
  }

  return enemies
}

function createCircleFormation(config: FormationConfig): EnemyShip[] {
  const enemies: EnemyShip[] = []
  const formationId = `formation-${Date.now()}`
  const centerX = GAME_CONFIG.CANVAS_WIDTH / 2
  const centerY = -50 // Start above screen
  const radius = 80

  for (let i = 0; i < config.enemyCount; i++) {
    const angle = (i / config.enemyCount) * Math.PI * 2
    const position: Position = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }

    const velocity: Velocity = {
      dx: 0,
      dy: config.speed
    }

    enemies.push({
      id: `enemy-${formationId}-${i}`,
      position,
      velocity,
      radius: GAME_CONFIG.ENEMY_RADIUS,
      active: true,
      points: GAME_CONFIG.BASE_ENEMY_POINTS,
      formationId
    })
  }

  return enemies
}

function createWaveFormation(config: FormationConfig): EnemyShip[] {
  const enemies: EnemyShip[] = []
  const formationId = `formation-${Date.now()}`
  const amplitude = 50
  const frequency = 0.05

  for (let i = 0; i < config.enemyCount; i++) {
    const position = getStartPosition(config.startSide, i, 40)
    const waveOffset = Math.sin(i * frequency) * amplitude

    position.y += waveOffset

    const velocity = getVelocityTowardCenter(position, config.speed)

    enemies.push({
      id: `enemy-${formationId}-${i}`,
      position,
      velocity,
      radius: GAME_CONFIG.ENEMY_RADIUS,
      active: true,
      points: GAME_CONFIG.BASE_ENEMY_POINTS,
      formationId
    })
  }

  return enemies
}

function getStartPosition(
  side: 'top' | 'bottom' | 'left' | 'right',
  index: number,
  spacing: number
): Position {
  switch (side) {
    case 'top':
      return {
        x: index * spacing + spacing,
        y: -GAME_CONFIG.ENEMY_RADIUS
      }
    case 'bottom':
      return {
        x: index * spacing + spacing,
        y: GAME_CONFIG.CANVAS_HEIGHT + GAME_CONFIG.ENEMY_RADIUS
      }
    case 'left':
      return {
        x: -GAME_CONFIG.ENEMY_RADIUS,
        y: index * spacing + spacing
      }
    case 'right':
      return {
        x: GAME_CONFIG.CANVAS_WIDTH + GAME_CONFIG.ENEMY_RADIUS,
        y: index * spacing + spacing
      }
  }
}

function getVelocityTowardCenter(position: Position, speed: number): Velocity {
  const centerX = GAME_CONFIG.CANVAS_WIDTH / 2
  const centerY = GAME_CONFIG.CANVAS_HEIGHT / 2

  const dx = centerX - position.x
  const dy = centerY - position.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  return {
    dx: (dx / distance) * speed,
    dy: (dy / distance) * speed
  }
}
