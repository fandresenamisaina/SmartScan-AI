// Reconnaissance de texte manuscrit via l'API Google Cloud Vision, relayée
// par un Worker Cloudflare (la clé API n'est jamais présente dans l'app).
// Nécessite une connexion internet — contrairement à extractText() (Tesseract),
// qui reste 100% hors ligne pour le texte imprimé.

const WORKER_URL = 'https://smartscan-ocr.fandresenamisaina.workers.dev';

/**
 * Convertit une image (URI locale, blob URL, ou data URL) en base64 brut,
 * sans le préfixe "data:image/...;base64,", tel qu'attendu par Cloud Vision.
 */
async function imageToBase64(imagePath) {
    const response = await fetch(imagePath);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result;
            const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Extrait le texte manuscrit (ou imprimé) d'une image via Cloud Vision.
 * Lance une erreur explicite si l'appareil est hors ligne.
 *
 * @param {string} imagePath
 * @returns {Promise<string>}
 */
export async function extractTextCloud(imagePath) {
    if (!navigator.onLine) {
        throw new Error('OFFLINE');
    }

    const imageBase64 = await imageToBase64(imagePath);

    const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
    });

    if (!res.ok) {
        throw new Error(`Erreur du service (${res.status})`);
    }

    const data = await res.json();
    if (data.error) {
        throw new Error(data.error);
    }

    return data.text || '';
}