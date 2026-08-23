# 🏆 ĐẠI ĐOÀN KẾT ARENA (CLASSROOM WEB GAME)
> **Chủ đề:** Chương V - Tư tưởng Hồ Chí Minh về Đại đoàn kết toàn dân tộc và Đoàn kết quốc tế  
> **Quy mô:** 30 người chơi đồng thời (Chia đều 6 Khối liên minh, mỗi khối 5 người)  
> **Thời gian:** Vòng 1 (15s/câu) & Vòng 2 (60s/câu)  
> **Nền tảng:** Next.js (React) + TailwindCSS + Firebase Realtime Database + Vercel Deployment  

---

## 📌 MỤC LỤC
1. [User Flow & Cơ Chế Vận Hành](#1-user-flow--cơ-chế-vận-hành)
2. [Hệ Thống 6 Khối Liên Minh](#2-hệ-thống-6-khối-liên-minh)
3. [Bộ Câu Hỏi Chuẩn Hóa](#3-bộ-câu-hỏi-chuẩn-hóa)
   - [Vòng 1: Khởi Động Thần Tốc (15s/câu)](#vòng-1-khởi-động-thần-tốc-5-câu---15scâu)
   - [Vòng 2: Bàn Tròn Chiến Lược (60s/câu)](#vòng-2-bàn-tròn-chiến-lược-5-tình-huống---60scâu)
4. [Kiến Trúc Kỹ Thuật & Data Schema](#4-kiến-trúc-kỹ-thuật--data-schema)
5. [Logic Tính Điểm & Combo Đồng Thuận](#5-logic-tính-điểm--combo-đồng-thuận)
6. [Hướng Dẫn Push GitHub & Deploy Vercel](#6-hướng-dẫn-push-github--deploy-vercel)

---

## 1. USER FLOW & CƠ CHẾ VẬN HÀNH

```
[BƯỚC 1: QUẢN TRÒ TẠO PHÒNG]
Quản trò kết nối Laptop với Máy chiếu -> Truy cập trang /host
Màn hình máy chiếu hiển thị: Mã PIN (4 số), Mã QR phòng, Trạng thái 6 Khối (0/5)

[BƯỚC 2: 30 SINH VIÊN THAM GIA]
Sinh viên quét mã QR hoặc truy cập /play trên điện thoại
Điền Tên -> Chọn 1 trong 6 Khối (Khối đủ 5 người sẽ tự động khóa)
Màn hình máy chiếu nhảy số realtime: Khối Tiên Phong (5/5), Khối Trí Thức (5/5)...

[BƯỚC 3: VÒNG 1 - KHỞI ĐỘNG THẦN TỐC]
5 câu hỏi cơ bản, 15 giây/câu
Mỗi cá nhân bấm nhanh trên điện thoại để ghi điểm cá nhân + điểm cho đội

[BƯỚC 4: VÒNG 2 - BÀN TRÒN CHIẾN LƯỢC]
5 tình huống chuyên sâu, 60 giây (1 phút)/câu
5 bạn trong từng đội thảo luận trực tiếp -> Cùng chọn phương án tối ưu
Kích hoạt COMBO x2 nếu cả 5 thành viên trong đội cùng chọn đúng!

[BƯỚC 5: TỔNG KẾT & PODIUM]
Bục vinh danh Top 3 Đội Quán quân + Vinh danh MVP xuất sắc nhất từng đội
Hiệu ứng pháo hoa Confetti chúc mừng!
```

---

## 2. HỆ THỐNG 6 KHỐI LIÊN MINH

| STT | Tên Khối | Biểu Tượng & Màu Sắc | Ý Nghĩa Trong Tư Tưởng Hồ Chí Minh | Slogan Của Đội |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Khối Tiên Phong** | ⚒️ Đỏ *(Red)* | Giai cấp **Công nhân & Nông dân** (Cái gốc, nền tảng cốt lõi của khối đại đoàn kết). | *"Vững gốc - Bền tâm - Quyết thắng!"* |
| **2** | **Khối Trí Thức** | 💡 Vàng *(Yellow)* | **Trí thức & Tinh hoa** (Lực lượng kiến thiết, đổi mới sáng tạo). | *"Trí tuệ dân tộc - Khai phóng tương lai!"* |
| **3** | **Khối Xung Kích** | ⚡ Cam *(Orange)* | **Thanh niên & Tuổi trẻ Việt Nam** (Lực lượng kế thừa rường cột, xung kích bứt phá). | *"Đâu cần thanh niên có - Đâu khó có thanh niên!"* |
| **4** | **Khối Dân Tộc - Tôn Giáo** | 🤝 Xanh lá *(Green)* | **54 Dân tộc anh em & Các tôn giáo** (Khối hòa hợp dân tộc bền chặt). | *"Muôn người một lòng - Bắc Nam một nhà!"* |
| **5** | **Khối Kiều Bào** | ✈️ Tím *(Purple)* | **Người Việt Nam ở nước ngoài** (Cầu nối hữu nghị, hướng về cội nguồn). | *"Dù xa đất mẹ - Vẹn tấm lòng son!"* |
| **6** | **Khối Bạn Bè Quốc Tế** | 🌐 Xanh dương *(Blue)* | **Lực lượng yêu chuộng hòa bình thế giới** (Kết hợp sức mạnh dân tộc với sức mạnh thời đại). | *"Độc lập tự chủ - Bạn hữu năm châu!"* |

---

## 3. BỘ CÂU HỎI CHUẨN HÓA

*(Độ dài 4 phương án cân bằng nhau, đáp án đúng rải đều A-B-C-D)*

### VÒNG 1: KHỞI ĐỘNG THẦN TỐC (5 CÂU - 15s/CÂU)

#### Câu 1 (Đáp án đúng: **C**)
> **Theo Chủ tịch Hồ Chí Minh, đại đoàn kết toàn dân tộc được xác định là:**
* A. Sách lược tạm thời nhằm đối phó với kẻ thù trong từng giai đoạn cách mạng
* B. Thủ đoạn chính trị để kêu gọi và vận động sự hỗ trợ của các tầng lớp nhân dân
* **C. Đường lối chiến lược xuyên suốt và quyết định thành công của cách mạng** *(ĐÚNG)*
* D. Phong trào thi đua ngắn hạn do các đoàn thể quần chúng tổ chức và phát động

#### Câu 2 (Đáp án đúng: **A**)
> **Điền vào chỗ trống quan điểm của Bác: *"Nước lấy dân làm..., gốc có vững cây mới bền"*:*
* **A. Gốc** *(ĐÚNG)*
* B. Trọng
* C. Tâm
* D. Đầu

#### Câu 3 (Đáp án đúng: **D**)
> **Lực lượng làm NỀN TẢNG cho khối Đại đoàn kết toàn dân tộc là:**
* A. Khối liên minh giữa giai cấp công nhân, tầng lớp doanh nhân và tư sản dân tộc
* B. Toàn thể tầng lớp tiểu tư sản trí thức và giới văn nghệ sĩ yêu nước thành thị
* C. Sự hợp nhất của tất cả các tổ chức chính trị - xã hội đang hoạt động toàn quốc
* **D. Khối liên minh giữa giai cấp công nhân, giai cấp nông dân và đội ngũ trí thức** *(ĐÚNG)*

#### Câu 4 (Đáp án đúng: **B**)
> **Tổ chức nào là hình thức tổ chức cao nhất của khối đại đoàn kết toàn dân tộc?**
* A. Cơ quan đại biểu quyền lực nhà nước cao nhất là Quốc hội nước CHXHCN Việt Nam
* **B. Mặt trận Dân tộc Thống nhất (ngày nay là Mặt trận Tổ quốc Việt Nam)** *(ĐÚNG)*
* C. Tổng Liên đoàn Lao động Việt Nam cùng toàn bộ các tổ chức công đoàn cơ sở
* D. Các hiệp hội nghề nghiệp và các tổ chức xã hội dân sự hoạt động độc lập

#### Câu 5 (Đáp án đúng: **A**)
> **Nguyên tắc hàng đầu trong đoàn kết quốc tế theo tư tưởng Hồ Chí Minh là:**
* **A. Giữ vững độc lập tự chủ, tự lực tự cường và dựa vào sức mình là chính** *(ĐÚNG)*
* B. Dựa hoàn toàn vào nguồn viện trợ kinh tế - quân sự từ các nước đồng minh
* C. Sẵn sàng nhượng bộ chủ quyền lãnh thổ để đổi lấy môi trường hòa bình lâu dài
* D. Thành lập khối liên minh quân sự chặt chẽ nhằm răn đe các thế lực đối địch

---

### VÒNG 2: BÀN TRÒN CHIẾN LƯỢC (5 TÌNH HUỐNG - 60s/CÂU)

#### 📌 Tình huống 1 (Khoan dung & Trọng dụng nhân tài năm 1945 - Đáp án đúng: **D**)
> **Bối cảnh:** Sau Cách mạng Tháng Tám 1945, nước Việt Nam Dân chủ Cộng hòa non trẻ đứng trước muôn vàn khó khăn. Nhiều nhân sĩ, quan lại cao cấp của chế độ phong kiến cũ (như Cựu hoàng Bảo Đại, Thượng thư Bùi Bằng Đoàn, cụ Huỳnh Thúc Kháng) còn e ngại chính quyền mới.  
> **Câu hỏi:** *Chính phủ lâm thời do Chủ tịch Hồ Chí Minh đứng đầu đã đưa ra quyết sách gì?*
* A. Ban hành sắc lệnh tịch thu toàn bộ tài sản và quản thúc nghiêm ngặt để phòng ngừa nội phản.
* B. Bắt buộc tất cả quan lại cũ phải hoàn thành các khóa bồi dưỡng chính trị mới được làm việc.
* C. Chỉ bố trí họ giữ các vị trí cố vấn danh dự bên ngoài và không giao bất kỳ quyền hạn thực tế nào.
* **D. Lấy lòng khoan dung cảm hóa, xóa bỏ định kiến và trân trọng mời họ cùng tham gia gánh vác việc nước.** *(ĐÚNG)*
> 💡 *Giải thích:* Bác chủ trương *"Cầu hiền tài"*, lấy đại nghĩa dân tộc làm trọng, hướng thiện và tin tưởng nhân dân.

#### 📌 Tình huống 2 (Nghệ thuật "Dĩ bất biến, ứng vạn biến" năm 1946 - Đáp án đúng: **A**)
> **Bối cảnh:** Đầu năm 1946, 20 vạn quân Tưởng ở miền Bắc rắp tâm lật đổ chính quyền ta, trong khi thực dân Pháp muốn tái chiếm miền Nam. Pháp và Tưởng bắt tay ký Hiệp ước Hoa - Pháp nhằm đưa quân Pháp ra Bắc.  
> **Câu hỏi:** *Chủ tịch Hồ Chí Minh đã lựa chọn giải pháp ngoại giao nào để hóa giải nguy cơ trên?*
* **A. Tạm thời hòa hoãn với Pháp qua Hiệp định Sơ bộ để gạt 20 vạn quân Tưởng về nước, tranh thủ củng cố lực lượng.** *(ĐÚNG)*
* B. Phát động cuộc kháng chiến tổng lực trên cả hai miền nhằm quyết chiến đồng thời với cả quân đội Pháp và quân Tưởng.
* C. Chấp nhận liên minh quân sự lâu dài với Tưởng Giới Thạch để nhờ quân Tưởng ngăn chặn dã tâm xâm lược của Pháp.
* D. Nhượng bộ hoàn toàn các yêu sách kinh tế và quân sự của Pháp để tránh một cuộc chiến tranh tốn kém xương máu.
> 💡 *Giải thích:* Đây là nghệ thuật *"Hòa để tiến"*, giữ vững mục tiêu độc lập ("bất biến") bằng sách lược mềm dẻo ("vạn biến").

#### 📌 Tình huống 3 (Xử lý quan hệ Giai cấp và Dân tộc trong Mặt trận - Đáp án đúng: **C**)
> **Bối cảnh:** Trong quá trình mở rộng Mặt trận, có ý kiến cho rằng: *"Đảng là đại diện của giai cấp công nhân, nên Mặt trận chỉ tập hợp công nhân và nông dân; không nên kết nạp tầng lớp tư sản dân tộc và địa chủ vì họ có tính chất bóc lột"*.  
> **Câu hỏi:** *Quan điểm trên KHÔNG đúng với tư tưởng Hồ Chí Minh ở điểm cốt lõi nào?*
* A. Bác khẳng định mâu thuẫn giai cấp trong xã hội lúc này gay gắt hơn mâu thuẫn giữa dân tộc và đế quốc.
* B. Bác chủ trương xóa bỏ vai trò tiên phong của giai cấp công nhân để hòa tan Đảng vào trong Mặt trận.
* **C. Bác đặt lợi ích dân tộc lên trên hết; bất kỳ ai có lòng ái quốc, ủng hộ độc lập đều là thành viên Mặt trận.** *(ĐÚNG)*
* D. Bác xem mọi giai cấp và tầng lớp trong xã hội đều có quyền lợi và địa vị kinh tế hoàn toàn giống nhau.
> 💡 *Giải thích:* Trong cách mạng giải phóng dân tộc, quyền lợi giai cấp phải phục tùng quyền lợi của toàn dân tộc.

#### 📌 Tình huống 4 (Sức mạnh thời đại & Phong trào hòa bình quốc tế - Đáp án đúng: **B**)
> **Bối cảnh:** Trong kháng chiến chống Mỹ, Việt Nam không chỉ nhận viện trợ từ các nước Xã hội Chủ nghĩa mà còn nhận được sự ủng hộ mạnh mẽ từ phong trào phản chiến của chính nhân dân, học sinh, sinh viên Mỹ.  
> **Câu hỏi:** *Hồ Chí Minh đã vận dụng sách lược đoàn kết quốc tế nào trong tình thế này?*
* A. Coi toàn thể quốc gia và người dân Mỹ là kẻ thù xâm lược cần phải đánh bại trên mọi mặt trận.
* **B. Phân biệt rõ chính quyền đế quốc đi xâm lược với nhân dân Mỹ yêu chuộng công lý để tranh thủ sự đồng tình.** *(ĐÚNG)*
* C. Chỉ tập trung quan hệ với các nước xã hội chủ nghĩa và từ chối sự giúp đỡ từ nhân dân các nước tư bản.
* D. Kêu gọi các tổ chức quốc tế can thiệp quân sự trực tiếp để nhanh chóng kết thúc cuộc chiến tranh xâm lược.
> 💡 *Giải thích:* Phân hóa kẻ thù, đoàn kết với nhân dân tiến bộ ở chính các nước đế quốc đi xâm lược.

#### 📌 Tình huống 5 (Trường phái Ngoại giao Cây tre hiện nay - Đáp án đúng: **D**)
> **Bối cảnh:** Hiện nay, thế giới diễn biến phức tạp với sự cạnh tranh chiến lược gay gắt giữa các nước lớn. Việt Nam vẫn kiên định trường phái đối ngoại "Ngoại giao Cây tre Việt Nam": *"Gốc vững, thân chắc, cành uyển chuyển"*.  
> **Câu hỏi:** *Hình tượng "Gốc vững" thể hiện sự kế thừa tư tưởng Hồ Chí Minh ở nội dung nào?*
* A. Thay đổi lập trường linh hoạt theo từng siêu cường để tối đa hóa nguồn vốn viện trợ và vốn đầu tư nước ngoài.
* B. Gia nhập vào một liên minh quân sự hùng mạnh nhằm tìm kiếm chiếc ô bảo vệ an ninh trước các mối đe dọa.
* C. Khép kín thị trường nội địa để xây dựng nền kinh tế tự cung tự cấp, hạn chế sự can dự của các tổ chức quốc tế.
* **D. Kiên định bảo vệ độc lập dân tộc, chủ quyền quốc gia và đặt lợi ích quốc gia - dân tộc lên trên hết trong mọi quan hệ.** *(ĐÚNG)*
> 💡 *Giải thích:* "Gốc vững" là độc lập, tự chủ, tự lực tự cường và lợi ích quốc gia - dân tộc tối thượng.

---

## 4. KIẾN TRÚC KỸ THUẬT & DATA SCHEMA

### Firebase Realtime Database Schema (`/rooms/{roomPin}`)
```json
{
  "rooms": {
    "1234": {
      "status": "LOBBY | QUESTION | REVEAL | LEADERBOARD | FINISHED",
      "round": 1,
      "currentQuestionIndex": 0,
      "questionStartTime": 1724400000000,
      "timeLimit": 60,
      "teams": {
        "tien_phong": { "name": "Khối Tiên Phong", "score": 4500, "count": 5 },
        "tri_thuc": { "name": "Khối Trí Thức", "score": 5200, "count": 5 },
        "xung_kich": { "name": "Khối Xung Kích", "score": 4800, "count": 5 },
        "dan_toc_ton_giao": { "name": "Khối Dân Tộc - Tôn Giáo", "score": 3900, "count": 5 },
        "kieu_bao": { "name": "Khối Kiều Bào", "score": 4100, "count": 5 },
        "ban_be_quoc_te": { "name": "Khối Bạn Bè Quốc Tế", "score": 4600, "count": 5 }
      },
      "players": {
        "p_1": { "name": "Nguyễn Văn A", "teamId": "tri_thuc", "score": 1200, "streak": 2, "answer": 3 }
      }
    }
  }
}
```

---

## 5. LOGIC TÍNH ĐIỂM & COMBO ĐỒNG THUẬN

```typescript
// Tính điểm cá nhân: Tốc độ + Streak
export function calculateScore(isCorrect: boolean, timeUsed: number, timeLimit: number, streak: number) {
  if (!isCorrect) return { points: 0, newStreak: 0 };
  const speedBonus = Math.max(0, 1 - (timeUsed / timeLimit) / 2);
  const basePoints = Math.round(1000 * speedBonus);
  const streakBonus = Math.min(streak * 100, 500);
  return { points: basePoints + streakBonus, newStreak: streak + 1 };
}

// Tính Combo x2 điểm cho cả Đội (Vòng 2: Cả 5 người cùng chọn đúng)
export function getTeamMultiplier(answers: { isCorrect: boolean }[]) {
  const isFullTeamCorrect = answers.length === 5 && answers.every(a => a.isCorrect);
  return isFullTeamCorrect ? 2.0 : 1.0;
}
```

---

## 6. HƯỚNG DẪN PUSH GITHUB & DEPLOY VERCEL

```bash
# 1. Khởi tạo dự án Next.js
npx create-next-app@latest dai-doan-ket-arena --typescript --tailwind --app
cd dai-doan-ket-arena
npm install firebase canvas-confetti qrcode.react lucide-react clsx tailwind-merge framer-motion
npm install -D @types/canvas-confetti

# 2. Đẩy lên GitHub
git init
git add .
git commit -m "feat: complete dai-doan-ket arena web game"
git branch -M main
git remote add origin https://github.com/<your-username>/dai-doan-ket-arena.git
git push -u origin main

# 3. Deploy lên Vercel
# - Truy cập vercel.com -> Import repo dai-doan-ket-arena
# - Điền Environment Variables của Firebase (NEXT_PUBLIC_FIREBASE_API_KEY, ...)
# - Bấm Deploy -> Nhận link chạy trực tiếp trên lớp học!
```
