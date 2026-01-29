// Simple profanity and risk detection placeholders.
// Replace with robust moderation / classification service in production.

const PROFANITY = [ 'badword1', 'badword2' ];
const RISK_PHRASES = [ 'suicide', 'self harm', 'kill myself', 'end my life', 'hurt myself' ];

export function basicProfanityFilter(text) {
  let clean = text;
  PROFANITY.forEach(w => {
    const re = new RegExp(`\\b${w}\\b`, 'ig');
    clean = clean.replace(re, '*'.repeat(w.length));
  });
  return clean;
}

export function detectRiskPhrases(text) {
  const lowered = text.toLowerCase();
  const hits = RISK_PHRASES.filter(p => lowered.includes(p));
  return hits;
}

export function needsCrisisEscalation(risks) {
  return risks && risks.length > 0;
}
