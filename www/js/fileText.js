/**
 * Extrait le texte brut d'un fichier Word (.docx), PDF (.pdf) ou texte (.txt).
 * Tout tourne en local dans le navigateur/WebView, aucune connexion requise
 * (les bibliothèques mammoth.js et pdf.js sont embarquées dans l'app).
 */
export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith('.txt')) {
    return file.text();
  }

  if (name.endsWith('.docx')) {
    return extractFromDocx(file);
  }

  if (name.endsWith('.pdf')) {
    return extractFromPdf(file);
  }

  throw new Error('Format non pris en charge. Utilise un fichier .docx, .pdf ou .txt.');
}

async function extractFromDocx(file) {
  // window.mammoth est chargé via un <script> classique dans index.html
  if (!window.mammoth) {
    throw new Error("La bibliothèque de lecture Word n'est pas chargée.");
  }
  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractFromPdf(file) {
  const pdfjsLib = await import('./vendor/pdfjs/pdf.min.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href;

  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}