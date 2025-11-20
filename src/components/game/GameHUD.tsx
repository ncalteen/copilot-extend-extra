'use client'

import { useGame } from '@/contexts/GameContext'

export function GameHUD() {
  const { gameState } = useGame()

  return (
    <div className="w-full max-w-[800px]">
      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <h1 className="mb-4 text-2xl font-bold">Copilot Extend Extra</h1>

        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <div className="text-muted-foreground">Score</div>
            <div className="text-xl font-bold">{gameState.score}</div>
          </div>

          <div>
            <div className="text-muted-foreground">Lives</div>
            <div className="text-xl font-bold">{gameState.lives}</div>
          </div>

          <div>
            <div className="text-muted-foreground">Level</div>
            <div className="text-xl font-bold">{gameState.level}</div>
          </div>

          <div>
            <div className="text-muted-foreground">Max Chain</div>
            <div className="text-xl font-bold">{gameState.maxChainDepth}</div>
          </div>
        </div>

        {gameState.isGameOver && (
          <div className="mt-4 rounded-md border border-destructive bg-destructive/10 p-3">
            <p className="text-center font-bold text-destructive">Game Over!</p>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <p className="mb-2 font-semibold">Controls:</p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <p>• WASD or Arrow Keys - Move</p>
          <p>• Space - Explode</p>
        </div>
      </div>
    </div>
  )
}
