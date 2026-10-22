'use client'

import * as React from 'react'
import type { GameMode, GameState, Position } from '@/types/game'
import { GAME_CONFIG } from '@/lib/game/constants'
import {
  canControl,
  createInitialGameState,
  detonatePlayer,
  movePlayer,
  updateGameLogic
} from '@/lib/game/gameLogic'

interface GameContextValue {
  gameState: GameState
  bestScore: number
  storageError: boolean
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
  setMode: (mode: GameMode) => void
  updatePlayer: (position: Position) => void
  setMovement: (keys: Set<string>) => void
  beginCharge: () => void
  triggerExplosion: () => void
}

const GameContext = React.createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = React.useState(createInitialGameState)
  const [bestScore, setBestScore] = React.useState(0)
  const [storageError, setStorageError] = React.useState(false)
  const movement = React.useRef(new Set<string>())

  React.useEffect(() => {
    try {
      const stored = Number(localStorage.getItem('react-arcade-best') ?? 0)
      if (Number.isFinite(stored) && stored >= 0) setBestScore(stored)
    } catch (error) {
      console.warn('High score storage is unavailable.', error)
      setStorageError(true)
    }
  }, [])

  React.useEffect(() => {
    if (!gameState.isGameOver) return
    setBestScore((best) => Math.max(best, gameState.score))
    try {
      const stored = Number(localStorage.getItem('react-arcade-best') ?? 0)
      localStorage.setItem(
        'react-arcade-best',
        String(Math.max(Number.isFinite(stored) ? stored : 0, gameState.score))
      )
    } catch (error) {
      console.warn('Could not save the high score.', error)
      setStorageError(true)
    }
  }, [gameState.isGameOver, gameState.score])

  React.useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver) return
    let frame = 0
    let previous = performance.now()
    function tick(time: number) {
      const delta = Math.max(0, time - previous)
      previous = time
      setGameState((state) => {
        const keys = movement.current
        const x =
          Number(keys.has('d') || keys.has('arrowright')) -
          Number(keys.has('a') || keys.has('arrowleft'))
        const y =
          Number(keys.has('s') || keys.has('arrowdown')) -
          Number(keys.has('w') || keys.has('arrowup'))
        const distance =
          (GAME_CONFIG.PLAYER_SPEED * Math.min(delta, 50)) /
          1000 /
          (Math.hypot(x, y) || 1)
        const moved =
          x || y
            ? movePlayer(state, {
                x: state.player.position.x + x * distance,
                y: state.player.position.y + y * distance
              })
            : state
        return updateGameLogic(moved, delta)
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [gameState.isPaused, gameState.isGameOver])

  const startGame = React.useCallback(() => {
    movement.current.clear()
    setGameState((state) => ({
      ...createInitialGameState(state.mode),
      hasStarted: true,
      isPaused: false
    }))
  }, [])
  const pauseGame = React.useCallback(() => {
    movement.current.clear()
    setGameState((state) => ({
      ...state,
      isPaused: true,
      player: { ...state.player, chargeStart: null }
    }))
  }, [])
  const resumeGame = React.useCallback(
    () =>
      setGameState((state) =>
        state.isGameOver || !state.hasStarted
          ? state
          : { ...state, isPaused: false }
      ),
    []
  )
  const resetGame = React.useCallback(() => {
    movement.current.clear()
    setGameState((state) => createInitialGameState(state.mode))
  }, [])
  const setMode = React.useCallback(
    (mode: GameMode) =>
      setGameState((state) =>
        state.hasStarted && !state.isGameOver
          ? state
          : createInitialGameState(mode)
      ),
    []
  )
  const updatePlayer = React.useCallback(
    (position: Position) =>
      setGameState((state) => movePlayer(state, position)),
    []
  )
  const setMovement = React.useCallback((keys: Set<string>) => {
    movement.current = keys
  }, [])
  const beginCharge = React.useCallback(
    () =>
      setGameState((state) =>
        canControl(state) && state.player.chargeStart === null
          ? {
              ...state,
              player: { ...state.player, chargeStart: state.elapsed }
            }
          : state
      ),
    []
  )
  const triggerExplosion = React.useCallback(
    () => setGameState(detonatePlayer),
    []
  )

  return (
    <GameContext.Provider
      value={{
        gameState,
        bestScore,
        storageError,
        startGame,
        pauseGame,
        resumeGame,
        resetGame,
        setMode,
        updatePlayer,
        setMovement,
        beginCharge,
        triggerExplosion
      }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = React.useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}
