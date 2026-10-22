import type { GameMode, GameState, Explosion, Position } from '@/types/game'
import { GAME_CONFIG } from '@/lib/game/constants'
import {
  checkCircleCollision,
  checkExplosionCollision,
  constrainToBounds,
  updateExplosion
} from '@/lib/game/physics'
import { createFormation, createPreviewEnemies } from '@/lib/game/formations'

export function createInitialGameState(mode: GameMode = 'standard'): GameState {
  return {
    player: {
      id: 'player',
      position: { x: 500, y: 310 },
      velocity: { dx: 0, dy: 0 },
      radius: GAME_CONFIG.PLAYER_RADIUS,
      active: true,
      isExploding: false,
      explosionStartTime: null,
      invulnerableUntil: 2500,
      chargeStart: null
    },
    enemies: createPreviewEnemies(),
    explosions: [],
    pickups: [],
    score: 0,
    lives: GAME_CONFIG.PLAYER_INITIAL_LIVES,
    level: 1,
    isPaused: true,
    isGameOver: false,
    hasStarted: false,
    mode,
    elapsed: 0,
    timeLeft: 90000,
    chainMultiplier: 1,
    chainCount: 0,
    bestChain: 0,
    maxChainDepth: 0,
    lastEnemySpawn: 0,
    nextExtend: GAME_CONFIG.LIFE_BONUS_THRESHOLD,
    extendCount: 0,
    quicken: 0,
    bonusStreak: 0,
    notice: 'FIND YOUR MOMENT.',
    noticeUntil: 3000
  }
}

export function canControl(state: GameState) {
  return (
    state.hasStarted &&
    !state.isPaused &&
    !state.isGameOver &&
    !state.player.isExploding
  )
}

export function movePlayer(state: GameState, position: Position): GameState {
  if (!canControl(state)) return state
  return {
    ...state,
    player: {
      ...state.player,
      position: constrainToBounds(position, state.player.radius)
    }
  }
}

export function detonatePlayer(state: GameState): GameState {
  if (!canControl(state) || state.lives <= 0) return state
  const charge =
    state.player.chargeStart === null
      ? 0
      : Math.min(
          1,
          (state.elapsed - state.player.chargeStart) /
            GAME_CONFIG.CHARGE_DURATION
        )
  return {
    ...state,
    lives: state.lives - 1,
    chainCount: state.explosions.length ? state.chainCount : 0,
    bonusStreak: 0,
    player: {
      ...state.player,
      isExploding: true,
      explosionStartTime: state.elapsed,
      chargeStart: null
    },
    explosions: [
      ...state.explosions,
      {
        id: `player-${state.elapsed}`,
        position: { ...state.player.position },
        radius: 0,
        maxRadius: GAME_CONFIG.EXPLOSION_MAX_RADIUS * (1 + charge * 0.75),
        startTime: state.elapsed,
        duration: GAME_CONFIG.EXPLOSION_DURATION,
        chainDepth: 0
      }
    ]
  }
}

export function updateGameLogic(state: GameState, delta: number): GameState {
  if (state.isPaused || state.isGameOver || !state.hasStarted) return state
  const elapsed = Math.max(0, delta)
  const dt = Math.min(elapsed, 50)
  const now = state.elapsed + elapsed
  const next: GameState = {
    ...state,
    elapsed: now,
    timeLeft: Math.max(0, state.timeLeft - elapsed),
    player: { ...state.player }
  }
  if (next.timeLeft === 0) {
    return {
      ...next,
      isGameOver: true,
      isPaused: true,
      player: { ...next.player, chargeStart: null }
    }
  }
  const speed = 1 + state.quicken * 0.16
  next.enemies = state.enemies
    .map((enemy) => ({
      ...enemy,
      position: {
        x: enemy.position.x + ((enemy.velocity.dx * dt) / 1000) * speed,
        y: enemy.position.y + ((enemy.velocity.dy * dt) / 1000) * speed
      }
    }))
    .filter(
      ({ position: p }) => p.x > -180 && p.x < 1180 && p.y > -180 && p.y < 800
    )

  const explosions = state.explosions
    .map((e) => updateExplosion(e, now))
    .filter((e) => !e.isComplete)
    .map((e) => e.explosion)
  const chainExplosions: Explosion[] = []
  const destroyed = new Set<string>()
  next.pickups = state.pickups.filter((pickup) => pickup.expiresAt > now)

  for (const explosion of explosions) {
    for (const enemy of next.enemies) {
      if (destroyed.has(enemy.id) || !checkExplosionCollision(explosion, enemy))
        continue
      destroyed.add(enemy.id)
      next.chainCount += 1
      next.score +=
        GAME_CONFIG.BASE_ENEMY_POINTS * 2 ** Math.min(next.chainCount - 1, 8)
      next.chainMultiplier = 2 ** Math.min(next.chainCount - 1, 8)
      next.maxChainDepth = Math.max(
        next.maxChainDepth,
        explosion.chainDepth + 1
      )
      chainExplosions.push({
        id: `blast-${enemy.id}`,
        position: { ...enemy.position },
        radius: 0,
        maxRadius:
          GAME_CONFIG.EXPLOSION_MAX_RADIUS * (enemy.kind === 'pulse' ? 1.8 : 1),
        startTime: now,
        duration: GAME_CONFIG.EXPLOSION_DURATION,
        chainDepth: explosion.chainDepth + 1
      })
      if (enemy.kind !== 'normal' && enemy.kind !== 'pulse') {
        next.pickups.push({
          id: `pickup-${enemy.id}`,
          position: { ...enemy.position },
          kind: enemy.kind,
          expiresAt: now + 14000
        })
      }
    }
  }

  next.explosions = [...explosions, ...chainExplosions]
  next.enemies = next.enemies.filter((enemy) => !destroyed.has(enemy.id))
  next.bestChain = Math.max(next.bestChain, next.chainCount)
  if (state.explosions.length > 0 && next.explosions.length === 0) {
    next.chainCount = 0
    next.chainMultiplier = 1
  }

  if (next.player.isExploding && next.explosions.length === 0) {
    next.player.isExploding = false
    next.player.explosionStartTime = null
    next.player.invulnerableUntil = now + 2200
  }
  if (!next.player.isExploding) {
    next.pickups = next.pickups.filter((pickup) => {
      if (!checkCircleCollision(next.player.position, 22, pickup.position, 12))
        return true
      if (pickup.kind === 'bonus') {
        next.bonusStreak += 1
        next.score += next.bonusStreak * 800
        next.notice = `BONUS +${next.bonusStreak * 800}`
      } else if (pickup.kind === 'quicken') {
        next.quicken = Math.min(5, next.quicken + 1)
        next.notice = `QUICKEN // LEVEL ${next.quicken}`
      } else {
        next.timeLeft += 10000
        next.notice = 'TIME EXTEND +10s'
      }
      next.noticeUntil = now + 2200
      return false
    })
    if (
      now > next.player.invulnerableUntil &&
      next.enemies.some((enemy) =>
        checkCircleCollision(
          next.player.position,
          next.player.radius,
          enemy.position,
          enemy.radius
        )
      )
    ) {
      next.lives = Math.max(0, next.lives - 1)
      next.timeLeft = Math.max(0, next.timeLeft - 5000)
      next.bonusStreak = 0
      next.player.chargeStart = null
      next.player.invulnerableUntil = now + 2500
      next.notice = 'COLLISION // -1 STOCK / -5s'
      next.noticeUntil = now + 2200
    }
  }
  while (next.score >= next.nextExtend) {
    next.lives += 1
    next.extendCount += 1
    next.nextExtend +=
      GAME_CONFIG.LIFE_BONUS_THRESHOLD + next.extendCount * 5000
    next.notice = 'STOCK EXTEND +1'
    next.noticeUntil = now + 2500
  }
  next.level = 1 + Math.floor(now / 20000)
  const interval =
    GAME_CONFIG.ENEMY_SPAWN_INTERVAL /
    ((state.mode === 'overdrive' ? 1.4 : 1) +
      next.quicken * 0.18 +
      (next.level - 1) * 0.08)
  if (now - next.lastEnemySpawn >= interval && next.enemies.length < 160) {
    next.enemies = [
      ...next.enemies,
      ...createFormation(
        Math.floor(now),
        next.quicken,
        state.mode === 'overdrive'
      )
    ]
    next.lastEnemySpawn = now
  }
  if (next.timeLeft <= 0 || (next.lives <= 0 && next.explosions.length === 0)) {
    next.isGameOver = true
    next.isPaused = true
    next.player.chargeStart = null
  }
  return next
}
