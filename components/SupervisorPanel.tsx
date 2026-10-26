"use client";

import { useState, useMemo } from "react";
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Users, 
  BarChart3, 
  Building2, 
  Search, 
  FileCheck2, 
  ExternalLink 
} from "lucide-react";
import { LegalAccount } from "@/lib/mockData";

interface SupervisorPanelProps {
  accounts: LegalAccount[];
  onUpdateAccounts: (updated: LegalAccount[]) => void;
  onBackToLanding: () => void;
  onSwitchRole: (role: "landing" | "specialist" | "support" | "supervisor" | "client") => void;
}

export default function SupervisorPanel({
  accounts,
  onUpdateAccounts,
  onBackToLanding,
  onSwitchRole
}: SupervisorPanelProps) {
  const [activeTab, setActiveTab] = useState<"pending_review" | "all" | "audit">("pending_review");
  const [search, setSearch] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  // Accounts requiring supervisor level 2 approval
  const pendingAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const isPending = 
        acc.phase === "processing" || 
        acc.lastStatus.includes("اسدی") || 
        acc.lastStatus.includes("سطح۲") || 
        acc.lastStatus.includes("قرارداد") ||
        (acc.formCompletionPercentage || 0) >= 70;
      
      const q = search.toLowerCase();
      const matches = 
        acc.companyName.toLowerCase().includes(q) ||
        acc.id.toLowerCase().includes(q) ||
        acc.expert.toLowerCase().includes(q);

      return isPending && matches;
    });
  }, [accounts, search]);

  const handleApproveLevel2 = (accId: string) => {
    const updated = accounts.map(item => {
      if (item.id === accId) {
        return {
          ...item,
          phase: "approved" as const,
          lastStatus: "تایید نهایی (سطح۲)",
          formCompletionPercentage: 100,
          rejectionReason: "پرونده توسط سرپرست حقوقی و نظارت تایید نهایی شد."
        };
      }
      return item;
    });

    onUpdateAccounts(updated);
    setActionSuccessMessage(`پرونده کاربر ${accId} با موفقیت تایید نهایی شد.`);
    setTimeout(() => setActionSuccessMessage(""), 4000);
  };

  const handleRejectToSpecialist = (accId: string) => {
    const reason = prompt("علت بازگشت به کارشناس جهت اصلاح مدارک را وارد نمایید:");
    if (!reason) return;

    const updated = accounts.map(item => {
      if (item.id === accId) {
        return {
          ...item,
          phase: "initial" as const,
          lastStatus: "بازگشت به کارشناس جهت اصلاح مدارک",
          rejectionReason: `دستور سرپرست: ${reason}`
        };
      }
      return item;
    });

    onUpdateAccounts(updated);
    setActionSuccessMessage(`پرونده به کارشناس عودت داده شد.`);
    setTimeout(() => setActionSuccessMessage(""), 4000);
  };

  // Performance ranking
  const expertStats = useMemo(() => {
    const counts: Record<string, { total: number; approved: number }> = {};
    accounts.forEach(acc => {
      if (!counts[acc.expert]) counts[acc.expert] = { total: 0, approved: 0 };
      counts[acc.expert].total++;
      if (acc.phase === "approved") counts[acc.expert].approved++;
    });
    return Object.entries(counts).map(([name, s]) => ({
      name,
      ...s,
      pct: s.total ? Math.round((s.approved / s.total) * 100) : 0
    })).sort((a, b) => b.approved - a.approved);
  }, [accounts]);

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
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">جایگاه فعال:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold">
              مدیر ارشد تطبیق و نظارت حقوقی (خانم اسدی / واحد ریسک)
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
            onClick={() => onSwitchRole("client")}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            پرتال متقاضی شرکتی
          </button>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Supervisor Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">کارتابل ارجاعات در انتظار تایید سرپرست</p>
          <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{pendingAccounts.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">پرونده‌های تکمیل شده توسط کارشناسان حقوقی</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">کل پرونده‌های تایید نهایی شده (سطح ۲)</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {accounts.filter(x => x.phase === "approved").length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">نرخ تایید: {Math.round((accounts.filter(x => x.phase === "approved").length / (accounts.length || 1)) * 100)}%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">کارشناسان فعال در این دوره</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{expertStats.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">رتبه نخست تایید: {expertStats[0]?.name || "---"}</p>
        </div>
      </div>

      {/* Pending Approval Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              کارتابل بررسی و تایید نهایی سطح ۲
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold">
              {pendingAccounts.length}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در کارتابل..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">شرکت و شناسه کاربری</th>
                <th className="p-4">کارشناس ثبت‌کننده</th>
                <th className="p-4">وضعیت فرم و اسناد</th>
                <th className="p-4">صاحبان امضا</th>
                <th className="p-4 text-left">اقدام تاییدیه سرپرست</th>
              </tr>
            </thead>
            <tbody>
              {pendingAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    پرونده‌ای در انتظار تایید سطح ۲ یافت نشد.
                  </td>
                </tr>
              ) : (
                pendingAccounts.slice(0, 15).map(acc => (
                  <tr key={acc.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{acc.companyName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">UID: {acc.id}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {acc.expert}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-800 font-bold">
                        {acc.lastStatus}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                      {acc.signers || "مشخص شده در فرم"}
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveLevel2(acc.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تایید نهایی سطح ۲</span>
                        </button>
                        <button
                          onClick={() => handleRejectToSpecialist(acc.id)}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>عودت جهت اصلاح</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
