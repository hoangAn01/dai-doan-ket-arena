'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Play,
  QrCode,
  Sparkles,
  ChevronRight,
  Bot,
  CheckCircle2,
  XCircle,
  BarChart3,
  BookOpen,
  PlusCircle,
  Trash2,
  RotateCcw,
  Zap,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { QRModal } from '@/components/QRModal';
import { Timer } from '@/components/Timer';
import { Podium } from '@/components/Podium';
import { EndRoomModal } from '@/components/EndRoomModal';
import { RoomState, TeamId } from '@/lib/types';
import { TEAMS, TEAM_LIST } from '@/lib/teams';
import { QUESTIONS } from '@/lib/questions';
import { sound } from '@/lib/sound';
import {
  generatePin,
  createInitialRoom,
  saveRoomState,
  subscribeToRoom,
  startNextQuestion,
  revealAnswersAndScoreTeams,
  populateBotPlayers,
  clearAllBots,
  resetRoom,
  simulateBotAnswers,
  getRoomState,
  finishRoomEarly,
  closeAndDestroyRoom,
  showLeaderboard,
} from '@/lib/roomManager';

export default function HostPage() {
  const [pin, setPin] = useState<string>('');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const botSimulatedRef = useRef<number>(-1);

  // Khởi tạo và giữ nguyên phòng (tránh mất phòng khi làm mới)
  useEffect(() => {
    let activePin = '';
    const params = new URLSearchParams(window.location.search);
    const urlPin = params.get('pin');
    const savedPin = typeof window !== 'undefined' ? localStorage.getItem('arena_host_pin') : null;

    if (urlPin) {
      activePin = urlPin;
    } else if (savedPin) {
      activePin = savedPin;
    } else {
      activePin = generatePin();
    }

    setPin(activePin);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arena_host_pin', activePin);
      window.history.replaceState(null, '', `/host?pin=${activePin}`);
    }

    getRoomState(activePin).then((existing) => {
      if (existing) {
        setRoom(existing);
      } else {
        const initial = createInitialRoom(activePin);
        setRoom(initial);
        saveRoomState(initial);
      }
    });

    const unsubscribe = subscribeToRoom(activePin, (updatedState) => {
      if (updatedState) {
        setRoom(updatedState);
      }
    });

    return () => unsubscribe();
  }, []);

  // Tự động cho bot trả lời khi câu hỏi mới bắt đầu
  useEffect(() => {
    if (
      room &&
      room.status === 'QUESTION' &&
      botSimulatedRef.current !== room.currentQuestionIndex
    ) {
      botSimulatedRef.current = room.currentQuestionIndex;
      const timer = setTimeout(() => {
        simulateBotAnswers(room.pin);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [room]);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-sm">Đang tải phòng quản trò...</p>
        </div>
      </div>
    );
  }

  const currentQ = QUESTIONS[room.currentQuestionIndex];
  const playersList = Object.values(room.players || {});
  const totalPlayersCount = playersList.length;
  const botCount = playersList.filter((p) => p.isBot).length;
  const answeredCount = playersList.filter((p) => p.lastAnswer !== undefined).length;

  const handlePopulateBots = async () => {
    sound.playClick();
    const updated = await populateBotPlayers(room.pin);
    if (updated) setRoom(updated);
  };

  const handleClearBots = async () => {
    sound.playClick();
    const updated = await clearAllBots(room.pin);
    if (updated) setRoom(updated);
  };

  const handleCreateNewRoom = async () => {
    sound.playClick();
    const newPin = generatePin();
    setPin(newPin);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arena_host_pin', newPin);
      window.history.replaceState(null, '', `/host?pin=${newPin}`);
    }
    const freshRoom = createInitialRoom(newPin);
    setRoom(freshRoom);
    await saveRoomState(freshRoom);
  };

  const handleResetRoom = async () => {
    sound.playClick();
    const updated = await resetRoom(room.pin);
    if (updated) setRoom(updated);
  };

  const handleStartNextQuestion = async () => {
    sound.playClick();
    sound.playReveal();
    const updated = await startNextQuestion(room.pin);
    if (updated) setRoom(updated);
  };

  const handleTimeUpOrReveal = async () => {
    sound.playReveal();
    const updated = await revealAnswersAndScoreTeams(room.pin);
    if (updated) setRoom(updated);
  };

  const handleShowLeaderboard = async () => {
    sound.playClick();
    const updated = await showLeaderboard(room.pin);
    if (updated) setRoom(updated);
  };

  const handleFinishEarly = async () => {
    sound.playClick();
    const updated = await finishRoomEarly(room.pin);
    if (updated) setRoom(updated);
  };

  const handleCloseRoom = async () => {
    sound.playClick();
    await closeAndDestroyRoom(room.pin);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const answerCounts = [0, 0, 0, 0];
  playersList.forEach((p) => {
    if (p.lastAnswer !== undefined && p.lastAnswer >= 0 && p.lastAnswer < 4) {
      answerCounts[p.lastAnswer]++;
    }
  });

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header
        pin={room.pin}
        round={room.round}
        totalPlayers={totalPlayersCount}
        showBack={true}
        onBackClick={() => setIsEndModalOpen(true)}
        endButtonText="KẾT THÚC PHÒNG"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col">
        {/* =========================================================================
            1. MÀN HÌNH LOBBY (SẢNH CHỜ THAM GIA)
           ========================================================================= */}
        {room.status === 'LOBBY' && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Header info bar */}
            <div className="p-4 sm:p-5 rounded-2xl academic-card border-slate-700/80 bg-slate-900/90 mb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-[11px] font-semibold mb-1">
                  <BookOpen className="w-3 h-3" />
                  <span>SẢNH THI ĐẤU LÝ LUẬN & THỰC TIỄN HCM202</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                  PHÒNG HỌC THUẬT QUẢN TRÒ
                </h2>
                <p className="text-xs text-slate-400">
                  Phòng học sẵn sàng. Sinh viên quét mã QR hoặc nhập mã PIN 4 chữ số để tham gia.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-[100px]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    MÃ PIN PHÒNG
                  </span>
                  <span className="text-2xl font-bold text-amber-400 font-mono tracking-widest mt-0.5">
                    {room.pin}
                  </span>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsQRModalOpen(true);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>MÃ QR</span>
                </button>

                <button
                  onClick={handleCreateNewRoom}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/40 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                  title="Tạo một mã phòng hoàn toàn mới"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>TẠO PHÒNG MỚI</span>
                </button>

                <button
                  onClick={() => setIsEndModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/60 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                  title="Kết thúc hoặc đóng phòng học"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>KẾT THÚC PHÒNG</span>
                </button>
              </div>
            </div>

            {/* 6 Khối Liên Minh Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-5">
              {TEAM_LIST.map((team) => {
                const members = playersList.filter((p) => p.teamId === team.id);
                const isFull = members.length >= 5;

                return (
                  <div
                    key={team.id}
                    className={`p-3.5 rounded-xl academic-card border transition-all ${
                      isFull
                        ? 'border-emerald-700/50 bg-emerald-950/20'
                        : members.length > 0
                        ? 'border-slate-700/80 bg-slate-900/60'
                        : 'border-slate-800/80 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{team.icon}</span>
                        <div>
                          <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-100">{team.name}</h3>
                          <p className="text-[10px] text-slate-400 italic truncate max-w-[170px]">"{team.slogan}"</p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                          isFull
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                            : members.length > 0
                            ? 'bg-slate-800 text-slate-200 border border-slate-700'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {members.length}/5
                      </span>
                    </div>

                    <div className="space-y-1 min-h-[120px] flex flex-col justify-start">
                      {Array.from({ length: 5 }).map((_, slotIdx) => {
                        const player = members[slotIdx];
                        return (
                          <div
                            key={slotIdx}
                            className={`px-2 py-1 rounded-lg text-xs flex items-center justify-between ${
                              player
                                ? 'bg-slate-800/70 border border-slate-700/60 text-slate-200'
                                : 'bg-slate-900/30 border border-dashed border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="truncate">
                              {player ? (
                                <>
                                  <span className="text-amber-400/90 font-mono font-semibold mr-1">
                                    #{slotIdx + 1}
                                  </span>
                                  {player.name}
                                  {player.isBot && (
                                    <span className="text-[10px] text-slate-400 ml-1">
                                      (Bot)
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span>Vị trí #{slotIdx + 1} đang chờ...</span>
                              )}
                            </span>
                            {player && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-3.5 rounded-xl academic-card border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <Users className="w-4 h-4 text-amber-400" />
                <span>
                  Tổng số: <strong className="text-slate-100 font-mono text-sm">{totalPlayersCount}/30</strong> (Người thật: {totalPlayersCount - botCount}, Bot: {botCount})
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                {botCount > 0 ? (
                  <button
                    onClick={handleClearBots}
                    className="px-3 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>XÓA 30 BOT TEST</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePopulateBots}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                    title="Nạp nhanh 30 sinh viên Bot để diễn tập bài giảng"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-400" />
                    <span>🤖 NẠP 30 BOT TEST</span>
                  </button>
                )}

                {totalPlayersCount > 0 && (
                  <button
                    onClick={handleResetRoom}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                    title="Xóa toàn bộ người chơi để làm mới phòng"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESET PHÒNG</span>
                  </button>
                )}

                <button
                  onClick={handleStartNextQuestion}
                  disabled={totalPlayersCount === 0}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>BẮT ĐẦU TRẬN ĐẤU</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. MÀN HÌNH CHUYỂN TIẾP SANG VÒNG 2 (ROUND TRANSITION INTERMISSION)
           ========================================================================= */}
        {room.status === 'ROUND_TRANSITION' && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 animate-in zoom-in-95 duration-300">
            <div className="w-full max-w-3xl p-8 rounded-3xl academic-card-gold border-2 border-amber-500/60 bg-slate-900 text-center shadow-2xl">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>BƯỚC VÀO VÒNG THI ĐẤU QUYẾT ĐỊNH</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-100 mb-3">
                VÒNG 2: BÀN TRÒN CHIẾN LƯỢC
              </h2>
              <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto mb-8">
                5 tình huống lịch sử và thời đại chuyên sâu — Thảo luận tập thể trong từng khối liên minh để tìm ra phương án tối ưu nhất.
              </p>

              {/* Special Rules 3 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-amber-400 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-serif font-bold text-sm">60 Giây / Tình huống</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Thời gian đủ dài để 5 thành viên trong khối cùng tranh luận, phân tích bối cảnh trước khi chọn.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-amber-300 mb-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span className="font-serif font-bold text-sm">Combo Đồng Thuận x2</span>
                    </div>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      Nhân đôi toàn bộ điểm số của vòng thi đấu nếu <strong>cả 5 thành viên</strong> trong khối cùng chọn đúng đáp án!
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-amber-400 mb-2">
                      <ImageIcon className="w-5 h-5" />
                      <span className="font-serif font-bold text-sm">Ảnh Tư Liệu Thực Tế</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Mỗi tình huống đều đi kèm hình ảnh lưu trữ lịch sử chân thực giúp bài học thêm sinh động.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Start Round 2 */}
              <button
                onClick={handleStartNextQuestion}
                className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-base flex items-center space-x-2 mx-auto shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>BẮT ĐẦU VÒNG 2 (TÌNH HUỐNG 1)</span>
                <ChevronRight className="w-5 h-5 text-slate-950" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. MÀN HÌNH CÂU HỎI (QUESTION IN PROGRESS)
           ========================================================================= */}
        {room.status === 'QUESTION' && currentQ && (
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-serif font-bold text-xs sm:text-sm flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>
                    {currentQ.round === 1
                      ? `Vòng 1: Câu hỏi lý luận ${room.currentQuestionIndex + 1}/5`
                      : `Vòng 2: Tình huống thực tiễn ${room.currentQuestionIndex - 4}/5`}
                  </span>
                </div>
                {currentQ.round === 2 && (
                  <div className="px-3 py-1 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-semibold flex items-center space-x-1.5 animate-pulse">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Combo Đồng Thuận x2 (5/5 Đúng)</span>
                  </div>
                )}
              </div>

              <Timer
                timeLimit={currentQ.timeLimit}
                startTime={room.questionStartTime}
                onTimeUp={handleTimeUpOrReveal}
              />
            </div>

            {/* Question Box (With optional historical image) */}
            <div className="p-5 md:p-6 rounded-2xl academic-card border-slate-700/80 bg-slate-900/80 mb-4">
              <div className="flex flex-col lg:flex-row gap-5 items-start">
                {/* Left: Historical Context & Text */}
                <div className="flex-1">
                  {currentQ.context && (
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 mb-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
                      <strong className="text-amber-400">📖 Bối cảnh lịch sử:</strong>{' '}
                      {currentQ.context}
                    </div>
                  )}

                  <h2 className="text-lg md:text-2xl font-serif font-bold text-slate-100 leading-snug">
                    {currentQ.text}
                  </h2>
                </div>

                {/* Right: Documentary Historical Photo (if available in Round 2) */}
                {currentQ.imageUrl && (
                  <div className="w-full lg:w-72 shrink-0 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-1.5 shadow-md">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900">
                      <img
                        src={currentQ.imageUrl}
                        alt="Ảnh tư liệu lịch sử"
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    </div>
                    {currentQ.imageCaption && (
                      <p className="text-[11px] text-slate-400 mt-1.5 px-1 leading-snug italic">
                        {currentQ.imageCaption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {currentQ.options.map((opt, idx) => {
                const labels = ['A', 'B', 'C', 'D'];
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl academic-card border-slate-800 hover:border-slate-700 bg-slate-900/60 flex items-start space-x-2.5 text-xs sm:text-sm"
                  >
                    <span className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {labels[idx]}
                    </span>
                    <span className="text-slate-200 font-medium leading-relaxed">{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Status */}
            <div className="p-3 rounded-xl academic-card border border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Đã ghi nhận{' '}
                <strong className="text-amber-400 font-mono font-semibold">
                  {answeredCount}/{totalPlayersCount}
                </strong>{' '}
                câu trả lời
              </div>

              <button
                onClick={handleTimeUpOrReveal}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
              >
                KẾT THÚC CÂU HỎI SỚM
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. MÀN HÌNH REVEAL (CÔNG BỐ ĐÁP ÁN & GIẢI THÍCH LÝ LUẬN)
           ========================================================================= */}
        {room.status === 'REVEAL' && currentQ && (
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="mb-4">
              <span className="px-3 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-[11px] font-semibold uppercase tracking-wider">
                ĐÁP ÁN CHÍNH XÁC
              </span>
              <h2 className="text-base md:text-lg font-serif font-bold text-slate-100 mt-1.5">
                {currentQ.text}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {currentQ.options.map((opt, idx) => {
                const isCorrect = idx === currentQ.correctIndex;
                const count = answerCounts[idx];
                const percentage =
                  totalPlayersCount > 0
                    ? Math.round((count / totalPlayersCount) * 100)
                    : 0;

                return (
                  <div
                    key={idx}
                    className={`relative p-3.5 rounded-xl border overflow-hidden transition-all ${
                      isCorrect
                        ? 'border-emerald-500/70 bg-emerald-950/30'
                        : 'border-slate-800 bg-slate-950/40 opacity-60'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 opacity-15 ${
                        isCorrect ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />

                    <div className="relative z-10 flex items-start justify-between">
                      <div className="flex items-start space-x-2 pr-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-xs ${
                            isCorrect ? 'text-emerald-200 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {opt}
                        </span>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <div className="text-sm font-bold text-slate-200">
                          {percentage}%
                        </div>
                        <div className="text-[10px] text-slate-400">{count} SV</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation Box */}
            {currentQ.explanation && (
              <div className="p-3.5 rounded-xl academic-card border-amber-800/40 bg-amber-950/20 mb-4">
                <div className="flex items-center space-x-1.5 text-amber-300 font-semibold text-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PHÂN TÍCH TƯ TƯỞNG HỒ CHÍ MINH:</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleShowLeaderboard}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center space-x-1.5 border border-slate-700 transition-colors"
              >
                <span>XEM BẢNG XẾP HẠNG</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            5. MÀN HÌNH BẢNG XẾP HẠNG (LEADERBOARD)
           ========================================================================= */}
        {room.status === 'LEADERBOARD' && (
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="text-center mb-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold mb-1">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>BẢNG XẾP HẠNG THỜI GIAN THỰC</span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-100">
                ĐIỂM SỐ 6 KHỐI LIÊN MINH
              </h2>
            </div>

            <div className="w-full max-w-2xl mx-auto space-y-2.5 mb-5">
              {Object.keys(room.teams)
                .map((k) => {
                  const id = k as TeamId;
                  return {
                    ...TEAMS[id],
                    score: room.teams[id]?.score || 0,
                    count: room.teams[id]?.count || 0,
                  };
                })
                .sort((a, b) => b.score - a.score)
                .map((team, idx) => {
                  const maxScore = Math.max(
                    ...Object.values(room.teams).map((t) => t.score),
                    1000
                  );
                  const barWidth = Math.max(
                    10,
                    Math.round((team.score / maxScore) * 100)
                  );

                  return (
                    <div
                      key={team.id}
                      className="p-3 rounded-xl academic-card border border-slate-800 flex items-center justify-between relative overflow-hidden"
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-slate-800/40 transition-all duration-700"
                        style={{ width: `${barWidth}%` }}
                      />

                      <div className="relative z-10 flex items-center space-x-3">
                        <span
                          className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950'
                              : idx === 2
                              ? 'bg-amber-800 text-amber-100'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="text-lg">{team.icon}</span>
                        <div>
                          <div className="font-serif font-bold text-xs sm:text-sm text-slate-100">{team.name}</div>
                          <div className="text-[10px] text-slate-400 italic truncate max-w-[180px]">{team.slogan}</div>
                        </div>
                      </div>

                      <div className="relative z-10 text-right">
                        <div className="text-lg font-bold font-mono text-amber-400">
                          {team.score.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-400">điểm tổng</div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleStartNextQuestion}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 transition-colors"
              >
                <span>
                  {room.currentQuestionIndex === 4 && room.round === 1
                    ? '🔥 CHUYỂN SANG VÒNG 2'
                    : room.currentQuestionIndex + 1 < QUESTIONS.length
                    ? 'CÂU HỎI TIẾP THEO'
                    : '🏆 LỄ TỔNG KẾT & VINH DANH'}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            6. MÀN HÌNH TỔNG KẾT & PODIUM (FINISHED)
           ========================================================================= */}
        {room.status === 'FINISHED' && (
          <Podium
            teams={room.teams}
            players={room.players}
            onRestart={handleCreateNewRoom}
          />
        )}
      </main>

      <QRModal
        pin={room.pin}
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />

      <EndRoomModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        onFinishEarly={handleFinishEarly}
        onCloseRoom={handleCloseRoom}
      />
    </div>
  );
}
