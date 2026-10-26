"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LegalAccount } from "@/lib/mockData";
import { AuthUser, getCurrentUser, logoutUser } from "@/lib/auth";
import LandingPage from "@/components/LandingPage";
import LegalSpecialistPanel from "@/components/LegalSpecialistPanel";
import ManagementPanel from "@/components/ManagementPanel";
import SupportAgentPanel from "@/components/SupportAgentPanel";
import LegalRegistrationModal from "@/components/LegalRegistrationModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";

const EXPERTS = ["آیگین صدیق", "غزل خدائی", "اسما فاضلی"];

export default function Home() {
  const [currentRole, setCurrentRole] = useState<"landing" | "specialist" | "management" | "support">("landing");
  const [accounts, setAccounts] = useState<LegalAccount[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Authentication & Security State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Quick Direct Registration modal trigger
  const [isQuickRegistrationOpen, setIsQuickRegistrationOpen] = useState(false);

  useEffect(() => {
    // 1. Dark Mode initialization
    const storedDark = localStorage.getItem("wallex_dark_mode");
    const isDark = storedDark === "true";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // 2. Authentication user restore
    const activeUser = getCurrentUser();
    if (activeUser) {
      setCurrentUser(activeUser);
      setCurrentRole(activeUser.role);
    } else {
      setCurrentRole("landing");
    }

    // 3. Clean accounts state
    const storageKey = "wallex_legal_accounts_v5_clean";
    const stored = localStorage.getItem(storageKey);
    let loadedAccounts: LegalAccount[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          loadedAccounts = parsed;
        }
      } catch {
        loadedAccounts = [];
      }
    }
    setAccounts(loadedAccounts);
    setIsClient(true);
  }, []);

  const saveToStorage = (updatedList: LegalAccount[]) => {
    setAccounts(updatedList);
    localStorage.setItem("wallex_legal_accounts_v5_clean", JSON.stringify(updatedList));
  };

  // Direct login without intermediate role selection screen:
  // Role is automatically determined by credentials!
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === "specialist") {
      setCurrentRole("specialist");
    } else if (user.role === "management") {
      setCurrentRole("management");
    } else if (user.role === "support") {
      setCurrentRole("support");
    } else {
      setCurrentRole("specialist");
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentRole("landing");
  };

  const handleQuickRegistrationSave = (newAccount: LegalAccount) => {
    const updated = [newAccount, ...accounts];
    saveToStorage(updated);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center text-slate-800 dark:text-slate-100 p-8 transition-colors duration-200">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-sans text-base font-semibold">در حال بارگزاری سامانه احراز هویت حقوقی والکس...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <AnimatePresence mode="wait">
        {/* Screen 1: Minimalist Login Entry */}
        {currentRole === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            <LandingPage onLoginSuccess={handleLoginSuccess} />
          </motion.div>
        )}

        {/* Screen 2: Direct Legal Specialist Panel for Legal Team */}
        {currentRole === "specialist" && (
          <motion.div
            key="specialist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6"
          >
            <LegalSpecialistPanel
              accounts={accounts}
              onUpdateAccounts={saveToStorage}
              onBackToLanding={handleLogout}
              onSwitchRole={() => {}}
              currentUser={currentUser}
              onOpenChangePassword={currentUser?.canChangePassword !== false ? () => setIsChangePasswordOpen(true) : undefined}
              onLogout={handleLogout}
            />
          </motion.div>
        )}

        {/* Screen 3: Direct Management Panel for Management Team */}
        {currentRole === "management" && (
          <motion.div
            key="management"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6"
          >
            <ManagementPanel
              accounts={accounts}
              onUpdateAccounts={saveToStorage}
              onBackToLanding={handleLogout}
              onSwitchRole={() => {}}
              currentUser={currentUser}
              onOpenChangePassword={currentUser?.canChangePassword !== false ? () => setIsChangePasswordOpen(true) : undefined}
              onLogout={handleLogout}
            />
          </motion.div>
        )}

        {/* Screen 4: Direct Support Agent Panel for General Support Team */}
        {currentRole === "support" && (
          <motion.div
            key="support"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6"
          >
            <SupportAgentPanel
              accounts={accounts}
              onBackToLanding={handleLogout}
              onSwitchRole={() => {}}
              currentUser={currentUser}
              onOpenChangePassword={currentUser?.canChangePassword !== false ? () => setIsChangePasswordOpen(true) : undefined}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Direct Registration Modal (Accessible from Legal Panel) */}
      <LegalRegistrationModal
        isOpen={isQuickRegistrationOpen}
        onClose={() => setIsQuickRegistrationOpen(false)}
        onSave={handleQuickRegistrationSave}
        experts={EXPERTS}
        initialMode="initial_only"
      />

      {/* Change Password Modal (Minimalist: Lock Logo, 3 Boxes & Submit Button) */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentUser={currentUser}
        onPasswordChanged={(updated) => setCurrentUser(updated)}
      />
    </div>
  );
}
