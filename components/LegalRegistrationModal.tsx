"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Building2, 
  Users, 
  FileCheck2, 
  CreditCard, 
  PhoneCall, 
  Check, 
  AlertCircle, 
  Save, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileUp,
  Eye,
  Trash2,
  File,
  UserPlus,
  Plus
} from "lucide-react";
import { LegalAccount, CallLog, StatusPhase, UploadedDocument, SignatoryMember } from "@/lib/mockData";
import { getTodayShamsiString } from "@/lib/utils";

const SIGNATORY_ROLES = [
  "مدیرعامل",
  "رئیس هیئت مدیره",
  "نایب رئیس هیئت مدیره",
  "عضو موظف هیئت مدیره",
  "عضو غیرموظف هیئت مدیره",
  "وکیل قانونی / نماینده تام‌الاختیار",
  "قائم‌مقام مدیرعامل",
  "سایر"
];

function parseExistingSigners(str: string): SignatoryMember[] {
  if (!str || !str.trim()) return [];
  const parts = str.split(/[،,;\n]+/).map(p => p.trim()).filter(Boolean);
  return parts.map((part, index) => {
    const match = part.match(/^([^(]+)(?:\(([^)]+)\))?$/);
    if (match) {
      const name = match[1].trim();
      const meta = match[2] ? match[2].trim() : "";
      let role = "مدیرعامل";
      let natId = "";
      if (meta) {
        const idMatch = meta.match(/(?:کد\s*ملی\s*[:\s]*)?(\d{10})/);
        if (idMatch) {
          natId = idMatch[1];
        }
        const roleClean = meta.replace(/[-–]?\s*کد\s*ملی\s*[:\s]*\d+/, "").trim();
        if (roleClean) role = roleClean;
      }
      return {
        id: `sig_${Date.now()}_${index}`,
        fullName: name,
        nationalId: natId,
        role: role
      };
    }
    return {
      id: `sig_${Date.now()}_${index}`,
      fullName: part,
      nationalId: "",
      role: "صاحب امضا"
    };
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "۰ بایت";
  const k = 1024;
  const sizes = ["بایت", "کیلوبایت", "مگابایت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = (bytes / Math.pow(k, i)).toFixed(1);
  return `${val} ${sizes[i]}`;
}

interface LegalRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: LegalAccount) => void;
  initialAccount?: LegalAccount | null;
  experts: string[];
  initialMode?: string;
}

const COMPANY_TYPES = [
  "سهامی خاص",
  "با مسئولیت محدود",
  "سهامی عام",
  "تضامنی",
  "دانش‌بنیان",
  "تعاونی",
  "موسسه غیرتجاری",
  "سایر"
];

const STATUS_PRESETS = [
  "در انتظار تکمیل فرم توسط کارشناس",
  "در انتظار تکمیل توسط کاربر",
  "ارسال ایمیل برای کاربر",
  "ارسال قرارداد نهایی برای کاربر",
  "سطح۲-ارسال برای خانم اسدی",
  "در پرروال ثبت شد",
  "تایید نهایی",
  "نقص مدارک ثبتی / استعلام روزنامه"
];

const CALL_OUTCOMES = [
  "پروفایل تکمیل می‌نماید",
  "درخواست تماس مجدد در زمانی دیگر",
  "انصراف از فعالیت در حوزه ارزدیجیتال",
  "تماس بی‌پاسخ",
  "خاموش / عدم دسترسی",
  "کاربر از طریق تماس ورودی/ چت راهنمایی شد"
];

const CALL_STATUSES = [
  "کاربر پاسخگو بود",
  "عدم پاسخگویی تماس",
  "دسترس نبودن / خاموش"
];

export default function LegalRegistrationModal({
  isOpen,
  onClose,
  onSave,
  initialAccount,
  experts,
}: LegalRegistrationModalProps) {
  // Tabs: 1 = Basic/Registry, 2 = Status & Evaluation, 3 = Signers & Admin, 4 = Gazette & Banking, 5 = Call Logs
  const [activeTab, setActiveTab] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>("");

  // Form Fields - Basic
  const [id, setId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState(COMPANY_TYPES[0]);
  const [nationalId, setNationalId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [economicCode, setEconomicCode] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Status & Phase
  const [expert, setExpert] = useState(experts[0] || "آیگین صدیق");
  const [prowal, setProwal] = useState("");
  const [date, setDate] = useState("1405/03/04");
  const [lastStatus, setLastStatus] = useState(STATUS_PRESETS[0]);
  const [phase, setPhase] = useState<StatusPhase>("initial");
  const [rejectionReason, setRejectionReason] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  // Signers & Governance
  const [adminName, setAdminName] = useState("");
  const [signers, setSigners] = useState("");
  const [signersRules, setSignersRules] = useState("");
  const [signatories, setSignatories] = useState<SignatoryMember[]>([]);

  // New signatory form state
  const [newSignerName, setNewSignerName] = useState("");
  const [newSignerNationalId, setNewSignerNationalId] = useState("");
  const [newSignerRole, setNewSignerRole] = useState(SIGNATORY_ROLES[0]);
  const [signerInputError, setSignerInputError] = useState("");

  // مدارک بارگذاری شده توسط کاربر (آگهی تغییرات و معرفی نامه)
  const [changesGazetteFile, setChangesGazetteFile] = useState<UploadedDocument | null>(null);
  const [introLetterFile, setIntroLetterFile] = useState<UploadedDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);

  // Legal Documents & Gazette
  const [newspaperNumber, setNewspaperNumber] = useState("");
  const [gazetteVerified, setGazetteVerified] = useState(false);
  const [hasStatute, setHasStatute] = useState(false);
  const [hasEstablishmentAd, setHasEstablishmentAd] = useState(false);
  const [hasBoardChanges, setHasBoardChanges] = useState(false);

  // Financial & Banking
  const [iban, setIban] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("بانک ملی ایران");
  const [wallexSignedSent, setWallexSignedSent] = useState("");

  // Call Logs
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [newCallDate, setNewCallDate] = useState("1405/03/04");
  const [newCallExpert, setNewCallExpert] = useState(experts[0] || "آیگین صدیق");
  const [newCallStatus, setNewCallStatus] = useState(CALL_STATUSES[0]);
  const [newCallOutcome, setNewCallOutcome] = useState(CALL_OUTCOMES[0]);
  const [newCallInterval, setNewCallInterval] = useState("");

  // Auto-fill from initialAccount when opened
  useEffect(() => {
    if (!isOpen) return;

    const today = getTodayShamsiString() || "1405/03/04";
    setValidationError("");
    setActiveTab(1);

    if (initialAccount) {
      setId(initialAccount.id || "");
      setCompanyName(initialAccount.companyName || "");
      setCompanyType(initialAccount.companyType || COMPANY_TYPES[0]);
      setNationalId(initialAccount.nationalId || "");
      setRegistrationNumber(initialAccount.registrationNumber || "");
      setEconomicCode(initialAccount.economicCode || "");
      setAdminName(initialAccount.adminName || "");
      setRegistrationDate(initialAccount.registrationDate || initialAccount.companyPhone || "");
      setCompanyPhone(initialAccount.companyPhone || "");
      setCompanyAddress(initialAccount.companyAddress || "");
      setPostalCode(initialAccount.postalCode || "");
      setExpert(initialAccount.expert || experts[0] || "آیگین صدیق");
      setProwal(initialAccount.prowal || "");
      setDate(initialAccount.date || today);
      setLastStatus(initialAccount.lastStatus || STATUS_PRESETS[0]);
      setPhase(initialAccount.phase || "initial");
      setRejectionReason(initialAccount.rejectionReason || "");
      setProfileUrl(initialAccount.profileUrl || "");
      setSigners(initialAccount.signers || "");
      if (initialAccount.signatories && initialAccount.signatories.length > 0) {
        setSignatories(initialAccount.signatories);
      } else if (initialAccount.signers) {
        setSignatories(parseExistingSigners(initialAccount.signers));
      } else {
        setSignatories([]);
      }
      setSignersRules(initialAccount.signersRules || "");
      setNewspaperNumber(initialAccount.newspaperNumber || "");
      setGazetteVerified(!!initialAccount.gazetteVerified);
      setHasStatute(!!initialAccount.hasStatute);
      setHasEstablishmentAd(!!initialAccount.hasEstablishmentAd);
      setHasBoardChanges(!!initialAccount.hasBoardChanges);
      setIban(initialAccount.iban || "");
      setAccountNumber(initialAccount.accountNumber || "");
      setBankName(initialAccount.bankName || "بانک ملی ایران");
      setWallexSignedSent(initialAccount.wallexSignedContractSentDate || "");
      setCallLogs(initialAccount.callLogs ? [...initialAccount.callLogs] : []);
      setChangesGazetteFile(initialAccount.changesGazetteFile || null);
      setIntroLetterFile(initialAccount.introLetterFile || null);
    } else {
      // Create new clean account
      const randomUid = Math.floor(100000000 + Math.random() * 900000000).toString();
      setId(randomUid);
      setCompanyName("");
      setCompanyType(COMPANY_TYPES[0]);
      setNationalId("");
      setRegistrationNumber("");
      setEconomicCode("");
      setAdminName("");
      setRegistrationDate("");
      setCompanyPhone("");
      setCompanyAddress("");
      setPostalCode("");
      setExpert(experts[0] || "آیگین صدیق");
      setProwal("");
      setDate(today);
      setLastStatus(STATUS_PRESETS[0]);
      setPhase("initial");
      setRejectionReason("");
      setProfileUrl(`https://wallex.ir/admin/users/${randomUid}`);
      setSigners("");
      setSignatories([]);
      setSignersRules("");
      setNewspaperNumber("");
      setGazetteVerified(false);
      setHasStatute(false);
      setHasEstablishmentAd(false);
      setHasBoardChanges(false);
      setIban("");
      setAccountNumber("");
      setBankName("بانک ملی ایران");
      setWallexSignedSent("");
      setCallLogs([]);
      setChangesGazetteFile(null);
      setIntroLetterFile(null);
    }

    setNewSignerName("");
    setNewSignerNationalId("");
    setNewSignerRole(SIGNATORY_ROLES[0]);
    setSignerInputError("");
    setNewCallDate(today);
  }, [isOpen, initialAccount, experts]);

  // File upload handler for PDF & JPEG/PNG documents
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (doc: UploadedDocument | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setValidationError("حجم فایل انتخابی بیشتر از ۱۵ مگابایت است.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setter({
        name: file.name,
        size: formatBytes(file.size),
        type: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        dataUrl: result,
        uploadDate: getTodayShamsiString() || "۱۴۰۳/۰۳/۰۴",
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    let score = 0;
    if (companyName.trim()) score += 15;
    if (nationalId.trim().length === 11) score += 15;
    if (registrationNumber.trim()) score += 10;
    if (adminName.trim()) score += 15;
    if (changesGazetteFile || signers.trim() || signatories.length > 0) score += 15;
    if (introLetterFile) score += 10;
    if (signersRules.trim()) score += 10;
    if (newspaperNumber.trim()) score += 10;
    if (iban.trim().length >= 24) score += 15;
    return Math.min(score, 100);
  };

  const handleAddSignatory = () => {
    setSignerInputError("");
    if (!newSignerName.trim()) {
      setSignerInputError("لطفاً نام و نام خانوادگی صاحب امضا را وارد کنید.");
      return;
    }
    const cleanNatId = newSignerNationalId.trim();
    if (cleanNatId && (cleanNatId.length !== 10 || !/^\d+$/.test(cleanNatId))) {
      setSignerInputError("کد ملی باید دقیقاً ۱۰ رقم عددی باشد.");
      return;
    }
    const newMember: SignatoryMember = {
      id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: newSignerName.trim(),
      nationalId: cleanNatId,
      role: newSignerRole.trim() || "صاحب امضا",
    };
    const updated = [...signatories, newMember];
    setSignatories(updated);
    const synced = updated
      .map(s => `${s.fullName} (${s.role}${s.nationalId ? ` - کد ملی: ${s.nationalId}` : ""})`)
      .join("، ");
    setSigners(synced);

    setNewSignerName("");
    setNewSignerNationalId("");
    setNewSignerRole(SIGNATORY_ROLES[0]);
  };

  const handleRemoveSignatory = (idToRemove: string) => {
    const updated = signatories.filter(s => s.id !== idToRemove);
    setSignatories(updated);
    const synced = updated
      .map(s => `${s.fullName} (${s.role}${s.nationalId ? ` - کد ملی: ${s.nationalId}` : ""})`)
      .join("، ");
    setSigners(synced);
  };

  const handleAddCallLog = () => {
    if (!newCallOutcome) return;
    const log: CallLog = {
      date: newCallDate,
      expert: newCallExpert,
      status: newCallStatus,
      result: newCallOutcome,
      recallInterval: newCallInterval.trim() || undefined
    };
    setCallLogs([log, ...callLogs]);
    setNewCallInterval("");
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError("");

    if (!companyName.trim()) {
      setValidationError("لطفاً نام شرکت را وارد نمایید.");
      setActiveTab(1);
      return;
    }

    if (nationalId.trim() && nationalId.trim().length !== 11) {
      setValidationError("شناسه ملی شخص حقوقی باید ۱۱ رقم باشد.");
      setActiveTab(1);
      return;
    }

    const completion = calculateCompletion();

    const formattedSigners = signers.trim() || signatories.map(s => `${s.fullName} (${s.role}${s.nationalId ? ` - کد ملی: ${s.nationalId}` : ""})`).join("، ");

    const account: LegalAccount = {
      id: id || Math.floor(100000000 + Math.random() * 900000000).toString(),
      companyName: companyName.trim(),
      adminName: adminName.trim(),
      signers: formattedSigners,
      signatories,
      signersRules: signersRules.trim(),
      lastStatus: lastStatus.trim(),
      expert,
      prowal: prowal.trim(),
      date,
      phase,
      rejectionReason: rejectionReason.trim(),
      profileUrl: profileUrl || `https://wallex.ir/admin/users/${id}`,
      callLogs,
      nationalId: nationalId.trim(),
      registrationNumber: registrationNumber.trim(),
      companyType,
      postalCode: postalCode.trim(),
      registrationDate: registrationDate.trim(),
      companyPhone: registrationDate.trim() || companyPhone.trim(),
      companyAddress: companyAddress.trim(),
      iban: iban.trim(),
      accountNumber: accountNumber.trim(),
      bankName: bankName.trim(),
      economicCode: economicCode.trim(),
      newspaperNumber: newspaperNumber.trim(),
      gazetteVerified,
      hasStatute,
      hasEstablishmentAd,
      hasBoardChanges,
      wallexSignedContractSentDate: wallexSignedSent.trim(),
      formCompletionPercentage: completion,
      changesGazetteFile,
      introLetterFile
    };

    onSave(account);
    onClose();
  };

  if (!isOpen) return null;

  const completionPct = calculateCompletion();

  const tabs = [
    { id: 1, label: "مشخصات ثبتی و شرکتی", icon: Building2 },
    { id: 2, label: "وضعیت پرونده و ارزیابی", icon: ShieldCheck },
    { id: 3, label: "صاحبان امضا و نماینده", icon: Users },
    { id: 4, label: "روزنامه رسمی و امور مالی", icon: FileCheck2 },
    { id: 5, label: "تاریخچه مکالمات و پیگیری", icon: PhoneCall },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {initialAccount ? `ویرایش و تکمیل پرونده حقوقی (${initialAccount.companyName})` : "فرم جامع ثبت پرونده و احراز هویت حقوقی"}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                  دسترسی کارشناس حقوقی
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ورود و ویرایش کامل مشخصات شرکتی، روزنامه رسمی، صاحبان امضا و وضعیت احراز هویت والکس
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress & Completion Bar */}
        <div className="px-6 py-2.5 bg-slate-100/60 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">درصد تکمیل اطلاعات فرم:</span>
            <div className="w-28 sm:w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  completionPct >= 80 ? "bg-emerald-500" : completionPct >= 50 ? "bg-purple-500" : "bg-blue-500"
                }`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{completionPct}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">شناسه پرونده (کد کاربری):</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">{id || "---"}</span>
          </div>
        </div>

        {/* Unified Tab Bar */}
        <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: Company Profile & Registry */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>مشخصات پایه ثبتی و هویتی شرکت</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام شرکت *
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: شرکت پیشگامان تجارت هوشمند ایرانیان"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شناسه ملی ۱۱ رقمی *
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="مثال: 14008923451"
                    value={nationalId}
                    onChange={e => setNationalId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نوع شرکت
                  </label>
                  <select
                    value={companyType}
                    onChange={e => setCompanyType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {COMPANY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شماره ثبت
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 543210"
                    value={registrationNumber}
                    onChange={e => setRegistrationNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    کد اقتصادی ۱۲ رقمی
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 411589234123"
                    value={economicCode}
                    onChange={e => setEconomicCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاریخ ثبت
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 1400/05/12"
                    value={registrationDate}
                    onChange={e => {
                      setRegistrationDate(e.target.value);
                      setCompanyPhone(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    کدپستی ۱۰ رقمی
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="مثال: 1987654321"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نشانی رسمی و ثبتی شرکت
                  </label>
                  <textarea
                    rows={2}
                    placeholder="استان، شهر، خیابان، پلاک، طبقه و واحد ثبتی"
                    value={companyAddress}
                    onChange={e => setCompanyAddress(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Status & Legal Evaluation */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>وضعیت پرونده، یادداشت کارشناس و تعیین سطح احراز هویت</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    فاز فرآیند احراز هویت
                  </label>
                  <select
                    value={phase}
                    onChange={e => setPhase(e.target.value as StatusPhase)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 cursor-pointer font-bold"
                  >
                    <option value="initial">در انتظار بررسی اولیه</option>
                    <option value="processing">در حال پیگیری و تکمیل مدارک</option>
                    <option value="approved">تایید نهایی و تایید شده</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    عنوان وضعیت جاری پرونده
                  </label>
                  <div className="space-y-1.5">
                    <select
                      value={STATUS_PRESETS.includes(lastStatus) ? lastStatus : "سایر"}
                      onChange={e => {
                        if (e.target.value !== "سایر") setLastStatus(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {STATUS_PRESETS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      <option value="سایر">سایر (تایپ دستی عنوان وضعیت)</option>
                    </select>

                    <input
                      type="text"
                      placeholder="عنوان وضعیت را تایپ یا ویرایش نمایید"
                      value={lastStatus}
                      onChange={e => setLastStatus(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    کارشناس حقوقی مسئول پرونده
                  </label>
                  <select
                    value={expert}
                    onChange={e => setExpert(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {experts.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    کد پرووال (شناسه بیزاجی / تیکت والکس)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 60234"
                    value={prowal}
                    onChange={e => setProwal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاریخ ثبت پرونده
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    لینک مستقیم پرونده در پنل ادمین والکس
                  </label>
                  <input
                    type="text"
                    placeholder="https://wallex.ir/admin/users/..."
                    value={profileUrl}
                    onChange={e => setProfileUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>علت عدم تایید یا یادداشت نقص مدارک (مشاهده برای کارشناس پشتیبانی و کاربر)</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">این متن به عنوان راهنما به کارشناسان پاسخگو نمایش داده می‌شود</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="مثال: آخرین روزنامه رسمی بارگذاری نشده است / گواهی امضای مدیرعامل منقضی شده است / شماره شبا به نام شخص حقیقی بوده و شبای حقوقی شرکت نیاز است."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-slate-900 dark:text-slate-100 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Signers & Admin */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>صاحبان امضای مجاز، مدیران و نماینده رابط والکس</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام نماینده / ادمین اکانت کاربری والکس به همراه کد ملی
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: علیرضا محمدی - کد ملی: ۰۰۱۷۶۵۴۳۲۱"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* کادر صاحبان امضا به همراه کدملی و سمت */}
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  {/* هدر کادر */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                        <Users className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          صاحبان امضا به همراه کدملی و سمت
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          امکان ثبت چند شخص دارای حق امضا با مشخصات کامل (نام، کد ملی و سمت)
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-start sm:self-auto font-mono">
                      <span>{signatories.length} نفر ثبت شده</span>
                    </span>
                  </div>

                  {/* لیست اشخاص ثبت شده */}
                  {signatories.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        لیست صاحبان امضای مجاز:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {signatories.map((sig, idx) => (
                          <div
                            key={sig.id || idx}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                {idx + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {sig.fullName}
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-900">
                                    {sig.role}
                                  </span>
                                  {sig.nationalId ? (
                                    <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded" dir="ltr">
                                      کد ملی: {sig.nationalId}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">
                                      کد ملی ثبت نشده
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveSignatory(sig.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                              title="حذف این صاحب امضا"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-white/70 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-700/70 rounded-xl text-center text-xs text-slate-500">
                      هنوز مشخصات صاحب امضایی ثبت نشده است. از فرم زیر برای اضافه کردن مشخصات افراد دارای حق امضا استفاده کنید.
                    </div>
                  )}

                  {/* فرم ثبت شخص جدید */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-3 shadow-2xs">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>افزودن شخص جدید:</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* نام و نام خانوادگی */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          نام و نام خانوادگی <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="مثال: علی حسینی"
                          value={newSignerName}
                          onChange={e => {
                            setNewSignerName(e.target.value);
                            if (signerInputError) setSignerInputError("");
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSignatory();
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* کد ملی ۱۰ رقمی */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          کد ملی (۱۰ رقم)
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="مثال: ۰۰۱۲۳۴۵۶۷۸"
                          value={newSignerNationalId}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, "");
                            setNewSignerNationalId(val);
                            if (signerInputError) setSignerInputError("");
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSignatory();
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500"
                          dir="ltr"
                        />
                      </div>

                      {/* سمت در شرکت */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          سمت در شرکت
                        </label>
                        <select
                          value={newSignerRole}
                          onChange={e => setNewSignerRole(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {SIGNATORY_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {signerInputError && (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{signerInputError}</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddSignatory}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ثبت و افزودن شخص</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* مدارک بارگذاری شده توسط کاربر */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200/80 dark:border-slate-700/80 pb-2.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>مدارک بارگذاری شده توسط کاربر:</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      فرمت‌های مجاز: فایل PDF و یا تصویر (JPEG / PNG) تا سقف ۱۵ مگابایت
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* مدرک ۱: آگهی آخرین تغییرات ثبتی شرکت */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug block">
                          آگهی آخرین تغییرات ثبتی شرکت که مشخصات آخرین صاحبین امضای مجاز شرکت در آن قید شده است
                        </label>
                      </div>

                      {changesGazetteFile ? (
                        <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>بارگذاری موفق</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                              {changesGazetteFile.type?.includes("pdf") ? "PDF" : "JPEG / تصویر"}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-700 dark:text-slate-200 font-mono truncate bg-white/70 dark:bg-slate-900/60 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40" dir="ltr">
                            {changesGazetteFile.name}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-emerald-100 dark:border-emerald-900/40">
                            <span>حجم: {changesGazetteFile.size}</span>
                            <span>تاریخ: {changesGazetteFile.uploadDate}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(changesGazetteFile)}
                              className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>مشاهده مدرک</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setChangesGazetteFile(null)}
                              className="py-1.5 px-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              title="حذف مدرک"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-3.5 text-center space-y-2.5 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                          <FileUp className="w-7 h-7 text-blue-500/80 dark:text-blue-400/80 mx-auto" />
                          <div className="text-[11px] text-slate-500 leading-relaxed">
                            امکان بارگذاری مدرک به صورت <span className="font-bold text-slate-700 dark:text-slate-300">PDF</span> و یا تصویر <span className="font-bold text-slate-700 dark:text-slate-300">JPEG</span>
                          </div>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>بارگذاری فایل آخرین تغییرات</span>
                            <input
                              type="file"
                              accept=".pdf,.jpeg,.jpg,.png,application/pdf,image/jpeg,image/png"
                              className="hidden"
                              onChange={e => handleFileUpload(e, setChangesGazetteFile)}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    {/* مدرک ۲: معرفی‌نامه */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug block">
                          معرفی‌نامه
                        </label>
                      </div>

                      {introLetterFile ? (
                        <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>بارگذاری موفق</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                              {introLetterFile.type?.includes("pdf") ? "PDF" : "JPEG / تصویر"}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-700 dark:text-slate-200 font-mono truncate bg-white/70 dark:bg-slate-900/60 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40" dir="ltr">
                            {introLetterFile.name}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-emerald-100 dark:border-emerald-900/40">
                            <span>حجم: {introLetterFile.size}</span>
                            <span>تاریخ: {introLetterFile.uploadDate}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(introLetterFile)}
                              className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>مشاهده مدرک</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIntroLetterFile(null)}
                              className="py-1.5 px-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              title="حذف مدرک"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-3.5 text-center space-y-2.5 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                          <FileUp className="w-7 h-7 text-blue-500/80 dark:text-blue-400/80 mx-auto" />
                          <div className="text-[11px] text-slate-500 leading-relaxed">
                            امکان بارگذاری مدرک به صورت <span className="font-bold text-slate-700 dark:text-slate-300">PDF</span> و یا تصویر <span className="font-bold text-slate-700 dark:text-slate-300">JPEG</span>
                          </div>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs">
                            <Upload className="w-3.5 h-3.5" />
                            <span>بارگذاری فایل معرفی‌نامه</span>
                            <input
                              type="file"
                              accept=".pdf,.jpeg,.jpg,.png,application/pdf,image/jpeg,image/png"
                              className="hidden"
                              onChange={e => handleFileUpload(e, setIntroLetterFile)}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نحوه حق امضای تعهدآور شرکت
                  </label>
                  <input
                    type="text"
                    placeholder="نحوه حق امضای تعهدآور را تایپ کنید (مثال: متفقاً همراه با مهر شرکت / منفرداً مدیرعامل)"
                    value={signersRules}
                    onChange={e => setSignersRules(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Gazette, Documents & Banking */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>بررسی اسناد ثبتی، روزنامه رسمی و اطلاعات بانکی حقوقی</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاریخ آگهی آخرین روزنامه رسمی
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: روزنامه شماره ۲۲۳۴۵ مورخ ۱۴۰۲/۰۶/۱۵"
                    value={newspaperNumber}
                    onChange={e => setNewspaperNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نام بانک عامل
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: بانک ملی ایران / بانک سامان"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شماره حساب بانکی شرکت
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: ۰۲۱۸۹۸۷۶۵۴۳۲۱"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شماره شبای حساب حقوقی شرکت
                  </label>
                  <input
                    type="text"
                    maxLength={26}
                    placeholder="شماره ۲۴ رقمی شبا (IR...)"
                    value={iban}
                    onChange={e => setIban(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاریخ ارسال قرارداد امضا شده به کاربر / والکس
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: 1405/03/04"
                    value={wallexSignedSent}
                    onChange={e => setWallexSignedSent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Call Logs & Follow-ups */}
          {activeTab === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span>ثبت و مشاهده تاریخچه تماس‌ها و پیگیری‌ها</span>
              </h3>

              {/* Add New Call Form */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">ثبت تماس جدید با نماینده شرکت:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">تاریخ تماس</label>
                    <input
                      type="text"
                      value={newCallDate}
                      onChange={e => setNewCallDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">کارشناس تماس گیرنده</label>
                    <select
                      value={newCallExpert}
                      onChange={e => setNewCallExpert(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs cursor-pointer"
                    >
                      {experts.map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">وضعیت پاسخگویی</label>
                    <select
                      value={newCallStatus}
                      onChange={e => setNewCallStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs cursor-pointer"
                    >
                      {CALL_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">نتیجه مکالمه</label>
                    <select
                      value={newCallOutcome}
                      onChange={e => setNewCallOutcome(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs cursor-pointer"
                    >
                      {CALL_OUTCOMES.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">بازه پیگیری بعدی</label>
                    <input
                      type="text"
                      placeholder="مثال: ۲ روز کاری دیگر"
                      value={newCallInterval}
                      onChange={e => setNewCallInterval(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="text-left pt-1">
                  <button
                    type="button"
                    onClick={handleAddCallLog}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    + افزودن به تاریخچه تماس‌ها
                  </button>
                </div>
              </div>

              {/* Call Logs List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  تاریخچه مکالمات ثبت‌شده ({callLogs.length}):
                </span>
                {callLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">هنوز هیچ مکالمه‌ای برای این پرونده ثبت نشده است.</p>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {callLogs.map((log, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400">{log.date}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{log.expert}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 font-medium">
                              {log.status}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{log.result}</p>
                        </div>
                        {log.recallInterval && (
                          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold whitespace-nowrap">
                            پیگیری: {log.recallInterval}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation & Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {profileUrl && (
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>مشاهده پرونده در ادمین والکس</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
            {activeTab > 1 && (
              <button
                type="button"
                onClick={() => setActiveTab(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>بخش قبلی</span>
              </button>
            )}

            {activeTab < 5 && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 1 && !companyName.trim()) {
                    setValidationError("لطفاً نام شرکت را وارد فرمایید.");
                    return;
                  }
                  setValidationError("");
                  setActiveTab(prev => Math.min(5, prev + 1));
                }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>بخش بعدی</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{initialAccount ? "ذخیره تغییرات پرونده حقوقی" : "تأیید و ثبت نهایی پرونده"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal پیش‌نمایش مدارک بارگذاری شده */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden" dir="rtl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  پیش‌نمایش مدرک بارگذاری شده:
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs" dir="ltr">
                  {previewDoc.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950 min-h-[320px]">
              {previewDoc.type?.includes("pdf") ? (
                previewDoc.dataUrl ? (
                  <iframe
                    src={previewDoc.dataUrl}
                    className="w-full h-[65vh] rounded-xl border border-slate-300 dark:border-slate-700 bg-white"
                    title={previewDoc.name}
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">سند PDF با موفقیت بارگذاری شده است</div>
                    <div className="text-xs text-slate-500 font-mono" dir="ltr">{previewDoc.name} ({previewDoc.size})</div>
                  </div>
                )
              ) : previewDoc.dataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewDoc.dataUrl}
                  alt={previewDoc.name}
                  className="max-h-[65vh] max-w-full rounded-xl object-contain shadow-md"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-blue-500 mx-auto" />
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">تصویر با موفقیت بارگذاری شده است</div>
                  <div className="text-xs text-slate-500 font-mono" dir="ltr">{previewDoc.name} ({previewDoc.size})</div>
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="font-bold">فرمت: <span className="font-normal font-mono">{previewDoc.type?.includes("pdf") ? "PDF" : "JPEG / تصویر"}</span></span>
                <span>حجم: <span className="font-mono">{previewDoc.size}</span></span>
                <span>تاریخ بارگذاری: <span className="font-mono">{previewDoc.uploadDate}</span></span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-medium cursor-pointer transition-colors"
              >
                بستن پیش‌نمایش
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
