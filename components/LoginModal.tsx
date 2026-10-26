"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  X, 
  ArrowLeft, 
  KeyRound, 
  Sparkles,
  AlertCircle,
  Building2,
  Smartphone
} from "lucide-react";
import { authenticateUser, AuthUser, RoleType } from "@/lib/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: "specialist" | "support" | "management" | "landing" | null;
  onLoginSuccess: (user: AuthUser, intendedRole: "specialist" | "support" | "management") => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  targetRole,
  onLoginSuccess,
}: LoginModalProps) {
  const [username, setUsername] = useState("a.sedigh");
  const [password, setPassword] = useState("wallex");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const getRoleTitle = () => {
    switch (targetRole) {
      case "specialist":
        return "ورود به پنل کارشناس حقوقی (ثبت و فرم)";
      case "support":
        return "ورود به پنل کارشناس پشتیبانی (استعلام با شناسه ملی)";
      case "management":
        return "ورود به پنل نظارت و گزارش‌گیری مدیریت";
      default:
        return "ورود امن سازمانی والکس (همراه بانک / اینترنت بانک)";
    }
  };

  const getRoleThemeColor = () => {
    switch (targetRole) {
      case "specialist":
        return "border-blue-500 from-blue-600 to-indigo-700";
      case "support":
        return "border-amber-500 from-amber-500 to-orange-600";
      case "management":
        return "border-purple-500 from-purple-600 to-indigo-700";
      default:
        return "border-blue-500 from-blue-600 to-indigo-700";
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("لطفاً نام کاربری خود را وارد نمایید.");
      return;
    }
    if (!password) {
      setErrorMessage("لطفاً رمز عبور خود را وارد نمایید.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(username, password);
      setIsLoading(false);

      if (!result.success || !result.user) {
        setErrorMessage(result.error || "نام کاربری یا رمز عبور اشتباه است.");
        return;
      }

      // Determine destination role
      let destination: "specialist" | "support" | "management" = "specialist";
      if (targetRole && targetRole !== "landing") {
        destination = targetRole;
      } else {
        if (result.user.role === "support") destination = "support";
        else if (result.user.role === "management") destination = "management";
        else destination = "specialist";
      }

      onLoginSuccess(result.user, destination);
    }, 350);
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        >
          {/* Header Banner - Bank Style */}
          <div className={`p-6 text-white bg-gradient-to-l ${getRoleThemeColor()} relative`}>
            <button
              onClick={onClose}
              className="absolute left-4 top-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/25 text-white">
                    امنیت همراه بانک
                  </span>
                  <span className="text-[11px] text-white/80">احراز هویت سازمانی</span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-1">
                  سامانه احراز هویت حقوقی والکس
                </h3>
              </div>
            </div>

            <p className="text-xs text-white/90 mt-2.5 leading-relaxed bg-black/15 p-2 rounded-xl border border-white/10">
              {getRoleTitle()}
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>نام کاربری:</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">مثال: a.sedigh</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری خود را وارد کنید..."
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none transition-all shadow-xs"
                  dir="ltr"
                  autoFocus
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>رمز عبور:</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">پیش‌فرض: wallex</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور خود را وارد کنید..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none transition-all shadow-xs"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Fill Preset Badges */}
            <div className="pt-1 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>حساب‌های تست سریع سازمانی (جهت ورود آسان):</span>
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill("a.sedigh", "wallex")}
                  className="p-2 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/40 text-[11px] font-medium text-blue-900 dark:text-blue-200 hover:border-blue-500 transition-all text-right cursor-pointer"
                >
                  <strong className="block text-blue-700 dark:text-blue-300 font-mono">a.sedigh (اصلی)</strong>
                  <span className="text-[10px] text-slate-500">رمز: wallex (دسترسی کامل)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("support.agent", "wallex")}
                  className="p-2 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/40 text-[11px] font-medium text-amber-900 dark:text-amber-200 hover:border-amber-500 transition-all text-right cursor-pointer"
                >
                  <strong className="block text-amber-700 dark:text-amber-300 font-mono">support.agent</strong>
                  <span className="text-[10px] text-slate-500">رمز: wallex (پشتیبانی)</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 active:scale-98 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>ورود به سامانه</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Bank Security Notice */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>رمزنگاری SHA-256 و پروتکل امن SSL</span>
              </div>
              <span>ورود امن والکس</span>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
