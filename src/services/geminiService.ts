import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Get the Key (Vite looks for the VITE_ prefix we set in GitHub)
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";

// 2. Initialize the AI (with a fallback to prevent build crashes)
let genAI: any = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export async function generatePathfinderBuild(prompt: string) {
  if (!API_KEY || !genAI) {
    throw new Error("The Abyss is locked. (API Key missing or invalid)");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Dark Omens:", error);
    throw new Error(error.message || "The summoning failed.");
  }
}
