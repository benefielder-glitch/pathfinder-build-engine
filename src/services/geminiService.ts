import { GoogleGenerativeAI } from "@google/generative-ai";

// We use 'as any' to stop TypeScript from blocking the build
const meta = (import.meta as any);
const API_KEY = meta.env?.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generatePathfinderBuild(prompt: string) {
  if (!API_KEY) {
    throw new Error("The Abyss is locked. (API Key missing)");
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
