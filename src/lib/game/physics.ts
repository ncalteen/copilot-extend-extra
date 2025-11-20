import type { Position, GameObject, Explosion } from '@/types/game'
import { GAME_CONFIG } from './constants'

export function checkCircleCollision(
  pos1: Position,
  radius1: number,
  pos2: Position,
  radius2: number
): boolean {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  return (
    distance < radius1 + radius2 - GAME_CONFIG.COLLISION_DETECTION_THRESHOLD
  )
}

export function isWithinBounds(position: Position, radius: number): boolean {
  return (
    position.x - radius >= 0 &&
    position.x + radius <= GAME_CONFIG.CANVAS_WIDTH &&
    position.y - radius >= 0 &&
    position.y + radius <= GAME_CONFIG.CANVAS_HEIGHT
  )
}

export function constrainToBounds(
  position: Position,
  radius: number
): Position {
  return {
    x: Math.max(
      radius,
      Math.min(GAME_CONFIG.CANVAS_WIDTH - radius, position.x)
    ),
    y: Math.max(
      radius,
      Math.min(GAME_CONFIG.CANVAS_HEIGHT - radius, position.y)
    )
  }
}

export function updateExplosion(
  explosion: Explosion,
  currentTime: number
): {
  explosion: Explosion
  isComplete: boolean
} {
  const elapsed = currentTime - explosion.startTime
  const progress = Math.min(elapsed / explosion.duration, 1)

  const newRadius = explosion.maxRadius * progress

  return {
    explosion: {
      ...explosion,
      radius: newRadius
    },
    isComplete: progress >= 1
  }
}

export function checkExplosionCollision(
  explosion: Explosion,
  object: GameObject
): boolean {
  return checkCircleCollision(
    explosion.position,
    explosion.radius,
    object.position,
    object.radius
  )
}
