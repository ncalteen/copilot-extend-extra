'use client'

import * as React from 'react'
import { useGame } from '@/contexts/GameContext'
import type { Position } from '@/types/game'
import { KEYBOARD_CONTROLS, GAME_CONFIG } from '@/lib/game/constants'

export function useGameControls() {
  const { gameState, updatePlayer, triggerExplosion } = useGame()
  const pressedKeys = React.useRef<Set<string>>(new Set())

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (gameState.isPaused || gameState.isGameOver) return

      const key = e.key

      // Prevent default for game keys
      if (Object.values(KEYBOARD_CONTROLS).flat().includes(key)) {
        e.preventDefault()
      }

      pressedKeys.current.add(key)

      // Handle explosion trigger
      if (KEYBOARD_CONTROLS.EXPLODE.includes(key)) {
        triggerExplosion()
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      pressedKeys.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState.isPaused, gameState.isGameOver, triggerExplosion])

  // Update player position based on pressed keys
  React.useEffect(() => {
    if (
      gameState.isPaused ||
      gameState.isGameOver ||
      gameState.player.isExploding
    ) {
      return
    }

    const interval = setInterval(() => {
      const newPosition = calculateNewPosition(
        gameState.player.position,
        pressedKeys.current
      )

      if (
        newPosition.x !== gameState.player.position.x ||
        newPosition.y !== gameState.player.position.y
      ) {
        updatePlayer(newPosition)
      }
    }, 1000 / GAME_CONFIG.FRAME_RATE)

    return () => clearInterval(interval)
  }, [gameState, updatePlayer])
}

function calculateNewPosition(
  currentPosition: Position,
  pressedKeys: Set<string>
): Position {
  let dx = 0
  let dy = 0

  // Check movement keys
  if (
    Array.from(pressedKeys).some((key) =>
      KEYBOARD_CONTROLS.MOVE_UP.includes(key)
    )
  ) {
    dy -= GAME_CONFIG.PLAYER_SPEED
  }
  if (
    Array.from(pressedKeys).some((key) =>
      KEYBOARD_CONTROLS.MOVE_DOWN.includes(key)
    )
  ) {
    dy += GAME_CONFIG.PLAYER_SPEED
  }
  if (
    Array.from(pressedKeys).some((key) =>
      KEYBOARD_CONTROLS.MOVE_LEFT.includes(key)
    )
  ) {
    dx -= GAME_CONFIG.PLAYER_SPEED
  }
  if (
    Array.from(pressedKeys).some((key) =>
      KEYBOARD_CONTROLS.MOVE_RIGHT.includes(key)
    )
  ) {
    dx += GAME_CONFIG.PLAYER_SPEED
  }

  // Normalize diagonal movement
  if (dx !== 0 && dy !== 0) {
    const magnitude = Math.sqrt(dx * dx + dy * dy)
    dx = (dx / magnitude) * GAME_CONFIG.PLAYER_SPEED
    dy = (dy / magnitude) * GAME_CONFIG.PLAYER_SPEED
  }

  // Calculate new position
  const newPosition: Position = {
    x: currentPosition.x + dx,
    y: currentPosition.y + dy
  }

  // Constrain to bounds
  return {
    x: Math.max(
      GAME_CONFIG.PLAYER_RADIUS,
      Math.min(
        GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_RADIUS,
        newPosition.x
      )
    ),
    y: Math.max(
      GAME_CONFIG.PLAYER_RADIUS,
      Math.min(
        GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PLAYER_RADIUS,
        newPosition.y
      )
    )
  }
}
