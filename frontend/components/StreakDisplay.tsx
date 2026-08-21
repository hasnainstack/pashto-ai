interface StreakDisplayProps {
  streak: number;
  best: number;
}

export default function StreakDisplay({ streak, best }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-orange-600 font-semibold text-sm">
        <span aria-hidden>🔥</span>
        <span>{streak} day streak</span>
      </div>
      <div className="text-xs text-slate-400">
        Best: <span className="font-medium text-slate-500">{best}</span>
      </div>
    </div>
  );
}
