import type { GameState, Explosion } from '@/types/game'
import { GAME_CONFIG } from './constants'
import {
  checkExplosionCollision,
  updateExplosion,
  isWithinBounds
} from './physics'
import { createFormation, getRandomFormation } from './formations'

export function updateGameLogic(
  state: GameState,
  currentTime: number
): GameState {
  if (state.isPaused || state.isGameOver) return state

  const newState = { ...state }

  // Update explosions
  const updatedExplosions: Explosion[] = []
  const newExplosionsFromChain: Explosion[] = []
  const destroyedEnemyIds = new Set<string>()

  newState.explosions.forEach((explosion) => {
    const { explosion: updated, isComplete } = updateExplosion(
      explosion,
      currentTime
    )

    if (!isComplete) {
      updatedExplosions.push(updated)

      // Check collision with enemies
      newState.enemies.forEach((enemy) => {
        if (
          enemy.active &&
          !destroyedEnemyIds.has(enemy.id) &&
          checkExplosionCollision(updated, enemy)
        ) {
          destroyedEnemyIds.add(enemy.id)

          // Create new explosion from enemy
          newExplosionsFromChain.push({
            id: `explosion-${Date.now()}-${Math.random()}`,
            position: { ...enemy.position },
            radius: 0,
            maxRadius: GAME_CONFIG.EXPLOSION_MAX_RADIUS,
            startTime: currentTime,
            duration: GAME_CONFIG.EXPLOSION_DURATION,
            chainDepth: explosion.chainDepth + 1
          })
        }
      })
    }
  })

  newState.explosions = [...updatedExplosions, ...newExplosionsFromChain]

  // Calculate score from destroyed enemies
  if (destroyedEnemyIds.size > 0) {
    const maxChainDepth = Math.max(
      ...newExplosionsFromChain.map((e) => e.chainDepth),
      0
    )
    const multiplier = Math.pow(GAME_CONFIG.CHAIN_MULTIPLIER, maxChainDepth)
    const points =
      destroyedEnemyIds.size * GAME_CONFIG.BASE_ENEMY_POINTS * multiplier

    newState.score += Math.floor(points)
    newState.maxChainDepth = Math.max(newState.maxChainDepth, maxChainDepth)
    newState.chainMultiplier = multiplier

    // Check for life bonus
    const oldLives = Math.floor(state.score / GAME_CONFIG.LIFE_BONUS_THRESHOLD)
    const newLives = Math.floor(
      newState.score / GAME_CONFIG.LIFE_BONUS_THRESHOLD
    )
    if (newLives > oldLives) {
      newState.lives += 1
    }
  } else if (newState.explosions.length === 0) {
    newState.chainMultiplier = 1
  }

  // Remove destroyed enemies
  newState.enemies = newState.enemies.filter(
    (enemy) => !destroyedEnemyIds.has(enemy.id)
  )

  // Update enemy positions
  newState.enemies = newState.enemies.map((enemy) => {
    const newPosition = {
      x: enemy.position.x + enemy.velocity.dx,
      y: enemy.position.y + enemy.velocity.dy
    }

    // Deactivate enemies that move off screen
    const active = isWithinBounds(newPosition, enemy.radius * 2)

    return {
      ...enemy,
      position: newPosition,
      active
    }
  })

  // Remove inactive enemies
  newState.enemies = newState.enemies.filter((enemy) => enemy.active)

  // Reset player explosion state when explosion completes
  if (
    newState.player.isExploding &&
    newState.player.explosionStartTime !== null
  ) {
    const timeSinceExplosion = currentTime - newState.player.explosionStartTime
    if (timeSinceExplosion >= GAME_CONFIG.EXPLOSION_DURATION) {
      newState.player = {
        ...newState.player,
        isExploding: false,
        explosionStartTime: null,
        explosionRadius: 0
      }
      newState.lives -= 1

      // Check for game over
      if (newState.lives <= 0) {
        newState.isGameOver = true
        newState.isPaused = true
      }
    }
  }

  // Spawn new enemies
  if (
    currentTime - newState.lastEnemySpawn >=
    GAME_CONFIG.ENEMY_SPAWN_INTERVAL
  ) {
    const formation = getRandomFormation()
    const newEnemies = createFormation(formation)
    newState.enemies = [...newState.enemies, ...newEnemies]
    newState.lastEnemySpawn = currentTime
  }

  return newState
}
