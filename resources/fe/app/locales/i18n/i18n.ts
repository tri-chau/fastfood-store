import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import HOME_EN from "./en.json";
import HOME_VI from "./vi.json";

const resources = {
    en: {
        translation: HOME_EN
    },
    vi: {
        translation: HOME_VI
    }
};

i18n.use(initReactI18next).init({
    resources,
    defaultNS: "translation",
    ns: ["translation"],
    lng: "vi", // default language
    fallbackLng: "vi", // fallback language
    interpolation: {
        escapeValue: false
    }
});

export default i18n;
