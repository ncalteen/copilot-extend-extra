'use client'

import { Clock3, Diamond, Trophy, Zap } from 'lucide-react'
import { useGame } from '@/contexts/GameContext'

export function GameHUD() {
  const { gameState: state, bestScore } = useGame()
  const seconds = Math.ceil(state.timeLeft / 1000)
  return (
    <div className="game-hud">
      <div className="stat score-stat">
        <div className="stat-label">
          <span className="tiny-square" /> SCORE
        </div>
        <strong data-testid="score">
          {String(state.score).padStart(7, '0')}
        </strong>
        <span className="stat-foot">
          <Trophy /> BEST{' '}
          <b>
            {Math.max(bestScore, state.isGameOver ? state.score : 0)
              .toLocaleString()
              .padStart(7, '0')}
          </b>
        </span>
      </div>
      <div className={`stat ${seconds <= 15 ? 'time-warning' : ''}`}>
        <div className="stat-label">
          <Clock3 /> TIME REMAINING
        </div>
        <strong data-testid="timer">
          {String(Math.floor(seconds / 60)).padStart(2, '0')}
          <span className="stat-colon">:</span>
          {String(seconds % 60).padStart(2, '0')}
          <small>.{Math.floor((state.timeLeft % 1000) / 100)}</small>
        </strong>
        <span className="stat-foot">EVERY SECOND COUNTS</span>
      </div>
      <div className="stat">
        <div className="stat-label">
          <Diamond /> STOCK
        </div>
        <strong data-testid="stock">
          {String(state.lives).padStart(2, '0')}
          <span className="stock-diamonds">
            {Array.from({ length: Math.min(state.lives, 7) }, (_, i) => (
              <Diamond key={i} className="fill-current" />
            ))}
          </span>
        </strong>
        <span className="stat-foot">
          NEXT EXTEND <b>{state.nextExtend.toLocaleString()}</b>
        </span>
      </div>
      <div className="stat">
        <div className="stat-label">
          <Zap /> BEST CHAIN
        </div>
        <strong data-testid="best-chain">
          {String(state.bestChain).padStart(2, '0')}
          <small> HITS</small>
        </strong>
        <span className="stat-foot">
          <span className="text-lime">
            {state.chainCount ? 'CHAIN ACTIVE' : 'WAIT FOR YOUR MOMENT'}
          </span>
        </span>
      </div>
    </div>
  )
}
