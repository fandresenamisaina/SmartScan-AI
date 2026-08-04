import { db } from './db.js';
import { scanDocument, pickFromFiles } from './scan.js';
import { extractText } from './ocr.js';

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
const extractedTextEl = document.getElementById('extracted-text');
const copyButton = document.getElementById('copy-button');
const shareButton = document.getElementById('share-button');

let currentImagePath = null;
let currentExtractedText = '';

// --- Écran d'accueil ---

async function renderDocumentList(query = '') {
  const docs = query ? await db.search(query) : await db.getAll();

  if (docs.length === 0) {
    documentList.innerHTML = `<p class="empty-state">Aucun document pour le moment.<br>Appuie sur « Scanner » en bas pour commencer.</p>`;
    return;
  }

  documentList.innerHTML = docs.map(doc => `
    <div class="doc-card" data-id="${doc.id}">
      <img src="${doc.imagePath}" onerror="this.style.display='none'" />
      <div class="doc-info">
        <div class="doc-title">${escapeHtml(doc.title)}</div>
        <div class="doc-preview">${escapeHtml(doc.extractedText || 'Aucun texte détecté')}</div>
      </div>
      <button class="delete-btn" data-id="${doc.id}">🗑</button>
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

// --- Lancement du scan / import de fichier ---

async function handleNewImage(imagePath) {
  if (!imagePath) return; // l'utilisateur a annulé

  currentImagePath = imagePath;
  currentExtractedText = '';
  titleInput.value = 'Document sans titre';
  resultImage.src = imagePath;
  ocrLoading.style.display = 'block';
  extractedTextEl.style.display = 'none';
  saveButton.disabled = true;

  showScreen('result-screen');

  const text = await extractText(imagePath);
  currentExtractedText = text;
  ocrLoading.style.display = 'none';
  extractedTextEl.style.display = 'block';
  extractedTextEl.textContent = text || 'Aucun texte détecté sur ce document.';
  saveButton.disabled = false;
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
    title: titleInput.value.trim() || 'Document sans titre',
    imagePath: currentImagePath,
    extractedText: currentExtractedText,
  });
  showScreen('home-screen');
  renderDocumentList();
});

backButton.addEventListener('click', () => showScreen('home-screen'));

copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(currentExtractedText);
  alert('Texte copié');
});

shareButton.addEventListener('click', async () => {
  if (navigator.share) {
    await navigator.share({ text: currentExtractedText });
  } else {
    alert('Le partage n\'est pas disponible sur cet appareil');
  }
});

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// --- Démarrage ---
renderDocumentList();