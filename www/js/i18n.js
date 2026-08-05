// Traductions de l'interface — 100% embarqué, aucune requête réseau.
export const translations = {
    fr: {
        appTitle: 'SmartScan AI',
        searchPlaceholder: 'Rechercher un document...',
        emptyState: 'Aucun document pour le moment.<br>Appuie sur « Scanner » en bas pour commencer.',
        noTextDetected: 'Aucun texte détecté',
        importButton: '📁 Fichier',
        scanButton: '📷 Scanner',
        titlePlaceholder: 'Titre du document',
        defaultTitle: 'Document sans titre',
        detectedTextLabel: 'Texte détecté',
        copyTitle: 'Copier',
        shareTitle: 'Partager',
        ocrLoading: 'Analyse du texte en cours...',
        ocrProgress: 'Analyse du texte en cours... {percent}%',
        ocrStatusInit: 'Initialisation...',
        ocrStatusLoadLang: 'Chargement de la langue...',
        ocrStatusRecognizing: 'Reconnaissance du texte...',
        noTextOnDocument: 'Aucun texte détecté sur ce document.',
        copiedAlert: 'Texte copié',
        shareUnavailable: "Le partage n'est pas disponible sur cet appareil",
        ocrLangLabel: 'Langue du document',
        ocrLangFrench: 'Français',
        ocrLangEnglish: 'Anglais',
        ocrLangNote: "L'OCR (reconnaissance de texte) fonctionne en français et en anglais. Le malgache n'est pas encore pris en charge par le moteur de reconnaissance de texte.",
        uiLangLabel: 'Langue de l\'application',
        deleteTitle: 'Supprimer',
        modeLabel: 'Type de document',
        modePrinted: 'Imprimé',
        modeHandwritten: 'Manuscrit',
        modeHandwrittenNote: "Le mode manuscrit utilise un service en ligne (Google Cloud Vision) et nécessite une connexion internet.",
        offlineError: "Pas de connexion internet. Le mode manuscrit en a besoin — réessaie une fois connecté, ou passe en mode « Imprimé » qui fonctionne hors ligne.",
        cloudOcrError: "Erreur lors de la reconnaissance en ligne. Vérifie ta connexion et réessaie.",
    },
    en: {
        appTitle: 'SmartScan AI',
        searchPlaceholder: 'Search a document...',
        emptyState: 'No document yet.<br>Tap "Scan" below to get started.',
        noTextDetected: 'No text detected',
        importButton: '📁 File',
        scanButton: '📷 Scan',
        titlePlaceholder: 'Document title',
        defaultTitle: 'Untitled document',
        detectedTextLabel: 'Detected text',
        copyTitle: 'Copy',
        shareTitle: 'Share',
        ocrLoading: 'Analyzing text...',
        ocrProgress: 'Analyzing text... {percent}%',
        ocrStatusInit: 'Initializing...',
        ocrStatusLoadLang: 'Loading language...',
        ocrStatusRecognizing: 'Recognizing text...',
        noTextOnDocument: 'No text detected on this document.',
        copiedAlert: 'Text copied',
        shareUnavailable: 'Sharing is not available on this device',
        ocrLangLabel: 'Document language',
        ocrLangFrench: 'French',
        ocrLangEnglish: 'English',
        ocrLangNote: 'Text recognition (OCR) works in French and English. Malagasy is not yet supported by the text recognition engine.',
        uiLangLabel: 'App language',
        deleteTitle: 'Delete',
        modeLabel: 'Document type',
        modePrinted: 'Printed',
        modeHandwritten: 'Handwritten',
        modeHandwrittenNote: 'Handwritten mode uses an online service (Google Cloud Vision) and requires an internet connection.',
        offlineError: 'No internet connection. Handwritten mode needs one — try again once connected, or switch to "Printed" mode, which works offline.',
        cloudOcrError: 'Error during online recognition. Check your connection and try again.',
    },
    mg: {
        appTitle: 'SmartScan AI',
        searchPlaceholder: 'Karohy ny antontan-taratasy...',
        emptyState: 'Mbola tsy misy antontan-taratasy.<br>Tsindrio ny « Scanner » eo ambany mba hanomboka.',
        noTextDetected: 'Tsy nisy soratra hita',
        importButton: '📁 Rakitra',
        scanButton: '📷 Scanner',
        titlePlaceholder: 'Lohatenin\'ny antontan-taratasy',
        defaultTitle: 'Antontan-taratasy tsy misy lohateny',
        detectedTextLabel: 'Soratra hita',
        copyTitle: 'Adikao',
        shareTitle: 'Zarao',
        ocrLoading: 'Mandalina ny soratra...',
        ocrProgress: 'Mandalina ny soratra... {percent}%',
        ocrStatusInit: 'Manomboka...',
        ocrStatusLoadLang: 'Maka ny fiteny...',
        ocrStatusRecognizing: 'Mamaky ny soratra...',
        noTextOnDocument: 'Tsy nisy soratra hita tao amin\'ity antontan-taratasy ity.',
        copiedAlert: 'Voadika ny soratra',
        shareUnavailable: 'Tsy azo atao ny fizarana amin\'ity fitaovana ity',
        ocrLangLabel: 'Fiteny amin\'ny antontan-taratasy',
        ocrLangFrench: 'Frantsay',
        ocrLangEnglish: 'Anglisy',
        ocrLangNote: 'Ny fanavahana soratra (OCR) dia mandeha amin\'ny teny frantsay sy anglisy ihany. Mbola tsy tohanan\'ny maotera famakiana soratra ny teny malagasy.',
        uiLangLabel: 'Fitenin\'ny rindrankajy',
        deleteTitle: 'Fafao',
        modeLabel: "Karazan'ny antontan-taratasy",
        modePrinted: 'Pirinty',
        modeHandwritten: 'Soratana',
        modeHandwrittenNote: "Ny fomba soratana dia mampiasa serivisy an-tserasera (Google Cloud Vision) ary mila fifandraisana Internet.",
        offlineError: "Tsy misy fifandraisana Internet. Mila izany ny fomba soratana — andramo indray rehefa mifandray, na ampiasao ny fomba « Pirinty » izay mandeha na dia tsy misy Internet aza.",
        cloudOcrError: "Nisy olana teo am-pamakiana an-tserasera. Jereo ny fifandraisanao ary andramo indray.",
    },
};

const STORAGE_KEY = 'smartscan_ui_lang';

function detectDefaultLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
    const nav = (navigator.language || 'fr').slice(0, 2).toLowerCase();
    if (translations[nav]) return nav;
    return 'fr';
}

let currentLang = detectDefaultLang();

export function getLang() {
    return currentLang;
}

export function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations();
}

export function t(key, vars = {}) {
    let str = translations[currentLang][key] ?? translations.fr[key] ?? key;
    for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, v);
    }
    return str;
}

// Applique les traductions à tous les éléments marqués [data-i18n] / [data-i18n-placeholder]
export function applyTranslations() {
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', t(key));
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.setAttribute('title', t(key));
    });

    document.querySelectorAll('[data-i18n-value]').forEach(el => {
        const key = el.getAttribute('data-i18n-value');
        // Ne pas écraser une valeur déjà saisie par l'utilisateur
        if (!el.dataset.userEdited) {
            el.value = t(key);
        }
    });

    const langSelect = document.getElementById('ui-lang-select');
    if (langSelect) langSelect.value = currentLang;
}