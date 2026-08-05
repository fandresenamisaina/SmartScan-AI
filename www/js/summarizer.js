/**
 * Résumé automatique EXTRACTIF, sans IA, sans connexion.
 * Principe : on repère les mots les plus fréquents (hors mots-outils comme
 * "le", "de", "et"...), on note chaque phrase selon la fréquence de ses mots,
 * puis on garde les meilleures phrases dans leur ordre d'origine.
 * Fonctionne aussi bien en français qu'en anglais.
 */

const STOPWORDS = new Set([
  'le','la','les','un','une','des','de','du','et','en','à','au','aux','ce','ces','cette',
  'que','qui','quoi','dont','où','est','sont','être','avoir','a','ont','pour','par','sur',
  'dans','avec','sans','ne','pas','plus','moins','tres','très','se','sa','son','ses','leur',
  'leurs','on','il','elle','ils','elles','nous','vous','je','tu','mais','ou','donc','or','ni',
  'car','comme','si','tout','tous','toute','toutes','the','a','an','and','or','of','to','in',
  'on','is','are','was','were','be','been','it','this','that','for','with','as','at','by'
]);

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ü0-9])/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function tokenize(sentence) {
  return sentence
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .match(/[a-z0-9]+/g) || [];
}

/**
 * @param {string} text - le texte complet à résumer
 * @param {number} ratio - proportion de phrases à garder (0.3 = 30%)
 * @returns {string} le texte résumé
 */
export function summarize(text, ratio = 0.3) {
  const sentences = splitSentences(text);
  const minSentences = 3;
  const maxSentences = 12;

  if (sentences.length <= minSentences) return sentences.join(' ');

  const freq = {};
  sentences.forEach(s => {
    tokenize(s).forEach(w => {
      if (STOPWORDS.has(w) || w.length < 3) return;
      freq[w] = (freq[w] || 0) + 1;
    });
  });

  const scored = sentences.map((s, i) => {
    const words = tokenize(s).filter(w => !STOPWORDS.has(w) && w.length >= 3);
    const score = words.reduce((sum, w) => sum + (freq[w] || 0), 0) / Math.max(words.length, 1);
    return { i, s, score };
  });

  let count = Math.round(sentences.length * ratio);
  count = Math.max(minSentences, Math.min(maxSentences, count));
  count = Math.min(count, sentences.length);

  const top = scored.sort((a, b) => b.score - a.score).slice(0, count);
  top.sort((a, b) => a.i - b.i);

  return top.map(t => t.s).join(' ');
}

export function countSentences(text) {
  return splitSentences(text).length;
}