import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Đại Đoàn Kết Arena — Tư tưởng Hồ Chí Minh (HCM202)',
  description:
    'Nền tảng đối kháng học thuật tương tác lớp học — Chương V: Tư tưởng Hồ Chí Minh về Đại đoàn kết toàn dân tộc và Đoàn kết quốc tế',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`dark ${beVietnamPro.variable} ${lora.variable}`}>
      <body
        className={`${beVietnamPro.className} bg-[#090D16] text-slate-200 antialiased selection:bg-amber-900/60 selection:text-amber-200 min-h-screen flex flex-col`}
      >
        {/* Subtle academic background textures & minimal grid */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-950/25 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[400px] bg-amber-950/15 rounded-full blur-[140px]" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
