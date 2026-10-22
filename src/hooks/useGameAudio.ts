'use client'

import * as React from 'react'
import { useGame } from '@/contexts/GameContext'

export function useGameAudio() {
  const { gameState } = useGame()
  const [enabled, setEnabled] = React.useState(false)
  const [error, setError] = React.useState('')
  const audio = React.useRef<AudioContext | null>(null)
  const lastSound = React.useRef(0)
  const previousScore = React.useRef(0)

  const tone = React.useCallback((frequency: number) => {
    const ctx = audio.current
    if (!ctx || ctx.state !== 'running') return
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 0.5,
      ctx.currentTime + 0.16
    )
    gain.gain.setValueAtTime(0.055, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.21)
    oscillator.onended = () => {
      oscillator.disconnect()
      gain.disconnect()
    }
  }, [])

  async function toggle() {
    if (enabled) {
      setEnabled(false)
      return
    }
    try {
      if (!audio.current) audio.current = new AudioContext()
      await audio.current.resume()
      setEnabled(true)
      setError('')
      tone(440)
    } catch (cause) {
      console.warn('Audio could not be enabled.', cause)
      setError('Audio is unavailable in this browser.')
    }
  }

  React.useEffect(() => {
    if (
      enabled &&
      !gameState.isPaused &&
      gameState.score > previousScore.current &&
      performance.now() - lastSound.current > 80
    ) {
      tone(220 + Math.min(gameState.chainCount, 24) * 32)
      lastSound.current = performance.now()
    }
    previousScore.current = gameState.score
  }, [gameState.score, gameState.chainCount, gameState.isPaused, enabled, tone])

  React.useEffect(
    () => () => {
      void audio.current?.close()
    },
    []
  )
  return { enabled, toggle, error }
}
