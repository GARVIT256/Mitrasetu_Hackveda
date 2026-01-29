function calculatePhq9(answers) {
  const score = answers.reduce((acc, val) => acc + val, 0);
  let riskLevel = 'Minimal';
  if (score >= 5) riskLevel = 'Mild';
  if (score >= 10) riskLevel = 'Moderate';
  if (score >= 15) riskLevel = 'Moderately Severe';
  if (score >= 20) riskLevel = 'Severe';
  return { score, riskLevel };
}

function calculateGad7(answers) {
  const score = answers.reduce((acc, val) => acc + val, 0);
  let riskLevel = 'Minimal';
  if (score >= 5) riskLevel = 'Mild';
  if (score >= 10) riskLevel = 'Moderate';
  if (score >= 15) riskLevel = 'Severe';
  return { score, riskLevel };
}

module.exports = { calculatePhq9, calculateGad7 };
