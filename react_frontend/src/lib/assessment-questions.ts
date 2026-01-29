export const OBJECTIVE_QUESTIONS = [
  {
    id: 1,
    text: "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: 2,
    text: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: 3,
    text: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: 4,
    text: "Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: 5,
    text: "Over the last 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
  {
    id: 6,
    text: "Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" },
    ],
  },
]

export const SUBJECTIVE_PROMPTS = [
  "How would you describe your current emotional state?",
  "What has been your biggest challenge lately?",
  "What brings you joy or makes you feel peaceful?",
  "How do you typically cope with stress or difficult emotions?",
  "What would you like to work on or improve about your mental wellbeing?",
  "Is there anything specific you'd like support with today?",
]

export function calculateScores(answers: number[]) {
  const depressionScore = answers.slice(0, 2).reduce((sum, val) => sum + val, 0)
  const anxietyScore = answers.slice(2, 4).reduce((sum, val) => sum + val, 0)
  const totalScore = answers.reduce((sum, val) => sum + val, 0)

  return { depressionScore, anxietyScore, totalScore }
}

export function getScoreLabel(score: number, maxScore: number) {
  const percentage = (score / maxScore) * 100
  if (percentage <= 25) return "Minimal"
  if (percentage <= 50) return "Mild"
  if (percentage <= 75) return "Moderate"
  return "Severe"
}
