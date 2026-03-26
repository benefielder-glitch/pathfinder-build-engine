import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * PATHFINDER BUILD ENGINE - GEMINI SERVICE
 * This file handles the communication with the Abyss (Google Gemini).
 */

// Vite uses import.meta.env for variables. 
// We check for both names just to be 100% safe.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("The Abyss is silent. (Missing API Key in the browser environment)");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generatePathfinderBuild(prompt: string) {
  try {
    // We use gemini-1.5-flash as it's the fastest free-tier model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Dark Omens in the Console:", error);
    
    // If you see a 403 error here, your API key is restricted.
    // If you see a 429 error, you've hit the free tier limit.
    throw new Error(error.message || "The Abyss resists your call. Try again in a moment.");
  }
}
