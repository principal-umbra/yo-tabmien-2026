import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// NOTE: In a real production app, calls should go through a backend to protect the API Key.
// For this demo, we assume the environment variable is available.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const getRiddleHint = async (riddleContext: string): Promise<string> => {
  if (!apiKey) {
    return "La niebla es densa... (Configura tu API Key para recibir ayuda del oráculo).";
  }

  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Actúa como un oráculo místico y antiguo. 
      El usuario está atascado en un acertijo.
      Contexto del acertijo: "${riddleContext}".
      
      Dame una pista breve, poética y críptica, de máximo 20 palabras. 
      No des la respuesta directa. Mantén el tono romántico y misterioso.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "El oráculo guarda silencio...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Las estrellas no se alinean hoy. Intenta meditar la respuesta.";
  }
};