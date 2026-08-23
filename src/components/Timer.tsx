'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { sound } from '@/lib/sound';

interface TimerProps {
  timeLimit: number; // in seconds
  startTime: number; // timestamp in ms
  onTimeUp?: () => void;
  isPaused?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  timeLimit,
  startTime,
  onTimeUp,
  isPaused = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);

  useEffect(() => {
    if (isPaused || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);

      setTimeLeft(remaining);

      if (remaining > 0 && remaining <= 5) {
        sound.playUrgentTick();
      } else if (remaining > 5) {
        sound.playTick();
      }

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, startTime, isPaused, onTimeUp]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100));
  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 10 && !isUrgent;

  return (
    <div className="flex flex-col items-center">
      {/* Minimalist Academic Timer Badge */}
      <div
        className={`px-5 py-2 rounded-xl border flex items-center space-x-2.5 transition-colors duration-300 ${
          isUrgent
            ? 'border-red-600 bg-red-950/50 text-red-300 animate-pulse'
            : isWarning
            ? 'border-amber-600/70 bg-amber-950/40 text-amber-300'
            : 'border-slate-700 bg-slate-900/90 text-slate-200'
        }`}
      >
        <Clock
          className={`w-4 h-4 ${
            isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-slate-400'
          }`}
        />
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold font-mono tracking-tight">
            {timeLeft}
          </span>
          <span className="text-xs text-slate-400 font-medium">giây</span>
        </div>
      </div>

      {/* Sleek Line Progress */}
      <div className="w-36 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700/50">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isUrgent
              ? 'bg-red-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-slate-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
