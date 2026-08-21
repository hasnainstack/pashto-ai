const STREAK_KEY = "pashtopro_streak";
const BEST_STREAK_KEY = "pashtopro_best_streak";

export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STREAK_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function getBestStreak(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(BEST_STREAK_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

export function incrementStreak(): { streak: number; best: number } {
  const streak = getStreak() + 1;
  const best = Math.max(streak, getBestStreak());
  window.localStorage.setItem(STREAK_KEY, String(streak));
  window.localStorage.setItem(BEST_STREAK_KEY, String(best));
  return { streak, best };
}

export function resetStreak(): void {
  window.localStorage.setItem(STREAK_KEY, "0");
}
