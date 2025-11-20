'use client'

import * as React from 'react'
import type { GameState, PlayerShip, Position } from '@/types/game'
import { GAME_CONFIG } from '@/lib/game/constants'
import { updateGameLogic } from '@/lib/game/gameLogic'

interface GameContextValue {
  gameState: GameState
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
  updatePlayer: (position: Partial<Position>) => void
  triggerExplosion: () => void
}

const GameContext = React.createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = React.useState<GameState>(
    createInitialGameState()
  )
  const animationFrameRef = React.useRef<number>(0)
  const lastUpdateRef = React.useRef<number>(Date.now())

  // Game loop
  React.useEffect(() => {
    function gameLoop() {
      const currentTime = Date.now()
      setGameState((prev) => updateGameLogic(prev, currentTime))
      lastUpdateRef.current = currentTime
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    if (!gameState.isPaused && !gameState.isGameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState.isPaused, gameState.isGameOver])

  const startGame = React.useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: false, isGameOver: false }))
    lastUpdateRef.current = Date.now()
  }, [])

  const pauseGame = React.useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: true }))
  }, [])

  const resumeGame = React.useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: false }))
    lastUpdateRef.current = Date.now()
  }, [])

  const resetGame = React.useCallback(() => {
    setGameState(createInitialGameState())
    lastUpdateRef.current = Date.now()
  }, [])

  const updatePlayer = React.useCallback((position: Partial<Position>) => {
    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        position: { ...prev.player.position, ...position }
      }
    }))
  }, [])

  const triggerExplosion = React.useCallback(() => {
    setGameState((prev) => {
      if (prev.player.isExploding) return prev

      const currentTime = Date.now()

      return {
        ...prev,
        player: {
          ...prev.player,
          isExploding: true,
          explosionStartTime: currentTime
        },
        explosions: [
          ...prev.explosions,
          {
            id: `explosion-${currentTime}-player`,
            position: { ...prev.player.position },
            radius: 0,
            maxRadius: GAME_CONFIG.EXPLOSION_MAX_RADIUS,
            startTime: currentTime,
            duration: GAME_CONFIG.EXPLOSION_DURATION,
            chainDepth: 0
          }
        ]
      }
    })
  }, [])

  const contextValue: GameContextValue = {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    updatePlayer,
    triggerExplosion
  }

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  )
}

export function useGame() {
  const context = React.useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within GameProvider')
  }
  return context
}

function createInitialGameState(): GameState {
  return {
    player: createInitialPlayer(),
    enemies: [],
    explosions: [],
    score: 0,
    lives: GAME_CONFIG.PLAYER_INITIAL_LIVES,
    level: 1,
    isPaused: true,
    isGameOver: false,
    chainMultiplier: 1,
    maxChainDepth: 0,
    lastEnemySpawn: Date.now()
  }
}

function createInitialPlayer(): PlayerShip {
  return {
    id: 'player',
    position: {
      x: GAME_CONFIG.CANVAS_WIDTH / 2,
      y: GAME_CONFIG.CANVAS_HEIGHT / 2
    },
    velocity: { dx: 0, dy: 0 },
    radius: GAME_CONFIG.PLAYER_RADIUS,
    active: true,
    lives: GAME_CONFIG.PLAYER_INITIAL_LIVES,
    isExploding: false,
    explosionStartTime: null,
    explosionRadius: 0
  }
}
