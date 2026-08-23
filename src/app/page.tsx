'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, MonitorPlay, Users, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { TEAM_LIST } from '@/lib/teams';
import { sound } from '@/lib/sound';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 flex flex-col items-center justify-center">
        {/* Academic Course Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 text-xs font-medium mb-6">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>TƯ TƯỞNG HỒ CHÍ MINH · HCM202 · CHƯƠNG V</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-center text-slate-100 max-w-4xl tracking-tight leading-tight">
          ĐẠI ĐOÀN KẾT ARENA
        </h1>

        <p className="text-slate-400 text-center text-sm sm:text-base max-w-2xl mt-3 mb-10 font-normal leading-relaxed">
          Nền tảng tương tác học thuật lớp học dành cho 30 sinh viên — Chia đều 6 Khối liên minh, cùng nghiên cứu và tranh tài qua 2 vòng đấu lý luận và tình huống thực tiễn.
        </p>

        {/* 2 Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl mb-14">
          {/* Card 1: Host (Quản trò / Máy chiếu) */}
          <Link
            href="/host"
            onClick={() => sound.playClick()}
            className="group relative p-6 sm:p-7 rounded-2xl academic-card border-slate-800 hover:border-amber-500/40 bg-slate-900/70 hover:bg-slate-900 transition-all flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium uppercase tracking-wider">
                  Giảng viên / Quản trò
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-amber-400 transition-colors">
                  <MonitorPlay className="w-4 h-4" />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Màn hình Máy chiếu (Host)
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Khởi tạo phòng, hiển thị mã PIN & mã QR, điều phối 10 câu hỏi lý luận, thống kê phân bổ đáp án và bảng vinh danh.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-slate-300 group-hover:text-amber-400 font-semibold text-xs sm:text-sm transition-colors">
              <span>BẮT ĐẦU TẠO PHÒNG HỌC</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Player (Sinh viên / Điện thoại) */}
          <Link
            href="/play"
            onClick={() => sound.playClick()}
            className="group relative p-6 sm:p-7 rounded-2xl academic-card border-slate-800 hover:border-amber-500/40 bg-slate-900/70 hover:bg-slate-900 transition-all flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium uppercase tracking-wider">
                  Sinh viên tham gia
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-amber-400 transition-colors">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Thiết bị Người chơi (Play)
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Nhập mã PIN, đăng ký họ tên, chọn 1 trong 6 Khối liên minh (5 sinh viên/khối) và tham gia trả lời câu hỏi trực tiếp.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-slate-300 group-hover:text-amber-400 font-semibold text-xs sm:text-sm transition-colors">
              <span>THAM GIA PHÒNG NGAY</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* 6 Alliances Academic Showcase */}
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-center space-x-2 text-slate-400 mb-6">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-slate-300">
              HỆ THỐNG 6 KHỐI LIÊN MINH (5 THÀNH VIÊN / ĐỘI)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEAM_LIST.map((team) => (
              <div
                key={team.id}
                className="p-4 rounded-xl academic-card border-slate-800/90 hover:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2.5 mb-2">
                    <span className="text-2xl">{team.icon}</span>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-slate-100">{team.name}</h4>
                      <p className="text-[11px] text-amber-400/90 font-medium italic">
                        "{team.slogan}"
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2 border-t border-slate-800/60 pt-2">
                    {team.meaning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
        <p>
          🇻🇳 <strong>Đại Đoàn Kết Arena</strong> · Môn Tư tưởng Hồ Chí Minh - HCM202 · Tương tác 30 người chơi thời gian thực
        </p>
      </footer>
    </div>
  );
}
