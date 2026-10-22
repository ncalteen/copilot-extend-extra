'use client'

import * as React from 'react'
import { ArrowUpRight, Maximize2, Play, Radio, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGame } from '@/contexts/GameContext'
import { GAME_CONFIG } from '@/lib/game/constants'
import type { EnemyKind, GameState, Position } from '@/types/game'

const COLORS: Record<EnemyKind, string> = {
  normal: '#67e8f9',
  bonus: '#c5f467',
  quicken: '#d695ff',
  time: '#ffd275',
  pulse: '#ff819f'
}

export function GameCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const arenaRef = React.useRef<HTMLDivElement>(null)
  const [displayError, setDisplayError] = React.useState('')
  const {
    gameState: state,
    startGame,
    resumeGame,
    updatePlayer,
    beginCharge,
    triggerExplosion
  } = useGame()
  const blocked = state.isPaused || state.isGameOver

  React.useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) {
      setDisplayError(
        'Your browser could not initialize the game canvas. Please enable hardware acceleration or try another browser.'
      )
      return
    }
    ctx.setTransform(2, 0, 0, 2, 0, 0)
    renderGame(ctx, state)
  }, [state])

  function pointerPosition(
    event: React.PointerEvent<HTMLCanvasElement>
  ): Position {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * GAME_CONFIG.CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * GAME_CONFIG.CANVAS_HEIGHT
    }
  }

  async function fullscreen() {
    try {
      if (!document.fullscreenEnabled)
        throw new Error('Fullscreen is not supported in this browser.')
      if (document.fullscreenElement) await document.exitFullscreen()
      else await arenaRef.current?.requestFullscreen()
    } catch (error) {
      console.warn('Could not switch fullscreen mode.', error)
      setDisplayError(
        'Fullscreen is unavailable. You can still play in this window.'
      )
    }
  }

  return (
    <section className="arena-shell" aria-label="Game arena">
      <div className="arena-topline">
        <span className="flex items-center gap-2">
          <span className={`status-dot ${!blocked ? 'live' : ''}`} />
          {!state.hasStarted
            ? 'SYSTEM READY'
            : state.isGameOver
              ? 'RUN COMPLETE'
              : state.isPaused
                ? 'SIGNAL PAUSED'
                : 'LIVE SESSION'}
        </span>
        <span className="hidden sm:inline">
          SECTOR 0{state.level} <span className="px-3 text-white/15">/</span>{' '}
          THE FIRST SPARK
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="arena-expand"
          aria-label="Toggle fullscreen"
          onClick={fullscreen}>
          <Maximize2 className="size-4" />
        </Button>
      </div>
      <div className="arena" ref={arenaRef}>
        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.CANVAS_WIDTH * 2}
          height={GAME_CONFIG.CANVAS_HEIGHT * 2}
          tabIndex={0}
          aria-label="Chain reaction playfield. Move with WASD, arrow keys, or pointer. Hold and release Space or a mouse click to detonate. On touch screens, drag to move and use the Detonate button."
          onPointerMove={(event) => {
            if (event.pointerType !== 'touch' || event.buttons)
              updatePlayer(pointerPosition(event))
          }}
          onPointerDown={(event) => {
            if (blocked || event.button !== 0) return
            event.currentTarget.focus()
            event.currentTarget.setPointerCapture(event.pointerId)
            updatePlayer(pointerPosition(event))
            if (event.pointerType !== 'touch') beginCharge()
          }}
          onPointerUp={(event) => {
            if (
              event.pointerType !== 'touch' &&
              !blocked &&
              event.currentTarget.hasPointerCapture(event.pointerId)
            )
              triggerExplosion()
          }}
          onPointerCancel={() => {
            if (!blocked) triggerExplosion()
          }}
          onContextMenu={(event) => event.preventDefault()}>
          This game requires a browser that supports HTML canvas.
        </canvas>
        <div className="arena-coordinate top-left">
          X 000 <span>/</span> Y 000
        </div>
        <div className="arena-coordinate bottom-right">
          RE:ACT ENGINE // V.01
        </div>
        {!blocked && state.chainCount > 0 && (
          <div className="chain-callout">
            <span>CHAIN REACTION</span>
            <strong>
              {String(state.chainCount).padStart(2, '0')}
              <small> HITS</small>
            </strong>
            <span className="text-lime">
              +{(10 * state.chainMultiplier).toLocaleString()} PER HIT
            </span>
          </div>
        )}
        {!blocked && state.noticeUntil > state.elapsed && (
          <div className="arena-notice" role="status">
            {state.notice}
          </div>
        )}
        {blocked && !displayError && (
          <div className="arena-overlay">
            <div className="intro-mark">
              <Radio className="size-6" />
            </div>
            <div className="eyebrow text-lime">
              {state.isGameOver
                ? 'EVERY END IS A NEW BEGINNING'
                : !state.hasStarted
                  ? 'ONE SPARK. ENDLESS POSSIBILITIES.'
                  : 'TAKE A BREATH.'}
            </div>
            <h2>
              {state.isGameOver ? (
                'Signal lost.'
              ) : !state.hasStarted ? (
                <>
                  Make waves.
                  <br />
                  <em>Break the chain.</em>
                </>
              ) : (
                'In suspension.'
              )}
            </h2>
            <p>
              {state.isGameOver
                ? `${state.timeLeft <= 0 ? 'Time is up.' : 'Out of stock.'} ${state.score.toLocaleString()} points. ${state.bestChain} enemies in your best chain.`
                : !state.hasStarted
                  ? 'You are the catalyst. Find your moment, detonate,\nand turn a single spark into a beautiful reaction.'
                  : 'Your next great reaction can wait.\nResume when you are ready.'}
            </p>
            <Button
              className="launch-button"
              size="lg"
              onClick={() => {
                if (state.hasStarted && !state.isGameOver) resumeGame()
                else startGame()
                canvasRef.current?.focus()
              }}>
              {state.isGameOver ? (
                <RotateCcw />
              ) : (
                <Play className="fill-current" />
              )}
              {state.isGameOver
                ? 'TRY AGAIN'
                : !state.hasStarted
                  ? 'START REACTION'
                  : 'RESUME SESSION'}
              <ArrowUpRight className="ml-5" />
            </Button>
            {!state.hasStarted && (
              <div className="intro-hint">
                90 SECONDS <span /> 5 STOCK <span /> MAKE IT COUNT
              </div>
            )}
          </div>
        )}
        {displayError && (
          <div className="canvas-error" role="alert">
            {displayError}
            <Button variant="outline" onClick={() => setDisplayError('')}>
              Dismiss
            </Button>
          </div>
        )}
      </div>
      <div className="arena-bottomline">
        <span>
          <span className="status-dot live" />{' '}
          {state.player.isExploding
            ? 'REACTION IN PROGRESS'
            : 'YOU ARE THE CATALYST'}
        </span>
        <span>
          {state.player.isExploding
            ? 'WAIT FOR YOUR SIGNAL TO RETURN'
            : 'POSITION. DETONATE. REPEAT.'}
        </span>
      </div>
    </section>
  )
}

function polygon(
  ctx: CanvasRenderingContext2D,
  position: Position,
  radius: number,
  sides: number,
  rotation = 0
) {
  ctx.beginPath()
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + rotation
    const x = position.x + Math.cos(angle) * radius
    const y = position.y + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function renderGame(ctx: CanvasRenderingContext2D, state: GameState) {
  const width = GAME_CONFIG.CANVAS_WIDTH
  const height = GAME_CONFIG.CANVAS_HEIGHT
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#090e12'
  ctx.fillRect(0, 0, width, height)
  const ambient = ctx.createRadialGradient(500, 300, 10, 500, 300, 580)
  ambient.addColorStop(0, '#15302d66')
  ambient.addColorStop(1, '#090e1200')
  ctx.fillStyle = ambient
  ctx.fillRect(0, 0, width, height)
  ctx.lineWidth = 0.5
  ctx.strokeStyle = '#8fb9a50c'
  for (let x = 0; x <= width; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = i % 3 ? '#b1d2d22b' : '#c5f46760'
    ctx.fillRect(
      (i * 193 + 37) % width,
      (i * 113 + 83) % height,
      i % 5 ? 1 : 2,
      1
    )
  }

  for (const explosion of state.explosions) {
    const progress = (state.elapsed - explosion.startTime) / explosion.duration
    const color = explosion.chainDepth === 0 ? '197,244,103' : '103,232,249'
    const alpha = Math.max(0, 1 - progress)
    const radius = Math.max(0.1, explosion.radius)
    const glow = ctx.createRadialGradient(
      explosion.position.x,
      explosion.position.y,
      0,
      explosion.position.x,
      explosion.position.y,
      radius
    )
    glow.addColorStop(0, `rgba(${color},${alpha * 0.3})`)
    glow.addColorStop(0.8, `rgba(${color},${alpha * 0.06})`)
    glow.addColorStop(1, `rgba(${color},${alpha * 0.22})`)
    ctx.fillStyle = glow
    ctx.strokeStyle = `rgba(${color},${alpha * 0.9})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(explosion.position.x, explosion.position.y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    for (let i = 0; i < 9; i++) {
      const angle = i * 2.4 + explosion.chainDepth
      const r = radius * (0.6 + (i % 3) * 0.3)
      ctx.fillStyle = `rgba(${color},${alpha})`
      ctx.fillRect(
        explosion.position.x + Math.cos(angle) * r,
        explosion.position.y + Math.sin(angle) * r,
        2,
        2
      )
    }
  }

  for (const enemy of state.enemies) {
    const color = COLORS[enemy.kind]
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = 12
    ctx.strokeStyle = color
    ctx.fillStyle = `${color}16`
    ctx.lineWidth = 1.3
    polygon(
      ctx,
      enemy.position,
      enemy.radius,
      enemy.kind === 'pulse' ? 6 : 4,
      state.elapsed * 0.0003 + (enemy.kind === 'normal' ? Math.PI / 4 : 0)
    )
    ctx.fill()
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.fillStyle = color
    ctx.fillRect(enemy.position.x - 1.5, enemy.position.y - 1.5, 3, 3)
    if (enemy.kind !== 'normal') {
      ctx.strokeStyle = `${color}55`
      ctx.beginPath()
      ctx.arc(
        enemy.position.x,
        enemy.position.y,
        enemy.radius + 6,
        0,
        Math.PI * 2
      )
      ctx.stroke()
    }
    ctx.restore()
  }

  for (const pickup of state.pickups) {
    const color = COLORS[pickup.kind]
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = 14
    ctx.strokeStyle = color
    ctx.fillStyle = `${color}25`
    ctx.lineWidth = 1.5
    polygon(
      ctx,
      pickup.position,
      12 + Math.sin(state.elapsed / 180) * 2,
      4,
      Math.PI / 4
    )
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = color
    ctx.font = 'bold 12px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      pickup.kind === 'time' ? '+' : pickup.kind === 'bonus' ? '$' : '»',
      pickup.position.x,
      pickup.position.y
    )
    ctx.restore()
  }

  if (!state.player.isExploding) {
    const p = state.player.position
    const charging = state.player.chargeStart !== null
    const charge = charging
      ? Math.min(
          1,
          (state.elapsed - state.player.chargeStart!) /
            GAME_CONFIG.CHARGE_DURATION
        )
      : 0
    ctx.save()
    if (state.hasStarted && state.elapsed < state.player.invulnerableUntil)
      ctx.globalAlpha = 0.45 + Math.sin(state.elapsed / 70) * 0.25
    ctx.strokeStyle = '#c5f467'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 7])
    ctx.beginPath()
    ctx.arc(p.x, p.y, charging ? 88 * (1 + charge * 0.75) : 29, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.shadowColor = '#c5f467'
    ctx.shadowBlur = 22
    ctx.fillStyle = '#c5f467'
    polygon(ctx, p, 10, 4, -Math.PI / 2)
    ctx.fill()
    ctx.fillStyle = '#0b1610'
    polygon(ctx, p, 4, 4)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#c5f46799'
    ctx.font = '9px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(
      charging ? `CHARGE ${Math.round(charge * 100)}%` : 'YOU',
      p.x,
      p.y + 45
    )
    ctx.restore()
  }
  const vignette = ctx.createRadialGradient(500, 310, 220, 500, 310, 650)
  vignette.addColorStop(0, '#00000000')
  vignette.addColorStop(1, '#00000080')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
}
