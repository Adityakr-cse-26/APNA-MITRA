
import React, { useState, useEffect } from "react";
import { Type, Calculator, Gamepad2, Sparkles, Brain, RotateCcw, CheckCircle2, Trophy, Sun, Volume2, VolumeX, Footprints, Smile, Flame, Play, Pause, Timer, Wind, Star } from "lucide-react";
import { Language } from "../types";
import { MEMORY_POOL, WORD_POOL, MATH_POOL, SUDOKU_POOL } from "../data/gamesData";
import { saveGameResult, fetchUserPoints, UserPoints } from "../services/db";

interface GamesActivitySectionProps {
  currentLang: Language;
  user?: any;
}

export const GamesActivitySection: React.FC<GamesActivitySectionProps> = ({
  currentLang,
  user
}) => {
  const [activeTab, setActiveTab] = useState<"sudoku" | "memory" | "word" | "math" | "activities" | "progress">("memory");
  
  // -- POINTS & PROGRESS STATE --
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Easy' | 'Medium' | 'Advanced'>('Easy');
  const [showPointsAnim, setShowPointsAnim] = useState<{show: boolean, msg: string, pts: number}>({show: false, msg: '', pts: 0});
  
  // -- TRACK HISTORY TO AVOID REPETITION --
  const [playedWords, setPlayedWords] = useState<number[]>([]);
  const [playedMath, setPlayedMath] = useState<number[]>([]);
  const [playedSudoku, setPlayedSudoku] = useState<number[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadUserPoints();
    }
  }, [user]);

  const loadUserPoints = async () => {
    if (!user?.id || user.id === "00000000-0000-0000-0000-000000000000") return;
    const pts = await fetchUserPoints(user.id);
    setUserPoints(pts);
    
    // Auto-adjust difficulty based on games completed
    if (pts) {
      if (pts.games_completed > 50) setDifficulty('Advanced');
      else if (pts.games_completed > 20) setDifficulty('Medium');
      else if (pts.games_completed > 5) setDifficulty('Easy');
      else setDifficulty('Beginner');
    }
  };

  const handleGameComplete = async (gameId: string, basePoints: number, isPerfect: boolean, contentId: string) => {
    if (!user?.id || user.id === "00000000-0000-0000-0000-000000000000") return;
    
    let earned = basePoints;
    let msg = `Great job! You earned ${earned} points.`;
    
    if (isPerfect) {
      earned += 5;
      msg = `Excellent! Perfect score! You earned ${earned} points.`;
    }
    
    if (difficulty === 'Medium') earned += 2;
    if (difficulty === 'Advanced') earned += 5;
    
    setShowPointsAnim({ show: true, msg, pts: earned });
    setTimeout(() => setShowPointsAnim({show: false, msg: '', pts: 0}), 4000);
    
    await saveGameResult({
      user_id: user.id,
      game_id: gameId,
      difficulty,
      score: isPerfect ? 100 : 80,
      points_earned: earned,
      content_id: contentId,
      completion_status: true
    });
    
    loadUserPoints();
  };

  // --- MEMORY GAME STATE ---
  const [cards, setCards] = useState<Array<{ instanceId: number; id: number; icon: string; name: string; isFlipped: boolean; isMatched: boolean }>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [memoryWon, setMemoryWon] = useState(false);
  const [totalPairs, setTotalPairs] = useState(4);

  const initMemoryGame = () => {
    let pairCount = 4;
    if (difficulty === 'Beginner') pairCount = 3;
    if (difficulty === 'Medium') pairCount = 6;
    if (difficulty === 'Advanced') pairCount = 8;
    setTotalPairs(pairCount);
    
    // Randomize pool
    const shuffledPool = [...MEMORY_POOL].sort(() => Math.random() - 0.5).slice(0, pairCount);
    
    const paired = [...shuffledPool, ...shuffledPool].map((item, idx) => ({
      ...item,
      instanceId: idx,
      isFlipped: false,
      isMatched: false,
    }));
    
    const shuffled = paired.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setMemoryWon(false);
  };

  useEffect(() => {
    if (activeTab === 'memory') initMemoryGame();
  }, [difficulty, activeTab]);

  const handleCardClick = (instanceId: number) => {
    if (flippedCards.length === 2) return;
    const card = cards.find((c) => c.instanceId === instanceId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlipped = [...flippedCards, instanceId];
    setFlippedCards(newFlipped);
    setCards((prev) => prev.map((c) => (c.instanceId === instanceId ? { ...c, isFlipped: true } : c)));

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const firstCard = cards.find((c) => c.instanceId === newFlipped[0]);
      const secondCard = card;

      if (firstCard && secondCard && firstCard.id === secondCard.id) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === firstCard.id ? { ...c, isMatched: true, isFlipped: true } : c));
          setMatchedPairs((p) => {
            const newMatches = p + 1;
            if (newMatches === totalPairs && !memoryWon) {
              setMemoryWon(true);
              const isPerfect = moves + 1 === totalPairs;
              handleGameComplete('memory', 10, isPerfect, `memory-${totalPairs}`);
            }
            return newMatches;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.instanceId === newFlipped[0] || c.instanceId === newFlipped[1]) ? { ...c, isFlipped: false } : c));
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  // --- SUDOKU ---
  const [sudokuGrid, setSudokuGrid] = useState<number[][]>([]);
  const [sudokuSol, setSudokuSol] = useState<number[][]>([]);
  const [sudokuWon, setSudokuWon] = useState(false);
  const [currentSudokuIdx, setCurrentSudokuIdx] = useState(0);

  const initSudoku = () => {
    let available = SUDOKU_POOL.map((_, i) => i).filter(i => !playedSudoku.includes(i));
    if (available.length === 0) {
      setPlayedSudoku([]); // reset pool
      available = SUDOKU_POOL.map((_, i) => i);
    }
    const idx = available[Math.floor(Math.random() * available.length)];
    setPlayedSudoku(prev => [...prev, idx]);
    setCurrentSudokuIdx(idx);
    
    setSudokuGrid(JSON.parse(JSON.stringify(SUDOKU_POOL[idx].initial)));
    setSudokuSol(SUDOKU_POOL[idx].solution);
    setSudokuWon(false);
  };

  useEffect(() => {
    if (activeTab === 'sudoku') initSudoku();
  }, [activeTab]);

  const handleSudokuCell = (r: number, c: number, val: number) => {
    if (sudokuWon) return;
    const updated = sudokuGrid.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? val : cell)));
    setSudokuGrid(updated);
    
    const allFilled = updated.every((row) => row.every((cl) => cl > 0));
    if (allFilled) {
      const isCorrect = updated.every((row, ri) => row.every((cl, ci) => cl === sudokuSol[ri][ci]));
      if (isCorrect && !sudokuWon) {
        setSudokuWon(true);
        handleGameComplete('sudoku', 15, true, `sudoku-${currentSudokuIdx}`);
      }
    }
  };

  // --- WORD SCRAMBLE GAME ---
  const [wordIndex, setWordIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [wordInput, setWordInput] = useState("");
  const [wordWon, setWordWon] = useState(false);

  const initWordScramble = () => {
    let available = WORD_POOL.map((_, i) => i).filter(i => !playedWords.includes(i));
    if (available.length === 0) {
      setPlayedWords([]);
      available = WORD_POOL.map((_, i) => i);
    }
    const idx = available[Math.floor(Math.random() * available.length)];
    setPlayedWords(prev => [...prev, idx]);
    setWordIndex(idx);
    
    const word = WORD_POOL[idx].target;
    let scram = word.split('').sort(() => 0.5 - Math.random()).join('');
    while (scram === word && word.length > 1) {
      scram = word.split('').sort(() => 0.5 - Math.random()).join('');
    }
    setScrambled(scram);
    setWordInput("");
    setWordWon(false);
  };

  useEffect(() => {
    if (activeTab === 'word') initWordScramble();
  }, [activeTab]);

  const handleWordCheck = () => {
    if (wordInput.toUpperCase() === WORD_POOL[wordIndex].target && !wordWon) {
      setWordWon(true);
      handleGameComplete('word', 10, true, `word-${WORD_POOL[wordIndex].target}`);
    }
  };

  // --- NUMBER SEQUENCE GAME ---
  const [mathIndex, setMathIndex] = useState(0);
  const [mathInput, setMathInput] = useState("");
  const [mathWon, setMathWon] = useState(false);

  const initMathGame = () => {
    let available = MATH_POOL.map((_, i) => i).filter(i => !playedMath.includes(i));
    if (available.length === 0) {
      setPlayedMath([]);
      available = MATH_POOL.map((_, i) => i);
    }
    const idx = available[Math.floor(Math.random() * available.length)];
    setPlayedMath(prev => [...prev, idx]);
    setMathIndex(idx);
    setMathInput("");
    setMathWon(false);
  };

  useEffect(() => {
    if (activeTab === 'math') initMathGame();
  }, [activeTab]);

  const handleMathCheck = () => {
    if (parseInt(mathInput) === MATH_POOL[mathIndex].ans && !mathWon) {
      setMathWon(true);
      handleGameComplete('math', 10, true, `math-${mathIndex}`);
    }
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

  const togglePranayama = () => {
    if (!pranayamaActive) {
      setPranayamaActive(true);
    } else {
      setPranayamaActive(false);
      handleGameComplete('breathing', 5, false, 'activity-breath');
    }
  };

  return (
    <section id="games" className="py-16 bg-white border-t border-[#E2E4E0]">
      {/* Toast Notification for Points */}
      {showPointsAnim.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          <span className="font-bold">{showPointsAnim.msg}</span>
        </div>
      )}

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
          <div className="flex bg-[#FAFAFA] p-1.5 rounded-2xl gap-1 border border-[#E2E4E0] overflow-x-auto text-xs font-bold hide-scrollbar">
            <button
              onClick={() => setActiveTab("memory")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${activeTab === "memory" ? "bg-[#1F4E46] text-white shadow-xs" : "text-[#374940] hover:text-[#1F4E46]"}`}
            >
              <Brain className="w-4 h-4" />
              <span>Memory Game</span>
            </button>
            <button
              onClick={() => setActiveTab("sudoku")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${activeTab === "sudoku" ? "bg-[#1F4E46] text-white shadow-xs" : "text-[#374940] hover:text-[#1F4E46]"}`}
            >
              <Trophy className="w-4 h-4" />
              <span>Senior Sudoku</span>
            </button>
            <button
              onClick={() => setActiveTab("word")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${activeTab === "word" ? "bg-[#1F4E46] text-white shadow-xs" : "text-[#374940] hover:text-[#1F4E46]"}`}
            >
              <Type className="w-4 h-4" />
              <span>Word Scramble</span>
            </button>
            <button
              onClick={() => setActiveTab("math")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${activeTab === "math" ? "bg-[#1F4E46] text-white shadow-xs" : "text-[#374940] hover:text-[#1F4E46]"}`}
            >
              <Calculator className="w-4 h-4" />
              <span>Number Sequence</span>
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${activeTab === "activities" ? "bg-[#1F4E46] text-white shadow-xs" : "text-[#374940] hover:text-[#1F4E46]"}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Daily Activities</span>
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 ${activeTab === "progress" ? "bg-[#153A34] text-white shadow-xs" : "text-[#1F4E46] hover:bg-[#DCEAE4]"}`}
            >
              <Trophy className="w-4 h-4" />
              <span>My Progress</span>
            </button>
          </div>
        </div>

        {/* Difficulty Selector (if applicable) */}
        {['memory', 'sudoku', 'word', 'math'].includes(activeTab) && (
          <div className="flex justify-end mb-4 gap-2">
            <span className="text-sm font-medium text-stone-500 self-center mr-2">Difficulty:</span>
            {['Beginner', 'Easy', 'Medium', 'Advanced'].map(lvl => (
               <button 
                 key={lvl}
                 onClick={() => setDifficulty(lvl as any)}
                 className={`px-3 py-1 text-xs rounded-full border ${difficulty === lvl ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}
               >
                 {lvl}
               </button>
            ))}
          </div>
        )}

        <div className="bg-[#F8FAF8] rounded-2xl p-6 sm:p-10 border border-[#F3F5F4] min-h-[400px]">
          
          {/* TAB 0: PROGRESS */}
          {activeTab === "progress" && (
            <div className="max-w-2xl mx-auto space-y-6">
               <div className="text-center mb-8">
                 <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                 <h3 className="text-2xl font-bold text-[#153A34]">Brain Fitness Profile</h3>
                 <p className="text-stone-600">Track your cognitive exercises and achievements</p>
               </div>
               
               {userPoints ? (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-center">
                     <p className="text-sm text-stone-500 font-bold mb-1">Total Points</p>
                     <p className="text-4xl font-black text-emerald-600">{userPoints.total_points}</p>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-center">
                     <p className="text-sm text-stone-500 font-bold mb-1">Current Level</p>
                     <p className="text-2xl font-black text-amber-600">{userPoints.current_level}</p>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-center">
                     <p className="text-sm text-stone-500 font-bold mb-1">Games Completed</p>
                     <p className="text-2xl font-black text-[#153A34]">{userPoints.games_completed}</p>
                   </div>
                   <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm text-center">
                     <p className="text-sm text-stone-500 font-bold mb-1">Daily Streak</p>
                     <p className="text-2xl font-black text-rose-600">{userPoints.daily_streak} Days</p>
                   </div>
                 </div>
               ) : (
                 <div className="text-center p-8 bg-white rounded-2xl">
                   <p className="text-stone-500">Please login to track your brain fitness points.</p>
                 </div>
               )}
            </div>
          )}

          {/* TAB 1: MEMORY GAME */}
          {activeTab === "memory" && (
            <div className="flex flex-col items-center">
              <div className="flex justify-between w-full max-w-2xl mb-6 text-sm font-bold text-[#4A5D54]">
                <span>Moves: {moves}</span>
                <span>Pairs Matched: {matchedPairs}/{totalPairs}</span>
              </div>
              <div className={`grid ${totalPairs > 4 ? 'grid-cols-4' : 'grid-cols-4'} gap-4 max-w-2xl w-full`}>
                {cards.map((card) => (
                  <button
                    key={card.instanceId}
                    onClick={() => handleCardClick(card.instanceId)}
                    className={`aspect-square text-3xl sm:text-5xl flex items-center justify-center rounded-2xl transition-all duration-300 transform ${
                      card.isFlipped || card.isMatched
                        ? "bg-white shadow-sm border border-[#DCEAE4] rotate-0"
                        : "bg-[#1F4E46] text-white shadow-md hover:bg-[#153A34] rotate-y-180"
                    }`}
                  >
                    <span className={`transition-opacity duration-200 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
                      {card.icon}
                    </span>
                  </button>
                ))}
              </div>
              
              {memoryWon && (
                <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#153A34] mb-2">Excellent Memory!</h3>
                  <p className="text-emerald-700 mb-6">You matched all {totalPairs} pairs in {moves} moves.</p>
                  <button
                    onClick={initMemoryGame}
                    className="px-6 py-3 bg-[#1F4E46] hover:bg-[#153A34] text-white font-bold rounded-xl flex items-center gap-2 mx-auto transition"
                  >
                    <RotateCcw className="w-5 h-5" /> Play New Session
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUDOKU */}
          {activeTab === "sudoku" && (
            <div className="flex flex-col items-center">
              <p className="text-center text-[#586C62] mb-6 max-w-md">
                Fill the empty cells so that every row and column contains the numbers 1, 2, 3, and 4 exactly once.
              </p>
              
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-[#E2E4E0] inline-block">
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {sudokuGrid.map((row, ri) =>
                    row.map((cell, ci) => {
                      const isInitial = SUDOKU_POOL[currentSudokuIdx].initial[ri][ci] !== 0;
                      return (
                        <div key={`${ri}-${ci}`} className="relative w-12 h-12 sm:w-16 sm:h-16">
                          {isInitial ? (
                            <div className="w-full h-full flex items-center justify-center bg-[#F3F5F4] text-[#153A34] text-xl font-bold rounded-xl">
                              {cell}
                            </div>
                          ) : (
                            <select
                              value={cell === 0 ? "" : cell}
                              onChange={(e) => handleSudokuCell(ri, ci, parseInt(e.target.value) || 0)}
                              disabled={sudokuWon}
                              className={`w-full h-full appearance-none text-center text-xl font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#1F4E46] cursor-pointer ${
                                cell !== 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              <option value="" disabled></option>
                              {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {sudokuWon && (
                <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#153A34] mb-2">Puzzle Solved!</h3>
                  <button
                    onClick={initSudoku}
                    className="px-6 py-3 bg-[#1F4E46] hover:bg-[#153A34] text-white font-bold rounded-xl flex items-center gap-2 mx-auto transition mt-4"
                  >
                    <RotateCcw className="w-5 h-5" /> Play New Session
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WORD SCRAMBLE */}
          {activeTab === "word" && (
            <div className="flex flex-col items-center text-center">
              <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#E2E4E0]">
                <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">Unscramble the Word</p>
                <div className="text-4xl font-mono font-black tracking-widest text-[#153A34] mb-6 p-4 bg-[#FAFAFA] rounded-2xl">
                  {scrambled}
                </div>
                
                <p className="text-[#5B6B60] italic mb-6">Hint: {WORD_POOL[wordIndex].hint}</p>

                {!wordWon ? (
                  <div className="flex flex-col gap-3">
                    <input 
                      type="text" 
                      value={wordInput}
                      onChange={(e) => setWordInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleWordCheck()}
                      placeholder="Type your answer..."
                      className="w-full text-center px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#1F4E46] outline-none text-xl font-bold uppercase"
                    />
                    <button 
                      onClick={handleWordCheck}
                      className="w-full py-3 bg-[#1F4E46] hover:bg-[#153A34] text-white font-bold rounded-xl transition"
                    >
                      Check Answer
                    </button>
                  </div>
                ) : (
                  <div className="animate-in fade-in zoom-in">
                    <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl mb-6 font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Correct! The word is {WORD_POOL[wordIndex].target}.
                    </div>
                    <button 
                      onClick={initWordScramble}
                      className="px-6 py-3 bg-[#F3F5F4] hover:bg-[#DCEAE4] text-[#1F4E46] font-bold rounded-xl transition flex items-center gap-2 mx-auto"
                    >
                      Next Word <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NUMBER SEQUENCE */}
          {activeTab === "math" && (
            <div className="flex flex-col items-center text-center">
              <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#E2E4E0]">
                <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">Find the Missing Number</p>
                
                <div className="flex items-center justify-center gap-4 my-6">
                  {MATH_POOL[mathIndex].seq.map((num, i) => (
                    <div key={i} className={`w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-xl ${num === '?' ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' : 'bg-[#FAFAFA] text-[#153A34]'}`}>
                      {num}
                    </div>
                  ))}
                </div>

                <p className="text-[#5B6B60] italic mb-6">Hint: {MATH_POOL[mathIndex].hint}</p>

                {!mathWon ? (
                  <div className="flex gap-3">
                    <input 
                      type="number" 
                      value={mathInput}
                      onChange={(e) => setMathInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleMathCheck()}
                      placeholder="?"
                      className="w-24 text-center px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#1F4E46] outline-none text-xl font-bold"
                    />
                    <button 
                      onClick={handleMathCheck}
                      className="flex-1 py-3 bg-[#1F4E46] hover:bg-[#153A34] text-white font-bold rounded-xl transition"
                    >
                      Check Answer
                    </button>
                  </div>
                ) : (
                  <div className="animate-in fade-in zoom-in">
                     <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl mb-6 font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Correct! The answer is {MATH_POOL[mathIndex].ans}.
                    </div>
                    <button 
                      onClick={initMathGame}
                      className="px-6 py-3 bg-[#F3F5F4] hover:bg-[#DCEAE4] text-[#1F4E46] font-bold rounded-xl transition flex items-center gap-2 mx-auto"
                    >
                      Next Sequence <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVITIES */}
          {activeTab === "activities" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Pranayama Breathing */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E4E0] shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                    <Wind className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#153A34] text-lg">Pranayama Timer</h3>
                    <p className="text-xs text-[#586C62]">4-4-4 Breathing Exercise</p>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center py-6">
                  <div className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
                    pranayamaActive ? (breathPhase === 'Inhale' ? 'border-sky-400 scale-110' : breathPhase === 'Hold' ? 'border-indigo-400 scale-110' : 'border-teal-400 scale-90') : 'border-stone-200'
                  }`}>
                    <div className="text-center">
                      <span className="block text-2xl font-black text-[#153A34]">
                        {pranayamaActive ? breathCount : 'Ready'}
                      </span>
                      <span className="block text-xs font-bold text-stone-500 uppercase tracking-widest mt-1">
                        {pranayamaActive ? breathPhase : 'Start'}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={togglePranayama}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${pranayamaActive ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-[#1F4E46] hover:bg-[#153A34] text-white'}`}
                >
                  {pranayamaActive ? <><Pause className="w-5 h-5" /> Stop Session</> : <><Play className="w-5 h-5" /> Start Breathing</>}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
};
