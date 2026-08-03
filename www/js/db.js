import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'smartscan_documents';

/**
 * Gère l'historique des documents scannés.
 * Utilise Capacitor Preferences (stockage clé-valeur natif, persistant).
 */
export const db = {
  async getAll() {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    return value ? JSON.parse(value) : [];
  },

  async insert(document) {
    const docs = await this.getAll();
    const newDoc = { ...document, id: Date.now(), createdAt: new Date().toISOString() };
    docs.unshift(newDoc);
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(docs) });
    return newDoc;
  },

  async delete(id) {
    const docs = await this.getAll();
    const filtered = docs.filter(d => d.id !== id);
    await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(filtered) });
  },

  async search(query) {
    const docs = await this.getAll();
    if (!query) return docs;
    const q = query.toLowerCase();
    return docs.filter(d =>
      d.title.toLowerCase().includes(q) || d.extractedText.toLowerCase().includes(q)
    );
  }
};