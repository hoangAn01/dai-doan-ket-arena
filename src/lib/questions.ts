import { Question } from './types';

export const QUESTIONS: Question[] = [
  // VÒNG 1: KHỞI ĐỘNG THẦN TỐC (15s/CÂU)
  {
    id: 1,
    round: 1,
    text: 'Theo Chủ tịch Hồ Chí Minh, đại đoàn kết toàn dân tộc được xác định là:',
    options: [
      'A. Sách lược tạm thời nhằm đối phó với kẻ thù trong từng giai đoạn cách mạng',
      'B. Thủ đoạn chính trị để kêu gọi và vận động sự hỗ trợ của các tầng lớp nhân dân',
      'C. Đường lối chiến lược xuyên suốt và quyết định thành công của cách mạng',
      'D. Phong trào thi đua ngắn hạn do các đoàn thể quần chúng tổ chức và phát động',
    ],
    correctIndex: 2, // C
    timeLimit: 15,
  },
  {
    id: 2,
    round: 1,
    text: 'Điền vào chỗ trống quan điểm của Bác: "Nước lấy dân làm..., gốc có vững cây mới bền":',
    options: ['A. Gốc', 'B. Trọng', 'C. Tâm', 'D. Đầu'],
    correctIndex: 0, // A
    timeLimit: 15,
  },
  {
    id: 3,
    round: 1,
    text: 'Lực lượng làm NỀN TẢNG cho khối Đại đoàn kết toàn dân tộc là:',
    options: [
      'A. Khối liên minh giữa giai cấp công nhân, tầng lớp doanh nhân và tư sản dân tộc',
      'B. Toàn thể tầng lớp tiểu tư sản trí thức và giới văn nghệ sĩ yêu nước thành thị',
      'C. Sự hợp nhất của tất cả các tổ chức chính trị - xã hội đang hoạt động toàn quốc',
      'D. Khối liên minh giữa giai cấp công nhân, giai cấp nông dân và đội ngũ trí thức',
    ],
    correctIndex: 3, // D
    timeLimit: 15,
  },
  {
    id: 4,
    round: 1,
    text: 'Tổ chức nào là hình thức tổ chức cao nhất của khối đại đoàn kết toàn dân tộc?',
    options: [
      'A. Cơ quan đại biểu quyền lực nhà nước cao nhất là Quốc hội nước CHXHCN Việt Nam',
      'B. Mặt trận Dân tộc Thống nhất (ngày nay là Mặt trận Tổ quốc Việt Nam)',
      'C. Tổng Liên đoàn Lao động Việt Nam cùng toàn bộ các tổ chức công đoàn cơ sở',
      'D. Các hiệp hội nghề nghiệp và các tổ chức xã hội dân sự hoạt động độc lập',
    ],
    correctIndex: 1, // B
    timeLimit: 15,
  },
  {
    id: 5,
    round: 1,
    text: 'Nguyên tắc hàng đầu trong đoàn kết quốc tế theo tư tưởng Hồ Chí Minh là:',
    options: [
      'A. Giữ vững độc lập tự chủ, tự lực tự cường và dựa vào sức mình là chính',
      'B. Dựa hoàn toàn vào nguồn viện trợ kinh tế - quân sự từ các nước đồng minh',
      'C. Sẵn sàng nhượng bộ chủ quyền lãnh thổ để đổi lấy môi trường hòa bình lâu dài',
      'D. Thành lập khối liên minh quân sự chặt chẽ nhằm răn đe các thế lực đối địch',
    ],
    correctIndex: 0, // A
    timeLimit: 15,
  },

  // VÒNG 2: BÀN TRÒN CHIẾN LƯỢC (60s/CÂU)
  {
    id: 6,
    round: 2,
    context:
      'Sau Cách mạng Tháng Tám 1945, nước Việt Nam Dân chủ Cộng hòa non trẻ đứng trước muôn vàn khó khăn. Nhiều nhân sĩ, quan lại cao cấp của chế độ phong kiến cũ (như Cựu hoàng Bảo Đại, Thượng thư Bùi Bằng Đoàn, cụ Huỳnh Thúc Kháng) còn e ngại chính quyền mới.',
    text: 'Chính phủ lâm thời do Chủ tịch Hồ Chí Minh đứng đầu đã đưa ra quyết sách gì?',
    options: [
      'A. Ban hành sắc lệnh tịch thu toàn bộ tài sản và quản thúc nghiêm ngặt để phòng ngừa nội phản.',
      'B. Bắt buộc tất cả quan lại cũ phải hoàn thành các khóa bồi dưỡng chính trị mới được làm việc.',
      'C. Chỉ bố trí họ giữ các vị trí cố vấn danh dự bên ngoài và không giao bất kỳ quyền hạn thực tế nào.',
      'D. Lấy lòng khoan dung cảm hóa, xóa bỏ định kiến và trân trọng mời họ cùng tham gia gánh vác việc nước.',
    ],
    correctIndex: 3, // D
    explanation:
      'Bác chủ trương "Cầu hiền tài", lấy đại nghĩa dân tộc làm trọng, hướng thiện và tin tưởng nhân dân.',
    timeLimit: 60,
  },
  {
    id: 7,
    round: 2,
    context:
      'Đầu năm 1946, 20 vạn quân Tưởng ở miền Bắc rắp tâm lật đổ chính quyền ta, trong khi thực dân Pháp muốn tái chiếm miền Nam. Pháp và Tưởng bắt tay ký Hiệp ước Hoa - Pháp nhằm đưa quân Pháp ra Bắc.',
    text: 'Chủ tịch Hồ Chí Minh đã lựa chọn giải pháp ngoại giao nào để hóa giải nguy cơ trên?',
    options: [
      'A. Tạm thời hòa hoãn với Pháp qua Hiệp định Sơ bộ để gạt 20 vạn quân Tưởng về nước, tranh thủ củng cố lực lượng.',
      'B. Phát động cuộc kháng chiến tổng lực trên cả hai miền nhằm quyết chiến đồng thời với cả quân đội Pháp và quân Tưởng.',
      'C. Chấp nhận liên minh quân sự lâu dài với Tưởng Giới Thạch để nhờ quân Tưởng ngăn chặn dã tâm xâm lược của Pháp.',
      'D. Nhượng bộ hoàn toàn các yêu sách kinh tế và quân sự của Pháp để tránh một cuộc chiến tranh tốn kém xương máu.',
    ],
    correctIndex: 0, // A
    explanation:
      'Đây là nghệ thuật "Hòa để tiến", giữ vững mục tiêu độc lập ("bất biến") bằng sách lược mềm dẻo ("vạn biến").',
    timeLimit: 60,
  },
  {
    id: 8,
    round: 2,
    context:
      'Trong quá trình mở rộng Mặt trận, có ý kiến cho rằng: "Đảng là đại diện của giai cấp công nhân, nên Mặt trận chỉ tập hợp công nhân và nông dân; không nên kết nạp tầng lớp tư sản dân tộc và địa chủ vì họ có tính chất bóc lột".',
    text: 'Quan điểm trên KHÔNG đúng với tư tưởng Hồ Chí Minh ở điểm cốt lõi nào?',
    options: [
      'A. Bác khẳng định mâu thuẫn giai cấp trong xã hội lúc này gay gắt hơn mâu thuẫn giữa dân tộc và đế quốc.',
      'B. Bác chủ trương xóa bỏ vai trò tiên phong của giai cấp công nhân để hòa tan Đảng vào trong Mặt trận.',
      'C. Bác đặt lợi ích dân tộc lên trên hết; bất kỳ ai có lòng ái quốc, ủng hộ độc lập đều là thành viên Mặt trận.',
      'D. Bác xem mọi giai cấp và tầng lớp trong xã hội đều có quyền lợi và địa vị kinh tế hoàn toàn giống nhau.',
    ],
    correctIndex: 2, // C
    explanation:
      'Trong cách mạng giải phóng dân tộc, quyền lợi giai cấp phải phục tùng quyền lợi của toàn dân tộc.',
    timeLimit: 60,
  },
  {
    id: 9,
    round: 2,
    context:
      'Trong kháng chiến chống Mỹ, Việt Nam không chỉ nhận viện trợ từ các nước Xã hội Chủ nghĩa mà còn nhận được sự ủng hộ mạnh mẽ từ phong trào phản chiến của chính nhân dân, học sinh, sinh viên Mỹ.',
    text: 'Hồ Chí Minh đã vận dụng sách lược đoàn kết quốc tế nào trong tình thế này?',
    options: [
      'A. Coi toàn thể quốc gia và người dân Mỹ là kẻ thù xâm lược cần phải đánh bại trên mọi mặt trận.',
      'B. Phân biệt rõ chính quyền đế quốc đi xâm lược với nhân dân Mỹ yêu chuộng công lý để tranh thủ sự đồng tình.',
      'C. Chỉ tập trung quan hệ với các nước xã hội chủ nghĩa và từ chối sự giúp đỡ từ nhân dân các nước tư bản.',
      'D. Kêu gọi các tổ chức quốc tế can thiệp quân sự trực tiếp để nhanh chóng kết thúc cuộc chiến tranh xâm lược.',
    ],
    correctIndex: 1, // B
    explanation:
      'Phân hóa kẻ thù, đoàn kết với nhân dân tiến bộ ở chính các nước đế quốc đi xâm lược.',
    timeLimit: 60,
  },
  {
    id: 10,
    round: 2,
    context:
      'Hiện nay, thế giới diễn biến phức tạp với sự cạnh tranh chiến lược gay gắt giữa các nước lớn. Việt Nam vẫn kiên định trường phái đối ngoại "Ngoại giao Cây tre Việt Nam": "Gốc vững, thân chắc, cành uyển chuyển".',
    text: 'Hình tượng "Gốc vững" thể hiện sự kế thừa tư tưởng Hồ Chí Minh ở nội dung nào?',
    options: [
      'A. Thay đổi lập trường linh hoạt theo từng siêu cường để tối đa hóa nguồn vốn viện trợ và vốn đầu tư nước ngoài.',
      'B. Gia nhập vào một liên minh quân sự hùng mạnh nhằm tìm kiếm chiếc ô bảo vệ an ninh trước các mối đe dọa.',
      'C. Khép kín thị trường nội địa để xây dựng nền kinh tế tự cung tự cấp, hạn chế sự can dự của các tổ chức quốc tế.',
      'D. Kiên định bảo vệ độc lập dân tộc, chủ quyền quốc gia và đặt lợi ích quốc gia - dân tộc lên trên hết trong mọi quan hệ.',
    ],
    correctIndex: 3, // D
    explanation:
      '"Gốc vững" là độc lập, tự chủ, tự lực tự cường và lợi ích quốc gia - dân tộc tối thượng.',
    timeLimit: 60,
  },
];
