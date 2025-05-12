import { Translation } from "./types";

export const backendTranslations: Translation = {
  // Backend connection messages
  "backendConnected": {
    en: "Backend Connected",
    ar: "تم الاتصال بالخادم",
    fr: "Backend Connecté"
  },
  "backendConnectionSuccessful": {
    en: "Connection to the backend server is successful.",
    ar: "تم الاتصال بالخادم الخلفي بنجاح.",
    fr: "La connexion au serveur backend est réussie."
  },
  "backendConnectionFailed": {
    en: "Backend Connection Failed",
    ar: "فشل الاتصال بالخادم",
    fr: "Échec de la Connexion au Backend"
  },
  "backendConnectionError": {
    en: "Could not connect to the backend server.",
    ar: "تعذر الاتصال بالخادم الخلفي.",
    fr: "Impossible de se connecter au serveur backend."
  },
  "checkingBackendConnection": {
    en: "Checking backend connection...",
    ar: "جاري التحقق من الاتصال بالخادم...",
    fr: "Vérification de la connexion backend..."
  },
  "ensureBackendRunning": {
    en: "Please ensure the backend server is running.",
    ar: "يرجى التأكد من تشغيل الخادم الخلفي.",
    fr: "Veuillez vous assurer que le serveur backend est en cours d'exécution."
  },
  "localBackendNotAvailable": {
    en: "Local backend is not available",
    ar: "الخادم المحلي غير متاح",
    fr: "Le backend local n'est pas disponible"
  }
};
