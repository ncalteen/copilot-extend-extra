import { expect, test } from '@playwright/test'
import {
  createInitialGameState,
  detonatePlayer,
  movePlayer,
  updateGameLogic
} from '../src/lib/game/gameLogic'
import { createFormation } from '../src/lib/game/formations'
import type { EnemyKind, EnemyShip, GameState } from '../src/types/game'

function running(): GameState {
  return {
    ...createInitialGameState(),
    hasStarted: true,
    isPaused: false,
    enemies: [],
    lastEnemySpawn: 1000000
  }
}

function enemy(id: string, x = 500, kind: EnemyKind = 'normal'): EnemyShip {
  return {
    id,
    position: { x, y: 310 },
    velocity: { dx: 0, dy: 0 },
    radius: 8,
    active: true,
    kind,
    points: 10,
    formationId: 'test'
  }
}

function advance(state: GameState, milliseconds: number) {
  let next = state
  for (let i = 0; i < milliseconds; i += 10) {
    next = updateGameLogic(next, Math.min(10, milliseconds - i))
  }
  return next
}

test('detonation costs exactly one stock and is guarded during a chain', () => {
  const initial = running()
  const blast = detonatePlayer(initial)
  expect(blast.lives).toBe(4)
  expect(blast.explosions).toHaveLength(1)
  expect(detonatePlayer(blast)).toBe(blast)
  expect(initial.lives).toBe(5)
  expect(initial.player.isExploding).toBe(false)
})

test('cannot detonate or move before starting, while paused, or after game over', () => {
  for (const state of [
    createInitialGameState(),
    { ...running(), isPaused: true },
    { ...running(), isGameOver: true }
  ]) {
    expect(detonatePlayer(state)).toBe(state)
    expect(movePlayer(state, { x: 0, y: 0 })).toBe(state)
  }
})

test('charge enlarges the blast and clamps at maximum charge', () => {
  const state = running()
  state.elapsed = 5000
  state.player.chargeStart = 0
  expect(detonatePlayer(state).explosions[0].maxRadius).toBe(154)
  expect(detonatePlayer(running()).explosions[0].maxRadius).toBe(88)
})

test('successive kills double points with a 2560-point cap, not by chain depth', () => {
  const state = running()
  state.enemies = Array.from({ length: 12 }, (_, i) => enemy(String(i)))
  const next = advance(detonatePlayer(state), 100)
  expect(next.chainCount).toBe(12)
  expect(next.score).toBe(10 * (2 ** 8 - 1) + 2560 * 4)
  expect(next.chainMultiplier).toBe(256)
  expect(next.enemies).toHaveLength(0)
  expect(next.bestChain).toBe(12)
})

test('enemy blasts propagate to enemies outside the original blast radius', () => {
  const state = running()
  state.enemies = [enemy('near', 560), enemy('far', 620)]
  const next = advance(detonatePlayer(state), 1700)
  expect(next.bestChain).toBe(2)
  expect(next.score).toBe(30)
  expect(next.enemies).toHaveLength(0)
})

test('last stock waits for the chain and can recover through a score extend', () => {
  const state = { ...running(), lives: 1, score: 14995 }
  state.enemies = [enemy('lifeline')]
  const blast = detonatePlayer(state)
  expect(blast.lives).toBe(0)
  expect(blast.isGameOver).toBe(false)
  const next = advance(blast, 2200)
  expect(next.lives).toBe(1)
  expect(next.isGameOver).toBe(false)
  expect(next.nextExtend).toBe(35000)
})

test('last-stock whiff ends the run only after the blast finishes', () => {
  const state = detonatePlayer({ ...running(), lives: 1 })
  expect(advance(state, 500).isGameOver).toBe(false)
  expect(advance(state, 1100).isGameOver).toBe(true)
})

test('collisions penalize time and stock, with invulnerability afterward', () => {
  const state = running()
  state.elapsed = 3000
  state.enemies = [enemy('collision')]
  const hit = updateGameLogic(state, 10)
  expect(hit.lives).toBe(4)
  expect(hit.timeLeft).toBe(84990)
  const shielded = updateGameLogic(hit, 10)
  expect(shielded.lives).toBe(4)
  expect(state.lives).toBe(5)
})

test('pause freezes timer, movement, charge, pickups, and explosions', () => {
  const state = { ...detonatePlayer(running()), isPaused: true }
  expect(updateGameLogic(state, 50)).toBe(state)
})

test('timer expiration ends the run even with remaining stock', () => {
  const state = { ...running(), timeLeft: 20 }
  const next = updateGameLogic(state, 40)
  expect(next.timeLeft).toBe(0)
  expect(next.isGameOver).toBe(true)
  expect(next.isPaused).toBe(true)
})

test('a slow frame does not slow the countdown or the charge clock', () => {
  const next = updateGameLogic(running(), 10000)
  expect(next.timeLeft).toBe(80000)
  expect(next.elapsed).toBe(10000)
})

test('an expired timer cannot be rescued by a drop on the final frame', () => {
  const state = { ...running(), timeLeft: 5 }
  state.pickups = [
    {
      id: 'too-late',
      kind: 'time',
      position: { x: 500, y: 310 },
      expiresAt: 1000
    }
  ]
  const next = updateGameLogic(state, 10)
  expect(next.timeLeft).toBe(0)
  expect(next.isGameOver).toBe(true)
})

test('pickups extend time, stack bonuses, and cap quicken at five', () => {
  const state = running()
  state.quicken = 5
  state.pickups = ['bonus', 'bonus', 'quicken', 'time'].map((kind, i) => ({
    id: String(i),
    kind: kind as 'bonus' | 'quicken' | 'time',
    position: { x: 500, y: 310 },
    expiresAt: 1000
  }))
  const next = updateGameLogic(state, 10)
  expect(next.score).toBe(2400)
  expect(next.timeLeft).toBe(99990)
  expect(next.quicken).toBe(5)
  expect(next.pickups).toHaveLength(0)
  expect(detonatePlayer(next).bonusStreak).toBe(0)
})

test('special enemies drop pickups; pulse enemies create a larger blast instead', () => {
  const state = running()
  state.enemies = [enemy('bonus', 500, 'bonus'), enemy('pulse', 500, 'pulse')]
  const next = updateGameLogic(detonatePlayer(state), 10)
  expect(next.pickups).toHaveLength(1)
  expect(next.pickups[0].kind).toBe('bonus')
  expect(
    next.explosions.find((blast) => blast.id === 'blast-pulse')?.maxRadius
  ).toBeCloseTo(158.4)
})

test('every earned extend is awarded and the next thresholds increase', () => {
  const state = { ...running(), score: 100000 }
  const next = updateGameLogic(state, 10)
  expect(next.lives).toBe(9)
  expect(next.extendCount).toBe(4)
  expect(next.nextExtend).toBe(125000)
})

test('enemy travel is frame-rate independent and incoming formations survive offscreen', () => {
  const state = running()
  state.enemies = [{ ...enemy('moving'), velocity: { dx: 100, dy: 0 } }]
  const fine = advance(state, 1000)
  let coarse = state
  for (let i = 0; i < 20; i++) coarse = updateGameLogic(coarse, 50)
  expect(fine.enemies[0].position.x).toBeCloseTo(coarse.enemies[0].position.x)
  const incoming = { ...running(), enemies: createFormation(1) }
  expect(updateGameLogic(incoming, 16).enemies.length).toBeGreaterThan(0)
})

test('player movement stays inside the arena and expired drops are removed', () => {
  const state = running()
  expect(movePlayer(state, { x: -200, y: 900 }).player.position).toEqual({
    x: 9,
    y: 611
  })
  state.pickups = [
    { id: 'expired', kind: 'bonus', position: { x: 500, y: 310 }, expiresAt: 5 }
  ]
  expect(updateGameLogic(state, 10).pickups).toHaveLength(0)
})
