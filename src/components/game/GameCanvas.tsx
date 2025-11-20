'use client'

import * as React from 'react'
import { useGame } from '@/contexts/GameContext'
import type { GameState, PlayerShip, EnemyShip, Explosion } from '@/types/game'
import { GAME_CONFIG } from '@/lib/game/constants'

export function GameCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const { gameState } = useGame()

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    renderGame(ctx, gameState)
  }, [gameState])

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.CANVAS_WIDTH}
      height={GAME_CONFIG.CANVAS_HEIGHT}
      className="rounded-lg border border-border bg-background shadow-lg"
    />
  )
}

function renderGame(ctx: CanvasRenderingContext2D, gameState: GameState) {
  // Clear canvas
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT)

  // Render explosions (behind everything)
  gameState.explosions.forEach((explosion) => {
    renderExplosion(ctx, explosion)
  })

  // Render enemies
  gameState.enemies.forEach((enemy) => {
    if (enemy.active) {
      renderEnemy(ctx, enemy)
    }
  })

  // Render player
  if (gameState.player.active) {
    renderPlayer(ctx, gameState.player)
  }

  // Render UI overlay
  renderUIOverlay(ctx, gameState)
}

function renderPlayer(ctx: CanvasRenderingContext2D, player: PlayerShip) {
  ctx.save()

  if (player.isExploding) {
    // Pulsing effect during explosion
    const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7
    ctx.globalAlpha = pulse
  }

  ctx.fillStyle = '#3b82f6' // blue-500
  ctx.strokeStyle = '#60a5fa' // blue-400
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.arc(player.position.x, player.position.y, player.radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Draw direction indicator
  ctx.fillStyle = '#93c5fd' // blue-300
  ctx.beginPath()
  ctx.arc(
    player.position.x,
    player.position.y - player.radius * 0.5,
    player.radius * 0.3,
    0,
    Math.PI * 2
  )
  ctx.fill()

  ctx.restore()
}

function renderEnemy(ctx: CanvasRenderingContext2D, enemy: EnemyShip) {
  ctx.save()

  ctx.fillStyle = '#ef4444' // red-500
  ctx.strokeStyle = '#f87171' // red-400
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.arc(enemy.position.x, enemy.position.y, enemy.radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}

function renderExplosion(ctx: CanvasRenderingContext2D, explosion: Explosion) {
  ctx.save()

  const progress = explosion.radius / explosion.maxRadius
  const alpha = 1 - progress

  // Create radial gradient for explosion effect
  const gradient = ctx.createRadialGradient(
    explosion.position.x,
    explosion.position.y,
    0,
    explosion.position.x,
    explosion.position.y,
    explosion.radius
  )

  gradient.addColorStop(0, `rgba(251, 191, 36, ${alpha * 0.8})`) // amber-400
  gradient.addColorStop(0.5, `rgba(245, 158, 11, ${alpha * 0.5})`) // amber-500
  gradient.addColorStop(1, `rgba(217, 119, 6, ${alpha * 0.2})`) // amber-600

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(
    explosion.position.x,
    explosion.position.y,
    explosion.radius,
    0,
    Math.PI * 2
  )
  ctx.fill()

  // Outer ring
  ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.restore()
}

function renderUIOverlay(ctx: CanvasRenderingContext2D, gameState: GameState) {
  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px monospace'

  // Score
  ctx.fillText(`Score: ${gameState.score}`, 20, 30)

  // Lives
  ctx.fillText(`Lives: ${gameState.lives}`, 20, 60)

  // Chain multiplier (if active)
  if (gameState.chainMultiplier > 1) {
    ctx.fillStyle = '#facc15' // yellow-400
    ctx.font = 'bold 24px monospace'
    ctx.fillText(
      `Chain x${gameState.chainMultiplier.toFixed(1)}`,
      GAME_CONFIG.CANVAS_WIDTH / 2 - 60,
      40
    )
  }

  ctx.restore()
}
