'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Award, Sparkles, RotateCcw } from 'lucide-react';
import { TeamId, Player } from '@/lib/types';
import { TEAMS } from '@/lib/teams';
import { sound } from '@/lib/sound';

interface PodiumProps {
  teams: Record<TeamId, { name: string; score: number; count: number }>;
  players: Record<string, Player>;
  onRestart: () => void;
}

export const Podium: React.FC<PodiumProps> = ({ teams, players, onRestart }) => {
  const sortedTeams = Object.keys(teams)
    .map((k) => {
      const id = k as TeamId;
      return {
        ...TEAMS[id],
        score: teams[id]?.score || 0,
        count: teams[id]?.count || 0,
      };
    })
    .sort((a, b) => b.score - a.score);

  const top1 = sortedTeams[0];
  const top2 = sortedTeams[1];
  const top3 = sortedTeams[2];
  const otherTeams = sortedTeams.slice(3);

  const teamMVPs: Record<TeamId, Player | null> = {
    tien_phong: null,
    tri_thuc: null,
    xung_kich: null,
    dan_toc_ton_giao: null,
    kieu_bao: null,
    ban_be_quoc_te: null,
  };

  Object.values(players).forEach((p) => {
    const currentMVP = teamMVPs[p.teamId];
    if (!currentMVP || p.score > currentMVP.score) {
      teamMVPs[p.teamId] = p;
    }
  });

  useEffect(() => {
    sound.playFanfare();

    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 50,
        origin: { x: 0, y: 0.7 },
        colors: ['#D97706', '#DC2626', '#2563EB', '#059669'],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 50,
        origin: { x: 1, y: 0.7 },
        colors: ['#D97706', '#DC2626', '#2563EB', '#059669'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Academic Honor Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold mb-3">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>BẢNG DANH DỰ HỌC THUẬT</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 tracking-tight">
          LỄ TỔNG KẾT & VINH DANH KHỐI LIÊN MINH
        </h2>
        <p className="text-slate-400 mt-2 text-xs sm:text-sm max-w-xl mx-auto">
          Chúc mừng tất cả các khối liên minh đã hoàn thành xuất sắc 10 câu hỏi lý luận và phân tích tình huống thực tiễn môn Tư tưởng Hồ Chí Minh.
        </p>
      </div>

      {/* Top 3 Academic Podium Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 items-end mb-10 max-w-4xl">
        {/* RANK 2 - SILVER */}
        {top2 && (
          <div className="order-2 md:order-1 flex flex-col items-center">
            <div className="w-full p-5 rounded-2xl academic-card border-slate-700/80 bg-slate-900/80 text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-slate-800 border border-slate-600 text-slate-200 font-bold text-sm flex items-center justify-center mb-3">
                🥈
              </div>
              <div className="text-2xl mb-1">{top2.icon}</div>
              <h3 className="text-base font-serif font-bold text-white mb-0.5">{top2.name}</h3>
              <div className="text-xl font-bold text-slate-200 font-mono">
                {top2.score.toLocaleString()} <span className="text-xs text-slate-400">điểm</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                MVP: <strong className="text-slate-200">{teamMVPs[top2.id]?.name || 'N/A'}</strong> (
                {teamMVPs[top2.id]?.score.toLocaleString() || 0}đ)
              </div>
            </div>
            <div className="w-full h-16 md:h-24 bg-slate-900 border-x border-t border-slate-800 rounded-t-xl mt-2 flex items-center justify-center text-slate-400 font-serif font-semibold text-sm">
              HẠNG NHÌ
            </div>
          </div>
        )}

        {/* RANK 1 - GOLD */}
        {top1 && (
          <div className="order-1 md:order-2 flex flex-col items-center">
            <div className="relative w-full p-6 rounded-2xl academic-card-gold border-amber-500/50 bg-slate-900 text-center shadow-lg">
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mb-3">
                <Trophy className="w-3 h-3" />
                <span>QUÁN QUÂN ARENA</span>
              </div>

              <div className="text-3xl mb-1">{top1.icon}</div>
              <h3 className="text-lg font-serif font-bold text-amber-300 mb-0.5">{top1.name}</h3>
              <p className="text-[11px] text-slate-400 italic mb-2">"{top1.slogan}"</p>
              <div className="text-3xl font-bold text-amber-400 font-mono">
                {top1.score.toLocaleString()} <span className="text-xs text-amber-300/80">điểm</span>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs text-amber-200/90">
                ⭐ MVP: <strong className="text-white">{teamMVPs[top1.id]?.name || 'N/A'}</strong> (
                {teamMVPs[top1.id]?.score.toLocaleString() || 0}đ)
              </div>
            </div>
            <div className="w-full h-24 md:h-36 bg-amber-950/30 border-x border-t border-amber-800/40 rounded-t-xl mt-2 flex items-center justify-center text-amber-400 font-serif font-bold text-base">
              QUÁN QUÂN
            </div>
          </div>
        )}

        {/* RANK 3 - BRONZE */}
        {top3 && (
          <div className="order-3 md:order-3 flex flex-col items-center">
            <div className="w-full p-5 rounded-2xl academic-card border-slate-700/80 bg-slate-900/80 text-center">
              <div className="w-9 h-9 mx-auto rounded-full bg-slate-800 border border-slate-600 text-slate-300 font-bold text-sm flex items-center justify-center mb-3">
                🥉
              </div>
              <div className="text-2xl mb-1">{top3.icon}</div>
              <h3 className="text-base font-serif font-bold text-white mb-0.5">{top3.name}</h3>
              <div className="text-xl font-bold text-slate-300 font-mono">
                {top3.score.toLocaleString()} <span className="text-xs text-slate-400">điểm</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                MVP: <strong className="text-slate-200">{teamMVPs[top3.id]?.name || 'N/A'}</strong> (
                {teamMVPs[top3.id]?.score.toLocaleString() || 0}đ)
              </div>
            </div>
            <div className="w-full h-12 md:h-16 bg-slate-900 border-x border-t border-slate-800 rounded-t-xl mt-2 flex items-center justify-center text-slate-400 font-serif font-semibold text-xs">
              HẠNG BA
            </div>
          </div>
        )}
      </div>

      {/* Ranks 4, 5, 6 Minimalist Table */}
      {otherTeams.length > 0 && (
        <div className="w-full max-w-3xl mb-8">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            CÁC KHỐI LIÊN MINH ĐỒNG HẠNG
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {otherTeams.map((team, idx) => (
              <div
                key={team.id}
                className="p-3.5 rounded-xl academic-card border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{idx + 4}
                  </span>
                  <div>
                    <div className="font-semibold text-xs text-slate-200 flex items-center space-x-1">
                      <span>{team.icon}</span>
                      <span>{team.shortName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                      MVP: {teamMVPs[team.id]?.name || 'N/A'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-slate-300">
                  {team.score.toLocaleString()}đ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restart Button */}
      <button
        onClick={() => {
          sound.playClick();
          onRestart();
        }}
        className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center space-x-2 border border-slate-700 transition-colors"
      >
        <RotateCcw className="w-4 h-4 text-slate-400" />
        <span>TỔ CHỨC TRẬN ĐẤU MỚI</span>
      </button>
    </div>
  );
};
