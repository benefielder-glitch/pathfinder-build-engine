import { useState } from 'react';
import { 
  Sword, 
  Shield, 
  Zap, 
  Skull, 
  Scroll, 
  Dna, 
  ChevronRight, 
  Loader2, 
  Flame,
  Trophy,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateBuild, generateBuildImage, PreferredClass } from './services/geminiService';
import { PathfinderBuild, Stats } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [build, setBuild] = useState<PathfinderBuild | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferredClasses, setPreferredClasses] = useState<PreferredClass[]>([
    { className: "Random", archetype: "Base Class" }
  ]);
  const [selectedWeapon, setSelectedWeapon] = useState("Random");
  const [selectedMythicPath, setSelectedMythicPath] = useState("Random");
  const [difficulty, setDifficulty] = useState<"Core" | "Unfair">("Unfair");
  const [buildImage, setBuildImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState<"Male" | "Female">("Male");
  const [useManualStats, setUseManualStats] = useState(false);
  const [manualStats, setManualStats] = useState<Stats>({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });

  const updateStat = (stat: keyof Stats, delta: number) => {
    setManualStats(prev => ({
      ...prev,
      [stat]: Math.max(7, Math.min(20, prev[stat] + delta))
    }));
  };

  const mythicPaths = [
    "Random",
    "Angel",
    "Lich",
    "Aeon",
    "Azata",
    "Trickster",
    "Demon",
    "Gold Dragon",
    "Legend",
    "Swarm-That-Walks",
    "Devil"
  ];

  const weapons = [
    "Random",
    "Greataxe",
    "Fauchard",
    "Scimitar",
    "Longsword",
    "Falchion",
    "Elven Curved Blade",
    "Rapier",
    "Dagger",
    "Kukri",
    "Longbow",
    "Shortbow",
    "Dual Wielding",
    "Shield Bash",
    "Natural Weapons",
    "Unarmed Strike",
    "Quarterstaff",
    "Glaive",
    "Bardiche"
  ];

  const classArchetypes: Record<string, string[]> = {
    "Random": ["Random Archetype"],
    "Alchemist": ["Base Class", "Chirurgeon", "Grenadier", "Incense Synthesizer", "Metamorph", "Preservationist", "Reanimator", "Vivisectionist"],
    "Arcanist": ["Base Class", "Brown-Fur Transmuter", "Eldritch Font", "Nature Mage", "Unlettered Arcanist", "White Mage", "Phantasmal Mage"],
    "Barbarian": ["Base Class", "Armored Hulk", "Beast Kin", "Instinctual Warrior", "Invulnerable Rager", "Mad Dog", "Pack Rager", "Wild Dog"],
    "Bard": ["Base Class", "Archaeologist", "Beast Tamer", "Dirge Bard", "Flame Dancer", "Thundercaller", "Tranquil Whisperer"],
    "Bloodrager": ["Base Class", "Bloodrider", "Greenrager", "Mixed-Blood", "Primalist", "Reformed Fiend", "Steelblood", "Untamed Rager"],
    "Cavalier": ["Base Class", "Beast Rider", "Disciple of the Pike", "Gendarme", "Knight of the Wall", "Standard Bearer", "Strategist"],
    "Cleric": ["Base Class", "Angelfire Apostle", "Crusader", "Ecclesitheurge", "Herald Caller", "Priest of Balance"],
    "Druid": ["Base Class", "Blight Druid", "Drovier", "Elemental Rampager", "Feyspeaker", "Primal Druid", "Winter Child"],
    "Fighter": ["Base Class", "Aldori Defender", "Armiger", "Dragonheir Scion", "Mutation Warrior", "Tower Shield Specialist", "Two-Handed Fighter"],
    "Hunter": ["Base Class", "Collusive Hunter", "Divine Hound", "Forester", "Urban Hunter", "Wandering Marksman"],
    "Inquisitor": ["Base Class", "Faith Hunter", "Monster Tactician", "Sacred Huntsmaster", "Sanctified Slayer", "Tactical Leader"],
    "Kineticist": ["Base Class", "Blood Kineticist", "Dark Elementalist", "Elemental Engine", "Kinetic Knight", "Overwhelming Soul", "Psychokineticist"],
    "Magus": ["Base Class", "Arcane Rider", "Armored Battlemage", "Eldritch Archer", "Eldritch Scion", "Hexcrafter", "Spell Dancer", "Sword Saint"],
    "Monk": ["Base Class", "Quartermaster", "Scaled Fist", "Sensei", "Sohei", "Traditional Monk", "Zen Archer"],
    "Oracle": ["Base Class", "Divine Herbalist", "Enlightened Philosopher", "Lone Strider", "Possessed Oracle", "Purifier", "Seeker", "Wind Whisperer"],
    "Paladin": ["Base Class", "Divine Guardian", "Divine Hunter", "Divine Scion", "Hospitaler", "Martyr", "Warrior of the Holy Light"],
    "Ranger": ["Base Class", "Demonslayer", "Espionage Expert", "Flamewarden", "Freebooter", "Nomad", "Stormwalker"],
    "Rogue": ["Base Class", "Eldritch Scoundrel", "Knife Master", "Master of All", "Rowdy", "Sylvan Trickster", "Thug", "Underground Chemist"],
    "Shaman": ["Base Class", "Shadow Shaman", "Spirit Hunter", "Spirit Warden", "Spirit Whisperer", "Unsworn Shaman", "Witch Doctor"],
    "Shifter": ["Base Class", "Child of the Manticore", "Dragonblood Shifter", "Feyform Shifter", "Fiendflesh Shifter", "Rageshifter", "Wild Hunt Shifter"],
    "Skald": ["Base Class", "Battle Scion", "Court Poet", "Demon Dancer", "Herald of the Horn", "Hunt Caller"],
    "Slayer": ["Base Class", "Arcane Enforcer", "Deliverer", "Executioner", "Imitator", "Stygian Slayer", "Vanguard"],
    "Sorcerer": ["Base Class", "Crossblooded", "Empyreal Sorcerer", "Nine-Tailed Heir", "Overwhelming Mage", "Sage Sorcerer", "Sylvan Sorcerer"],
    "Warpriest": ["Base Class", "Champion of the Faith", "Cult Leader", "Disenchanter", "Feral Champion", "Proclaimer", "Shieldbearer"],
    "Witch": ["Base Class", "Elemental Witch", "Hag of Gyronna", "Hex Channeler", "Ley Line Guardian", "Stigmatized Witch", "White Mage"],
    "Wizard": ["Base Class", "Cruoromancer", "Elemental Master", "Exploiter Wizard", "Scroll Savant", "Spellbinder", "Thassilonian Specialist"],
    "Vivi-Slayer": ["Base Class"]
  };

  const classes = Object.keys(classArchetypes);

  const addClass = () => {
    if (preferredClasses.length < 5) {
      setPreferredClasses([...preferredClasses, { className: "Fighter", archetype: "Base Class" }]);
    }
  };

  const removeClass = (index: number) => {
    if (preferredClasses.length > 1) {
      const newClasses = [...preferredClasses];
      newClasses.splice(index, 1);
      setPreferredClasses(newClasses);
    }
  };

  const updateClass = (index: number, className: string) => {
    const newClasses = [...preferredClasses];
    newClasses[index] = { className, archetype: classArchetypes[className][0] };
    setPreferredClasses(newClasses);
  };

  const updateArchetype = (index: number, archetype: string) => {
    const newClasses = [...preferredClasses];
    newClasses[index] = { ...newClasses[index], archetype };
    setPreferredClasses(newClasses);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const newBuild = await generateBuild(
        difficulty, 
        preferredClasses,
        selectedWeapon, 
        selectedMythicPath,
        useManualStats ? manualStats : undefined
      );
      setBuild(newBuild);
      setBuildImage(null); // Reset image on new build
    } catch (err) {
      console.error(err);
      setError('Failed to summon the build. The Abyss resists your call.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!build) return;
    setImageLoading(true);
    try {
      const imageUrl = await generateBuildImage(
        build.name, 
        build.race, 
        build.mythicPath, 
        build.mainClass, 
        build.mainArchetype,
        selectedWeapon !== "Random" ? selectedWeapon : undefined,
        selectedGender
      );
      setBuildImage(imageUrl);
    } catch (err) {
      console.error(err);
      setError('Failed to manifest the portrait.');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Desktop Header */}
      <header className="w-full max-w-6xl mb-8 flex items-center gap-4">
        <div className="win98-window p-1">
          <div className="bg-[#000080] p-1">
            <Sword className="text-white" size={24} />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-[1px_1px_0_#000]">Pathfinder: WotR Build Engine</h1>
          <p className="text-[10px] text-white opacity-80">Version 1.0.98 - 2026 Meta Edition</p>
        </div>
      </header>

      <main className="w-full max-w-6xl space-y-8">
        {/* Main Control Window */}
        <div className="win98-window">
          <div className="win98-title-bar">
            <span>Build Configuration</span>
            <div className="flex gap-1">
              <div className="win98-icon-btn">_</div>
              <div className="win98-icon-btn">□</div>
              <div className="win98-icon-btn">X</div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Difficulty Toggle */}
            <div className="flex items-center gap-4">
              <span className="win98-input-label font-bold">Difficulty Mode:</span>
              <div className="flex gap-2">
                {(["Core", "Unfair"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDifficulty(mode)}
                    className={cn(
                      "win98-button",
                      difficulty === mode && "active font-bold"
                    )}
                  >
                    {mode === "Unfair" ? <Skull size={14} className="text-red-700" /> : <Shield size={14} className="text-amber-700" />}
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="win98-input-label font-bold">Class Progression (Multiclassing):</span>
                <button 
                  onClick={addClass} 
                  disabled={preferredClasses.length >= 5}
                  className="win98-button text-[10px] py-1"
                >
                  + ADD CLASS
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {preferredClasses.map((pc, index) => (
                  <div key={index} className="flex items-end gap-4 win98-window-inset p-3 bg-white/30">
                    <div className="flex-1">
                      <label className="win98-input-label">Class {index + 1}:</label>
                      <select
                        value={pc.className}
                        onChange={(e) => updateClass(index, e.target.value)}
                        className="win98-select w-full"
                      >
                        {classes.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="win98-input-label">Archetype:</label>
                      <select
                        value={pc.archetype}
                        onChange={(e) => updateArchetype(index, e.target.value)}
                        className="win98-select w-full"
                      >
                        {classArchetypes[pc.className].map((arch) => (
                          <option key={arch} value={arch}>{arch}</option>
                        ))}
                      </select>
                    </div>

                    {preferredClasses.length > 1 && (
                      <button 
                        onClick={() => removeClass(index)}
                        className="win98-button text-red-700 font-bold w-8 h-8"
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="win98-input-label">Preferred Weapon:</label>
                  <select
                    value={selectedWeapon}
                    onChange={(e) => setSelectedWeapon(e.target.value)}
                    className="win98-select w-full"
                  >
                    {weapons.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="win98-input-label">Mythic Path:</label>
                  <select
                    value={selectedMythicPath}
                    onChange={(e) => setSelectedMythicPath(e.target.value)}
                    className="win98-select w-full"
                  >
                    {mythicPaths.map((path) => (
                      <option key={path} value={path}>{path}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Manual Stat Allocation Section */}
            <div className="win98-window-inset p-4 bg-white/50">
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox" 
                  id="useManualStats" 
                  checked={useManualStats}
                  onChange={(e) => setUseManualStats(e.target.checked)}
                  className="win98-checkbox"
                />
                <label htmlFor="useManualStats" className="win98-input-label font-bold cursor-pointer">
                  Enable Manual Stat Allocation (Point Buy)
                </label>
              </div>

              {useManualStats && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 flex-1">
                      {(Object.keys(manualStats) as Array<keyof Stats>).map((stat) => (
                        <div key={stat} className="flex flex-col items-center gap-1">
                          <label className="text-[10px] font-bold uppercase">{stat.slice(0, 3)}</label>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateStat(stat, -1)}
                              className="win98-button w-6 h-6 flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <div className="win98-window-inset bg-white px-2 py-1 min-w-[30px] text-center font-bold">
                              {manualStats[stat]}
                            </div>
                            <button 
                              onClick={() => updateStat(stat, 1)}
                              className="win98-button w-6 h-6 flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="ml-6 flex flex-col items-end gap-2">
                      <div className="win98-window-inset bg-white p-2 text-right min-w-[100px]">
                        <div className="text-[9px] font-bold uppercase">Points Used</div>
                        <div className="text-lg font-bold">
                          {Object.values(manualStats).reduce((acc, val) => acc + (val - 10), 0)}
                        </div>
                      </div>
                      <button 
                        onClick={() => setManualStats({
                          strength: 10,
                          dexterity: 10,
                          constitution: 10,
                          intelligence: 10,
                          wisdom: 10,
                          charisma: 10
                        })}
                        className="win98-button w-full text-[10px]"
                      >
                        RESET
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="win98-button px-12 py-2 text-sm font-bold"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                {loading ? "SUMMONING..." : "GENERATE META BUILD"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="win98-window border-red-800">
            <div className="win98-title-bar bg-red-800">
              <span>System Error</span>
              <div className="win98-icon-btn">X</div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <AlertTriangle className="text-red-600" size={32} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {build && !loading && (
            <div className="space-y-6">
              {/* Main Build Window */}
              <div className="win98-window">
                <div className="win98-title-bar">
                  <div className="flex items-center gap-2">
                    <Trophy size={14} />
                    <span>Build Details - {build.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="win98-icon-btn">_</div>
                    <div className="win98-icon-btn">[]</div>
                    <div className="win98-icon-btn">X</div>
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Portrait */}
                  <div className="win98-window-inset p-1 bg-white">
                    {buildImage ? (
                      <img 
                        src={buildImage} 
                        alt={build.name} 
                        className="w-full aspect-[3/4] object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={48} />
                      </div>
                    )}
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-2">
                        {(["Male", "Female"] as const).map((g) => (
                          <button
                            key={g}
                            onClick={() => setSelectedGender(g)}
                            className={cn(
                              "win98-button flex-1 py-1 text-[10px]",
                              selectedGender === g && "active font-bold"
                            )}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleGenerateImage}
                        disabled={imageLoading}
                        className="win98-button w-full py-1 text-[10px]"
                      >
                        {imageLoading ? "PAINTING..." : "REGENERATE PORTRAIT"}
                      </button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="win98-window-inset p-4 bg-white min-h-[100px]">
                      <h2 className="text-xl font-bold mb-2">{build.name}</h2>
                      <p className="text-sm italic">"{build.hook}"</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="win98-window-inset p-2 bg-white text-center">
                        <div className="text-[10px] font-bold uppercase">Race</div>
                        <div className="text-xs">{build.race}</div>
                      </div>
                      <div className="win98-window-inset p-2 bg-white text-center">
                        <div className="text-[10px] font-bold uppercase">Mythic</div>
                        <div className="text-xs">{build.mythicPath}</div>
                      </div>
                      <div className="win98-window-inset p-2 bg-white text-center">
                        <div className="text-[10px] font-bold uppercase">Difficulty</div>
                        <div className="text-xs">{build.difficulty}</div>
                      </div>
                    </div>

                    <div className="win98-window-inset p-4 bg-white">
                      <div className="grid grid-cols-6 gap-2">
                        {Object.entries(build.stats).map(([stat, val]) => (
                          <div key={stat} className="text-center">
                            <div className="text-[10px] font-bold uppercase">{stat.slice(0, 3)}</div>
                            <div className="text-sm font-bold">{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="win98-window-inset p-4 bg-white">
                      <div className="text-[10px] font-bold uppercase mb-2">Recommended Skill Allocation</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {build.skills.map((skill, i) => (
                          <div key={i} className="flex justify-between text-xs border-b border-gray-100 pb-1">
                            <span className="text-gray-600">{skill.name}:</span>
                            <span className="font-bold">{skill.allocation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Core Buffs */}
                <div className="win98-window">
                  <div className="win98-title-bar">
                    <div className="flex items-center gap-2">
                      <Flame size={14} />
                      <span>Core Math Buffs & Mechanics</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="win98-window-inset p-4 bg-white h-full">
                      <div className="flex flex-wrap gap-2">
                        {build.coreBuffs.map((buff, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 border border-gray-300 text-[10px] font-bold">
                            {buff}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leveling Progression */}
              <div className="win98-window">
                <div className="win98-title-bar">
                  <div className="flex items-center gap-2">
                    <Scroll size={14} />
                    <span>Leveling Progression (1-20)</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="win98-window-inset bg-white overflow-x-auto">
                    <table className="win98-table">
                      <thead>
                        <tr>
                          <th>Lvl</th>
                          <th>Class</th>
                          <th>Key Feats & Abilities</th>
                        </tr>
                      </thead>
                      <tbody>
                        {build.levelingTable.map((lvl) => (
                          <tr key={lvl.level}>
                            <td className="font-bold">{lvl.level}</td>
                            <td>{lvl.class}</td>
                            <td>
                              <div className="flex flex-wrap gap-1">
                                {lvl.feats.map((feat, i) => (
                                  <span key={i} className="text-[10px] bg-gray-100 px-1 border border-gray-200">{feat}</span>
                                ))}
                                {lvl.abilities.map((ability, i) => (
                                  <span key={i} className="text-[10px] bg-amber-50 text-amber-800 px-1 border border-amber-200">{ability}</span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mythic Progression */}
              <div className="win98-window">
                <div className="win98-title-bar">
                  <div className="flex items-center gap-2">
                    <Dna size={14} />
                    <span>Mythic Progression (M1-M10)</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="win98-window-inset bg-white overflow-x-auto">
                    <table className="win98-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Mythic Ability</th>
                          <th>Mythic Feat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {build.mythicTable.map((m) => (
                          <tr key={m.level}>
                            <td className="font-bold">M{m.level}</td>
                            <td>{m.ability}</td>
                            <td>{m.feat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!build && !loading && (
            <div className="win98-window-inset bg-white p-20 text-center">
              <div className="inline-block p-4 bg-gray-100 border border-gray-400 mb-6">
                <Dna size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-600">No Build Summoned</h3>
              <p className="text-gray-500">Click the button above to generate a meta-optimized path.</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Trophy size={12} />
              <span className="text-[9px] font-bold uppercase">Core & Unfair Certified</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={12} />
              <span className="text-[9px] font-bold uppercase">2026 Meta</span>
            </div>
          </div>
          <p className="text-[9px] text-gray-500 font-bold uppercase">
            Pathfinder: WotR Build Engine &copy; 2026 - Microsoft Windows 98 Edition
          </p>
        </div>
      </footer>
    </div>
  );
}
