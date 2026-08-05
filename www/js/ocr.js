import Tesseract from './vendor/tesseract.esm.min.js';

// Chemins calculés par rapport à ce fichier, pour fonctionner peu importe
// depuis quelle page le module est chargé.
const CORE_PATH = new URL('./tesseract-core/tesseract-core-simd-lstm.wasm.js', import.meta.url).href;
const WORKER_PATH = new URL('./tesseract-core/worker.min.js', import.meta.url).href;
const LANG_PATH = new URL('../tessdata', import.meta.url).href;

// Largeur maximale d'image envoyée à l'OCR. Les photos de caméra font souvent
// 3000-4000px de large ; Tesseract n'a pas besoin de cette résolution pour lire
// du texte, et la reconnaissance ralentit fortement avec la taille de l'image.
// Réduire à ~1600px accélère nettement le scan sans perte de précision notable
// sur du texte de document.
const MAX_WIDTH = 1600;

// --- Worker Tesseract réutilisé entre les scans ---
// Créer un worker recharge le moteur WASM + les données de langue (~1-2s à
// chaque fois). En le gardant en mémoire entre les scans et en changeant
// seulement la langue via reinitialize() si besoin, les scans suivants
// démarrent quasi instantanément au lieu de tout recharger.
let workerPromise = null;
let workerLang = null;

// Le callback de progression est lu par Tesseract une seule fois, à la
// création du worker — il ne peut pas être changé à chaque appel recognize().
// On passe donc une fonction fixe qui délègue vers cette référence mutable,
// mise à jour avant chaque scan.
let activeOnProgress = null;

function handleLoggerEvent(m) {
  if (activeOnProgress && m && typeof m.progress === 'number') {
    activeOnProgress({ status: m.status, progress: m.progress });
  }
}

async function getWorker(lang) {
  if (!workerPromise) {
    workerLang = lang;
    workerPromise = Tesseract.createWorker(lang, 1, {
      workerPath: WORKER_PATH,
      corePath: CORE_PATH,
      langPath: LANG_PATH,
      gzip: false, // nos fichiers .traineddata ne sont pas compressés
      logger: handleLoggerEvent,
    });
    return workerPromise;
  }

  const worker = await workerPromise;
  if (workerLang !== lang) {
    await worker.reinitialize(lang);
    workerLang = lang;
  }
  return worker;
}

/**
 * Redimensionne l'image si elle dépasse MAX_WIDTH, pour accélérer l'OCR.
 * Fonctionne entièrement en local via <canvas>, aucune requête réseau.
 */
async function downscaleImage(imagePath) {
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = imagePath;
  });

  if (img.width <= MAX_WIDTH) {
    return imagePath; // déjà assez petite, pas besoin de retraiter
  }

  const scale = MAX_WIDTH / img.width;
  const canvas = document.createElement('canvas');
  canvas.width = MAX_WIDTH;
  canvas.height = Math.round(img.height * scale);

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Extrait le texte d'une image avec Tesseract.js — 100% embarqué dans l'app,
 * AUCUNE requête réseau, même au premier lancement. Le moteur OCR (WASM) et
 * les données de langue sont inclus directement dans l'APK à la compilation.
 * Le worker est réutilisé entre les appels pour accélérer les scans après
 * le premier, et l'image est redimensionnée avant reconnaissance.
 *
 * @param {string} imagePath
 * @param {string} lang - code de langue Tesseract ('fra' ou 'eng')
 * @param {(info: {status: string, progress: number}) => void} onProgress
 *        callback appelé à chaque mise à jour de progression (0 à 1)
 */
export async function extractText(imagePath, lang = 'fra', onProgress = null) {
  const resizedPath = await downscaleImage(imagePath);
  const worker = await getWorker(lang);

  activeOnProgress = onProgress;
  try {
    const { data } = await worker.recognize(resizedPath);
    return data.text;
  } finally {
    activeOnProgress = null;
  }
}