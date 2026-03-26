import { GoogleGenAI, Type } from "@google/genai";
import { PathfinderBuild, Stats } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const buildSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    hook: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["Core", "Unfair"] },
    earlyGameSurvivalScore: { type: Type.NUMBER },
    endgamePowerScore: { type: Type.NUMBER },
    coreBuffs: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    levelingTable: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.NUMBER },
          class: { type: Type.STRING },
          feats: { type: Type.ARRAY, items: { type: Type.STRING } },
          abilities: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["level", "class", "feats", "abilities"]
      }
    },
    mythicTable: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.NUMBER },
          ability: { type: Type.STRING },
          feat: { type: Type.STRING }
        },
        required: ["level", "ability", "feat"]
      }
    },
    mainClass: { type: Type.STRING },
    mainArchetype: { type: Type.STRING },
    stats: {
      type: Type.OBJECT,
      properties: {
        strength: { type: Type.NUMBER },
        dexterity: { type: Type.NUMBER },
        constitution: { type: Type.NUMBER },
        intelligence: { type: Type.NUMBER },
        wisdom: { type: Type.NUMBER },
        charisma: { type: Type.NUMBER }
      },
      required: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]
    },
    race: { type: Type.STRING },
    mythicPath: { type: Type.STRING },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          allocation: { type: Type.STRING }
        },
        required: ["name", "allocation"]
      }
    }
  },
  required: [
    "name", "hook", "difficulty", "earlyGameSurvivalScore", "endgamePowerScore", 
    "coreBuffs", "levelingTable", "mythicTable", "stats", 
    "race", "mythicPath", "mainClass", "skills"
  ]
};

export interface PreferredClass {
  className: string;
  archetype: string;
}

export async function generateBuild(
  difficulty: "Core" | "Unfair", 
  preferredClasses: PreferredClass[],
  preferredWeapon?: string, 
  preferredMythicPath?: string,
  manualStats?: Stats
): Promise<PathfinderBuild> {
  let classPrompt = `Generate a random high-tier ${difficulty} build.`;
  
  if (preferredClasses.length > 0 && preferredClasses[0].className !== "Random") {
    const classDescriptions = preferredClasses.map(pc => {
      if (pc.archetype && pc.archetype !== "Base Class" && pc.archetype !== "Random Archetype") {
        return `${pc.archetype} (${pc.className})`;
      }
      return pc.className;
    }).join(", ");

    if (preferredClasses.length === 1) {
      classPrompt = `Generate a high-tier ${difficulty} build specifically for the ${classDescriptions} class.`;
    } else {
      classPrompt = `Generate a high-tier ${difficulty} multiclass build for ${difficulty} difficulty using these classes: ${classDescriptions}. Ensure the level distribution is optimized for the meta.`;
    }
  }

  if (preferredWeapon && preferredWeapon !== "Random") {
    classPrompt += ` The build MUST focus on using ${preferredWeapon} as the primary weapon.`;
  }

  if (preferredMythicPath && preferredMythicPath !== "Random") {
    classPrompt += ` The build MUST follow the ${preferredMythicPath} mythic path.`;
  }

  if (manualStats) {
    classPrompt += ` The build MUST use these starting base stats: STR ${manualStats.strength}, DEX ${manualStats.dexterity}, CON ${manualStats.constitution}, INT ${manualStats.intelligence}, WIS ${manualStats.wisdom}, CHA ${manualStats.charisma}. Adjust the build's feats and abilities to synergize with these specific stats.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${classPrompt} Ensure it follows the meta for ${difficulty} difficulty.`,
    config: {
      systemInstruction: `You are the Pathfinder: WotR Build Engine. 
      Generate level 1-20 character builds, mythic level 1-10 progression, and skill point allocation recommendations for ${difficulty} difficulty based on 2026 patch meta.
      
      SKILL ALLOCATION RULES:
      - MOBILITY: If the build uses Defensive Fighting, recommend at least 3 ranks in Mobility.
      - PERCEPTION: Always a high priority for at least one character in the party.
      - PERSUASION: Crucial for the main character (MC) for dialogue checks.
      - KNOWLEDGE/LORE: Recommend based on the build's primary stats (e.g., INT for Knowledge, WIS for Lore).
      
      ${difficulty === "Unfair" ? `
      UNFAIR MATH RULES:
      - AC STACKING: Prioritize "Double-Dipping" stats. Example: Nature Oracle (Nature's Whispers) replaces DEX with CHA. Scaled Fist Monk adds CHA as an untyped bonus. These stack.
      - AB THRESHOLDS: Martial builds must reach +55 to +65 Attack Bonus by Level 20.
      - SPELL MERGING: If the user picks Angel/Lich, use a full-caster class (Oracle/Wizard/Cleric) to ensure Caster Level 25+.
      ` : `
      CORE MATH RULES:
      - THEMATIC FLEXIBILITY: Builds do NOT need to "Double-Dip" stats. Avoid mandatory Monk/Oracle dips unless they fit the theme.
      - VIABILITY: Ensure the build is strong enough for Core difficulty (approx +45-50 AB by level 20).
      - SINGLE CLASS FRIENDLY: Prioritize pure or mostly-pure class builds unless multiclassing is thematic or provides a unique playstyle.
      - FUN OVER MATH: Focus on unique mechanics, thematic synergy, and fun gameplay loops rather than just raw AC/AB stacking.
      `}
      `,
      responseMimeType: "application/json",
      responseSchema: buildSchema
    }
  });

  return JSON.parse(response.text);
}

export async function generateBuildImage(buildName: string, race: string, mythicPath: string, className: string, archetype?: string, weapon?: string, gender?: string): Promise<string | null> {
  const classDetail = archetype ? `${archetype} (a specialized ${className})` : className;
  const weaponDetail = weapon ? ` wielding a ${weapon}` : "";
  const genderDetail = gender ? ` ${gender}` : "";
  
  const prompt = `A high-quality character portrait in the official Pathfinder: Wrath of the Righteous art style. 
  The character is a${genderDetail} ${race} ${classDetail} named "${buildName}" following the ${mythicPath} mythic path${weaponDetail}. 
  
  Visual requirements:
  - The character must be clearly identifiable as a ${className}, wearing appropriate gear (e.g., musical instruments and light armor for a Bard, heavy plate and holy symbols for a Paladin, arcane robes and staves for a Wizard).
  - The character should be prominently displaying their ${weapon || "equipment"}.
  - Incorporate visual elements of the ${mythicPath} mythic path (e.g., golden light and wings for Angel, dark shadows and skeletal features for Lich, chaotic energy for Trickster).
  - The art should be dramatic, detailed, and epic, with dark fantasy lighting and a painterly aesthetic characteristic of Pathfinder portraits.
  - Focus on a clear, centered character portrait.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  return null;
}
