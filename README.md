# 🏆 ĐẠI ĐOÀN KẾT ARENA (CLASSROOM WEB GAME)

> **Môn học:** Tư tưởng Hồ Chí Minh - HCM202 — Chương V: Tư tưởng Hồ Chí Minh về Đại đoàn kết toàn dân tộc và Đoàn kết quốc tế  
> **Quy mô:** 30 người chơi trực tiếp (6 Khối liên minh, mỗi khối 5 người)  
> **Công nghệ:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Web Audio Synth + Firebase Realtime DB (Hỗ trợ Local Fallback Sync)  

---
<img width="2559" height="1396" alt="image" src="https://github.com/user-attachments/assets/746f8865-7dca-4de8-b495-2a41083d4e2c" />

## ✨ TÍNH NĂNG NỔI BẬT

1. **Giao diện Trình chiếu (Host) & Điện thoại (Player):**
   - Màn hình Host (`/host`): Tạo phòng ngẫu nhiên 4 số, sinh mã QR, quản lý 6 khối liên minh, hiển thị đồng hồ đếm ngược, phân tích biểu đồ đáp án, bảng tổng sắp và bục vinh danh 3D kèm pháo hoa.
   - Màn hình Player (`/play`): Giao diện 4 nút lớn A/B/C/D mượt mà, hỗ trợ haptic/âm thanh, tự động khóa đội khi đủ 5 người.
   - Nút **"🤖 Nạp 30 Bot Test"**: Cho phép giảng viên hoặc quản trò chạy thử diễn tập toàn bộ 10 câu hỏi mà không cần 30 điện thoại thật.

2. **6 Khối Liên Minh Đại Diện Toàn Dân Tộc:**
   - ⚒️ **Khối Tiên Phong:** Công nhân & Nông dân *(Vững gốc - Bền tâm - Quyết thắng!)*
   - 💡 **Khối Trí Thức:** Trí thức & Tinh hoa *(Trí tuệ dân tộc - Khai phóng tương lai!)*
   - ⚡ **Khối Xung Kích:** Thanh niên & Tuổi trẻ *(Đâu cần thanh niên có - Đâu khó có thanh niên!)*
   - 🤝 **Khối Dân Tộc - Tôn Giáo:** 54 Dân tộc anh em & Các tôn giáo *(Muôn người một lòng - Bắc Nam một nhà!)*
   - ✈️ **Khối Kiều Bào:** Người Việt Nam ở nước ngoài *(Dù xa đất mẹ - Vẹn tấm lòng son!)*
   - 🌐 **Khối Bạn Bè Quốc Tế:** Lực lượng yêu chuộng hòa bình thế giới *(Độc lập tự chủ - Bạn hữu năm châu!)*

3. **2 Vòng Đấu Chiến Lược:**
   - **Vòng 1 (Khởi động thần tốc - 15s/câu):** 5 câu hỏi lý luận cơ bản tính điểm tốc độ và chuỗi thắng (Streak).
   - **Vòng 2 (Bàn tròn chiến lược - 60s/câu):** 5 tình huống lịch sử và thời đại, kích hoạt **COMBO ĐỒNG THUẬN x2 ĐIỂM** khi cả 5 thành viên trong khối cùng chọn đúng!

4. **Âm Thanh Thuần Web Audio API:**
   - Bộ tổng hợp âm thanh built-in (tích tắc đếm ngược, tiếng chuông trả lời đúng/sai, âm hiệu Combo x2, nhạc chiến thắng Fanfare) 100% không phụ thuộc link ngoài.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY LOCAL

```bash
# 1. Cài đặt thư viện
npm install

# 2. Chạy môi trường phát triển
npm run dev

# 3. Mở trình duyệt:
# - Host (Máy chiếu): http://localhost:3000/host
# - Player (Điện thoại/Tab ẩn danh): http://localhost:3000/play
```

---


