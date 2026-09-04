const fs = require('fs');

let content = fs.readFileSync('src/components/GamesActivitySection.tsx', 'utf8');

// 1. Add extra lucide icons if needed
content = content.replace(
  'import { ', 
  'import { Type, Calculator, '
);

// 2. Update activeTab type
content = content.replace(
  /const \[activeTab, setActiveTab\] = useState<"sudoku" \| "memory" \| "word" \| "activities">/g,
  'const [activeTab, setActiveTab] = useState<"sudoku" | "memory" | "word" | "math" | "activities">'
);

// 3. Add game states before return (
const newStates = `
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
`;

content = content.replace(/\s*return \(\s*<section id="games"/, newStates + '    <section id="games"');

// 4. Add Tab Buttons
const tabButtons = `
            <button
              onClick={() => setActiveTab("word")}
              className={\`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 \${
                activeTab === "word"
                  ? "bg-[#1F4E46] text-white shadow-xs"
                  : "text-[#374940] hover:text-[#1F4E46]"
              }\`}
            >
              <Type className="w-4 h-4" />
              <span>Word Scramble</span>
            </button>

            <button
              onClick={() => setActiveTab("math")}
              className={\`px-4 py-2 rounded-xl transition shrink-0 flex items-center gap-1.5 \${
                activeTab === "math"
                  ? "bg-[#1F4E46] text-white shadow-xs"
                  : "text-[#374940] hover:text-[#1F4E46]"
              }\`}
            >
              <Calculator className="w-4 h-4" />
              <span>Number sequence</span>
            </button>
`;

content = content.replace(
  /(\s*<button\s*onClick=\{\(\) => setActiveTab\("activities"\)\})/,
  tabButtons + '$1'
);

// 5. Add UI for the games
const gamesUI = `

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
                    <div className={\`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-2xl font-black rounded-xl shadow-sm \${num === '?' ? 'bg-[#1F4E46] text-white border-2 border-[#1F4E46]' : 'bg-white text-[#153A34] border border-[#D8E2DA]'}\`}>
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
`;

content = content.replace(
  /(\{\/\* TAB 3: GUIDED ACTIVITIES & PRANAYAMA \*\/})/,
  gamesUI + '\n        $1'
);

fs.writeFileSync('src/components/GamesActivitySection.tsx', content);
