"use client";

import { useState } from "react";
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Users
} from "lucide-react";
import { LegalAccount } from "@/lib/mockData";

interface CorporateClientPortalProps {
  accounts: LegalAccount[];
  onBackToLanding: () => void;
  onSwitchRole: (role: "landing" | "specialist" | "support" | "supervisor" | "client") => void;
}

export default function CorporateClientPortal({
  accounts,
  onBackToLanding,
  onSwitchRole
}: CorporateClientPortalProps) {
  const [lookupQuery, setLookupQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<LegalAccount | null>(accounts[0] || null);
  const [uploadSuccess, setUploadSuccess] = useState("");

  const handleSearch = () => {
    const q = lookupQuery.trim().toLowerCase();
    if (!q) return;
    const found = accounts.find(a => 
      a.id.toLowerCase() === q || 
      a.companyName.toLowerCase().includes(q) ||
      (a.nationalId && a.nationalId.toLowerCase() === q)
    );
    if (found) {
      setSelectedAccount(found);
    } else {
      alert("پرونده‌ای با این مشخصات یافت نشد. لطفاً از صحت شناسه کاربری (UID) یا شناسه ملی اطمینان حاصل فرمایید.");
    }
  };

  const handleSimulateUpload = (docName: string) => {
    setUploadSuccess(`سند «${docName}» با موفقیت بارگذاری شد و در کارتابل کارشناس حقوقی قرار گرفت.`);
    setTimeout(() => setUploadSuccess(""), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Role Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLanding}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>صفحه اصلی (لندینگ)</span>
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">جایگاه فعال:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              نماینده شخص حقوقی / متقاضی شرکتی والکس
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-400 font-medium hidden lg:inline">تغییر سریع جایگاه:</span>
          <button
            onClick={() => onSwitchRole("support")}
            className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            پنل پشتیبانی (استعلام)
          </button>
          <button
            onClick={() => onSwitchRole("specialist")}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            ورود به پنل کارشناس حقوقی (ثبت و فرم)
          </button>
          <button
            onClick={() => onSwitchRole("supervisor")}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            پنل سرپرست نظارت
          </button>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Account Lookup Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>استعلام وضعیت پرونده احراز هویت شرکت</span>
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          جهت مشاهده آخرین وضعیت بررسی مدارک، شناسه کاربری والکس (UID) یا نام شرکت را وارد فرمایید:
        </p>
        <div className="flex gap-2 max-w-xl">
          <input
            type="text"
            placeholder="مثال: 1247401530 یا نام شرکت"
            value={lookupQuery}
            onChange={e => setLookupQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>استعلام پرونده</span>
          </button>
        </div>
      </div>

      {/* Current File Details */}
      {selectedAccount ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Status Card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400">اطلاعات پرونده حقوقی</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedAccount.companyName}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>شناسه والکس: <strong className="font-mono text-slate-700 dark:text-slate-300">{selectedAccount.id}</strong></span>
                  <span>|</span>
                  <span>کارشناس پیگیری: <strong className="text-slate-700 dark:text-slate-300">{selectedAccount.expert}</strong></span>
                </div>
              </div>

              <div className="text-left">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  selectedAccount.phase === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedAccount.phase === "processing"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-amber-100 text-amber-800"
                }`}>
                  {selectedAccount.lastStatus}
                </span>
              </div>
            </div>

            {selectedAccount.rejectionReason && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>پیام کارشناس حقوقی والکس جهت تکمیل مدارک:</span>
                </p>
                <p className="mt-1">{selectedAccount.rejectionReason}</p>
              </div>
            )}

            {/* Checklist of verification */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">چک‌لیست وضعیت اسناد ثبتی:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>اساسنامه و آگهی تاسیس</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">تایید شده</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>استعلام روزنامه رسمی کشور</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    selectedAccount.gazetteVerified 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {selectedAccount.gazetteVerified ? "تایید شده" : "در حال استعلام"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>احراز هویت صاحبان امضا</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">بررسی شده</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>شماره حساب بانکی شرکت</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    selectedAccount.accountNumber ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                  }`}>
                    {selectedAccount.accountNumber ? "ثبت شده" : "نیاز به ورود"}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>شماره شبای حقوقی شرکت</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    selectedAccount.iban ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                  }`}>
                    {selectedAccount.iban ? "ثبت شده" : "نیاز به ورود"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Documents Drawer for Client */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>بارگذاری اسناد تکمیلی</span>
            </h3>
            <p className="text-xs text-slate-500">
              در صورت درخواست کارشناس، تصاویر اسناد مهر و امضا شده را از اینجا ارسال نمایید:
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSimulateUpload("آخرین آگهی تغییرات روزنامه رسمی")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>بارگذاری روزنامه تغییرات</span>
                <Upload className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handleSimulateUpload("قرارداد امضاشده والکس با مهر شرکت")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>ارسال قرارداد امضاشده والکس</span>
                <Upload className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handleSimulateUpload("تاییدیه شماره شبا از بانک عامل")}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>گواهی شماره شبا بانکی</span>
                <Upload className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-[11px] text-blue-800 dark:text-blue-300">
              مدارک ارسالی شما در اسرع وقت توسط کارشناسان حقوقی پشتیبانی والکس بررسی و نتیجه از طریق پیامک و ایمیل اعلام می‌گردد.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
