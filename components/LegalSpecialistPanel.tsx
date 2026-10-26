"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Plus, 
  Download, 
  Edit2, 
  Trash2, 
  Filter, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PhoneCall, 
  ExternalLink, 
  X,
  Sparkles,
  Layers,
  FileCheck2,
  Building2,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  FileText,
  KeyRound,
  LogOut,
  User
} from "lucide-react";
import { LegalAccount, StatusPhase } from "@/lib/mockData";
import { isShamsiDateInPeriod, getTodayShamsiString } from "@/lib/utils";
import { AuthUser } from "@/lib/auth";
import LegalRegistrationModal from "./LegalRegistrationModal";

interface LegalSpecialistPanelProps {
  accounts: LegalAccount[];
  onUpdateAccounts: (updated: LegalAccount[]) => void;
  onBackToLanding: () => void;
  onSwitchRole: (role: "landing" | "specialist" | "support" | "management" | "supervisor" | "client") => void;
  currentUser?: AuthUser | null;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
}

const EXPERTS = ["آیگین صدیق", "غزل خدائی", "اسما فاضلی"];

export default function LegalSpecialistPanel({
  accounts,
  onUpdateAccounts,
  onBackToLanding,
  onSwitchRole,
  currentUser,
  onOpenChangePassword,
  onLogout,
}: LegalSpecialistPanelProps) {
  // Search and Filters
  const [search, setSearch] = useState("");
  const [filterExpert, setFilterExpert] = useState("");
  const [filterPhase, setFilterPhase] = useState<StatusPhase | "all">("all");
  const [filterTime, setFilterTime] = useState<"all" | "today" | "week" | "month" | "year">("all");
  const [filterCompletion, setFilterCompletion] = useState<"all" | "incomplete" | "complete">("all");
  const [sortBy, setSortBy] = useState<"date" | "company" | "status" | "completion">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State for Unified Legal Registration & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<LegalAccount | null>(null);

  const handleOpenCreateAccount = () => {
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const handleOpenEditAccount = (acc: LegalAccount) => {
    setSelectedAccount(acc);
    setIsModalOpen(true);
  };

  // Save Account (Create or Update)
  const handleSaveAccount = (account: LegalAccount) => {
    let updatedList = [...accounts];
    const index = updatedList.findIndex(x => x.id === account.id);

    if (index !== -1) {
      updatedList[index] = account;
    } else {
      updatedList = [account, ...updatedList];
    }

    onUpdateAccounts(updatedList);
  };

  // Delete Account modal state & toast
  const [accountToDelete, setAccountToDelete] = useState<LegalAccount | null>(null);
  const [deleteToast, setDeleteToast] = useState<string | null>(null);

  // In Legal Specialist Panel, deletion is fully active for legal specialists
  const isLegalSpecialist = !currentUser || currentUser.role === "specialist";

  const handlePromptDeleteAccount = (acc: LegalAccount) => {
    setAccountToDelete(acc);
  };

  const handleConfirmDelete = () => {
    if (!accountToDelete) return;
    const targetId = accountToDelete.id;
    const companyName = accountToDelete.companyName || "پرونده حقوقی";
    const updated = accounts.filter(x => x.id !== targetId);
    onUpdateAccounts(updated);
    setAccountToDelete(null);
    setDeleteToast(`پرونده «${companyName}» با موفقیت حذف گردید.`);
    setTimeout(() => {
      setDeleteToast(null);
    }, 4000);
  };

  // Export to Excel-compatible CSV
  const handleExportCSV = () => {
    const headers = [
      "تاریخ ثبت پرونده",
      "شناسه کاربری (UID)",
      "نام شرکت",
      "شناسه ملی",
      "نوع شرکت",
      "کارشناس مسئول",
      "آخرین وضعیت",
      "نام نماینده / ادمین",
      "صاحبین امضا",
      "درصد تکمیل فرم حقوقی",
      "تلفن شرکت",
      "شماره شبا حقوقی",
      "استعلام روزنامه رسمی",
      "پرووال",
      "دلیل عدم تایید یا توضیحات",
      "تعداد تماس‌های ثبت‌شده"
    ];

    const rows = accounts.map(acc => [
      acc.date,
      acc.id,
      acc.companyName,
      acc.nationalId || "",
      acc.companyType || "",
      acc.expert,
      acc.lastStatus,
      acc.adminName,
      acc.signers,
      `${acc.formCompletionPercentage || 0}%`,
      acc.companyPhone || "",
      acc.iban || "",
      acc.gazetteVerified ? "تایید شده" : "در انتظار",
      acc.prowal,
      acc.rejectionReason,
      acc.callLogs?.length || 0
    ]);

    let csvContent = "\uFEFF";
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      const sanitized = row.map(v => {
        const str = String(v ?? "").replace(/"/g, '""');
        return str.includes(",") || str.includes("\n") ? `"${str}"` : str;
      });
      csvContent += sanitized.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Wallex-Legal-Accounts-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering and Sorting
  const filteredAccounts = useMemo(() => {
    const today = getTodayShamsiString();
    return accounts.filter(acc => {
      const q = search.toLowerCase();
      const matchesSearch = 
        acc.id.toLowerCase().includes(q) ||
        (acc.companyName || "").toLowerCase().includes(q) ||
        (acc.nationalId || "").toLowerCase().includes(q) ||
        (acc.adminName || "").toLowerCase().includes(q) ||
        (acc.expert || "").toLowerCase().includes(q) ||
        (acc.lastStatus || "").toLowerCase().includes(q) ||
        (acc.signers || "").toLowerCase().includes(q) ||
        (acc.prowal || "").toLowerCase().includes(q) ||
        (acc.registrationNumber || "").toLowerCase().includes(q);

      const matchesExpert = filterExpert === "" || acc.expert === filterExpert;
      const matchesPhase = filterPhase === "all" || acc.phase === filterPhase;
      const matchesTime = isShamsiDateInPeriod(acc.date, filterTime, today);

      let matchesCompletion = true;
      const comp = acc.formCompletionPercentage || 0;
      if (filterCompletion === "incomplete") {
        matchesCompletion = comp < 70;
      } else if (filterCompletion === "complete") {
        matchesCompletion = comp >= 70;
      }

      return matchesSearch && matchesExpert && matchesPhase && matchesTime && matchesCompletion;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = a.date.localeCompare(b.date);
      } else if (sortBy === "company") {
        comparison = (a.companyName || "").localeCompare(b.companyName || "");
      } else if (sortBy === "status") {
        comparison = a.phase.localeCompare(b.phase);
      } else if (sortBy === "completion") {
        comparison = (a.formCompletionPercentage || 0) - (b.formCompletionPercentage || 0);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [accounts, search, filterExpert, filterPhase, filterTime, filterCompletion, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = accounts.length;
    const initialCount = accounts.filter(x => x.phase === "initial").length;
    const processingCount = accounts.filter(x => x.phase === "processing").length;
    const approvedCount = accounts.filter(x => x.phase === "approved").length;
    const needsFormCompletion = accounts.filter(x => (x.formCompletionPercentage || 0) < 60).length;

    return {
      total,
      initialCount,
      processingCount,
      approvedCount,
      needsFormCompletion,
      initialPct: total ? Math.round((initialCount / total) * 100) : 0,
      approvedPct: total ? Math.round((approvedCount / total) * 100) : 0,
    };
  }, [accounts]);

  return (
    <div className="space-y-6">
      {/* Role Navigation & Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white">
              سامانه احراز هویت حقوقی والکس
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {currentUser && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/60 rounded-xl px-3 py-1.5 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({currentUser.displayUsername || currentUser.username})
              </span>
            </div>
          )}

          {onOpenChangePassword && (
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

      {/* Unified Workflow Callout: Unified Registration & Management Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unified Legal Registration Card */}
        <div className="md:col-span-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-2xl p-6 shadow-lg shadow-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
          <div className="space-y-2 relative z-10 text-center sm:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>فرم جامع احراز هویت حقوقی والکس</span>
            </div>
            <h3 className="text-xl font-black">ثبت و مدیریت پرونده‌های حقوقی</h3>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              تعریف شرکت جدید، ثبت مشخصات ثبتی، استعلام روزنامه رسمی، صاحبان امضا، شبای حقوقی و تعیین وضعیت احراز هویت در یک فرم یکپارچه.
            </p>
          </div>

          <div className="relative z-10 w-full sm:w-auto shrink-0">
            <button
              onClick={handleOpenCreateAccount}
              className="w-full sm:w-auto py-3 px-5 bg-white text-blue-900 hover:bg-blue-50 font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>+ ثبت پرونده حقوقی جدید</span>
            </button>
          </div>
        </div>

        {/* Action Card 3: Incomplete Forms Counter & Quick Filter */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                وضعیت فرم‌های حقوقی
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold">
                نیازمند اقدام
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats.needsFormCompletion}
              </span>
              <span className="text-xs text-slate-500">پرونده با فرم تکمیل‌نشده</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              پرونده‌هایی که نیازمند استعلام روزنامه رسمی، دریافت اساسنامه یا تکمیل شماره شبا می‌باشند.
            </p>
          </div>

          <div className="pt-3">
            <button
              onClick={() => {
                setFilterCompletion(prev => prev === "incomplete" ? "all" : "incomplete");
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                filterCompletion === "incomplete"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterCompletion === "incomplete" ? "نمایش همه پرونده‌ها" : "فیلتر پرونده‌های نیازمند تکمیل فرم"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">کل پرونده‌های ثبت شده</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{stats.total}</p>
          </div>
          <Building2 className="w-7 h-7 text-blue-500/40" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">اطلاعات اولیه / پیش‌نویس</p>
            <p className="text-xl font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">{stats.initialCount}</p>
          </div>
          <AlertTriangle className="w-7 h-7 text-amber-500/40" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">در مرحله تایید و پیگیری</p>
            <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">{stats.processingCount}</p>
          </div>
          <Clock className="w-7 h-7 text-purple-500/40" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">تایید نهایی شده (سبز)</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.approvedCount}</p>
          </div>
          <CheckCircle2 className="w-7 h-7 text-emerald-500/40" />
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Live Search */}
        <div className="relative w-full lg:w-96 flex-shrink-0">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="جستجو در شناسه کاربری، شرکت، شناسه ملی، نماینده یا کارشناس..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 h-11 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-900 text-slate-850 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-sm focus:outline-none"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          {/* Expert Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 px-3 h-11 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={filterExpert}
              onChange={e => setFilterExpert(e.target.value)}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer h-full"
            >
              <option value="">همه کارشناسان</option>
              {EXPERTS.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>

          {/* Phase Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 px-3 h-11 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={filterPhase}
              onChange={e => setFilterPhase(e.target.value as StatusPhase | "all")}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer h-full"
            >
              <option value="all">همه مراحل پیشرفت</option>
              <option value="initial">اطلاعات اولیه / پیش‌نویس</option>
              <option value="processing">نزدیک تایید / پیگیری</option>
              <option value="approved">تایید نهایی شده (سطح ۲)</option>
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 px-3 h-11 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={filterTime}
              onChange={e => setFilterTime(e.target.value as "all" | "today" | "week" | "month" | "year")}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none cursor-pointer h-full"
            >
              <option value="all">همه زمان‌ها</option>
              <option value="today">امروز</option>
              <option value="week">هفته جاری</option>
              <option value="month">ماه جاری</option>
              <option value="year">سال جاری</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="h-11 px-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="خروجی فایل اکسل"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">خروجی اکسل</span>
          </button>

          {/* Reset Filters */}
          {(search || filterExpert || filterPhase !== "all" || filterTime !== "all" || filterCompletion !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setFilterExpert("");
                setFilterPhase("all");
                setFilterTime("all");
                setFilterCompletion("all");
              }}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer h-11 px-2"
            >
              <X className="w-3.5 h-3.5" />
              <span>پاک‌سازی</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-right border-collapse text-slate-800 dark:text-slate-200">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-xs font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="px-5 py-3.5">شرکت و شناسه ملی</th>
                <th className="px-4 py-3.5">درصد تکمیل فرم حقوقی</th>
                <th className="px-4 py-3.5">اقدام: تکمیل / ویرایش فرم</th>
                <th className="px-4 py-3.5">آخرین وضعیت و علت رد</th>
                <th className="px-4 py-3.5">کارشناس مسئول</th>
                <th className="px-4 py-3.5">تاریخ ثبت پرونده</th>
                <th className="px-4 py-3.5 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">پرونده‌ای با فیلترهای مشخص‌شده یافت نشد.</p>
                    <button
                      onClick={handleOpenCreateAccount}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>ثبت پرونده حقوقی جدید</span>
                    </button>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredAccounts.map(acc => {
                    let cardBg = "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80";
                    let sideBorder = "border-r-4 border-r-slate-300 dark:border-r-slate-700";
                    let badgeColor = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";

                    if (acc.phase === "approved") {
                      cardBg = "bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20";
                      sideBorder = "border-r-4 border-r-emerald-500";
                      badgeColor = "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300";
                    } else if (acc.phase === "processing") {
                      cardBg = "bg-purple-50/20 dark:bg-purple-950/10 hover:bg-purple-50/50 dark:hover:bg-purple-950/20";
                      sideBorder = "border-r-4 border-r-purple-500";
                      badgeColor = "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300";
                    }

                    const completion = acc.formCompletionPercentage || 0;

                    return (
                      <motion.tr
                        key={acc.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`border-b dark:border-slate-800 last:border-none transition-colors ${cardBg} ${sideBorder}`}
                      >
                        {/* Company & National ID */}
                        <td className="px-5 py-3.5">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                              <span>{acc.companyName || "تکمیل نام شرکت"}</span>
                              {acc.companyType && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                  {acc.companyType}
                                </span>
                              )}
                              {acc.prowal && (
                                <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono px-1.5 py-0.5 rounded font-bold">
                                  پرووال: {acc.prowal}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                              <span>نماینده: {acc.adminName || "ثبت نشده"}</span>
                              <span className="text-slate-300">|</span>
                              <span className="font-mono text-[11px] text-slate-400">شناسه: {acc.id}</span>
                              {acc.nationalId && (
                                <>
                                  <span className="text-slate-300">|</span>
                                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                    شناسه ملی: {acc.nationalId}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Form Completion Progress Bar */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1 w-32">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">پیشرفت فرم:</span>
                              <span className="font-bold font-mono">{completion}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  completion >= 80 ? "bg-emerald-500" : completion >= 40 ? "bg-purple-500" : "bg-blue-500"
                                }`}
                                style={{ width: `${completion}%` }}
                              />
                            </div>
                            {acc.gazetteVerified && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                                <ShieldCheck className="w-3 h-3" />
                                <span>روزنامه رسمی تایید شد</span>
                              </span>
                            )}
                            {(acc.changesGazetteFile || acc.introLetterFile) && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                <FileText className="w-3 h-3" />
                                <span>مدارک کاربر پیوست شد</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Direct Action: Complete Legal Form */}
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAccount(acc)}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>تکمیل فرم حقوقی</span>
                          </button>
                        </td>

                        {/* Last Status & Rejection Reason */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
                            {acc.lastStatus}
                          </span>
                          {acc.rejectionReason && (
                            <p className="text-xs text-slate-500 mt-1 max-w-[220px] truncate" title={acc.rejectionReason}>
                              {acc.rejectionReason}
                            </p>
                          )}
                        </td>

                        {/* Expert */}
                        <td className="px-4 py-3.5 font-medium text-xs text-slate-700 dark:text-slate-300">
                          {acc.expert}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">
                          {acc.date}
                        </td>

                        {/* Operations */}
                        <td className="px-4 py-3.5 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAccount(acc)}
                              className="px-3 py-1.5 text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                              title="ویرایش و تکمیل پرونده حقوقی"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>ویرایش و تکمیل پرونده</span>
                            </button>
                            {isLegalSpecialist ? (
                              <button
                                type="button"
                                onClick={() => handlePromptDeleteAccount(acc)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer flex items-center justify-center active:scale-90"
                                title="حذف پرونده (دسترسی اختصاصی کارشناس حقوقی)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="p-1.5 text-slate-300 dark:text-slate-700 rounded-lg cursor-not-allowed opacity-35 flex items-center justify-center"
                                title="دسترسی غیرفعال: حذف رکوردها فقط برای کارشناسان حقوقی فعال است"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal Registration & Edit Unified Modal */}
      <LegalRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAccount}
        initialAccount={selectedAccount}
        experts={EXPERTS}
      />

      {/* In-App Delete Confirmation Modal (Bypasses sandboxed iframe confirm dialog blocks) */}
      <AnimatePresence>
        {accountToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-right"
              dir="rtl"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  آیا از حذف این پرونده اطمینان دارید؟
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  پرونده شرکت <strong className="text-slate-900 dark:text-white">«{accountToDelete.companyName || "بدون نام"}»</strong> با شناسه کاربری <span className="font-mono text-blue-600 dark:text-blue-400">{accountToDelete.id}</span> و شناسه ملی <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{accountToDelete.nationalId || "ثبت‌نشده"}</span> به‌طور کامل از سامانه حذف خواهد شد.
                </p>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>توجه: این اقدام غیرقابل بازگشت است.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>بله، حذف پرونده</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountToDelete(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Success Toast Notification */}
      <AnimatePresence>
        {deleteToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 dark:border-slate-300"
            dir="rtl"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
            <span>{deleteToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
