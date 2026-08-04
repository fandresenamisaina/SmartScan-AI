// Accès direct au plugin natif exposé par Capacitor (pas d'import npm : ce projet
// n'utilise aucun bundler, les imports "bare" comme '@capacitor/preferences' ne
// peuvent pas être résolus par le navigateur/la WebView, ce qui cassait tout le script).
const { Preferences } = window.Capacitor.Plugins;

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