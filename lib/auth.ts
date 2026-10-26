"use client";

export type RoleType = "specialist" | "management" | "support";

export interface AuthUser {
  username: string; // e.g. "a.sedigh", "q.khodaei", "h.jaliliani", "support agent"
  displayUsername: string; // e.g. "a.sedigh", "Q.Khodaei", "H.Jaliliani", "support agent"
  aliases?: string[]; // e.g. ["q.khodayi", "support.agent"]
  password: string; // default "wallex"
  fullName: string;
  role: RoleType;
  title: string;
  avatarInitial: string;
  canChangePassword?: boolean; // Only true for specifically named legal experts and managers
  lastPasswordChange?: string;
  mustChangePassword?: boolean;
}

// Exactly matching the user's requested staff members and tasks:
export const DEFAULT_USERS: AuthUser[] = [
  // 1. کارشناس حقوقی (Legal Specialists - Named with password change access)
  {
    username: "a.sedigh",
    displayUsername: "a.sedigh",
    password: "wallex",
    fullName: "آیگین صدیق",
    role: "specialist",
    title: "کارشناس حقوقی",
    avatarInitial: "ص",
    canChangePassword: true,
    mustChangePassword: true,
  },
  {
    username: "q.khodaei",
    displayUsername: "Q.Khodaei",
    aliases: ["q.khodayi", "Q.Khodayi"],
    password: "wallex",
    fullName: "غزل خدائی",
    role: "specialist",
    title: "کارشناس حقوقی",
    avatarInitial: "خ",
    canChangePassword: true,
    mustChangePassword: true,
  },
  {
    username: "a.fazeli",
    displayUsername: "a.fazeli",
    password: "wallex",
    fullName: "اسما فاضلی",
    role: "specialist",
    title: "کارشناس حقوقی",
    avatarInitial: "ف",
    canChangePassword: true,
    mustChangePassword: true,
  },

  // 2. بررسی و نظارت مدیریت (Management & Oversight - Named with password change access)
  {
    username: "h.jaliliani",
    displayUsername: "H.Jaliliani",
    password: "wallex",
    fullName: "حامد جلیلیانی",
    role: "management",
    title: "بررسی و نظارت مدیریت",
    avatarInitial: "ج",
    canChangePassword: true,
    mustChangePassword: true,
  },
  {
    username: "m.jafari",
    displayUsername: "M.Jafari",
    password: "wallex",
    fullName: "مهدیه جعفری",
    role: "management",
    title: "بررسی و نظارت مدیریت",
    avatarInitial: "ج",
    canChangePassword: true,
    mustChangePassword: true,
  },
  {
    username: "h.ebadi",
    displayUsername: "H.Ebadi",
    password: "wallex",
    fullName: "حامد عبادی",
    role: "management",
    title: "بررسی و نظارت مدیریت",
    avatarInitial: "ع",
    canChangePassword: true,
    mustChangePassword: true,
  },
  {
    username: "d.eskandari",
    displayUsername: "D.Eskandari",
    aliases: ["d. eskandari", "D. Eskandari"],
    password: "wallex",
    fullName: "دریا اسکندری",
    role: "management",
    title: "بررسی و نظارت مدیریت",
    avatarInitial: "ا",
    canChangePassword: true,
    mustChangePassword: true,
  },
  {
    username: "s.maleki",
    displayUsername: "S.Maleki",
    password: "wallex",
    fullName: "سعید ملکی",
    role: "management",
    title: "بررسی و نظارت مدیریت",
    avatarInitial: "م",
    canChangePassword: true,
    mustChangePassword: true,
  },
  {
    username: "r.yousefi",
    displayUsername: "R.Yousefi",
    password: "wallex",
    fullName: "رضا یوسفی",
    role: "management",
    title: "بررسی و نظارت مدیریت",
    avatarInitial: "ی",
    canChangePassword: true,
    mustChangePassword: true,
  },
  {
    username: "s.rouzbehi",
    displayUsername: "S.Rouzbehi",
    password: "wallex",
    fullName: "سبحان روزبهی",
    role: "management",
    title: "بررسی و نظارت مدیریت",
    avatarInitial: "ر",
    canChangePassword: true,
    mustChangePassword: true,
  },
  {
    username: "e.ghafarallahi",
    displayUsername: "E.Ghafarallahi",
    aliases: ["e. ghafarallahi", "E. Ghafarallahi", "e_ghafarallahi", "eghafarallahi"],
    password: "wallex",
    fullName: "احسان غفراللهی",
    role: "management",
    title: "بررسی و نظارت مدیریت",
    avatarInitial: "غ",
    canChangePassword: true,
    mustChangePassword: true,
  },

  // 3. سایر کارشناسان (Customer Support - support agent without password change)
  {
    username: "support agent",
    displayUsername: "support agent",
    aliases: ["support.agent", "support_agent", "supportagent", "Support Agent"],
    password: "wallex",
    fullName: "کارشناس پشتیبانی مشتریان",
    role: "support",
    title: "کارشناس پشتیبانی (استعلام با شناسه ملی)",
    avatarInitial: "پ",
    canChangePassword: false, // امکان تغییر رمز عبور را ندارند
    mustChangePassword: false,
  },
];

const STORAGE_USERS_KEY = "wallex_auth_users_v6_rbac";
const STORAGE_CURRENT_USER_KEY = "wallex_auth_current_user_v6_rbac";

function normalizeUsername(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, "");
}

function matchesUser(u: AuthUser, cleanInput: string): boolean {
  if (normalizeUsername(u.username) === cleanInput) return true;
  if (normalizeUsername(u.displayUsername) === cleanInput) return true;
  if (u.aliases && u.aliases.some(a => normalizeUsername(a) === cleanInput)) return true;
  return false;
}

export function getStoredUsers(): AuthUser[] {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  } else {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export function authenticateUser(usernameInput: string, passwordInput: string): { success: boolean; user?: AuthUser; error?: string } {
  const users = getStoredUsers();
  const cleanInput = normalizeUsername(usernameInput);

  const user = users.find(u => matchesUser(u, cleanInput));
  if (!user) {
    return { success: false, error: "نام کاربری وارد شده در سامانه وجود ندارد." };
  }

  if (user.password !== passwordInput) {
    return { success: false, error: "رمز عبور وارد شده نادرست است." };
  }

  saveCurrentUser(user);
  return { success: true, user };
}

export function changeUserPassword(username: string, currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  const users = getStoredUsers();
  const cleanInput = normalizeUsername(username);
  const userIndex = users.findIndex(u => matchesUser(u, cleanInput));

  if (userIndex === -1) {
    return { success: false, error: "کاربر مورد نظر یافت نشد." };
  }

  const user = users[userIndex];

  // Check if user has permission to change password
  if (user.canChangePassword === false) {
    return { success: false, error: "امکان تغییر رمز عبور برای کارشناسان عمومی پشتیبانی تعریف نشده است." };
  }

  if (user.password !== currentPassword) {
    return { success: false, error: "رمز عبور فعلی وارد شده نادرست است." };
  }

  if (newPassword.length < 4) {
    return { success: false, error: "رمز عبور جدید باید حداقل ۴ کاراکتر باشد." };
  }

  if (newPassword === currentPassword) {
    return { success: false, error: "رمز عبور جدید نمی‌تواند مشابه رمز عبور فعلی باشد." };
  }

  const updatedUser: AuthUser = {
    ...user,
    password: newPassword,
    lastPasswordChange: new Date().toLocaleDateString("fa-IR"),
    mustChangePassword: false,
  };

  users[userIndex] = updatedUser;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }
  saveCurrentUser(updatedUser);

  return { success: true };
}

export function logoutUser() {
  saveCurrentUser(null);
}
