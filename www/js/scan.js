import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });
    return photo.webPath; // chemin utilisable directement dans une balise <img>
  } catch (e) {
    // L'utilisateur a annulé, ou permission refusée
    return null;
  }
}