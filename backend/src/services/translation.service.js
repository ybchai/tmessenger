import * as deepl from "deepl-node";


const translator = new deepl.Translator(
    process.env.DEEPL_API_KEY
);


export async function translateText(
    text,
    targetLanguage
) {

    try {

        const result = await translator.translateText(
            text,
            null, // auto detect source language
            targetLanguage
        );


        return {
            translatedText: result.text,
            detectedLanguage: result.detectedSourceLang,
        };


    } catch(error){

        console.error(
            "DeepL translation error:",
            error
        );

        throw error;
    }
}

