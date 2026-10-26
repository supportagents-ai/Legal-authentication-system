"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthUser, authenticateUser, saveCurrentUser } from "@/lib/auth";

interface LandingPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export default function LandingPage({
  onLoginSuccess,
}: LandingPageProps) {
  const [username, setUsername] = useState("a.sedigh");
  const [password, setPassword] = useState("wallex");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!username.trim()) {
      setLoginError("لطفاً نام کاربری را وارد نمایید.");
      return;
    }
    if (!password) {
      setLoginError("لطفاً رمز عبور را وارد نمایید.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(username, password);
      setIsLoading(false);

      if (!result.success || !result.user) {
        setLoginError(result.error || "نام کاربری یا رمز عبور اشتباه است.");
        return;
      }

      saveCurrentUser(result.user);
      onLoginSuccess(result.user);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        {/* تیتر کادر: سامانه احراز هویت حقوقی والکس */}
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            سامانه احراز هویت حقوقی والکس
          </h1>
        </div>

        {/* فرم وارد کردن نام کاربری و رمز عبور */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center">
              {loginError}
            </div>
          )}

          {/* نام کاربری */}
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              نام کاربری
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="نام کاربری"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none transition-all shadow-xs"
              dir="ltr"
              autoFocus
            />
          </div>

          {/* رمز عبور */}
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:outline-none transition-all shadow-xs"
                dir="ltr"
              />
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

          {/* دکمه ورود */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>ورود</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
