import { createWorker } from 'tesseract.js';

/**
 * Extrait le texte d'une image avec Tesseract.js.
 * Gratuit, tourne dans le JavaScript. Les données de langue (~15 Mo pour le français)
 * sont téléchargées une fois puis mises en cache pour un usage hors-ligne ensuite.
 */
export async function extractText(imagePath, lang = 'fra') {
  const worker = await createWorker(lang);
  const { data } = await worker.recognize(imagePath);
  await worker.terminate();
  return data.text;
}