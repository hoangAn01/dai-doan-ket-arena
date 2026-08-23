'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, GraduationCap, Users, BookOpen, LogOut } from 'lucide-react';
import { sound } from '@/lib/sound';

interface HeaderProps {
  pin?: string;
  round?: 1 | 2;
  totalPlayers?: number;
  showBack?: boolean;
  onBackClick?: () => void;
  endButtonText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  pin,
  round,
  totalPlayers,
  showBack = false,
  onBackClick,
  endButtonText = 'Thoát',
}) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sound.isMuted());
  }, []);

  const handleToggleSound = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      sound.playClick();
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    if (onBackClick) {
      e.preventDefault();
      sound.playClick();
      onBackClick();
    } else {
      sound.playClick();
    }
  };

  return (
    <header className="w-full px-4 py-3.5 md:px-8 academic-card border-b border-slate-800/80 sticky top-0 z-50 bg-[#090D16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Academic Title */}
        <Link
          href="/"
          onClick={() => sound.playClick()}
          className="flex items-center space-x-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 group-hover:border-amber-500/50 transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-base md:text-lg text-slate-100 tracking-wide group-hover:text-amber-300 transition-colors">
                ĐẠI ĐOÀN KẾT ARENA
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-950/60 border border-red-800/60 text-red-300">
                HCM202
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
              Tư tưởng Hồ Chí Minh · 6 Khối liên minh học thuật
            </p>
          </div>
        </Link>

        {/* Center Room Status (If active) */}
        {pin && (
          <div className="flex items-center space-x-2 md:space-x-3">
            {round && (
              <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs md:text-sm font-medium flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Vòng {round}</span>
              </div>
            )}
            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs md:text-sm font-mono font-semibold">
              PIN: <strong className="text-amber-400 tracking-wider">{pin}</strong>
            </div>
            {totalPlayers !== undefined && (
              <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs md:text-sm font-medium hidden md:flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{totalPlayers}/30 Sinh viên</span>
              </div>
            )}
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleSound}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {showBack && (
            onBackClick ? (
              <button
                onClick={handleBack}
                className="text-xs md:text-sm px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-semibold transition-colors flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{endButtonText}</span>
              </button>
            ) : (
              <Link
                href="/"
                onClick={() => sound.playClick()}
                className="text-xs md:text-sm px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                {endButtonText}
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
};
