import { GoogleGenerativeAI } from "@google/generative-ai";

// Use a simple constant for the key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generatePathfinderBuild(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("The Abyss resists:", error);
    throw error;
  }
}
