'use client'

import * as React from 'react'
import { useGame } from '@/contexts/GameContext'

export function useGameControls() {
  const {
    gameState,
    setMovement,
    beginCharge,
    triggerExplosion,
    pauseGame,
    resumeGame
  } = useGame()
  const running = gameState.hasStarted && !gameState.isGameOver

  React.useEffect(() => {
    const keys = new Set<string>()
    const movementKeys = [
      'w',
      'a',
      's',
      'd',
      'arrowup',
      'arrowdown',
      'arrowleft',
      'arrowright'
    ]
    function down(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('button, a, input, select, textarea')
      )
        return
      const key = event.key.toLowerCase()
      if (!running) return
      if (key === 'p' || key === 'escape') {
        if (!event.repeat) {
          event.preventDefault()
          if (gameState.isPaused) resumeGame()
          else pauseGame()
        }
        return
      }
      if (gameState.isPaused) return
      if (movementKeys.includes(key) || key === ' ') event.preventDefault()
      if (movementKeys.includes(key)) {
        keys.add(key)
        setMovement(new Set(keys))
      }
      if (key === ' ' && !event.repeat) beginCharge()
    }
    function up(event: KeyboardEvent) {
      keys.delete(event.key.toLowerCase())
      setMovement(new Set(keys))
      if (
        event.key === ' ' &&
        !gameState.isPaused &&
        running &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest('button, a, input, select, textarea')
        )
      ) {
        event.preventDefault()
        triggerExplosion()
      }
    }
    function blur() {
      keys.clear()
      setMovement(new Set())
      if (running) pauseGame()
    }
    function visibility() {
      if (document.hidden) blur()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
      document.removeEventListener('visibilitychange', visibility)
      setMovement(new Set())
    }
  }, [
    running,
    gameState.isPaused,
    setMovement,
    beginCharge,
    triggerExplosion,
    pauseGame,
    resumeGame
  ])
}
