import { VOCABULARY, VocabWord } from "./vocabulary";
import { getLearnedIds, getMistakeIds, getPracticeHistory } from "./xp";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Returns a pool of words to practice, prioritised by mistakes / least-recently-practiced */
export function getPracticePool(count: number): VocabWord[] {
  const learnedIds = getLearnedIds();
  const mistakeIds = getMistakeIds();
  const history = getPracticeHistory();

  // Use learned words if available, otherwise fall back to all vocab
  const pool = learnedIds.length >= 4
    ? VOCABULARY.filter((w) => learnedIds.includes(w.id))
    : VOCABULARY;

  // Sort: mistakes first, then least-recently-practiced
  const sorted = [...pool].sort((a, b) => {
    const aMistake = mistakeIds.includes(a.id) ? 0 : 1;
    const bMistake = mistakeIds.includes(b.id) ? 0 : 1;
    if (aMistake !== bMistake) return aMistake - bMistake;
    const aTime = history[a.id] || 0;
    const bTime = history[b.id] || 0;
    return aTime - bTime;
  });

  return shuffle(sorted.slice(0, Math.max(count * 3, 20))).slice(0, count);
}

export interface QuizQuestion {
  word: VocabWord;
  /** The question asks: "What does [pashto] mean?" → choices are English */
  choices: string[];
  correctIndex: number;
}

export function generateQuizQuestions(count: number): QuizQuestion[] {
  const words = getPracticePool(count);
  const allEnglish = VOCABULARY.map((w) => w.english);

  return words.map((word) => {
    const distractors = shuffle(
      allEnglish.filter((e) => e !== word.english)
    ).slice(0, 3);
    const choices = shuffle([word.english, ...distractors]);
    return {
      word,
      choices,
      correctIndex: choices.indexOf(word.english),
    };
  });
}

export function generateMatchPairs(count = 6): VocabWord[] {
  return getPracticePool(count);
}

export { shuffle };
