import React, { useState, useEffect } from "react";
import { Type, Calculator, 
  Gamepad2, 
  Sparkles, 
  Brain, 
  RotateCcw, 
  CheckCircle2, 
  Trophy, 
  Sun, 
  Volume2, 
  VolumeX, 
  Footprints, 
  Smile, 
  Flame, 
  Play, 
  Pause, 
  Timer,
  Wind
} from "lucide-react";
import { Language } from "../types";

interface GamesActivitySectionProps {
  currentLang: Language;
}

// Memory Game Cards definition
const MEMORY_CARDS_DATA = [
  { id: 1, icon: "🫚", name: "Ginger (Adrak)" },
  { id: 2, icon: "🌿", name: "Tulsi (Basil)" },
  { id: 3, icon: "🍎", name: "Apple (Seb)" },
  { id: 4, icon: "🧘", name: "Yoga Asana" },
  { id: 5, icon: "🫖", name: "Herbal Tea" },
  { id: 6, icon: "🥥", name: "Coconut" },
];

export const GamesActivitySection: React.FC<GamesActivitySectionProps> = ({
  currentLang,
}) => {
  const [activeTab, setActiveTab] = useState<"sudoku" | "memory" | "word" | "math" | "activities">("memory");

  // --- MEMORY GAME STATE ---
  const [cards, setCards] = useState<Array<{ instanceId: number; id: number; icon: string; name: string; isFlipped: boolean; isMatched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);

  const initMemoryGame = () => {
    const paired = [...MEMORY_CARDS_DATA, ...MEMORY_CARDS_DATA].map((item, idx) => ({
      ...item,
      instanceId: idx,
      isFlipped: false,
      isMatched: false,
    }));
    // Shuffle
    const shuffled = paired.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
  };

  useEffect(() => {
    initMemoryGame();
  }, []);

  const handleCardClick = (instanceId: number) => {
    if (flippedCards.length === 2) return;
    const card = cards.find((c) => c.instanceId === instanceId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlipped = [...flippedCards, instanceId];
    setFlippedCards(newFlipped);

    setCards((prev) =>
      prev.map((c) => (c.instanceId === instanceId ? { ...c, isFlipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = cards.find((c) => c.instanceId === newFlipped[0]);
      const secondCard = card;

      if (firstCard && secondCard && firstCard.id === secondCard.id) {
        // Matched
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstCard.id ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          setMatchedPairs((p) => p + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match -> flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.instanceId === newFlipped[0] || c.instanceId === newFlipped[1]
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  // --- SUDOKU 4x4 MINI SENIOR FRIENDLY ---
  const INITIAL_SUDOKU = [
    [1, 0, 3, 0],
    [0, 0, 0, 2],
    [3, 0, 0, 0],
    [0, 2, 0, 4],
  ];
  const SUDOKU_SOLUTION = [
    [1, 4, 3, 2],
    [4, 3, 1, 2],
    [3, 1, 2, 4],
    [2, 2, 4, 4], // simplified gentle grid
  ];
  const [sudokuGrid, setSudokuGrid] = useState<number[][]>(INITIAL_SUDOKU);
  const [sudokuWon, setSudokuWon] = useState(false);

  const handleSudokuCell = (r: number, c: number, val: number) => {
    const updated = sudokuGrid.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? val : cell))
    );
    setSudokuGrid(updated);
    // Check if fully filled
    const allFilled = updated.every((row) => row.every((c) => c > 0));
    if (allFilled) {
      setSudokuWon(true);
    }
  };

  const resetSudoku = () => {
    setSudokuGrid(INITIAL_SUDOKU);
    setSudokuWon(false);
  };

  // --- PRANAYAMA BREATHING TIMER ---
  const [pranayamaActive, setPranayamaActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathCount, setBreathCount] = useState<number>(4);

  useEffect(() => {
    let timer: any;
    if (pranayamaActive) {
      timer = setInterval(() => {
        setBreathCount((prev) => {
          if (prev <= 1) {
            if (breathPhase === "Inhale") {
              setBreathPhase("Hold");
              return 4;
            } else if (breathPhase === "Hold") {
              setBreathPhase("Exhale");
              return 4;
            } else {
              setBreathPhase("Inhale");
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pranayamaActive, breathPhase]);

  // Audio simulation for music therapy
  const [musicPlaying, setMusicPlaying] = useState(false);
  // --- WORD SCRAMBLE GAME ---
  const WORD_LIST = [
    { target: "GINGER", hint: "Healthy root used in tea for colds (Adrak)." },
    { target: "TULSI", hint: "Holy Basil, excellent for immunity." },
    { target: "DOCTOR", hint: "Medical professional." },
    { target: "FAMILY", hint: "Your loved ones." },
    { target: "HEALTH", hint: "The true wealth." },
    { target: "YOGA", hint: "Ancient practice for body and mind." }
  ];
  const [wordIndex, setWordIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [wordInput, setWordInput] = useState("");
  const [wordWon, setWordWon] = useState(false);

  const initWordScramble = (idx) => {
    const word = WORD_LIST[idx].target;
    let scram = word.split('').sort(() => 0.5 - Math.random()).join('');
    while (scram === word && word.length > 1) {
      scram = word.split('').sort(() => 0.5 - Math.random()).join('');
    }
    setScrambled(scram);
    setWordInput("");
    setWordWon(false);
  };

  useEffect(() => {
    initWordScramble(0);
  }, []);

  const handleWordCheck = () => {
    if (wordInput.toUpperCase() === WORD_LIST[wordIndex].target) {
      setWordWon(true);
    }
  };
  const handleWordNext = () => {
    const n = (wordIndex + 1) % WORD_LIST.length;
    setWordIndex(n);
    initWordScramble(n);
  };

  // --- NUMBER SEQUENCE GAME ---
  const MATH_LIST = [
    { seq: [2, 4, 6, '?'], ans: 8, hint: "Add 2 each time." },
    { seq: [5, 10, 15, '?'], ans: 20, hint: "Multiples of 5." },
    { seq: [1, 2, 4, 8, '?'], ans: 16, hint: "Double the previous number." },
    { seq: [10, 9, 8, '?'], ans: 7, hint: "Subtract 1 each time." },
    { seq: [1, 3, 5, '?'], ans: 7, hint: "Odd numbers." }
  ];
  const [mathIndex, setMathIndex] = useState(0);
  const [mathInput, setMathInput] = useState("");
  const [mathWon, setMathWon] = useState(false);

  const initMathGame = (idx) => {
    setMathInput("");
    setMathWon(false);
  };

  const handleMathCheck = () => {
    if (parseInt(mathInput) === MATH_LIST[mathIndex].ans) {
      setMathWon(true);
    }
  };
  const handleMathNext = () => {
    const n = (mathIndex + 1) % MATH_LIST.length;
    setMathIndex(n);
    initMathGame(n);
  };

  return (
    <section id="games" className="py-16 bg-white border-t border-[#D8E2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Flowchart Module 3 • Games &amp; Activity</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#153A34] tracking-tight">
              Brain Fitness Games &amp; Senior Activities
            </h2>
            <p className="text-base text-[#4A5D54] mt-2 max-w-2xl">
              Stimulate cognitive agility, memory retention, and mental peace with gentle puzzles, Ayurvedic herb matching, and daily guided wellness exercises.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex bg-[#F4F7F4] p-1.5 rounded-2xl gap-1 border border-[#D8E2DA] overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab("memory")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "memory"
                  ? "bg-[#1F4E46] text-white shadow-xs"
                  : "text-[#374940] hover:text-[#1F4E46]"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Memory Game</span>
            </button>

            <button
              onClick={() => setActiveTab("sudoku")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "sudoku"
                  ? "bg-[#1F4E46] text-white shadow-xs"
                  : "text-[#374940] hover:text-[#1F4E46]"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Senior Sudoku</span>
            </button>
            <button
              onClick={() => setActiveTab("word")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "word"
                  ? "bg-[#1F4E46] text-white shadow-xs"
                  : "text-[#374940] hover:text-[#1F4E46]"
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Word Scramble</span>
            </button>

            <button
              onClick={() => setActiveTab("math")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "math"
                  ? "bg-[#1F4E46] text-white shadow-xs"
                  : "text-[#374940] hover:text-[#1F4E46]"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Number sequence</span>
            </button>


            <button
              onClick={() => setActiveTab("activities")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${
                activeTab === "activities"
                  ? "bg-[#1F4E46] text-white shadow-xs"
                  : "text-[#374940] hover:text-[#1F4E46]"
              }`}
            >
              <Wind className="w-4 h-4" />
              <span>Pranayama &amp; Activities</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MEMORY GAME */}
        {activeTab === "memory" && (
          <div className="bg-[#F8FAF8] rounded-3xl p-6 sm:p-8 border border-[#D8E2DA] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#EEF3EA] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#153A34] flex items-center gap-2">
                  <span>Ayurvedic Herb &amp; Nutrition Memory Match</span>
                </h3>
                <p className="text-xs text-[#586C62]">
                  Flip two cards at a time to find matching pairs and boost short-term visual recall.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="bg-white px-3 py-1.5 rounded-xl border border-[#D8E2DA] text-[#1F4E46]">
                  Moves: <strong className="text-stone-900">{moves}</strong>
                </span>
                <span className="bg-white px-3 py-1.5 rounded-xl border border-[#D8E2DA] text-[#1F4E46]">
                  Matched: <strong className="text-stone-900">{matchedPairs} / 6</strong>
                </span>
                <button
                  onClick={initMemoryGame}
                  className="px-3.5 py-1.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              </div>
            </div>

            {/* Victory banner */}
            {matchedPairs === 6 && (
              <div className="mb-6 p-4 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-950">
                <div className="flex items-center gap-3">
                  <Trophy className="w-7 h-7 text-amber-600 animate-bounce" />
                  <div>
                    <h4 className="font-bold text-sm">Shabash! All Pairs Matched!</h4>
                    <p className="text-xs text-emerald-800">You completed the memory test in {moves} moves.</p>
                  </div>
                </div>
                <button
                  onClick={initMemoryGame}
                  className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900"
                >
                  Play Again
                </button>
              </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {cards.map((card) => (
                <button
                  key={card.instanceId}
                  type="button"
                  onClick={() => handleCardClick(card.instanceId)}
                  className={`h-28 rounded-2xl p-2 border transition-all duration-300 flex flex-col items-center justify-center text-center select-none ${
                    card.isMatched
                      ? "bg-emerald-100 border-emerald-400 text-emerald-950 scale-95 shadow-inner"
                      : card.isFlipped
                      ? "bg-white border-[#1F4E46] shadow-md scale-105"
                      : "bg-[#EBF3EF] border-[#D8E2DA] hover:bg-[#DCEAE2] hover:scale-102"
                  }`}
                >
                  {card.isFlipped || card.isMatched ? (
                    <>
                      <span className="text-3xl mb-1">{card.icon}</span>
                      <span className="text-[11px] font-bold text-[#153A34] truncate max-w-full">
                        {card.name}
                      </span>
                    </>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1F4E46]/15 text-[#1F4E46] flex items-center justify-center font-bold text-lg">
                      🌿
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SUDOKU */}
        {activeTab === "sudoku" && (
          <div className="bg-[#F8FAF8] rounded-3xl p-6 sm:p-8 border border-[#D8E2DA] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#EEF3EA] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#153A34] flex items-center gap-2">
                  <span>Senior Sudoku (Gentle 4x4 Brain Puzzle)</span>
                </h3>
                <p className="text-xs text-[#586C62]">
                  Fill each row, column, and 2x2 box with numbers 1 to 4 without repetition.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={resetSudoku}
                  className="px-3.5 py-1.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Grid</span>
                </button>
              </div>
            </div>

            {sudokuWon && (
              <div className="mb-6 p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-950 font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Great work! All numbers are filled in the Sudoku grid!</span>
              </div>
            )}

            <div className="flex flex-col items-center justify-center py-4">
              <div className="grid grid-cols-4 gap-2 bg-[#2D6A5D] p-3 rounded-2xl shadow-md">
                {sudokuGrid.map((row, rIdx) =>
                  row.map((cell, cIdx) => {
                    const isPrefilled = INITIAL_SUDOKU[rIdx][cIdx] !== 0;
                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-2xs ${
                          isPrefilled
                            ? "bg-[#EBF3EF] text-[#1F4E46]"
                            : "bg-white text-stone-900 border-2 border-dashed border-[#2D6A5D]/40"
                        }`}
                      >
                        {isPrefilled ? (
                          cell
                        ) : (
                          <select
                            value={cell === 0 ? "" : cell}
                            onChange={(e) =>
                              handleSudokuCell(rIdx, cIdx, Number(e.target.value))
                            }
                            className="w-full h-full bg-transparent text-center font-bold text-xl text-[#153A34] focus:outline-none cursor-pointer"
                          >
                            <option value="">-</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-stone-500 mt-4 text-center">
                Tip: Click any dashed box to select a number from 1 to 4.
              </p>
            </div>
          </div>
        )}

        

        {/* TAB: WORD SCRAMBLE */}
        {activeTab === "word" && (
          <div className="bg-[#F8FAF8] rounded-3xl p-6 sm:p-8 border border-[#D8E2DA] shadow-xs max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#EEF3EA] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#153A34] flex items-center gap-2">
                  <span>Jumbled Word Puzzle</span>
                </h3>
                <p className="text-xs text-[#586C62]">
                  Unscramble the letters to find the correct health or family-related word.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-sm font-bold text-emerald-800 mb-2">Unscramble this word:</div>
              <div className="text-4xl font-black text-[#1F4E46] tracking-widest uppercase bg-white px-8 py-4 rounded-2xl border-2 border-emerald-100 shadow-sm mb-6">
                {scrambled}
              </div>

              <div className="w-full max-w-xs space-y-4">
                <input
                  type="text"
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value.toUpperCase())}
                  placeholder="Type your answer..."
                  disabled={wordWon}
                  className="w-full text-center px-4 py-3 bg-white border border-[#D8E2DA] rounded-xl font-bold text-lg focus:outline-none focus:border-[#1F4E46] uppercase"
                />
                
                {!wordWon ? (
                  <button
                    onClick={handleWordCheck}
                    className="w-full py-3 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl font-bold transition shadow-md"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl flex flex-col items-center justify-center text-emerald-900 font-bold text-sm text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                      Correct! The word is {WORD_LIST[wordIndex].target}.
                    </div>
                    <button
                      onClick={handleWordNext}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-md"
                    >
                      Next Word
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-6 text-xs text-stone-500 bg-stone-100 px-4 py-2 rounded-lg">
                <strong>Hint:</strong> {WORD_LIST[wordIndex].hint}
              </div>
            </div>
          </div>
        )}

        {/* TAB: NUMBER SEQUENCE */}
        {activeTab === "math" && (
          <div className="bg-[#F8FAF8] rounded-3xl p-6 sm:p-8 border border-[#D8E2DA] shadow-xs max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#EEF3EA] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#153A34] flex items-center gap-2">
                  <span>Number Sequence Puzzle</span>
                </h3>
                <p className="text-xs text-[#586C62]">
                  Find the missing number to complete the mathematical pattern.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-6">
              <div className="flex items-center gap-3 mb-8">
                {MATH_LIST[mathIndex].seq.map((num, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl font-black rounded-xl shadow-sm ${num === '?' ? 'bg-[#1F4E46] text-white border-2 border-[#1F4E46]' : 'bg-white text-[#153A34] border border-[#D8E2DA]'}`}>
                      {num}
                    </div>
                    {i < MATH_LIST[mathIndex].seq.length - 1 && (
                      <span className="text-stone-400 mx-2 sm:mx-3 font-bold text-xl">,</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="w-full max-w-xs space-y-4">
                <input
                  type="number"
                  value={mathInput}
                  onChange={(e) => setMathInput(e.target.value)}
                  placeholder="What is '?'"
                  disabled={mathWon}
                  className="w-full text-center px-4 py-3 bg-white border border-[#D8E2DA] rounded-xl font-bold text-lg focus:outline-none focus:border-[#1F4E46]"
                />
                
                {!mathWon ? (
                  <button
                    onClick={handleMathCheck}
                    className="w-full py-3 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl font-bold transition shadow-md"
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl flex flex-col items-center justify-center text-emerald-900 font-bold text-sm text-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1" />
                      Excellent! The answer is {MATH_LIST[mathIndex].ans}.
                    </div>
                    <button
                      onClick={handleMathNext}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition shadow-md"
                    >
                      Next Pattern
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-6 text-xs text-stone-500 bg-stone-100 px-4 py-2 rounded-lg">
                <strong>Hint:</strong> {MATH_LIST[mathIndex].hint}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GUIDED ACTIVITIES & PRANAYAMA */}
        {activeTab === "activities" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Activity 1: Pranayama Breathing Timer */}
            <div className="bg-[#F8FAF8] rounded-3xl p-6 border border-[#D8E2DA] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold bg-[#EBF3EF] text-[#1F4E46] px-2.5 py-1 rounded-full">
                    Breathing Exercise
                  </span>
                  <Wind className="w-5 h-5 text-[#1F4E46]" />
                </div>
                <h4 className="font-bold text-base text-[#153A34]">Anulom Vilom / Deep Pranayama</h4>
                <p className="text-xs text-[#586C62]">
                  Gentle 4-4-4 rhythm to lower systolic blood pressure and calm anxiety.
                </p>
              </div>

              {/* Animated Circle */}
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${
                    breathPhase === "Inhale"
                      ? "bg-emerald-100 border-emerald-500 scale-110"
                      : breathPhase === "Hold"
                      ? "bg-amber-100 border-amber-500 scale-105"
                      : "bg-sky-100 border-sky-500 scale-95"
                  }`}
                >
                  <span className="text-sm font-bold text-[#153A34]">{breathPhase}</span>
                  <span className="text-2xl font-black text-[#1F4E46]">{breathCount}s</span>
                </div>
              </div>

              <button
                onClick={() => setPranayamaActive(!pranayamaActive)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                  pranayamaActive
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-[#1F4E46] hover:bg-[#153A34] text-white"
                }`}
              >
                {pranayamaActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{pranayamaActive ? "Pause Exercise" : "Start Guided Breathing"}</span>
              </button>
            </div>

            {/* Activity 2: Gentle Chair Yoga */}
            <div className="bg-[#F8FAF8] rounded-3xl p-6 border border-[#D8E2DA] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                    Joint Mobility
                  </span>
                  <Sun className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="font-bold text-base text-[#153A34]">Gentle Senior Chair Yoga</h4>
                <p className="text-xs text-[#586C62]">
                  Safe, seated stretching routines for spine alignment and joint comfort.
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#2A3D34]">
                <div className="p-2.5 bg-white rounded-xl border border-[#D8E2DA]">
                  <strong>1. Seated Cat-Cow:</strong> Inhale arch back, exhale round spine (5 reps).
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#D8E2DA]">
                  <strong>2. Ankle Rotations:</strong> 10 clockwise, 10 anti-clockwise circles.
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#D8E2DA]">
                  <strong>3. Shoulder Rolls:</strong> Gentle back rolls releasing neck stiffness.
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Knee Strain • Done Safely While Seated</span>
              </div>
            </div>

            {/* Activity 3: Daily 30-Min Walk Challenge */}
            <div className="bg-[#F8FAF8] rounded-3xl p-6 border border-[#D8E2DA] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold bg-sky-100 text-sky-900 px-2.5 py-1 rounded-full">
                    Daily Goal
                  </span>
                  <Footprints className="w-5 h-5 text-sky-600" />
                </div>
                <h4 className="font-bold text-base text-[#153A34]">Morning Sunshine Walk</h4>
                <p className="text-xs text-[#586C62]">
                  Target: 3,500 gentle steps in morning soft sunlight (7:00 AM - 8:00 AM).
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2A3D34]">Today's Progress</span>
                  <span className="font-bold text-[#1F4E46]">2,480 / 3,500 steps (71%)</span>
                </div>
                <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-[#1F4E46] h-full w-[71%] rounded-full"></div>
                </div>
                <p className="text-[11px] text-stone-500">
                  🔥 Burned: 115 kcal • Distance: 1.8 km
                </p>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl text-[11px] text-sky-900 font-bold flex items-center justify-between">
                <span>Streak: 5 Days Active</span>
                <span>🏅 Silver Walker</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
