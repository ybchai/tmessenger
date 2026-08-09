import * as deepl from "deepl-node";

const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

// Map your app's language codes to DeepL language codes
const deeplLanguageMap = {
  en: "EN-US",
  ja: "JA",
  ko: "KO",
  zh: "ZH",
  ms: "MS",
};

export async function translateText(text, targetLanguage) {
  try {
    // Convert app language code to DeepL language code
    const deeplTarget = deeplLanguageMap[targetLanguage] || targetLanguage;

    const result = await translator.translateText(
      text,
      null, // Auto-detect source language
      deeplTarget,
    );

    return {
      translatedText: result.text,
      detectedLanguage: result.detectedSourceLang,
    };
  } catch (error) {
    console.error("DeepL translation error:", error);

    throw error;
  }
}
