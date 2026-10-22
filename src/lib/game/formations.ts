import type { EnemyKind, EnemyShip } from '@/types/game'
import { GAME_CONFIG } from '@/lib/game/constants'

export function createFormation(
  sequence: number,
  quicken = 0,
  overdrive = false
): EnemyShip[] {
  const side = Math.floor(Math.random() * 4)
  const vertical = side < 2
  const anchor = 80 + Math.random() * (vertical ? 840 : 460)
  const direction = side % 2 === 0 ? 1 : -1
  const speed = GAME_CONFIG.ENEMY_BASE_SPEED * (overdrive ? 1.5 : 1)
  const count = GAME_CONFIG.ENEMIES_PER_FORMATION + quicken * 2
  const kinds: EnemyKind[] = ['bonus', 'quicken', 'time', 'pulse']
  const special = kinds[sequence % kinds.length]

  return Array.from({ length: count }, (_, i) => {
    const offset = (i - count / 2) * 32
    const wave = Math.sin(i * 0.9 + sequence) * 30
    return {
      id: `enemy-${sequence}-${i}`,
      formationId: `formation-${sequence}`,
      kind: i === Math.floor(count / 2) ? special : 'normal',
      position: vertical
        ? { x: anchor + offset, y: (direction > 0 ? -20 : 640) + wave }
        : { x: (direction > 0 ? -20 : 1020) + wave, y: anchor + offset },
      velocity: {
        dx: vertical ? Math.sin(sequence) * 12 : direction * speed,
        dy: vertical ? direction * speed : Math.cos(sequence) * 12
      },
      radius: special === 'pulse' && i === Math.floor(count / 2) ? 12 : 8,
      active: true,
      points: GAME_CONFIG.BASE_ENEMY_POINTS
    }
  })
}

export function createPreviewEnemies(): EnemyShip[] {
  return Array.from({ length: 38 }, (_, i) => ({
    id: `preview-${i}`,
    formationId: 'preview',
    kind: (i % 9 === 0
      ? 'bonus'
      : i % 13 === 0
        ? 'quicken'
        : 'normal') as EnemyKind,
    position: {
      x: 85 + ((i * 137) % 830),
      y: 65 + ((i * 79) % 490)
    },
    velocity: { dx: Math.sin(i) * 24, dy: Math.cos(i) * 24 },
    radius: GAME_CONFIG.ENEMY_RADIUS,
    active: true,
    points: GAME_CONFIG.BASE_ENEMY_POINTS
  }))
}
