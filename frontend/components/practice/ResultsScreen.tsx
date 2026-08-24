"use client";

interface SessionResult {
  correct: number;
  incorrect: number;
  xpEarned: number;
  mistakes: string[];
}

interface Props {
  result: SessionResult;
  total: number;
  onPracticeAgain: () => void;
  onReviewMistakes: () => void;
  onBackToLearn: () => void;
}

export default function ResultsScreen({ result, total, onPracticeAgain, onReviewMistakes, onBackToLearn }: Props) {
  const accuracy = Math.round((result.correct / total) * 100);
  const streakMaintained = result.correct >= Math.ceil(total * 0.6);

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5 fade-up">
      <div className="glass-card rounded-3xl p-8 flex flex-col gap-5 text-center">
        <h2 className="text-3xl font-bold text-white">PRACTICE COMPLETE!</h2>

        <p className="text-slate-300 text-xl font-semibold">
          {result.correct} / {total} Correct
        </p>

        {/* Accuracy bar */}
        <div>
          <div className="h-4 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700"
              style={{ width: `${accuracy}%` }}
            />
          </div>
          <p className="text-brand-400 font-bold mt-1">{accuracy}%</p>
        </div>

        <p className="text-yellow-400 text-xl font-bold">+{result.xpEarned} XP</p>

        {streakMaintained && (
          <p className="text-orange-400 font-semibold">Streak maintained!</p>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <StatRow label="Correct" value={String(result.correct)} accent="text-green-400" />
          <StatRow label="Incorrect" value={String(result.incorrect)} accent="text-red-400" />
          <StatRow label="Accuracy" value={`${accuracy}%`} accent="text-blue-400" />
          <StatRow label="XP Earned" value={`+${result.xpEarned}`} accent="text-yellow-400" />
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <button onClick={onPracticeAgain} className="btn-primary w-full">Practice Again</button>
          {result.mistakes.length > 0 && (
            <button
              onClick={onReviewMistakes}
              className="w-full glass-card rounded-2xl px-4 py-3 text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 transition-colors font-semibold"
            >
              Review Mistakes ({result.mistakes.length})
            </button>
          )}
          <button
            onClick={onBackToLearn}
            className="w-full glass-card rounded-2xl px-4 py-3 text-slate-300 hover:text-white transition-colors"
          >
            Back to Learn
          </button>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="glass-card rounded-xl p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${accent}`}>{value}</p>
    </div>
  );
}
