'use client'

import * as React from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  AudioLines,
  ChevronRight,
  CircleHelp,
  Clock3,
  Diamond,
  Github,
  MousePointer2,
  Sparkles,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react'
import { GameProvider, useGame } from '@/contexts/GameContext'
import { GameCanvas } from '@/components/game/GameCanvas'
import { GameControls } from '@/components/game/GameControls'
import { GameHUD } from '@/components/game/GameHUD'
import { Button } from '@/components/ui/button'
import { useGameControls } from '@/hooks/useGameControls'
import { useGameAudio } from '@/hooks/useGameAudio'
import { cn } from '@/lib/utils'

function GameContent() {
  useGameControls()
  const { gameState: state, setMode, storageError } = useGame()
  const { enabled, toggle, error } = useGameAudio()
  const [showHelp, setShowHelp] = React.useState(false)
  const modeDisabled = state.hasStarted && !state.isGameOver

  return (
    <div className="arcade-app">
      <header className="site-header">
        <a className="brand" href="#main" aria-label="RE:ACT home">
          <span className="brand-symbol">
            <AudioLines />
          </span>
          <span>
            RE<span className="text-lime">:</span>ACT
            <small>CHAIN REACTION ARCADE</small>
          </span>
        </a>
        <nav className="header-actions" aria-label="Game settings">
          <span className="version-label">INDEPENDENT ARCADE / 001</span>
          <Button
            variant="ghost"
            className="how-to-button"
            aria-label="How to play"
            aria-expanded={showHelp}
            aria-controls="how-to-play"
            onClick={() => setShowHelp(!showHelp)}>
            <CircleHelp />
            <span>How to play</span>
          </Button>
          <span className="header-divider" />
          <Button
            variant="ghost"
            size="icon"
            aria-label={enabled ? 'Mute audio' : 'Enable audio'}
            aria-pressed={enabled}
            onClick={toggle}>
            {enabled ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/ncalteen/copilot-extend-extra"
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub">
              <Github />
            </a>
          </Button>
        </nav>
      </header>
      <main id="main" className="main-content">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="status-dot live" /> A LITTLE CHAOS. A LOT OF
              POSSIBILITIES.
            </div>
            <h1>
              One spark changes <span>everything.</span>
            </h1>
            <p>
              No bullets. No running away. Just you, a perfect moment, and a
              chain reaction.
            </p>
          </div>
          <span className="session-tag">
            <span className="status-dot" /> LOCAL ARCADE
            <span className="session-tag-bottom">NO DOWNLOAD. JUST PLAY.</span>
          </span>
        </div>
        {showHelp && (
          <section id="how-to-play" className="help-panel">
            <h2>Make your first reaction</h2>
            <p>
              Move with WASD, arrow keys, or your mouse. On touch screens, drag
              the playfield to move. Hold Space, a mouse click, or the Detonate
              button to charge; release to explode. Each blast costs one stock.
              Destroyed enemies explode too, creating chains. You return when
              the chain ends; collect the colored drops before starting the next
              chain.
            </p>
            <p>
              Hits score 10, 20, 40… up to 2,560 each. Earn extra stock at the
              next-extend score; each later threshold is higher. Avoid enemies:
              a collision costs one stock and five seconds. Press P or Escape to
              pause. The game also pauses when you leave the window. Runs end at
              zero time or zero stock after the final chain resolves.
            </p>
          </section>
        )}
        {(error || storageError) && (
          <p className="system-warning" role="status">
            {error ||
              'High scores cannot be saved in this browser. Your game will still work.'}
          </p>
        )}
        <div className="game-layout">
          <div className="play-column">
            <GameHUD />
            <GameCanvas />
            <GameControls />
            <div className="play-caption">
              <span>
                <Sparkles /> BEAUTIFUL THINGS START WITH A LITTLE DESTRUCTION.
              </span>
              <span>BUILT TO PLAY. NOT TO PAY.</span>
            </div>
          </div>
          <aside className="game-sidebar" aria-label="Game guide">
            <section className="sidebar-card mode-card">
              <div className="section-heading">
                <span>01 / SELECT FREQUENCY</span>
                <AudioLines />
              </div>
              <div
                className="mode-buttons"
                role="group"
                aria-label="Difficulty">
                <Button
                  disabled={modeDisabled}
                  aria-pressed={state.mode === 'standard'}
                  className={cn(
                    'mode-option',
                    state.mode === 'standard' && 'selected'
                  )}
                  onClick={() => setMode('standard')}>
                  STANDARD
                </Button>
                <Button
                  disabled={modeDisabled}
                  aria-pressed={state.mode === 'overdrive'}
                  className={cn(
                    'mode-option',
                    state.mode === 'overdrive' && 'selected'
                  )}
                  onClick={() => setMode('overdrive')}>
                  OVERDRIVE <Zap className="size-3" />
                </Button>
              </div>
              <p>
                {state.mode === 'standard'
                  ? 'Find your rhythm. Make your mark.'
                  : 'Faster signals. Denser waves. Bigger risks.'}
              </p>
              <div className="mode-spec">
                <span>
                  <Clock3 /> 90 SEC
                </span>
                <span>
                  <Diamond /> 5 STOCK
                </span>
                <span>∞ POTENTIAL</span>
              </div>
            </section>
            <section className="sidebar-card guide-card">
              <div className="section-heading">
                <span>02 / THE CHAIN OF EVENTS</span>
                <ArrowDownRight />
              </div>
              <div className="guide-step">
                <span className="step-icon">
                  <MousePointer2 />
                </span>
                <div>
                  <h3>Find your moment.</h3>
                  <p>
                    Drift into a cluster. A little patience goes a long way.
                  </p>
                </div>
                <span className="step-number">01</span>
              </div>
              <div className="guide-step">
                <span className="step-icon">
                  <Zap />
                </span>
                <div>
                  <h3>Be the spark.</h3>
                  <p>
                    Hold to charge. Release to detonate. One stock, one big
                    opportunity.
                  </p>
                </div>
                <span className="step-number">02</span>
              </div>
              <div className="guide-step">
                <span className="step-icon">
                  <Sparkles />
                </span>
                <div>
                  <h3>Let it unfold.</h3>
                  <p>
                    Every enemy becomes a new blast. Longer chains. Bigger
                    scores.
                  </p>
                </div>
                <span className="step-number">03</span>
              </div>
              <div className="guide-tip">
                <span className="text-lime">↳</span> The best shot is the one
                you don&apos;t take. <strong>You don&apos;t have a gun.</strong>
              </div>
            </section>
            <section className="sidebar-card signals-card">
              <div className="section-heading">
                <span>03 / KNOW YOUR SIGNALS</span>
                <Diamond />
              </div>
              <div className="signal-row">
                <span className="signal-icon signal-enemy" />
                <div>
                  <strong>DRIFTER</strong>
                  <p>Your chain starts here.</p>
                </div>
                <span className="signal-value">10+</span>
              </div>
              <div className="signal-row">
                <span className="signal-icon signal-bonus" />
                <div>
                  <strong>BONUS</strong>
                  <p>Collect for stacking points.</p>
                </div>
                <span className="signal-value">+800</span>
              </div>
              <div className="signal-row">
                <span className="signal-icon signal-quicken" />
                <div>
                  <strong>QUICKEN</strong>
                  <p>More enemies. More possibility.</p>
                </div>
                <ChevronRight className="signal-value size-3" />
              </div>
              <div className="signal-row">
                <span className="signal-icon signal-time" />
                <div>
                  <strong>TIME EXTEND</strong>
                  <p>A little longer in the moment.</p>
                </div>
                <span className="signal-value">+10s</span>
              </div>
              <div className="signal-row">
                <span className="signal-icon signal-pulse" />
                <div>
                  <strong>PULSE</strong>
                  <p>A wider blast. A bigger ripple.</p>
                </div>
                <span className="signal-value">×1.8</span>
              </div>
            </section>
            <div className="sidebar-note">
              <span className="text-lime">✳</span>
              <p>
                Destruction is just
                <br />
                creation in a different direction.
              </p>
              <ArrowUpRight />
            </div>
          </aside>
        </div>
      </main>
      <footer className="site-footer">
        <span className="footer-brand">
          RE:ACT <span> / </span> AN EXPERIMENT IN CHAIN REACTIONS
        </span>
        <a
          href="https://en.wikipedia.org/wiki/Every_Extend"
          target="_blank"
          rel="noreferrer">
          Inspired by Every Extend. Made to be its own thing. <ArrowUpRight />
        </a>
        <span className="footer-status">
          <span className="status-dot live" /> ALL SYSTEMS PLAY
        </span>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}
