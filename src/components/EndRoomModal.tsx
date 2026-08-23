'use client';

import React from 'react';
import { X, Trophy, LogOut, AlertTriangle } from 'lucide-react';
import { sound } from '@/lib/sound';

interface EndRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishEarly: () => void;
  onCloseRoom: () => void;
}

export const EndRoomModal: React.FC<EndRoomModalProps> = ({
  isOpen,
  onClose,
  onFinishEarly,
  onCloseRoom,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl academic-card border-amber-500/40 bg-slate-900 shadow-2xl p-6">
        {/* Close Modal Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          title="Hủy thao tác"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 pr-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-100">
              KẾT THÚC PHÒNG HỌC
            </h2>
            <p className="text-xs text-slate-400">
              Vui lòng chọn hình thức kết thúc trận đấu
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Bạn đang điều hành phòng đấu với vai trò Quản trò. Việc kết thúc phòng sẽ ảnh hưởng đến tất cả các thành viên đang tham gia.
        </p>

        {/* Option Buttons */}
        <div className="space-y-3">
          {/* Option 1: Finish early & show Podium */}
          <button
            onClick={() => {
              sound.playClick();
              onFinishEarly();
              onClose();
            }}
            className="w-full p-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-left transition-colors flex items-center space-x-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-amber-300">
                🏆 Tổng kết & Trao giải ngay
              </div>
              <div className="text-[11px] text-slate-400">
                Chuyển thẳng đến Bảng Vàng Vinh Danh & Podium khen thưởng các Khối.
              </div>
            </div>
          </button>

          {/* Option 2: Close room completely */}
          <button
            onClick={() => {
              sound.playClick();
              onCloseRoom();
              onClose();
            }}
            className="w-full p-3.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-left transition-colors flex items-center space-x-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 shrink-0 group-hover:scale-105 transition-transform">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-red-400">
                🚪 Đóng phòng & Giải tán sảnh
              </div>
              <div className="text-[11px] text-slate-400">
                Hủy bỏ phòng học, đưa tất cả sinh viên về lại Trang Chủ.
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors border border-slate-700"
          >
            QUAY LẠI TRẬN ĐẤU
          </button>
        </div>
      </div>
    </div>
  );
};
