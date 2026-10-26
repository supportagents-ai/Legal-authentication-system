"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Save, 
  Building2, 
  User, 
  FileText,
  Calendar,
  Sparkles,
  Layers
} from "lucide-react";
import { LegalAccount, StatusPhase } from "@/lib/mockData";
import { getTodayShamsiString } from "@/lib/utils";

interface ManagementEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: LegalAccount | null;
  onSave: (updatedAccount: LegalAccount) => void;
  onOpenFullKyc?: (account: LegalAccount) => void;
  experts: string[];
}

const STATUS_PRESETS = [
  "تایید نهایی",
  "سطح۲-ارسال برای خانم اسدی",
  "ارسال قرارداد نهایی برای کاربر",
  "ارسال ایمیل برای کاربر",
  "در پرروال ثبت شد",
  "در انتظار تکمیل توسط کاربر",
  "در انتظار تکمیل فرم توسط کارشناس",
  "دارای نقص مدارک ثبتی / اساسنامه",
  "رد شده - عدم تطابق صاحبان امضا"
];

export default function ManagementEditModal({
  isOpen,
  onClose,
  account,
  onSave,
  onOpenFullKyc,
  experts
}: ManagementEditModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [expert, setExpert] = useState(experts[0] || "آیگین صدیق");
  const [lastStatus, setLastStatus] = useState(STATUS_PRESETS[0]);
  const [customStatus, setCustomStatus] = useState("");
  const [isCustomStatus, setIsCustomStatus] = useState(false);
  const [phase, setPhase] = useState<StatusPhase>("processing");
  const [rejectionReason, setRejectionReason] = useState("");
  const [prowal, setProwal] = useState("");
  const [signers, setSigners] = useState("");
  const [expertEmailSent, setExpertEmailSent] = useState("");
  const [userSignedEmailRecv, setUserSignedEmailRecv] = useState("");
  const [wallexSignedSent, setWallexSignedSent] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (account) {
      setCompanyName(account.companyName || "");
      setNationalId(account.nationalId || "");
      setExpert(account.expert || experts[0] || "آیگین صدیق");
      
      const foundPreset = STATUS_PRESETS.includes(account.lastStatus);
      if (foundPreset) {
        setLastStatus(account.lastStatus);
        setIsCustomStatus(false);
        setCustomStatus("");
      } else {
        setLastStatus("custom");
        setIsCustomStatus(true);
        setCustomStatus(account.lastStatus || "");
      }

      setPhase(account.phase || "processing");
      setRejectionReason(account.rejectionReason || "");
      setProwal(account.prowal || "");
      setSigners(account.signers || "");
      setExpertEmailSent(account.expertSignatureEmailSentDate || "");
      setUserSignedEmailRecv(account.userSignedEmailReceivedDate || "");
      setWallexSignedSent(account.wallexSignedContractSentDate || "");
      setSaveSuccess(false);
    }
  }, [account, experts, isOpen]);

  if (!isOpen || !account) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const finalStatus = isCustomStatus ? (customStatus.trim() || "در حال بررسی") : lastStatus;

    const updated: LegalAccount = {
      ...account,
      companyName: companyName.trim() || account.companyName,
      nationalId: nationalId.trim() || account.nationalId,
      expert,
      lastStatus: finalStatus,
      phase,
      rejectionReason: rejectionReason.trim(),
      prowal: prowal.trim(),
      signers: signers.trim(),
      expertSignatureEmailSentDate: expertEmailSent.trim(),
      userSignedEmailReceivedDate: userSignedEmailRecv.trim(),
      wallexSignedContractSentDate: wallexSignedSent.trim(),
    };

    setTimeout(() => {
      onSave(updated);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>بررسی و ثبت تغییرات مدیریتی پرونده</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/20">
                  {account.companyName}
                </span>
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                تغییر وضعیت احراز هویت، به‌روزرسانی فاز پرونده، تخصیص کارشناس و ثبت یادداشت‌های نظارتی
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 transition-colors text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>تغییرات مدیریتی پرونده با موفقیت در سامانه ذخیره شد.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Company Brief Info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">نام شرکت:</span>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">شناسه ملی شرکت:</span>
              <input
                type="text"
                value={nationalId}
                onChange={e => setNationalId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-purple-600 dark:text-purple-400"
                dir="ltr"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">شناسه یکتای پرونده (UID):</span>
              <div className="px-3 py-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-lg font-mono text-slate-500">
                {account.id}
              </div>
            </div>
          </div>

          {/* Phase Selector & Status Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Macro Phase Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>فاز کلان پیشرفت در سامانه:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPhase("approved")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    phase === "approved"
                      ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>تایید نهایی (سبز)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("processing")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    phase === "processing"
                      ? "bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-700 dark:text-purple-300 shadow-2xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>در جریان (بنفش)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("initial")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    phase === "initial"
                      ? "bg-slate-100 dark:bg-slate-800 border-slate-500 text-slate-800 dark:text-slate-200 shadow-2xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>اطلاعات اولیه (سفید)</span>
                </button>
              </div>
            </div>

            {/* Expert Allocation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-purple-600" />
                <span>کارشناس حقوقی مسئول پرونده:</span>
              </label>
              <select
                value={expert}
                onChange={e => setExpert(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {experts.map(exp => (
                  <option key={exp} value={exp}>
                    {exp} (کارشناس حقوقی)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                وضعیت دقیق احراز هویت:
              </label>
              <button
                type="button"
                onClick={() => setIsCustomStatus(!isCustomStatus)}
                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-bold"
              >
                {isCustomStatus ? "انتخاب از عناوین استاندارد" : "+ وارد کردن وضعیت سفارشی"}
              </button>
            </div>

            {isCustomStatus ? (
              <input
                type="text"
                placeholder="عنوان وضعیت احراز هویت را وارد کنید..."
                value={customStatus}
                onChange={e => setCustomStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              />
            ) : (
              <select
                value={lastStatus}
                onChange={e => {
                  if (e.target.value === "custom") {
                    setIsCustomStatus(true);
                  } else {
                    setLastStatus(e.target.value);
                  }
                }}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {STATUS_PRESETS.map((st, idx) => (
                  <option key={idx} value={st}>{st}</option>
                ))}
                <option value="custom">دیگر (وضعیت سفارشی)...</option>
              </select>
            )}
          </div>

          {/* Manager Notes / Rejection Reason / Defects */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>توضیحات نظارتی مدیریت / اعلام نقص مدارک یا شرایط رفع نقص:</span>
              <span className="text-[10px] text-slate-400">
                (در پنل کارشناس پشتیبانی برای پاسخ به مشتری نمایش داده می‌شود)
              </span>
            </label>
            <textarea
              rows={2}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="مثال: نقص در معرفی‌نامه امضا شده، نیاز به ارسال تصویر واضح صفحه اول روزنامه رسمی..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Operational fields: Prowal & Signers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                شناسه پرووال / تیکت (Prowal):
              </label>
              <input
                type="text"
                value={prowal}
                onChange={e => setProwal(e.target.value)}
                placeholder="مثال: PRW-8921"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                صاحبان امضای مجاز:
              </label>
              <input
                type="text"
                value={signers}
                onChange={e => setSigners(e.target.value)}
                placeholder="مثال: مدیرعامل متفقاً با رئیس هیئت‌مدیره"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Contract Tracking Dates */}
          <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 space-y-2">
            <h4 className="text-[11px] font-bold text-purple-900 dark:text-purple-300">
              تاریخ‌های ثبت و تبادل قرارداد:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">ارسال ایمیل امضا:</span>
                <input
                  type="text"
                  value={expertEmailSent}
                  onChange={e => setExpertEmailSent(e.target.value)}
                  placeholder="1405/03/01"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                  dir="ltr"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">دریافت قرارداد امضا شده:</span>
                <input
                  type="text"
                  value={userSignedEmailRecv}
                  onChange={e => setUserSignedEmailRecv(e.target.value)}
                  placeholder="1405/03/03"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                  dir="ltr"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">ارسال نسخه نهایی والکس:</span>
                <input
                  type="text"
                  value={wallexSignedSent}
                  onChange={e => setWallexSignedSent(e.target.value)}
                  placeholder="1405/03/05"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            {onOpenFullKyc ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullKyc(account);
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>ویرایش پیشرفته در فرم ۵ مرحله‌ای حقوقی</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>ثبت تغییرات مدیریتی</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
