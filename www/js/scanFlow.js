import { scanDocument } from './scan.js';
import { extractText } from './ocr.js';
import { db } from './db.js';

/**
 * Lance la caméra puis extrait le texte de la photo obtenue.
 * Ne sauvegarde rien : utile si l'app doit d'abord montrer un aperçu
 * (texte extrait, titre modifiable) avant l'enregistrement définitif.
 *
 * @param {Object} [options]
 * @param {string} [options.lang='fra'] - langue pour l'OCR (code Tesseract, ex. 'fra', 'eng')
 * @returns {Promise<{imagePath: string, extractedText: string}|null>}
 *   null si l'utilisateur a annulé la prise de photo (ou en cas d'erreur caméra,
 *   déjà gérée et signalée dans scan.js)
 */
export async function captureAndExtract({ lang = 'fra' } = {}) {
  const imagePath = await scanDocument();
  if (!imagePath) return null;

  const extractedText = await extractText(imagePath, lang);
  return { imagePath, extractedText: extractedText.trim() };
}

/**
 * Flux complet : scan -> OCR -> sauvegarde dans l'historique (db.js).
 *
 * @param {Object} [options]
 * @param {string} [options.lang='fra'] - langue pour l'OCR
 * @param {string} [options.title] - titre du document. Si absent, un titre
 *   est déduit automatiquement de la première ligne du texte extrait.
 * @param {(status: 'scanning'|'extracting'|'saving') => void} [options.onStatusChange]
 *   callback appelé à chaque étape (utile pour afficher un indicateur de chargement)
 * @returns {Promise<Object|null>} le document enregistré (avec id et createdAt),
 *   ou null si l'utilisateur a annulé la prise de photo
 */
export async function scanAndSaveDocument({ lang = 'fra', title, onStatusChange } = {}) {
  onStatusChange?.('scanning');
  const imagePath = await scanDocument();
  if (!imagePath) return null;

  try {
    onStatusChange?.('extracting');
    const extractedText = await extractText(imagePath, lang);

    onStatusChange?.('saving');
    const newDoc = await db.insert({
      title: title || buildDefaultTitle(extractedText),
      extractedText: extractedText.trim(),
      imagePath,
    });

    return newDoc;
  } catch (e) {
    console.error('Erreur pendant l\'OCR ou la sauvegarde :', e);
    alert('Impossible de traiter le document : ' + (e && e.message ? e.message : e));
    return null;
  }
}

/**
 * Déduit un titre par défaut à partir de la première ligne non vide
 * du texte extrait (tronquée à 50 caractères). Si le texte est vide
 * (photo blanche, mauvais cadrage...), utilise la date du jour.
 */
function buildDefaultTitle(extractedText) {
  const firstLine = extractedText
    .split('\n')
    .map(line => line.trim())
    .find(line => line.length > 0);

  if (firstLine) {
    return firstLine.length > 50 ? firstLine.slice(0, 50) + '…' : firstLine;
  }
  return `Document du ${new Date().toLocaleDateString('fr-FR')}`;
}