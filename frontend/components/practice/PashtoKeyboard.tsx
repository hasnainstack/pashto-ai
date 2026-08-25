"use client";

const KEY_ROWS = [
  ["ا", "ب", "پ", "ت", "ټ", "ث", "ج", "ځ", "چ", "ح", "خ"],
  ["د", "ډ", "ذ", "ر", "ړ", "ز", "ژ", "ږ", "س", "ش", "ښ"],
  ["ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک", "ګ", "ل"],
  ["م", "ن", "ڼ", "و", "ه", "ء", "ي", "ې", "ۍ", "ی"],
];

interface Props {
  disabled?: boolean;
  onInput: (value: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

export default function PashtoKeyboard({
  disabled = false,
  onInput,
  onBackspace,
  onClear,
}: Props) {
  const keyClass =
    "min-w-10 min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-lg text-slate-100 transition-colors hover:border-purple-400/50 hover:bg-purple-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className="rounded-2xl border border-white/10 bg-slate-950/30 p-3"
      dir="rtl"
      lang="ps"
      aria-label="Pashto on-screen keyboard"
    >
      <div className="flex flex-col gap-1.5">
        {KEY_ROWS.map((row, index) => (
          <div key={index} className="flex flex-wrap justify-center gap-1.5">
            {row.map((letter) => (
              <button
                key={letter}
                type="button"
                className={keyClass}
                disabled={disabled}
                onClick={() => onInput(letter)}
                aria-label={`Insert ${letter}`}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}

        <div className="flex gap-1.5" dir="ltr">
          <button
            type="button"
            className={`${keyClass} flex-1 text-sm`}
            disabled={disabled}
            onClick={() => onInput(" ")}
          >
            Space
          </button>
          <button
            type="button"
            className={`${keyClass} px-4 text-sm`}
            disabled={disabled}
            onClick={onBackspace}
            aria-label="Backspace"
          >
            Backspace
          </button>
          <button
            type="button"
            className={`${keyClass} px-4 text-sm text-slate-300`}
            disabled={disabled}
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
