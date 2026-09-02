'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Trophy,
  Shield,
  Clock,
  Award,
  BookOpen,
  ArrowLeft,
  Zap,
  HelpCircle,
  X,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { RoomState, TeamId, Player } from '@/lib/types';
import { TEAMS, TEAM_LIST } from '@/lib/teams';
import { QUESTIONS } from '@/lib/questions';
import { sound } from '@/lib/sound';
import {
  getRoomState,
  subscribeToRoom,
  joinRoom,
  submitAnswer,
  leaveRoom,
} from '@/lib/roomManager';

export default function PlayPage() {
  const [pin, setPin] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);

  // Đọc PIN từ URL hoặc sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPin = params.get('pin');
    const savedPlayerId = typeof window !== 'undefined' ? sessionStorage.getItem('arena_player_id') : null;
    const savedPin = typeof window !== 'undefined' ? sessionStorage.getItem('arena_player_pin') : null;
    const savedName = typeof window !== 'undefined' ? sessionStorage.getItem('arena_player_name') : null;

    if (urlPin) {
      setPin(urlPin);
    } else if (savedPin) {
      setPin(savedPin);
    }

    if (savedPlayerId) setPlayerId(savedPlayerId);
    if (savedName) setPlayerName(savedName);
  }, []);

  // Lắng nghe cập nhật phòng thời gian thực khi có PIN
  useEffect(() => {
    if (!pin || pin.length < 4) return;

    getRoomState(pin).then((r) => {
      if (r) setRoom(r);
    });

    const unsubscribe = subscribeToRoom(pin, (updated) => {
      if (updated) {
        setRoom(updated);
      }
    });

    return () => unsubscribe();
  }, [pin]);

  const currentPlayer: Player | undefined =
    room && playerId ? room.players?.[playerId] : undefined;

  // Xử lý tham gia phòng
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!pin || pin.length < 4) {
      setErrorMessage('Vui lòng nhập mã PIN 4 chữ số!');
      return;
    }
    if (!playerName.trim()) {
      setErrorMessage('Vui lòng điền họ và tên của bạn!');
      return;
    }
    if (!selectedTeamId) {
      setErrorMessage('Vui lòng chọn 1 trong 6 Khối liên minh!');
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    try {
      const result = await joinRoom(pin, playerName, selectedTeamId, playerId || undefined);
      setIsSubmitting(false);

      if (result.success && result.playerId) {
        setPlayerId(result.playerId);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('arena_player_id', result.playerId);
          sessionStorage.setItem('arena_player_pin', pin);
          sessionStorage.setItem('arena_player_name', playerName);
        }
        if (result.room) {
          setRoom(result.room);
        }
      } else {
        setErrorMessage(result.message || 'Không thể tham gia phòng lúc này.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Lỗi kết nối, vui lòng thử lại.');
    }
  };

  // Xử lý trả lời câu hỏi
  const handleAnswer = async (index: number) => {
    if (!room || !playerId || room.status !== 'QUESTION') return;
    const isAnsweredForThisQ =
      selectedAnswer !== null ||
      (currentPlayer?.lastAnswer !== undefined &&
        currentPlayer?.lastAnswerQuestionIndex === room.currentQuestionIndex);
    if (isAnsweredForThisQ) return;

    setSelectedAnswer(index);
    sound.playClick();

    const timeUsed = Math.max(0.5, (Date.now() - room.questionStartTime) / 1000);
    const res = await submitAnswer(pin, playerId, room.currentQuestionIndex, index, timeUsed);

    if (res.isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  // Thoát hoặc đổi khối / đổi phòng
  const handleLeaveRoom = async () => {
    sound.playClick();
    if (pin && playerId) {
      await leaveRoom(pin, playerId);
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('arena_player_id');
      sessionStorage.removeItem('arena_player_pin');
    }
    setPlayerId('');
    setSelectedAnswer(null);
  };

  useEffect(() => {
    if (room?.status === 'QUESTION') {
      setSelectedAnswer(null);
    }
  }, [room?.currentQuestionIndex, room?.status]);

  const currentQ = room ? QUESTIONS[room.currentQuestionIndex] : null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      <Header
        pin={room?.pin || pin}
        round={room?.round}
        showBack={Boolean(currentPlayer)}
        onBackClick={handleLeaveRoom}
        endButtonText="Thoát khối"
      />

      <main className="flex-1 w-full max-w-lg md:max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col justify-center">
        {/* =========================================================================
            1. MÀN HÌNH ĐĂNG KÝ (CHƯA VÀO PHÒNG)
           ========================================================================= */}
        {!currentPlayer && (
          <div className="max-w-md w-full mx-auto p-5 sm:p-7 rounded-2xl academic-card border-slate-700/80 bg-slate-900/90 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 mx-auto mb-2.5 shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-100">
                THAM GIA PHÒNG HỌC
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Điền thông tin và chọn 1 trong 6 Khối liên minh (5 sinh viên/khối)
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs text-center font-medium animate-in fade-in">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  MÃ PIN PHÒNG (4 SỐ)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold text-2xl tracking-widest text-center focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  HỌ VÀ TÊN SINH VIÊN
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  CHỌN KHỐI LIÊN MINH
                </label>

                <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {TEAM_LIST.map((team) => {
                    const currentCount =
                      room && room.players
                        ? Object.values(room.players).filter((p) => p.teamId === team.id)
                            .length
                        : 0;
                    const isFull = currentCount >= 5;
                    const isSelected = selectedTeamId === team.id;

                    return (
                      <button
                        type="button"
                        key={team.id}
                        disabled={isFull}
                        onClick={() => {
                          sound.playClick();
                          setSelectedTeamId(team.id);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/50 shadow-md'
                            : isFull
                            ? 'opacity-40 border-slate-800 bg-slate-950/40 cursor-not-allowed'
                            : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{team.icon}</span>
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isFull
                                ? 'bg-red-950 text-red-400'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {currentCount}/5
                          </span>
                        </div>
                        <div className="font-serif font-bold text-xs text-slate-200 truncate">
                          {team.shortName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {team.slogan}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedTeamId}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg active:scale-[0.99]"
              >
                {isSubmitting ? 'ĐANG KẾT NỐI...' : 'VÀO PHÒNG HỌC'}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            2. MÀN HÌNH SẢNH CHỜ TRONG PHÒNG (STATUS: LOBBY)
           ========================================================================= */}
        {currentPlayer && room && room.status === 'LOBBY' && (
          <div className="max-w-lg w-full mx-auto p-6 sm:p-8 rounded-3xl academic-card border-slate-700/80 bg-slate-900/90 text-center shadow-2xl">
            <div className="text-4xl mb-2">{TEAMS[currentPlayer.teamId]?.icon}</div>
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              {TEAMS[currentPlayer.teamId]?.name}
            </span>
            <h2 className="text-2xl font-serif font-bold text-white mt-3">{currentPlayer.name}</h2>
            <p className="text-xs sm:text-sm text-slate-400 italic mt-1">
              "{TEAMS[currentPlayer.teamId]?.slogan}"
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center space-x-3 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs sm:text-sm text-slate-300 font-medium">
                Đang chờ quản trò bấm bắt đầu trận đấu...
              </span>
            </div>

            <div className="text-left mb-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase mb-2.5">
                <span>THÀNH VIÊN TRONG KHỐI</span>
                <span className="font-mono text-amber-400">
                  {
                    Object.values(room.players).filter(
                      (p) => p.teamId === currentPlayer.teamId
                    ).length
                  }
                  /5 sinh viên
                </span>
              </div>

              <div className="space-y-1.5">
                {Object.values(room.players)
                  .filter((p) => p.teamId === currentPlayer.teamId)
                  .map((p, idx) => (
                    <div
                      key={p.id}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between ${
                        p.id === currentPlayer.id
                          ? 'bg-amber-950/40 border border-amber-800/50 text-amber-200 font-semibold shadow-sm'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>
                        #{idx + 1} {p.name} {p.id === currentPlayer.id && '(Bạn)'}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={handleLeaveRoom}
              className="text-xs text-slate-400 hover:text-slate-200 underline pt-2 transition-colors"
            >
              Đổi thông tin hoặc chọn khối khác
            </button>
          </div>
        )}

        {/* =========================================================================
            3. MÀN HÌNH CHUYỂN TIẾP VÒNG 2 (STATUS: ROUND_TRANSITION)
           ========================================================================= */}
        {currentPlayer && room && room.status === 'ROUND_TRANSITION' && (
          <div className="max-w-2xl w-full mx-auto p-6 sm:p-8 rounded-3xl academic-card-gold border border-amber-500/60 bg-slate-900/95 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-3.5 shadow-md">
              <Zap className="w-7 h-7" />
            </div>

            <span className="px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-bold uppercase tracking-wider">
              VÒNG 2: BÀN TRÒN CHIẾN LƯỢC
            </span>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mt-3">
              CHUẨN BỊ THẢO LUẬN NHÓM
            </h3>

            <div className="my-5 p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2.5 shadow-inner">
              <div className="flex items-center space-x-2 text-sm text-amber-300 font-semibold">
                <span className="text-lg">⚡</span>
                <span>Cơ chế Combo Đồng Thuận x2:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7">
                Hãy quay sang thảo luận trực tiếp cùng 4 đồng đội trong <strong>{TEAMS[currentPlayer.teamId]?.name}</strong>. Khi cả 5 bạn cùng chọn đúng đáp án, khối sẽ nhận ngay <strong>x2 điểm số</strong>!
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-center space-x-2 text-xs sm:text-sm text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>Đang chờ quản trò bấm bắt đầu câu hỏi...</span>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. MÀN HÌNH TRẢ LỜI CÂU HỎI (STATUS: QUESTION) - SCALE NHƯ QUẢN TRÒ
           ========================================================================= */}
        {currentPlayer && room && room.status === 'QUESTION' && currentQ && (
          <div className="flex-1 flex flex-col justify-between py-2 sm:py-4">
            {/* Top Status Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl academic-card border-slate-800 bg-slate-900/80 mb-3 sm:mb-4 shadow-md">
              <div className="flex items-center space-x-3">
                <span className="text-2xl sm:text-3xl">{TEAMS[currentPlayer.teamId]?.icon}</span>
                <div>
                  <div className="text-xs sm:text-base font-serif font-bold text-slate-100 truncate max-w-[160px] sm:max-w-xs">
                    {currentPlayer.name}
                  </div>
                  <div className="text-[11px] sm:text-xs text-amber-400 font-mono font-semibold">
                    {TEAMS[currentPlayer.teamId]?.name} · {currentPlayer.score.toLocaleString()}đ
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {currentQ.round === 2 && (
                  <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-semibold animate-pulse">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Đồng Thuận x2</span>
                  </div>
                )}
                {currentPlayer.streak > 0 && (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs sm:text-sm font-mono font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>x{currentPlayer.streak}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Question Box (Responsive layout: Context & Question on Left, Image on Right) */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl academic-card border-slate-700/80 bg-slate-900/90 mb-3 sm:mb-5 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] sm:text-xs font-semibold uppercase text-slate-300">
                      {currentQ.round === 1
                        ? `Vòng 1 · Câu hỏi lý luận ${room.currentQuestionIndex + 1}/5`
                        : `Vòng 2 · Tình huống thực tiễn ${room.currentQuestionIndex - 4}/5`}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                      ⏱ {currentQ.timeLimit}s
                    </span>
                  </div>

                  {currentQ.context && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 mb-2.5 text-slate-300 text-xs sm:text-sm leading-relaxed">
                      <strong className="text-amber-400">📖 Bối cảnh lịch sử:</strong>{' '}
                      {currentQ.context}
                    </div>
                  )}

                  <h3 className="text-sm sm:text-lg md:text-xl font-serif font-bold text-slate-100 leading-snug">
                    {currentQ.text}
                  </h3>
                </div>

                {/* Documentary Image for Round 2 */}
                {currentQ.imageUrl && (
                  <div className="w-full lg:w-72 shrink-0 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-1.5 shadow-md">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900">
                      <img
                        src={currentQ.imageUrl}
                        alt="Tư liệu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {currentQ.imageCaption && (
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 px-1 italic truncate">
                        {currentQ.imageCaption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4 Answer Options (2x2 Grid on tablet/desktop, 1 col on mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5 mb-3 sm:mb-4">
              {currentQ.options.map((opt, idx) => {
                const labels = ['A', 'B', 'C', 'D'];
                const isAnsweredForThisQ =
                  currentPlayer?.lastAnswer !== undefined &&
                  currentPlayer?.lastAnswerQuestionIndex === room.currentQuestionIndex;
                const isSelected =
                  selectedAnswer === idx || (isAnsweredForThisQ && currentPlayer.lastAnswer === idx);
                const hasAnswered = selectedAnswer !== null || isAnsweredForThisQ;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => handleAnswer(idx)}
                    className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/50 ring-2 ring-amber-500/50 shadow-lg'
                        : hasAnswered
                        ? 'opacity-35 border-slate-800 bg-slate-950/40'
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900 active:scale-[0.99] shadow-sm'
                    }`}
                  >
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-inner">
                      {labels[idx]}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed pt-0.5">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {(selectedAnswer !== null ||
              (currentPlayer?.lastAnswer !== undefined &&
                currentPlayer?.lastAnswerQuestionIndex === room.currentQuestionIndex)) && (
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-center text-slate-200 text-xs sm:text-sm font-medium shadow-md animate-in fade-in">
                ✓ Đã gửi đáp án · Đang đợi quản trò công bố kết quả...
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            5. MÀN HÌNH KẾT QUẢ CÂU HỎI (STATUS: REVEAL)
           ========================================================================= */}
        {currentPlayer && room && room.status === 'REVEAL' && currentQ && (
          <div className="max-w-2xl w-full mx-auto p-6 sm:p-8 rounded-3xl academic-card border-slate-700/80 bg-slate-900/90 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            {(currentPlayer.lastAnswerQuestionIndex === room.currentQuestionIndex
              ? currentPlayer.isCorrect
              : selectedAnswer === currentQ.correctIndex) ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-950/70 border border-emerald-500 flex items-center justify-center mx-auto mb-3 text-2xl shadow-lg">
                  ✓
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-emerald-400">
                  CHÍNH XÁC
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Bạn đã ghi điểm cho {TEAMS[currentPlayer.teamId]?.name}
                </p>

                <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">ĐIỂM NHẬN ĐƯỢC</div>
                  <div className="text-3xl font-bold text-amber-400 font-mono mt-1">
                    +{(currentPlayer.pointsEarned || 0).toLocaleString()}đ
                  </div>
                  {currentPlayer.streak > 1 && (
                    <div className="text-xs sm:text-sm text-amber-300 font-semibold mt-1">
                      🔥 Chuỗi đúng liên tiếp x{currentPlayer.streak}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-red-950/70 border border-red-500 flex items-center justify-center mx-auto mb-3 text-2xl shadow-lg">
                  ✕
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-red-400">
                  CHƯA CHÍNH XÁC
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Đáp án đúng là phương án <strong>{['A', 'B', 'C', 'D'][currentQ.correctIndex]}</strong>
                </p>

                <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">ĐIỂM NHẬN ĐƯỢC</div>
                  <div className="text-2xl font-bold text-slate-500 font-mono mt-1">
                    +0đ
                  </div>
                </div>
              </>
            )}

            {currentQ.explanation && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs sm:text-sm text-slate-300 leading-relaxed shadow-inner">
                <strong className="text-amber-400">💡 Phân tích & Giải thích lý luận:</strong>{' '}
                {currentQ.explanation}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            6. MÀN HÌNH BẢNG XẾP HẠNG (STATUS: LEADERBOARD)
           ========================================================================= */}
        {currentPlayer && room && room.status === 'LEADERBOARD' && (
          <div className="max-w-2xl w-full mx-auto p-6 sm:p-8 rounded-3xl academic-card border-slate-700/80 bg-slate-900/90 text-center shadow-2xl">
            <Trophy className="w-9 h-9 text-amber-400 mx-auto mb-2" />
            <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-100">BẢNG TỔNG SẮP HỌC THUẬT</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-4">Điểm số hiện tại của bạn và các khối liên minh</p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-4 shadow-inner">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">ĐIỂM TỔNG CÁ NHÂN</div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono mt-1">
                {currentPlayer.score.toLocaleString()}đ
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 shadow-inner">
              {Object.keys(room.teams)
                .map((k) => {
                  const tid = k as TeamId;
                  return { ...TEAMS[tid], score: room.teams[tid]?.score || 0 };
                })
                .sort((a, b) => b.score - a.score)
                .map((t, idx) => (
                  <div
                    key={t.id}
                    className={`p-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-between ${
                      t.id === currentPlayer.teamId
                        ? 'bg-amber-950/40 border border-amber-800/40 text-amber-200 font-semibold shadow-sm'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-bold text-slate-400 w-5">#{idx + 1}</span>
                      <span className="text-lg">{t.icon}</span>
                      <span className="font-medium">{t.name}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-300">{t.score.toLocaleString()}đ</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            7. MÀN HÌNH TỔNG KẾT (STATUS: FINISHED)
           ========================================================================= */}
        {currentPlayer && room && room.status === 'FINISHED' && (
          <div className="max-w-2xl w-full mx-auto p-6 sm:p-8 rounded-3xl academic-card-gold border-amber-500/50 bg-slate-900/90 text-center shadow-2xl">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-300">
              HOÀN THÀNH XUẤT SẮC
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Bạn đã cùng {TEAMS[currentPlayer.teamId]?.name} hoàn thành bài kiểm tra học thuật!
            </p>

            <div className="my-5 p-5 rounded-2xl bg-slate-950 border border-amber-800/40 shadow-inner">
              <div className="text-xs text-amber-300/80 font-semibold uppercase">
                TỔNG ĐIỂM CÁ NHÂN
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-amber-400 font-mono mt-1">
                {currentPlayer.score.toLocaleString()}đ
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400">
              Hãy nhìn lên màn hình máy chiếu để theo dõi Bảng danh dự học thuật & Bục vinh danh!
            </p>
          </div>
        )}

        {/* =========================================================================
            8. MÀN HÌNH PHÒNG ĐÃ ĐÓNG (STATUS: CLOSED)
           ========================================================================= */}
        {room && room.status === 'CLOSED' && (
          <div className="max-w-md w-full mx-auto p-6 sm:p-8 rounded-3xl academic-card border-red-500/40 bg-slate-900/90 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-950/70 border border-red-500 flex items-center justify-center mx-auto mb-3 text-2xl shadow-md">
              🚪
            </div>
            <h3 className="text-xl font-serif font-bold text-red-400">
              PHÒNG HỌC ĐÃ KẾT THÚC
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Quản trò đã đóng và giải tán sảnh thi đấu. Cảm ơn bạn đã tham gia học tập!
            </p>

            <div className="mt-6">
              <Link
                href="/"
                onClick={() => handleLeaveRoom()}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors shadow-md"
              >
                <span>VỀ TRANG CHỦ</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ===== FLOATING LUẬT CHƠI BUTTON ===== */}
      <button
        onClick={() => setShowRules(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-2xl shadow-amber-900/50 transition-all hover:scale-105 active:scale-95 border border-amber-400/60"
        title="Xem luật chơi"
      >
        <HelpCircle className="w-4 h-4 flex-shrink-0" />
        <span>Luật chơi</span>
      </button>

      {/* ===== MODAL LUẬT CHƠI ===== */}
      {showRules && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setShowRules(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-slate-900 border-b border-slate-700 rounded-t-2xl z-10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-serif font-bold text-amber-400 uppercase tracking-wide">Hướng dẫn luật chơi</h2>
              </div>
              <button
                onClick={() => setShowRules(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5 text-sm">

              {/* Tổng quan */}
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/50">
                <p className="text-amber-300 font-semibold text-xs uppercase tracking-wider mb-2">📋 Tổng quan</p>
                <p className="text-slate-300 leading-relaxed">
                  <span className="text-amber-400 font-bold">Đại Đoàn Kết Arena</span> — Trò chơi học thuật môn
                  {' '}<span className="text-white font-semibold">Tư tưởng Hồ Chí Minh (HCM202)</span>.{' '}
                  Gồm <span className="text-amber-400 font-bold">2 vòng đấu chiến lược</span> với{' '}
                  <span className="text-amber-400 font-bold">6 Khối liên minh</span> × <span className="text-amber-400 font-bold">5 sinh viên</span> = 30 người tham gia.
                </p>
              </div>

              {/* 6 Khối */}
              <div>
                <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-3">🏛️ 6 Khối liên minh</p>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50"><span>⚒️</span><span><strong className="text-slate-100">Khối Tiên Phong</strong> — Công nhân &amp; Nông dân</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50"><span>💡</span><span><strong className="text-slate-100">Khối Trí Thức</strong> — Trí thức &amp; Tinh hoa</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50"><span>⚡</span><span><strong className="text-slate-100">Khối Xung Kích</strong> — Thanh niên &amp; Tuổi trẻ</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50"><span>🤝</span><span><strong className="text-slate-100">Khối Dân Tộc - Tôn Giáo</strong> — 54 Dân tộc anh em</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50"><span>✈️</span><span><strong className="text-slate-100">Khối Kiều Bào</strong> — Người Việt Nam ở nước ngoài</span></div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50"><span>🌐</span><span><strong className="text-slate-100">Khối Bạn Bè Quốc Tế</strong> — Lực lượng yêu chuộng hòa bình</span></div>
                </div>
              </div>

              <div className="border-t border-slate-800" />

              {/* Vòng 1 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-slate-100 leading-tight">Vòng 1 — Khởi Động Thần Tốc</h3>
                    <p className="text-blue-400 text-xs">5 câu hỏi lý luận cơ bản</p>
                  </div>
                </div>
                <ul className="space-y-2 text-slate-300 leading-relaxed pl-9">
                  <li className="flex items-start gap-2"><Clock className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />Thời gian: <span className="text-white font-semibold ml-1">15 giây</span> mỗi câu.</li>
                  <li className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />Trả lời đúng nhận <span className="text-green-400 font-semibold ml-1">điểm tốc độ</span> — càng nhanh càng nhiều điểm.</li>
                  <li className="flex items-start gap-2"><Flame className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />Trả lời đúng liên tiếp kích hoạt <span className="text-amber-400 font-semibold ml-1">Chuỗi Streak 🔥</span> tăng điểm thưởng!</li>
                </ul>
              </div>

              <div className="border-t border-slate-800" />

              {/* Vòng 2 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-bold text-slate-100 leading-tight">Vòng 2 — Bàn Tròn Chiến Lược</h3>
                    <p className="text-amber-400 text-xs">5 tình huống lịch sử &amp; thời đại</p>
                  </div>
                </div>
                <ul className="space-y-2 text-slate-300 leading-relaxed pl-9">
                  <li className="flex items-start gap-2"><Clock className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />Thời gian: <span className="text-white font-semibold ml-1">60 giây</span> mỗi câu — đủ thời gian bàn luận nhóm.</li>
                  <li className="flex items-start gap-2"><Shield className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />Câu hỏi phức tạp về tình huống lịch sử, đòi hỏi tư duy đội nhóm.</li>
                  <li className="flex items-start gap-2 p-2 rounded-lg bg-amber-950/50 border border-amber-700/60">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="text-amber-300 font-bold">⚡ COMBO ĐỒNG THUẬN x2 ĐIỂM!</span>
                      <br />
                      <span className="text-slate-400 text-xs">Khi <strong className="text-slate-200">cả 5 thành viên</strong> trong khối cùng chọn đúng đáp án → điểm của cả khối được <strong className="text-amber-400">nhân đôi</strong>!</span>
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-slate-800" />

              {/* Lưu ý */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                <p className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-2">💡 Lưu ý</p>
                <ul className="space-y-1.5 text-slate-400 text-xs leading-relaxed">
                  <li>• Mỗi người chỉ được chọn <strong className="text-slate-300">1 đáp án duy nhất</strong> cho mỗi câu hỏi.</li>
                  <li>• Sau khi chọn, <strong className="text-slate-300">không thể thay đổi</strong> câu trả lời.</li>
                  <li>• Điểm khối = tổng điểm của tất cả thành viên trong khối.</li>
                  <li>• Kết quả từng câu hiển thị ngay sau khi hết thời gian.</li>
                  <li>• Mỗi khối tối đa <strong className="text-slate-300">5 thành viên</strong> — khối đầy sẽ bị khóa.</li>
                </ul>
              </div>

              <button
                onClick={() => setShowRules(false)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors"
              >
                Đã hiểu, bắt đầu thi!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
