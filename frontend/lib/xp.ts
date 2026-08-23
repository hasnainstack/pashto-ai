const XP_KEY = "pashtopro_xp";
const LEARNED_KEY = "pashtopro_learned";
const MISTAKES_KEY = "pashtopro_mistakes";
const PRACTICE_HISTORY_KEY = "pashtopro_practice_history";

export function getXP(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(XP_KEY) || "0", 10);
}

export function addXP(amount: number): number {
  const xp = getXP() + amount;
  localStorage.setItem(XP_KEY, String(xp));
  return xp;
}

export function getLevel(): number {
  return Math.floor(getXP() / 100) + 1;
}

export function getXPProgress(): number {
  return getXP() % 100;
}

/** Mark word IDs as learned */
export function markLearned(ids: string[]): void {
  if (typeof window === "undefined") return;
  const existing = getLearnedIds();
  const merged = Array.from(new Set([...existing, ...ids]));
  localStorage.setItem(LEARNED_KEY, JSON.stringify(merged));
}

export function getLearnedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LEARNED_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Track words the user got wrong */
export function recordMistake(id: string): void {
  if (typeof window === "undefined") return;
  const mistakes = getMistakeIds();
  if (!mistakes.includes(id)) {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify([...mistakes, id]));
  }
}

export function clearMistake(id: string): void {
  if (typeof window === "undefined") return;
  const mistakes = getMistakeIds().filter((m) => m !== id);
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
}

export function getMistakeIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MISTAKES_KEY) || "[]");
  } catch {
    return [];
  }
}

/** Record that a word was practiced (timestamp) */
export function recordPracticed(id: string): void {
  if (typeof window === "undefined") return;
  const history: Record<string, number> = getPracticeHistory();
  history[id] = Date.now();
  localStorage.setItem(PRACTICE_HISTORY_KEY, JSON.stringify(history));
}

export function getPracticeHistory(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PRACTICE_HISTORY_KEY) || "{}");
  } catch {
    return {};
  }
}
