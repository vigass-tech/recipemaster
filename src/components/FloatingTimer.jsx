import React, { useEffect } from 'react';

export default function FloatingTimer({
  timerState,
  onPause,
  onResume,
  onReset,
  onDismiss
}) {
  if (!timerState.isActive && timerState.secondsLeft === 0) {
    return null;
  }

  const { secondsLeft, isRunning, label, totalSeconds } = timerState;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isFinished = secondsLeft === 0;

  // Web Audio chime when timer completes
  useEffect(() => {
    if (isFinished && timerState.isActive) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2); // A5

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        // Fallback or silently pass if audioContext blocked
      }
    }
  }, [isFinished, timerState.isActive]);

  return (
    <div
      className="floating-timer"
      style={{
        borderColor: isFinished ? 'var(--accent-gold)' : 'var(--primary)',
        backgroundColor: isFinished ? 'rgba(229, 169, 60, 0.15)' : 'var(--bg-surface)'
      }}
    >
      <div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label || 'Cooking Timer'}
        </div>
        <div className="timer-digits" style={{ color: isFinished ? 'var(--accent-gold)' : 'var(--primary)' }}>
          {isFinished ? "⏰ TIME'S UP!" : timeString}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        {!isFinished && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={isRunning ? onPause : onResume}
            title={isRunning ? 'Pause' : 'Resume'}
          >
            {isRunning ? '⏸️' : '▶️'}
          </button>
        )}

        <button className="btn btn-secondary btn-sm" onClick={onReset} title="Reset">
          🔄
        </button>

        <button className="btn btn-ghost btn-sm" onClick={onDismiss} title="Dismiss Timer">
          ✕
        </button>
      </div>
    </div>
  );
}
