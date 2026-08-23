import { NextRequest, NextResponse } from 'next/server';
import { RoomState } from '@/lib/types';

const globalStore = globalThis as unknown as {
  __arena_rooms?: Map<string, RoomState>;
};

if (!globalStore.__arena_rooms) {
  globalStore.__arena_rooms = new Map<string, RoomState>();
}

const rooms = globalStore.__arena_rooms;

// GET /api/room?pin=1234
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get('pin');

  if (!pin) {
    return NextResponse.json({ success: false, message: 'Thiếu mã PIN' }, { status: 400 });
  }

  const room = rooms.get(pin);
  if (!room) {
    return NextResponse.json({ success: false, message: 'Phòng không tồn tại' }, { status: 404 });
  }

  return NextResponse.json({ success: true, room });
}

// POST /api/room
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, pin, state } = body;

    if (!pin) {
      return NextResponse.json({ success: false, message: 'Thiếu mã PIN' }, { status: 400 });
    }

    if (action === 'SAVE_STATE' && state) {
      rooms.set(pin, state);
      return NextResponse.json({ success: true, room: state });
    }

    return NextResponse.json({ success: false, message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
