'use client';

import React, { useState, useEffect } from 'react';
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

    // Đọc trạng thái ban đầu
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
    if (currentPlayer?.lastAnswer !== undefined || selectedAnswer !== null) return;

    setSelectedAnswer(index);
    sound.playClick();

    const timeUsed = (Date.now() - room.questionStartTime) / 1000;
    const res = await submitAnswer(pin, playerId, index, timeUsed);

    if (res.isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  // Thoát hoặc đổi phòng
  const handleLeaveRoom = () => {
    sound.playClick();
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
    <div className="min-h-screen flex flex-col justify-between">
      <Header
        pin={room?.pin || pin}
        round={room?.round}
        showBack={Boolean(currentPlayer)}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-5 flex flex-col justify-center">
        {/* =========================================================================
            1. MÀN HÌNH ĐĂNG KÝ (CHƯA VÀO PHÒNG)
           ========================================================================= */}
        {!currentPlayer && (
          <div className="p-5 sm:p-6 rounded-2xl academic-card border-slate-700/80 bg-slate-900/90 shadow-xl">
            <div className="text-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 mx-auto mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-serif font-bold text-slate-100">
                THAM GIA PHÒNG HỌC
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Điền thông tin và chọn 1 trong 6 Khối liên minh (5 sinh viên/khối)
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 mb-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs text-center font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  MÃ PIN PHÒNG (4 SỐ)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold text-xl tracking-widest text-center focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  HỌ VÀ TÊN SINH VIÊN
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  CHỌN KHỐI LIÊN MINH
                </label>

                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
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
                        className={`p-2.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/50'
                            : isFull
                            ? 'border-slate-800/80 bg-slate-950/40 opacity-40 cursor-not-allowed'
                            : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base">{team.icon}</span>
                          <span
                            className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                              isFull
                                ? 'bg-red-950 text-red-400 border border-red-900'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isFull ? 'ĐỦ' : `${currentCount}/5`}
                          </span>
                        </div>
                        <div className="font-serif font-bold text-xs text-slate-200 truncate">
                          {team.shortName}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
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
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
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
          <div className="p-5 sm:p-6 rounded-2xl academic-card border-slate-700/80 bg-slate-900/90 text-center">
            <div className="text-3xl mb-1.5">{TEAMS[currentPlayer.teamId]?.icon}</div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 text-xs font-semibold uppercase">
              {TEAMS[currentPlayer.teamId]?.name}
            </span>
            <h2 className="text-lg font-serif font-bold text-white mt-2">{currentPlayer.name}</h2>
            <p className="text-xs text-slate-400 italic mt-0.5">
              "{TEAMS[currentPlayer.teamId]?.slogan}"
            </p>

            <div className="my-5 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs text-slate-300 font-medium">
                Đang chờ quản trò bấm bắt đầu trận đấu...
              </span>
            </div>

            <div className="text-left mb-4">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase mb-2">
                <span>THÀNH VIÊN TRONG KHỐI</span>
                <span>
                  {
                    Object.values(room.players).filter(
                      (p) => p.teamId === currentPlayer.teamId
                    ).length
                  }
                  /5
                </span>
              </div>

              <div className="space-y-1">
                {Object.values(room.players)
                  .filter((p) => p.teamId === currentPlayer.teamId)
                  .map((p, idx) => (
                    <div
                      key={p.id}
                      className={`px-2.5 py-1 rounded-lg text-xs flex items-center justify-between ${
                        p.id === currentPlayer.id
                          ? 'bg-amber-950/40 border border-amber-800/50 text-amber-200 font-semibold'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>
                        #{idx + 1} {p.name} {p.id === currentPlayer.id && '(Bạn)'}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={handleLeaveRoom}
              className="text-xs text-slate-400 hover:text-slate-200 underline pt-2"
            >
              Đổi thông tin hoặc chọn khối khác
            </button>
          </div>
        )}

        {/* =========================================================================
            3. MÀN HÌNH TRẢ LỜI CÂU HỎI (STATUS: QUESTION)
           ========================================================================= */}
        {currentPlayer && room && room.status === 'QUESTION' && currentQ && (
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex items-center justify-between p-2.5 rounded-xl academic-card border-slate-800 mb-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{TEAMS[currentPlayer.teamId]?.icon}</span>
                <div>
                  <div className="text-xs font-serif font-bold text-slate-100 truncate max-w-[120px]">
                    {currentPlayer.name}
                  </div>
                  <div className="text-[10px] text-amber-400 font-mono font-semibold">
                    {currentPlayer.score.toLocaleString()}đ
                  </div>
                </div>
              </div>

              {currentPlayer.streak > 0 && (
                <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-950/50 border border-amber-800/40 text-amber-300 text-xs font-mono font-bold">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Chuỗi x{currentPlayer.streak}</span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl academic-card border-slate-700/80 bg-slate-900/80 mb-2.5">
              <span className="text-[10px] font-semibold uppercase text-slate-400">
                {currentQ.round === 1
                  ? `Vòng 1 · Câu ${room.currentQuestionIndex + 1}/5`
                  : `Vòng 2 · Tình huống ${room.currentQuestionIndex - 4}/5`}
              </span>
              <h3 className="text-xs sm:text-sm font-serif font-bold text-slate-100 mt-0.5 leading-snug">
                {currentQ.text}
              </h3>
            </div>

            {/* 4 Answer Buttons */}
            <div className="grid grid-cols-1 gap-2 mb-2.5">
              {currentQ.options.map((opt, idx) => {
                const labels = ['A', 'B', 'C', 'D'];
                const isSelected =
                  selectedAnswer === idx || currentPlayer.lastAnswer === idx;
                const hasAnswered =
                  selectedAnswer !== null || currentPlayer.lastAnswer !== undefined;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => handleAnswer(idx)}
                    className={`p-3 rounded-xl border text-left transition-colors flex items-center space-x-2.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/50'
                        : hasAnswered
                        ? 'opacity-35 border-slate-800 bg-slate-950/40'
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900 active:bg-slate-800'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {labels[idx]}
                    </span>
                    <span className="text-xs text-slate-200 font-medium leading-tight">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {(selectedAnswer !== null || currentPlayer.lastAnswer !== undefined) && (
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-center text-slate-300 text-xs font-medium">
                ✓ Đã gửi đáp án · Đang đợi quản trò công bố kết quả...
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            4. MÀN HÌNH KẾT QUẢ CÂU HỎI (STATUS: REVEAL)
           ========================================================================= */}
        {currentPlayer && room && room.status === 'REVEAL' && currentQ && (
          <div className="p-5 rounded-2xl academic-card border-slate-700/80 bg-slate-900/90 text-center">
            {currentPlayer.isCorrect ? (
              <>
                <div className="w-11 h-11 rounded-full bg-emerald-950/70 border border-emerald-500 flex items-center justify-center mx-auto mb-2 text-xl">
                  ✓
                </div>
                <h3 className="text-lg font-serif font-bold text-emerald-400">
                  CHÍNH XÁC
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Bạn đã ghi điểm cho khối liên minh</p>

                <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">ĐIỂM NHẬN ĐƯỢC</div>
                  <div className="text-2xl font-bold text-amber-400 font-mono mt-0.5">
                    +{(currentPlayer.pointsEarned || 0).toLocaleString()}đ
                  </div>
                  {currentPlayer.streak > 1 && (
                    <div className="text-xs text-amber-300 font-semibold mt-0.5">
                      🔥 Chuỗi đúng x{currentPlayer.streak}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-11 h-11 rounded-full bg-red-950/70 border border-red-500 flex items-center justify-center mx-auto mb-2 text-xl">
                  ✕
                </div>
                <h3 className="text-lg font-serif font-bold text-red-400">
                  CHƯA CHÍNH XÁC
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đáp án đúng là phương án {['A', 'B', 'C', 'D'][currentQ.correctIndex]}
                </p>

                <div className="my-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">ĐIỂM NHẬN ĐƯỢC</div>
                  <div className="text-xl font-bold text-slate-500 font-mono mt-0.5">
                    +0đ
                  </div>
                </div>
              </>
            )}

            {currentQ.explanation && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs text-slate-300">
                <strong className="text-amber-400">💡 Phân tích:</strong>{' '}
                {currentQ.explanation}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            5. MÀN HÌNH BẢNG XẾP HẠNG (STATUS: LEADERBOARD)
           ========================================================================= */}
        {currentPlayer && room && room.status === 'LEADERBOARD' && (
          <div className="p-5 rounded-2xl academic-card border-slate-700/80 bg-slate-900/90 text-center">
            <Trophy className="w-7 h-7 text-amber-400 mx-auto mb-1" />
            <h3 className="text-base font-serif font-bold text-slate-100">BẢNG TỔNG SẮP</h3>
            <p className="text-xs text-slate-400 mb-2.5">Điểm số hiện tại của bạn và các khối</p>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 mb-2.5">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">ĐIỂM TỔNG CÁ NHÂN</div>
              <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
                {currentPlayer.score.toLocaleString()}đ
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-1">
              {Object.keys(room.teams)
                .map((k) => {
                  const tid = k as TeamId;
                  return { ...TEAMS[tid], score: room.teams[tid]?.score || 0 };
                })
                .sort((a, b) => b.score - a.score)
                .map((t, idx) => (
                  <div
                    key={t.id}
                    className={`p-1.5 rounded-lg text-xs flex items-center justify-between ${
                      t.id === currentPlayer.teamId
                        ? 'bg-amber-950/40 border border-amber-800/40 text-amber-200 font-semibold'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-slate-400">#{idx + 1}</span>
                      <span>{t.icon}</span>
                      <span>{t.shortName}</span>
                    </div>
                    <span className="font-mono font-bold">{t.score.toLocaleString()}đ</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            6. MÀN HÌNH TỔNG KẾT (STATUS: FINISHED)
           ========================================================================= */}
        {currentPlayer && room && room.status === 'FINISHED' && (
          <div className="p-5 rounded-2xl academic-card-gold border-amber-500/50 bg-slate-900/90 text-center">
            <div className="text-3xl mb-1.5">🏆</div>
            <h3 className="text-lg font-serif font-bold text-amber-300">
              HOÀN THÀNH XUẤT SẮC
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bạn đã cùng {TEAMS[currentPlayer.teamId]?.name} hoàn thành bài kiểm tra học thuật!
            </p>

            <div className="my-4 p-3 rounded-xl bg-slate-950 border border-amber-800/40">
              <div className="text-[10px] text-amber-300/80 font-semibold uppercase">
                TỔNG ĐIỂM CÁ NHÂN
              </div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-0.5">
                {currentPlayer.score.toLocaleString()}đ
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Hãy nhìn lên màn hình máy chiếu để theo dõi Bảng danh dự học thuật!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
