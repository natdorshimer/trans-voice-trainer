import {createModel, Model} from "vosk-browser";

let modelPromise: Promise<Model | undefined> | undefined = undefined;
let cachedModel: Model | undefined = undefined;

const loadModel = async (): Promise<Model> => {
    try {
        const basePath = process.env['NEXT_PUBLIC_TRANS_VOICE_PATH'] || '';
        const basePathWithSlash = basePath === '' ? '' : basePath + "/";
        const model = await createModel(`${basePathWithSlash}models/modelNew.tar`);

        cachedModel = model;
        return model;
    } catch (error) {
        console.error(error);
        console.error("Got here, but there was an error while initializing");
        throw error;
    }
};

export const getModel = async (): Promise<Model> => {
    if (cachedModel) {
        return cachedModel;
    }
    if (!modelPromise) {
        modelPromise = loadModel().catch((error) => {
            console.error("Error loading Vosk model:", error);
            modelPromise = undefined; // Reset promise on error
            throw error;
        });
    }
    return modelPromise as Promise<Model>;
};