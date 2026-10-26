import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 p-4" dir="rtl">
      <div className="text-center max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-4">
        <h1 className="text-6xl font-black text-slate-300">۴۰۴</h1>
        <h2 className="text-xl font-bold text-slate-800">صفحه مورد نظر یافت نشد</h2>
        <p className="text-sm text-slate-500">آدرس مورد نظر وجود ندارد یا منتقل شده است.</p>
        <Link 
          href="/" 
          className="inline-block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200 shadow-sm"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
