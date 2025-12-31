
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set.");
    }
    return new GoogleGenAI({ apiKey });
}

export const generatePlayerAvatar = async (playerName: string, description: string): Promise<string> => {
    try {
        const ai = getClient();
        
        const prompt = `
        Photorealistic portrait of a football player named ${playerName}. 
        Professional sports photography style. 
        High detail, 8k resolution.
        Dramatic lighting, shallow depth of field.
        Character details: ${description || 'determined expression, wearing a professional football jersey'}.
        Blurred stadium background.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt }
                ]
            },
            config: {
                 imageConfig: { aspectRatio: '1:1' }
            }
        });

        // Parse response to find image
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64String = part.inlineData.data;
                return `data:image/png;base64,${base64String}`;
            }
        }
        
        throw new Error("No image generated");

    } catch (error) {
        console.error("Error generating avatar:", error);
        throw error;
    }
}
