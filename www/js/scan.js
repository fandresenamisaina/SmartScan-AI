const { Camera } = window.Capacitor.Plugins;

/**
 * Ouvre la caméra native pour prendre une photo d'un document.
 * Note : Capacitor Camera ne fait pas de détection de bords automatique
 * (contrairement au plugin Flutter) — c'est une simple prise de photo.
 * L'utilisateur cadre son document manuellement.
 */
export async function scanDocument() {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true, // permet à l'utilisateur de recadrer manuellement
      resultType: 'uri',
      source: 'CAMERA',
    });
    return photo.webPath; // chemin utilisable directement dans une balise <img>
  } catch (e) {
    // L'utilisateur a annulé -> Capacitor renvoie "User cancelled photos app"
    if (e && e.message && e.message.toLowerCase().includes('cancel')) {
      return null;
    }
    // Toute autre erreur (permission refusée, plugin absent, etc.) : on le signale
    console.error('Erreur caméra :', e);
    alert('Impossible d\'ouvrir la caméra : ' + (e && e.message ? e.message : e));
    return null;
  }
}