import type {Metadata} from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css'; // Global styles

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazir',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'سامانه احراز هویت حقوقی',
  description: 'سامانه مدیریت و گزارش‌دهی فرآیند احراز هویت کاربران حقوقی تیم پشتیبانی والکس',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
