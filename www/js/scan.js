const Camera = window.Capacitor?.Plugins?.Camera;

/**
 * Ouvre la caméra native pour prendre une photo d'un document.
 * Note : Capacitor Camera ne fait pas de détection de bords automatique
 * (contrairement au plugin Flutter) — c'est une simple prise de photo.
 * L'utilisateur cadre son document manuellement.
 */
export async function scanDocument() {
  if (!Camera) {
    alert("La caméra n'est disponible que dans l'app installée sur le téléphone (pas dans ce navigateur). Utilise le bouton \"Fichier\" pour tester avec une image existante.");
    return null;
  }

  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: 'uri',
      source: 'CAMERA',
      saveToGallery: false,
    });
    return photo.webPath;
  } catch (e) {
    return handleCameraError(e);
  }
}

/**
 * Ouvre le sélecteur de fichiers/galerie de l'appareil pour choisir une image
 * déjà existante.
 * - Sur téléphone (APK Capacitor) : utilise le plugin Camera natif (galerie/photos).
 * - Dans un navigateur classique (PC, ou test avec `npx serve`) : Capacitor n'est
 *   pas présent, donc on retombe sur un vrai sélecteur de fichiers HTML natif du
 *   navigateur, pour pouvoir quand même tester la fonctionnalité sur PC.
 */
export async function pickFromFiles() {
  if (Camera) {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: 'uri',
        source: 'PHOTOS',
      });
      return photo.webPath;
    } catch (e) {
      return handleCameraError(e);
    }
  }

  // Secours navigateur (pas de Capacitor) : <input type="file"> natif du système.
  return pickFromFilesWeb();
}

function pickFromFilesWeb() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      document.body.removeChild(input);
      if (!file) {
        resolve(null);
        return;
      }
      resolve(URL.createObjectURL(file));
    });

    // Si l'utilisateur ferme la boîte de dialogue sans rien choisir, aucun
    // événement 'change' ne se déclenche : on nettoie l'élément après un délai.
    input.addEventListener('cancel', () => {
      document.body.removeChild(input);
      resolve(null);
    });

    document.body.appendChild(input);
    input.click();
  });
}

function handleCameraError(e) {
  const message = (e && e.message ? e.message : String(e)).toLowerCase();

  if (message.includes('cancel')) {
    return null;
  }

  if (message.includes('permission')) {
    alert("Permission refusée. Active l'accès à la caméra et aux photos pour SmartScan AI dans les réglages du téléphone (Paramètres > Applications > SmartScan AI > Autorisations).");
    return null;
  }

  console.error('Erreur caméra :', e);
  alert("Impossible d'ouvrir la caméra/galerie : " + (e && e.message ? e.message : e));
  return null;
}