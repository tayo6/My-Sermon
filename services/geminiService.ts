
import { GoogleGenAI } from "@google/genai";

// Always initialize with process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyGuide = async (noteContent: string, topic: string) => {
  try {
    // Basic summarization task uses gemini-3-flash-preview
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are a helpful ministry assistant. 
      Based on the following sermon notes regarding the topic "${topic}", please generate:
      1. A concise 2-sentence summary of the main point.
      2. Three reflection questions for personal application.
      3. A short prayer point based on the message.

      Format the output in clean Markdown.

      Sermon Notes:
      ${noteContent}
    `;

    // Always use ai.models.generateContent to query GenAI with model and prompt together
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    // Access the extracted string directly via the .text property
    return response.text || "Could not generate content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while generating the study guide. Please try again later.";
  }
};
