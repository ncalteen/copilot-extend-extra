'use client'

import { Crosshair, Pause, Play, RotateCcw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGame } from '@/contexts/GameContext'

export function GameControls() {
  const {
    gameState: state,
    pauseGame,
    resumeGame,
    resetGame,
    beginCharge,
    triggerExplosion
  } = useGame()
  const disabled = !state.hasStarted || state.isGameOver
  return (
    <div className="controls-bar">
      <div className="control-guide">
        <Crosshair />
        <span>
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd>
          <span className="mx-2">/</span> MOUSE TO MOVE
        </span>
      </div>
      <div className="control-guide hidden lg:flex">
        <kbd className="space-key">SPACE</kbd>
        <span>HOLD TO CHARGE · RELEASE TO DETONATE</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={state.isPaused ? 'Resume game' : 'Pause game'}
          onClick={() => {
            if (state.isPaused) resumeGame()
            else pauseGame()
            document.querySelector<HTMLCanvasElement>('canvas')?.focus()
          }}>
          {state.isPaused ? <Play /> : <Pause />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Reset game"
          onClick={resetGame}>
          <RotateCcw />
        </Button>
        <Button
          className="mobile-detonate"
          disabled={disabled || state.isPaused || state.player.isExploding}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            beginCharge()
          }}
          onPointerUp={triggerExplosion}
          onPointerCancel={triggerExplosion}
          onClick={(event) => {
            if (event.detail === 0) triggerExplosion()
          }}>
          <Zap /> DETONATE
        </Button>
      </div>
    </div>
  )
}
