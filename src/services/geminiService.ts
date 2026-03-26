import { GoogleGenerativeAI } from "@google/generative-ai";

// Vite requires VITE_ prefix to see variables in the browser.
// This matches the VITE_GEMINI_API_KEY we set in your GitHub Workflow.
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generatePathfinderBuild(prompt: string) {
  if (!API_KEY) {
    throw new Error("API Key is missing. Check GitHub Secrets and Workflow.");
  }

  try {
    // Using gemini-1.5-flash for speed and free-tier compatibility
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "The Abyss is currently unreachable.");
  }
}
