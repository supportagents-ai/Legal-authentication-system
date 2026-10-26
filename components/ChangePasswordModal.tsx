"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { changeUserPassword, AuthUser } from "@/lib/auth";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onPasswordChanged?: (updatedUser: AuthUser) => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  currentUser,
  onPasswordChanged,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("کاربر معتبر نیست.");
      return;
    }

    if (!currentPassword) {
      setError("لطفاً رمز عبور فعلی را وارد کنید.");
      return;
    }

    if (!newPassword) {
      setError("لطفاً رمز عبور جدید را وارد کنید.");
      return;
    }

    if (newPassword.length < 4) {
      setError("رمز عبور جدید باید حداقل ۴ کاراکتر باشد.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("رمز عبور جدید نمی‌تواند مشابه رمز عبور فعلی باشد.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("تکرار رمز عبور جدید مطابقت ندارد.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = changeUserPassword(currentUser.username, currentPassword, newPassword);
      setIsSubmitting(false);

      if (!result.success) {
        setError(result.error || "خطا در تغییر رمز عبور.");
        return;
      }

      setSuccess(true);
      const updatedUser: AuthUser = {
        ...currentUser,
        password: newPassword,
        mustChangePassword: false,
        lastPasswordChange: new Date().toLocaleDateString("fa-IR"),
      };

      if (onPasswordChanged) {
        onPasswordChanged(updatedUser);
      }

      setTimeout(() => {
        handleReset();
        onClose();
      }, 1400);
    }, 300);
  };

  const handleReset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 relative space-y-5"
        >
          {/* دکمه بستن */}
          <button
            onClick={handleModalClose}
            className="absolute left-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>

          {/* هدر: لوگوی قفل و فقط تیتر «تغییر رمز عبور» */}
          <div className="text-center space-y-2 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              تغییر رمز عبور
            </h2>
          </div>

          {/* پیام موفقیت */}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>رمز عبور با موفقیت تغییر یافت.</span>
            </div>
          )}

          {/* پیام خطا */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 text-center">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* فرم ۳ کادر */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* کادر اول: رمز عبور فعلی */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                رمز عبور فعلی
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="رمز عبور فعلی"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none transition-all shadow-xs"
                  dir="ltr"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* کادر دوم: رمز عبور جدید */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                رمز عبور جدید
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="رمز عبور جدید"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none transition-all shadow-xs"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* کادر سوم: تکرار رمز عبور جدید */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                تکرار رمز عبور جدید
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تکرار رمز عبور جدید"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none transition-all shadow-xs"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* دکمه «ثبت رمز عبور جدید» */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>ثبت رمز عبور جدید</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
