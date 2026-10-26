import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Compact Shamsi to Gregorian date converter (Jalaali algorithm)
export function shamsiToGregorian(jy: number, jm: number, jd: number): Date {
  let gy: number;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }
  const days = (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy += 400 * Math.floor(days / 146097);
  let g_day_no = days % 146097;
  if (g_day_no > 36524) {
    gy += 100 * Math.floor(--g_day_no / 36524);
    g_day_no = (g_day_no % 36524) + 1;
  }
  gy += 4 * Math.floor(g_day_no / 1461);
  g_day_no %= 1461;
  if (g_day_no > 365) {
    gy += Math.floor((g_day_no - 1) / 365);
    g_day_no = (g_day_no - 1) % 365;
  }
  let gd = g_day_no + 1;
  let leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
  let i = 0;
  for (i = 0; i < 12; i++) {
    const m_days = (i === 1) ? (leap ? 29 : 28) : ((i === 3 || i === 5 || i === 8 || i === 10) ? 30 : 31);
    if (gd <= m_days) break;
    gd -= m_days;
  }
  const gm = i + 1;
  return new Date(gy, gm - 1, gd);
}

// Get the current system date as a Shamsi YYYY/MM/DD string dynamically
export function getTodayShamsiString(): string {
  try {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const formatted = formatter.format(today);
    if (formatted) {
      const cleaned = formatted.replace(/[.\-]/g, '/').trim();
      const parts = cleaned.split('/');
      if (parts.length === 3) {
        const y = parts[0];
        const m = parts[1].padStart(2, "0");
        const d = parts[2].padStart(2, "0");
        return `${y}/${m}/${d}`;
      }
    }
  } catch (e) {
    // fallback
  }
  return "1405/03/04"; // Default static fallback date matching current Shamsi date (2026-05-25)
}

// Convert a Shamsi date string (YYYY/MM/DD) to standard Gregorian JavaScript Date
export function parseShamsiToGregorianDate(shamsiStr: string): Date | null {
  if (!shamsiStr) return null;
  const cleaned = shamsiStr.replace(/[.\-]/g, '/').trim();
  const parts = cleaned.split('/');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return shamsiToGregorian(y, m, d);
}

// Verify if a Shamsi record date falls into the desired quick filter range
export function isShamsiDateInPeriod(
  shamsiStr: string,
  period: "all" | "today" | "week" | "month" | "year",
  todayShamsi: string
): boolean {
  if (!shamsiStr) return false;
  if (period === "all") return true;

  const cleanAcc = shamsiStr.replace(/[.\-]/g, '/').trim();
  const cleanToday = todayShamsi.replace(/[.\-]/g, '/').trim();

  if (period === "today") {
    return cleanAcc === cleanToday;
  }

  if (period === "week") {
    const accDate = parseShamsiToGregorianDate(cleanAcc);
    const todayDate = parseShamsiToGregorianDate(cleanToday);
    if (!accDate || !todayDate) return false;

    accDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);

    const diffMs = todayDate.getTime() - accDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    // Covering registration in the last 7 days (including future or today cases)
    return diffDays >= 0 && diffDays < 7;
  }

  const partsAcc = cleanAcc.split('/');
  const partsToday = cleanToday.split('/');
  if (partsAcc.length < 3 || partsToday.length < 3) return false;

  if (period === "month") {
    return partsAcc[0] === partsToday[0] && partsAcc[1] === partsToday[1];
  }

  if (period === "year") {
    return partsAcc[0] === partsToday[0];
  }

  return true;
}
