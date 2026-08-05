import { db } from './db.js';
import { scanDocument, pickFromFiles } from './scan.js';
import { extractText } from './ocr.js';
import { extractTextCloud } from './ocr-cloud.js';
import { t, getLang, setLang, applyTranslations } from './i18n.js';

const homeScreen = document.getElementById('home-screen');
const resultScreen = document.getElementById('result-screen');
const documentList = document.getElementById('document-list');
const searchInput = document.getElementById('search-input');
const scanButton = document.getElementById('scan-button');
const importButton = document.getElementById('import-button');
const backButton = document.getElementById('back-button');
const saveButton = document.getElementById('save-button');
const titleInput = document.getElementById('title-input');
const resultImage = document.getElementById('result-image');
const ocrLoading = document.getElementById('ocr-loading');
const ocrProgressBar = document.getElementById('ocr-progress-bar');
const ocrLoadingText = document.getElementById('ocr-loading-text');
const extractedTextEl = document.getElementById('extracted-text');
const copyButton = document.getElementById('copy-button');
const shareButton = document.getElementById('share-button');
const uiLangSelect = document.getElementById('ui-lang-select');
const ocrLangSelect = document.getElementById('ocr-lang-select');
const ocrModeSelect = document.getElementById('ocr-mode-select');
const modeNote = document.getElementById('mode-note');
const printedLangRow = document.getElementById('printed-lang-row');

let currentImagePath = null;
let currentExtractedText = '';

// --- Internationalisation ---

applyTranslations();

uiLangSelect.value = getLang();
uiLangSelect.addEventListener('change', () => {
  setLang(uiLangSelect.value);
  renderDocumentList(searchInput.value);
});

titleInput.addEventListener('input', () => {
  titleInput.dataset.userEdited = 'true';
});

// --- Bascule entre mode Imprimé (hors ligne) et Manuscrit (en ligne) ---
// Change l'affichage ET relance l'OCR sur l'image déjà chargée.

ocrModeSelect.addEventListener('change', () => {
  const isHandwritten = ocrModeSelect.value === 'handwritten';
  modeNote.style.display = isHandwritten ? 'block' : 'none';
  printedLangRow.style.display = isHandwritten ? 'none' : 'block';
  runOcr();
});

ocrLangSelect.addEventListener('change', () => {
  if (ocrModeSelect.value === 'printed') {
    runOcr();
  }
});

// --- Écran d'accueil ---

async function renderDocumentList(query = '') {
  const docs = query ? await db.search(query) : await db.getAll();

  if (docs.length === 0) {
    documentList.innerHTML = `<p class="empty-state">${t('emptyState')}</p>`;
    return;
  }

  documentList.innerHTML = docs.map(doc => `
    <div class="doc-card" data-id="${doc.id}">
      <img src="${doc.imagePath}" onerror="this.style.display='none'" />
      <div class="doc-info">
        <div class="doc-title">${escapeHtml(doc.title)}</div>
        <div class="doc-preview">${escapeHtml(doc.extractedText || t('noTextDetected'))}</div>
      </div>
      <button class="delete-btn" data-id="${doc.id}" title="${t('deleteTitle')}">🗑</button>
    </div>
  `).join('');

  documentList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await db.delete(Number(btn.dataset.id));
      renderDocumentList(searchInput.value);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

searchInput.addEventListener('input', () => renderDocumentList(searchInput.value));

// --- OCR ---

function updateOcrProgress(percent, statusKey) {
  ocrProgressBar.style.width = `${percent}%`;
  ocrLoadingText.textContent = statusKey
    ? t(statusKey)
    : t('ocrProgress', { percent });
}

function mapTesseractStatus(status) {
  if (!status) return null;
  if (status.includes('loading language')) return 'ocrStatusLoadLang';
  if (status.includes('initializ') || status.includes('loading')) return 'ocrStatusInit';
  if (status.includes('recognizing')) return 'ocrStatusRecognizing';
  return null;
}

/**
 * Lance (ou relance) l'OCR sur l'image actuellement affichée, selon le mode
 * choisi (Imprimé / Manuscrit). Ne touche pas au titre ni à l'image elle-même
 * — utilisé aussi bien pour une nouvelle image que pour un changement de mode.
 */
async function runOcr() {
  if (!currentImagePath) return;

  ocrLoading.style.display = 'block';
  extractedTextEl.style.display = 'none';
  saveButton.disabled = true;
  updateOcrProgress(0, 'ocrStatusInit');

  const isHandwritten = ocrModeSelect.value === 'handwritten';

  try {
    let text;
    if (isHandwritten) {
      ocrLoadingText.textContent = t('ocrLoading');
      ocrProgressBar.style.width = '50%'; // pas de progression détaillée côté cloud
      text = await extractTextCloud(currentImagePath);
    } else {
      const ocrLang = ocrLangSelect.value || 'fra';
      text = await extractText(currentImagePath, ocrLang, ({ status, progress }) => {
        const percent = Math.round((progress || 0) * 100);
        const statusKey = mapTesseractStatus(status);
        updateOcrProgress(percent, status && status.includes('recognizing') ? null : statusKey);
      });
    }

    currentExtractedText = text;
    ocrLoading.style.display = 'none';
    extractedTextEl.style.display = 'block';
    extractedTextEl.textContent = text || t('noTextOnDocument');
    saveButton.disabled = false;
  } catch (e) {
    ocrLoading.style.display = 'none';
    extractedTextEl.style.display = 'block';
    extractedTextEl.textContent = e.message === 'OFFLINE' ? t('offlineError') : t('cloudOcrError');
    saveButton.disabled = false;
  }
}

async function handleNewImage(imagePath) {
  if (!imagePath) return; // l'utilisateur a annulé

  currentImagePath = imagePath;
  currentExtractedText = '';
  titleInput.value = t('defaultTitle');
  delete titleInput.dataset.userEdited;
  resultImage.src = imagePath;

  showScreen('result-screen');
  await runOcr();
}

scanButton.addEventListener('click', async () => {
  const imagePath = await scanDocument();
  await handleNewImage(imagePath);
});

importButton.addEventListener('click', async () => {
  const imagePath = await pickFromFiles();
  await handleNewImage(imagePath);
});

// --- Sauvegarde ---

saveButton.addEventListener('click', async () => {
  await db.insert({
    title: titleInput.value.trim() || t('defaultTitle'),
    imagePath: currentImagePath,
    extractedText: currentExtractedText,
  });
  showScreen('home-screen');
  renderDocumentList();
});

backButton.addEventListener('click', () => showScreen('home-screen'));

copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(currentExtractedText);
  alert(t('copiedAlert'));
});

shareButton.addEventListener('click', async () => {
  if (navigator.share) {
    await navigator.share({ text: currentExtractedText });
  } else {
    alert(t('shareUnavailable'));
  }
});

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// --- Démarrage ---
renderDocumentList();