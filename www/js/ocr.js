import Tesseract from './vendor/tesseract.esm.min.js';

// Chemins calculés par rapport à ce fichier, pour fonctionner peu importe
// depuis quelle page le module est chargé.
const CORE_PATH = new URL('./tesseract-core/tesseract-core-simd-lstm.wasm.js', import.meta.url).href;
const WORKER_PATH = new URL('./tesseract-core/worker.min.js', import.meta.url).href;
const LANG_PATH = new URL('../tessdata', import.meta.url).href;

/**
 * Extrait le texte d'une image avec Tesseract.js — 100% embarqué dans l'app,
 * AUCUNE requête réseau, même au premier lancement. Le moteur OCR (WASM) et
 * les données de langue sont inclus directement dans l'APK à la compilation.
 */
export async function extractText(imagePath, lang = 'fra') {
  const worker = await Tesseract.createWorker(lang, 1, {
    workerPath: WORKER_PATH,
    corePath: CORE_PATH,
    langPath: LANG_PATH,
    gzip: false, // nos fichiers .traineddata ne sont pas compressés
  });
  const { data } = await worker.recognize(imagePath);
  await worker.terminate();
  return data.text;
}