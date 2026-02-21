"use client";

import { Button } from "@/components/ui/button";

const suggestions = [
  "Why is my cashflow getting worse?",
  "When will I run out of cash?",
  "Which clients pay slowest?",
  "Am I overspending anywhere?",
  "How do I cover payroll this Friday?",
  "What should I focus on this week?",
];

export function SuggestedQuestions({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {suggestions.map((question) => (
        <Button key={question} variant="outline" className="justify-start" onClick={() => onPick(question)}>
          {question}
        </Button>
      ))}
    </div>
  );
}
