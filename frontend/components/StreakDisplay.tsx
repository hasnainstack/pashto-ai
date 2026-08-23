interface StreakDisplayProps {
  streak: number;
  best: number;
}

export default function StreakDisplay({ streak, best }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5 streak-pulse">
        <span aria-hidden>🔥</span>
        <span className="text-orange-400 font-bold text-sm">{streak}</span>
        <span className="text-slate-500 text-xs">streak</span>
      </div>
      <div className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5">
        <span aria-hidden>⭐</span>
        <span className="text-yellow-400 font-bold text-sm">{best}</span>
        <span className="text-slate-500 text-xs">best</span>
      </div>
    </div>
  );
}
