"use client";

import { useState } from "react";
import PracticeDashboard from "./practice/PracticeDashboard";
import QuickQuiz from "./practice/QuickQuiz";
import TypeAnswer from "./practice/TypeAnswer";
import ListeningChallenge from "./practice/ListeningChallenge";
import MatchGame from "./practice/MatchGame";
import SpeedRound from "./practice/SpeedRound";
import ResultsScreen from "./practice/ResultsScreen";
import MistakeReview from "./practice/MistakeReview";

type GameMode = "quick-quiz" | "type-answer" | "listening" | "match" | "speed";
type Screen =
  | { type: "dashboard" }
  | { type: "game"; mode: GameMode }
  | { type: "results"; result: SessionResult; mode: GameMode }
  | { type: "mistakes"; ids: string[] };

interface SessionResult {
  correct: number;
  incorrect: number;
  xpEarned: number;
  mistakes: string[];
}

interface Props {
  onBackToLearn: () => void;
}

const QUIZ_TOTAL = 10;

export default function PracticePage({ onBackToLearn }: Props) {
  const [screen, setScreen] = useState<Screen>({ type: "dashboard" });

  function startMode(mode: GameMode) {
    setScreen({ type: "game", mode });
  }

  function handleComplete(result: SessionResult, mode: GameMode) {
    setScreen({ type: "results", result, mode });
  }

  function handleReviewMistakes(ids: string[]) {
    setScreen({ type: "mistakes", ids });
  }

  if (screen.type === "dashboard") {
    return <PracticeDashboard onStart={startMode} />;
  }

  if (screen.type === "game") {
    const back = () => setScreen({ type: "dashboard" });
    switch (screen.mode) {
      case "quick-quiz":
        return (
          <QuickQuiz
            onComplete={(r) => handleComplete(r, "quick-quiz")}
            onBack={back}
          />
        );
      case "type-answer":
        return (
          <TypeAnswer
            onComplete={(r) => handleComplete(r, "type-answer")}
            onBack={back}
          />
        );
      case "listening":
        return (
          <ListeningChallenge
            onComplete={(r) => handleComplete(r, "listening")}
            onBack={back}
          />
        );
      case "match":
        return <MatchGame onBack={back} />;
      case "speed":
        return <SpeedRound onBack={back} />;
    }
  }

  if (screen.type === "results") {
    return (
      <ResultsScreen
        result={screen.result}
        total={QUIZ_TOTAL}
        onPracticeAgain={() => startMode(screen.mode)}
        onReviewMistakes={() => handleReviewMistakes(screen.result.mistakes)}
        onBackToLearn={onBackToLearn}
      />
    );
  }

  if (screen.type === "mistakes") {
    return (
      <MistakeReview
        mistakeIds={screen.ids}
        onPracticeAgain={() => setScreen({ type: "dashboard" })}
        onBack={() => setScreen({ type: "dashboard" })}
      />
    );
  }

  return null;
}
