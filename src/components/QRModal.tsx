'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode } from 'lucide-react';
import { sound } from '@/lib/sound';

interface QRModalProps {
  pin: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ pin, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/play?pin=${pin}`
      : `https://arena.edu.vn/play?pin=${pin}`;

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-700 text-center shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center space-x-2 text-slate-200 mb-1">
          <QrCode className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-serif font-bold">MÃ QUÉT THAM GIA LỚP HỌC</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Quét camera hoặc truy cập <strong className="text-slate-200">/play</strong>
        </p>

        {/* QR Code Container */}
        <div className="flex justify-center p-3 bg-white rounded-xl mx-auto max-w-[220px]">
          <QRCodeSVG
            value={joinUrl}
            size={190}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* PIN Code Box */}
        <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            MÃ PIN PHÒNG
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono tracking-widest mt-0.5">
            {pin}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>ĐÃ SAO CHÉP ĐƯỜNG DẪN</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>SAO CHÉP LIÊN KẾT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
