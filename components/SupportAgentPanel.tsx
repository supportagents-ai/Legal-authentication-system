"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  MessageSquare, 
  PhoneCall, 
  ArrowRight, 
  FileText, 
  ShieldAlert, 
  Users, 
  CreditCard, 
  Sparkles,
  ExternalLink,
  HelpCircle,
  KeyRound,
  LogOut,
  Eye,
  X,
  FileCheck2,
  Calendar,
  AlertTriangle,
  Info,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { LegalAccount } from "@/lib/mockData";
import { AuthUser } from "@/lib/auth";

interface SupportAgentPanelProps {
  accounts: LegalAccount[];
  onBackToLanding: () => void;
  onSwitchRole: (role: "landing" | "specialist" | "support" | "management" | "supervisor" | "client") => void;
  currentUser?: AuthUser | null;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
}

export default function SupportAgentPanel({
  accounts,
  onBackToLanding,
  onSwitchRole,
  currentUser,
  onOpenChangePassword,
  onLogout,
}: SupportAgentPanelProps) {
  const [nationalIdInput, setNationalIdInput] = useState("");
  const [searchedId, setSearchedId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Selected account for full status inspection modal
  const [detailModalAccount, setDetailModalAccount] = useState<LegalAccount | null>(null);

  // Normalize Persian and Arabic digits to standard digits
  const normalizeDigits = (str: string) => {
    return (str || "")
      .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
      .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
      .trim();
  };

  // Find matching accounts strictly based on searched company National ID (or fallback UID)
  const matchingAccounts = useMemo(() => {
    if (!searchedId) return [];
    const rawClean = normalizeDigits(searchedId).replace(/\D/g, "");
    if (!rawClean) {
      // In case user typed letters (company name)
      const textQuery = searchedId.toLowerCase().trim();
      return accounts.filter(acc => (acc.companyName || "").toLowerCase().includes(textQuery));
    }

    return accounts.filter(acc => {
      const accNat = normalizeDigits(acc.nationalId || "").replace(/\D/g, "");
      const accUid = normalizeDigits(acc.id || "").replace(/\D/g, "");
      return accNat === rawClean || accNat.includes(rawClean) || accUid === rawClean;
    });
  }, [accounts, searchedId]);

  const matchedAccount = useMemo(() => {
    if (matchingAccounts.length === 0) return null;
    if (selectedAccountId) {
      const found = matchingAccounts.find(a => a.id === selectedAccountId);
      if (found) return found;
    }
    return matchingAccounts[0];
  }, [matchingAccounts, selectedAccountId]);

  const handleSearch = (customQuery?: string) => {
    const query = customQuery !== undefined ? customQuery : nationalIdInput;
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchedId(trimmed);
    setSelectedAccountId(null);
    setHasSearched(true);
    setCopied(false);
  };

  const handleClearSearch = () => {
    setNationalIdInput("");
    setSearchedId("");
    setSelectedAccountId(null);
    setHasSearched(false);
    setCopied(false);
  };

  // Generate polite support script to send to user in live chat
  const generateChatScript = (acc: LegalAccount) => {
    const company = acc.companyName || "شخص حقوقی";
    if (acc.phase === "approved") {
      return `کاربر گرامی والکس، با سلام. پرونده احراز هویت شرکت «${company}» با شناسه ملی ${acc.nationalId} در سامانه والکس با موفقیت تایید نهایی گردیده است و دسترسی معاملات و واریز/برداشت شرکتی برای شما فعال می‌باشد.`;
    }

    if (acc.rejectionReason) {
      return `کاربر گرامی والکس، با سلام. وضعیت پرونده حقوقی شرکت «${company}» توسط کارشناس حقوقی بررسی گردیده است. طبق یادداشت کارشناس: «${acc.rejectionReason}». خواهشمند است نسبت به رفع این موارد و ارسال مجدد مدارک اصلاح‌شده اقدام فرمایید تا فرآیند فعال‌سازی حساب تکمیل گردد.`;
    }

    return `کاربر گرامی والکس، با سلام. پرونده حقوقی شرکت «${company}» در وضعیت «${acc.lastStatus}» قرار دارد و توسط کارشناس حقوقی (${acc.expert}) در حال بررسی و تکمیل است. نتیجه بررسی به زودی از طریق پیامک به اطلاع شما خواهد رسید.`;
  };

  const handleCopyScript = (script: string) => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Role Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white">
              سامانه احراز هویت حقوقی والکس
            </h1>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">
              پنل کارشناس پشتیبانی (پاسخگویی به کاربران بر اساس استعلام شناسه ملی)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {currentUser && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 rounded-xl px-3 py-1.5 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({currentUser.displayUsername || currentUser.username})
              </span>
            </div>
          )}

          {currentUser?.canChangePassword !== false && onOpenChangePassword && (
            <button
              onClick={onOpenChangePassword}
              className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="تغییر رمز عبور ورود"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>تغییر رمز عبور</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
              title="خروج از حساب کاربری"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Support Agent Lookup Card */}
      <div className="bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-900 dark:to-slate-900/60 border-2 border-amber-300/80 dark:border-amber-700/60 rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 text-xs font-bold">
            <Search className="w-3.5 h-3.5" />
            <span>استعلام اختصاصی پرونده حقوقی بر اساس شناسه ملی</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              استعلام وضعیت حساب حقوقی شرکت
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl mx-auto leading-relaxed">
              جهت حفظ حریم خصوصی، فهرست کلی پرونده‌ها نمایش داده نمی‌شود. لطفاً هنگام ارتباط کاربر در چت آنلاین یا تماس تلفنی، شناسه ملی ۱۱ رقمی شرکت را وارد نمایید.
            </p>
          </div>

          {/* Prominent Search Input Box */}
          <div className="flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto pt-2">
            <div className="relative w-full flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="شناسه ملی ۱۱ رقمی شرکت را وارد کنید (مثال: ۱۰۱۰۳۴۵۶۷۸۹)..."
                value={nationalIdInput}
                onChange={e => setNationalIdInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="w-full pr-12 pl-10 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-500 rounded-2xl text-sm font-mono tracking-wider text-slate-900 dark:text-white focus:outline-none shadow-sm transition-all"
                dir="ltr"
              />
              {nationalIdInput && (
                <button
                  onClick={() => setNationalIdInput("")}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                  title="پاک کردن"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleSearch()}
                className="w-full sm:w-auto px-6 py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>استعلام پرونده</span>
              </button>

              {hasSearched && (
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  title="پاک کردن جستجو"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>پاک کردن</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Demo Search Chips for Convenience */}
          <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap text-[11px] text-slate-500">
            <span className="font-semibold">نمونه شناسه‌های ملی جهت تست سریع:</span>
            {accounts.slice(0, 3).map((acc) => (
              <button
                key={acc.id}
                onClick={() => {
                  setNationalIdInput(acc.nationalId || "");
                  handleSearch(acc.nationalId || "");
                }}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer"
                dir="ltr"
              >
                {acc.nationalId}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* INITIAL STATE: GUIDANCE WHEN NO SEARCH HAS BEEN PERFORMED */}
      {!hasSearched && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8 animate-in fade-in duration-200">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              استعلام اختصاصی پرونده‌های حقوقی
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              جهت حفظ محرمانگی و امنیت اطلاعات اشخاص حقوقی، کلیه پرونده‌ها صرفاً پس از جستجوی شناسه ملی ۱۱ رقمی شرکت نمایش داده می‌شوند.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-right">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">استعلام آنی آخرین وضعیت</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                مشاهده مرحله دقیق بررسی، فاز حقوقی، شماره شبا و شماره حساب بانکی و وضعیت استعلام روزنامه رسمی.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">مشاهده یادداشت‌های نقص مدارک</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                بررسی توضیحات و دلایل عدم تایید ثبت‌شده توسط کارشناسان حقوقی جهت راهنمایی دقیق کاربر.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">کپی آماده پیام چت پشتیبانی</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                تولید خودکار پاسخ استاندارد و محترمانه بر اساس آخرین وضعیت پرونده با امکان کپی یک‌کلیکه.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH RESULT DETAILS (DISPLAYED ONLY AFTER SEARCHING) */}
      {hasSearched && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Multiple matches selector if partial national ID matched more than 1 account */}
          {matchingAccounts.length > 1 && (
            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {matchingAccounts.length} پرونده با این مشخصات یافت شد، لطفاً شرکت مورد نظر را انتخاب نمایید:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {matchingAccounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      (matchedAccount?.id === acc.id)
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <span>{acc.companyName}</span>
                    <span className="font-mono text-[11px] opacity-80" dir="ltr">({acc.nationalId})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedAccount ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {matchedAccount.companyName}
                    </h3>
                    {matchedAccount.companyType && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {matchedAccount.companyType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>شناسه ملی: <strong className="font-mono text-slate-800 dark:text-slate-200">{matchedAccount.nationalId}</strong></span>
                    <span>|</span>
                    <span>شماره ثبت: <strong className="font-mono text-slate-800 dark:text-slate-200">{matchedAccount.registrationNumber || "---"}</strong></span>
                    {matchedAccount.registrationDate && (
                      <>
                        <span>|</span>
                        <span>تاریخ ثبت شرکت: <strong className="font-mono text-slate-800 dark:text-slate-200">{matchedAccount.registrationDate}</strong></span>
                      </>
                    )}
                    <span>|</span>
                    <span>نماینده رابط: <strong className="text-slate-800 dark:text-slate-200">{matchedAccount.adminName || "مشخص نشده"}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-2xs ${
                    matchedAccount.phase === "approved"
                      ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                      : matchedAccount.rejectionReason
                        ? "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        : matchedAccount.phase === "processing"
                          ? "bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
                          : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                  }`}>
                    {matchedAccount.phase === "approved" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : matchedAccount.rejectionReason ? (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-purple-600" />
                    )}
                    <span>{matchedAccount.lastStatus}</span>
                  </span>

                  {/* Open Detail Modal Button */}
                  <button
                    onClick={() => setDetailModalAccount(matchedAccount)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>مشاهده پرونده کامل</span>
                  </button>
                </div>
              </div>

              {/* Missing Documents & Legal Expert Comments */}
              <div className={`p-5 rounded-2xl border-2 space-y-3 ${
                matchedAccount.rejectionReason 
                  ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60"
                  : matchedAccount.phase === "approved"
                    ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60"
                    : "bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-5 h-5 ${
                      matchedAccount.rejectionReason ? "text-rose-600" : matchedAccount.phase === "approved" ? "text-emerald-600" : "text-blue-600"
                    }`} />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {matchedAccount.rejectionReason ? "علت نقص مدارک و یادداشت کارشناس حقوقی:" : "وضعیت بررسی مدارک توسط کارشناس حقوقی:"}
                    </h4>
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    کارشناس مسئول: <strong className="text-slate-800 dark:text-slate-200">{matchedAccount.expert}</strong>
                  </span>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {matchedAccount.rejectionReason ? (
                    <p className="text-rose-900 dark:text-rose-200 font-semibold">
                      {matchedAccount.rejectionReason}
                    </p>
                  ) : matchedAccount.phase === "approved" ? (
                    <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                      تمامی اسناد، روزنامه رسمی، احراز صاحبان امضا و شماره شبای شرکتی تایید گردیده و هیچ‌گونه نقصی در پرونده وجود ندارد.
                    </p>
                  ) : (
                    <p className="text-slate-700 dark:text-slate-300">
                      پرونده در مرحله بررسی کارشناس حقوقی است. تاکنون نقص مدارکی ثبت نشده است.
                    </p>
                  )}
                </div>

                {/* Ready-to-copy chat response for user */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>متن آماده جهت پاسخگویی به کاربر در چت / تماس:</span>
                    </span>

                    <button
                      onClick={() => handleCopyScript(generateChatScript(matchedAccount))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                        copied
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>کپی شد!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>کپی متن جهت ارسال در چت</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-700">
                    {generateChatScript(matchedAccount)}
                  </div>
                </div>
              </div>

              {/* Fast Information Grid for the Searched Account */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">شماره حساب و شبای بانکی</span>
                  <div className="space-y-0.5">
                    <p className="font-bold font-mono text-slate-800 dark:text-slate-200" dir="ltr">
                      {matchedAccount.iban || "ثبت نشده"}
                    </p>
                    {matchedAccount.accountNumber && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono" dir="ltr">
                        حساب: {matchedAccount.accountNumber}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 block">{matchedAccount.bankName || "بانک ملی ایران"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">صاحبان امضا</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {matchedAccount.signers || "مشخص شده در روزنامه رسمی"}
                  </p>
                  {matchedAccount.signatories && matchedAccount.signatories.length > 0 && (
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 block mt-0.5">
                      {matchedAccount.signatories.length} نفر صاحب امضا ثبت شده
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">استعلام روزنامه رسمی</span>
                  <span className={`inline-flex items-center gap-1 font-bold ${
                    matchedAccount.gazetteVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  }`}>
                    {matchedAccount.gazetteVerified ? "✓ تایید شده" : "⏳ در انتظار بررسی"}
                  </span>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {matchedAccount.newspaperNumber || "بدون شماره روزنامه"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                هیچ حساب حقوقی با شناسه ملی «{searchedId}» یافت نشد
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                لطفاً صحت شناسه ملی ۱۱ رقمی اعلام‌شده توسط کاربر را مجدداً بررسی فرمایید.
              </p>
              <button
                onClick={handleClearSearch}
                className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>پاک کردن و جستجوی مجدد</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* READ-ONLY STATUS INSPECTION MODAL FOR REGULAR AGENT */}
      {detailModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-amber-500/10 dark:bg-amber-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      مشاهده وضعیت پرونده: {detailModalAccount.companyName}
                    </h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      دسترسی کارشناس معمولی (فقط خواندنی)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    شناسه ملی: <strong className="font-mono text-slate-700 dark:text-slate-300">{detailModalAccount.nationalId || "---"}</strong> | شناسه کاربری: <strong className="font-mono text-slate-700 dark:text-slate-300">{detailModalAccount.id}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDetailModalAccount(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
                detailModalAccount.phase === "approved"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                  : detailModalAccount.rejectionReason
                    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800"
                    : "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800"
              }`}>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-semibold block">وضعیت فعلی در سامانه احراز هویت:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {detailModalAccount.lastStatus}
                    </span>
                    <span className="text-xs text-slate-500">
                      (فاز: {detailModalAccount.phase === "approved" ? "تایید نهایی" : detailModalAccount.phase === "processing" ? "در حال پیگیری" : "اطلاعات اولیه"})
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs text-slate-400 block">کارشناس مسئول:</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{detailModalAccount.expert}</span>
                </div>
              </div>

              {/* Rejection / Missing Documents Notes */}
              {detailModalAccount.rejectionReason && (
                <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>علت نقص مدارک و یادداشت کارشناس حقوقی جهت اعلام به کاربر:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200 font-semibold leading-relaxed">
                    {detailModalAccount.rejectionReason}
                  </p>
                </div>
              )}

              {/* Copyable Chat Script */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>متن آماده جهت پاسخگویی به متقاضی در چت آنلاین یا تیکت:</span>
                  </span>

                  <button
                    onClick={() => handleCopyScript(generateChatScript(detailModalAccount))}
                    className="px-3 py-1 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>کپی پاسخ</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {generateChatScript(detailModalAccount)}
                </p>
              </div>

              {/* Company Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">نوع شرکت</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{detailModalAccount.companyType || "ثبت نشده"}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">شماره ثبت و تاریخ ثبت شرکت</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    ثبت: {detailModalAccount.registrationNumber || "---"} {detailModalAccount.registrationDate ? `| تاریخ: ${detailModalAccount.registrationDate}` : ""}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">کد اقتصادی شرکت</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    {detailModalAccount.economicCode || "ثبت نشده"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">نماینده ثبت‌نامی / ادمین</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{detailModalAccount.adminName || "---"}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">شماره تماس شرکت</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200" dir="ltr">
                    {detailModalAccount.companyPhone || "---"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 block">صاحبان امضا به همراه کدملی و سمت</span>
                    {detailModalAccount.signersRules && (
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                        حق امضا: {detailModalAccount.signersRules}
                      </span>
                    )}
                  </div>
                  {detailModalAccount.signatories && detailModalAccount.signatories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {detailModalAccount.signatories.map((sig, idx) => (
                        <div key={sig.id || idx} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{sig.fullName}</span>
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{sig.role}</span>
                          </div>
                          <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]" dir="ltr">{sig.nationalId}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {detailModalAccount.signers || "مشخص شده در روزنامه رسمی"}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 sm:col-span-2">
                  <span className="text-slate-400 block mb-1">تاریخ آگهی آخرین روزنامه رسمی و استعلام</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {detailModalAccount.newspaperNumber || "ثبت نشده"}
                  </p>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 block font-bold">
                    {detailModalAccount.gazetteVerified ? "✓ استعلام روزنامه رسمی تایید گردیده است" : "⏳ در انتظار استعلام یا ارائه مدارک تکمیلی"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 sm:col-span-2">
                  <span className="text-slate-400 block mb-1">اطلاعات حساب و شماره شبای حقوقی</span>
                  <div className="space-y-1">
                    <p className="font-bold font-mono text-slate-800 dark:text-slate-200" dir="ltr">
                      {detailModalAccount.iban || "شماره شبا ثبت نشده است"}
                    </p>
                    {detailModalAccount.accountNumber && (
                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        شماره حساب بانکی: <strong className="font-mono text-slate-900 dark:text-white" dir="ltr">{detailModalAccount.accountNumber}</strong>
                      </p>
                    )}
                    <span className="text-[11px] text-slate-500 block">
                      بانک عامل: {detailModalAccount.bankName || "بانک ملی ایران"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Call History */}
              {detailModalAccount.callLogs && detailModalAccount.callLogs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    <span>تاریخچه مکالمات کارشناسان حقوقی با متقاضی ({detailModalAccount.callLogs.length}):</span>
                  </h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {detailModalAccount.callLogs.map((log, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between gap-3 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400">{log.date}</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{log.expert}</span>
                          <span className="text-slate-600 dark:text-slate-400">{log.result}</span>
                        </div>
                        {log.recallInterval && (
                          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                            {log.recallInterval}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                سامانه احراز هویت شرکتی والکس - نگارش حقوقی
              </span>
              <button
                onClick={() => setDetailModalAccount(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
