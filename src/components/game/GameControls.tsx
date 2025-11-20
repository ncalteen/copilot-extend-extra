'use client'

import { Button } from '@/components/ui/button'
import { useGame } from '@/contexts/GameContext'
import { Play, Pause, RotateCcw } from 'lucide-react'

export function GameControls() {
  const { gameState, startGame, pauseGame, resetGame } = useGame()

  return (
    <div className="flex gap-4">
      {gameState.isPaused ? (
        <Button onClick={gameState.isGameOver ? resetGame : startGame}>
          <Play className="mr-2 size-4" />
          {gameState.isGameOver ? 'New Game' : 'Start'}
        </Button>
      ) : (
        <Button onClick={pauseGame} variant="outline">
          <Pause className="mr-2 size-4" />
          Pause
        </Button>
      )}

      <Button onClick={resetGame} variant="outline">
        <RotateCcw className="mr-2 size-4" />
        Reset
      </Button>
    </div>
  )
}
