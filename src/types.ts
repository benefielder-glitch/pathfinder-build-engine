export interface LevelDetail {
  level: number;
  class: string;
  feats: string[];
  abilities: string[];
}

export interface MythicLevelDetail {
  level: number;
  ability: string;
  feat: string;
}

export interface Stats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SkillAllocation {
  name: string;
  allocation: string;
}

export interface PathfinderBuild {
  name: string;
  hook: string;
  difficulty: "Core" | "Unfair";
  earlyGameSurvivalScore: number;
  endgamePowerScore: number;
  coreBuffs: string[];
  levelingTable: LevelDetail[];
  mythicTable: MythicLevelDetail[];
  mainClass: string;
  mainArchetype?: string;
  stats: Stats;
  race: string;
  mythicPath: string;
  skills: SkillAllocation[];
}
