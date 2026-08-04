// Sur téléphone/émulateur (vraie app Capacitor), on utilise le plugin natif Preferences.
// Dans un simple navigateur (test avec `npx serve`), window.Capacitor n'existe pas du tout :
// on retombe alors sur localStorage pour pouvoir quand même tester l'interface.
const Preferences = window.Capacitor?.Plugins?.Preferences;

const STORAGE_KEY = 'smartscan_documents';

async function getValue() {
  if (Preferences) {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    return value;
  }
  return localStorage.getItem(STORAGE_KEY);
}

async function setValue(value) {
  if (Preferences) {
    await Preferences.set({ key: STORAGE_KEY, value });
  } else {
    localStorage.setItem(STORAGE_KEY, value);
  }
}

/**
 * Gère l'historique des documents scannés.
 * Utilise Capacitor Preferences (stockage clé-valeur natif, persistant) sur
 * téléphone, ou localStorage en secours pendant les tests en navigateur.
 */
export const db = {
  async getAll() {
    const value = await getValue();
    return value ? JSON.parse(value) : [];
  },

  async insert(document) {
    const docs = await this.getAll();
    const newDoc = { ...document, id: Date.now(), createdAt: new Date().toISOString() };
    docs.unshift(newDoc);
    await setValue(JSON.stringify(docs));
    return newDoc;
  },

  async delete(id) {
    const docs = await this.getAll();
    const filtered = docs.filter(d => d.id !== id);
    await setValue(JSON.stringify(filtered));
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