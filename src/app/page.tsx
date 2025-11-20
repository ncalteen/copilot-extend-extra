'use client'

import { GameProvider } from '@/contexts/GameContext'
import { GameCanvas } from '@/components/game/GameCanvas'
import { GameControls } from '@/components/game/GameControls'
import { GameHUD } from '@/components/game/GameHUD'
import { useGameControls } from '@/hooks/useGameControls'

function GameContent() {
  useGameControls()

  return (
    <div className="flex flex-col items-center gap-6">
      <GameHUD />
      <GameCanvas />
      <GameControls />
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <GameProvider>
          <GameContent />
        </GameProvider>
      </div>
    </div>
  )
}
