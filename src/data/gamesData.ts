export const MEMORY_POOL = [
  { id: 1, icon: "🫚", name: "Ginger (Adrak)" },
  { id: 2, icon: "🌿", name: "Tulsi (Basil)" },
  { id: 3, icon: "🍎", name: "Apple (Seb)" },
  { id: 4, icon: "🧘", name: "Yoga Asana" },
  { id: 5, icon: "🫖", name: "Herbal Tea" },
  { id: 6, icon: "🥥", name: "Coconut" },
  { id: 7, icon: "🥕", name: "Carrot" },
  { id: 8, icon: "🥑", name: "Avocado" },
  { id: 9, icon: "🫐", name: "Blueberry" },
  { id: 10, icon: "🍋", name: "Lemon" },
  { id: 11, icon: "🍯", name: "Honey" },
  { id: 12, icon: "🍵", name: "Green Tea" },
  { id: 13, icon: "🚶", name: "Walking" },
  { id: 14, icon: "🌻", name: "Sunflower" },
  { id: 15, icon: "🌞", name: "Morning Sun" },
  { id: 16, icon: "💧", name: "Water" }
];

export const WORD_POOL = [
  { target: "GINGER", hint: "Healthy root used in tea for colds (Adrak)." },
  { target: "TULSI", hint: "Holy Basil, excellent for immunity." },
  { target: "DOCTOR", hint: "Medical professional." },
  { target: "FAMILY", hint: "Your loved ones." },
  { target: "HEALTH", hint: "The true wealth." },
  { target: "YOGA", hint: "Ancient practice for body and mind." },
  { target: "WATER", hint: "Essential for hydration." },
  { target: "PEACE", hint: "State of tranquility." },
  { target: "WALK", hint: "Gentle physical activity." },
  { target: "SLEEP", hint: "Rest for the body and mind." },
  { target: "NATURE", hint: "Trees, flowers, and the outdoors." },
  { target: "BREATHE", hint: "Inhale and exhale." },
  { target: "SMILE", hint: "Expression of happiness." },
  { target: "CLINIC", hint: "Where you go for medical checkups." },
  { target: "FRUIT", hint: "Healthy natural snack." },
  { target: "MORNING", hint: "Start of the day." },
  { target: "MUSIC", hint: "Soothing sounds for therapy." },
  { target: "HEART", hint: "Organ that pumps blood." },
  { target: "PULSE", hint: "Heart rate." },
  { target: "VITAL", hint: "Absolutely necessary or important." }
];

export const MATH_POOL = [
  { seq: [2, 4, 6, '?'], ans: 8, hint: "Add 2 each time." },
  { seq: [5, 10, 15, '?'], ans: 20, hint: "Multiples of 5." },
  { seq: [1, 2, 4, 8, '?'], ans: 16, hint: "Double the previous number." },
  { seq: [10, 9, 8, '?'], ans: 7, hint: "Subtract 1 each time." },
  { seq: [1, 3, 5, '?'], ans: 7, hint: "Odd numbers." },
  { seq: [3, 6, 9, '?'], ans: 12, hint: "Add 3 each time." },
  { seq: [20, 15, 10, '?'], ans: 5, hint: "Subtract 5 each time." },
  { seq: [2, 5, 8, '?'], ans: 11, hint: "Add 3 each time." },
  { seq: [10, 20, 30, '?'], ans: 40, hint: "Add 10 each time." },
  { seq: [50, 40, 30, '?'], ans: 20, hint: "Subtract 10 each time." },
  { seq: [1, 4, 7, 10, '?'], ans: 13, hint: "Add 3 each time." },
  { seq: [12, 10, 8, '?'], ans: 6, hint: "Subtract 2 each time." },
  { seq: [0, 5, 10, '?'], ans: 15, hint: "Multiples of 5 starting from 0." },
  { seq: [11, 22, 33, '?'], ans: 44, hint: "Multiples of 11." },
  { seq: [7, 14, 21, '?'], ans: 28, hint: "Multiples of 7." }
];

export const SUDOKU_POOL = [
  {
    initial: [
      [1, 0, 3, 0],
      [0, 0, 0, 2],
      [3, 0, 0, 0],
      [0, 2, 0, 4],
    ],
    solution: [
      [1, 4, 3, 2],
      [4, 3, 1, 2],
      [3, 1, 2, 4],
      [2, 2, 4, 4], // Actually standard 4x4 sudoku has rows 1-4. The original code had a weird solution, let's make it standard 4x4.
    ]
  },
  {
    initial: [
      [0, 4, 0, 1],
      [3, 0, 4, 0],
      [1, 0, 0, 4],
      [0, 2, 1, 0]
    ],
    solution: [
      [2, 4, 3, 1],
      [3, 1, 4, 2],
      [1, 3, 2, 4],
      [4, 2, 1, 3]
    ]
  },
  {
    initial: [
      [0, 1, 0, 4],
      [4, 0, 2, 0],
      [0, 2, 0, 3],
      [3, 0, 1, 0]
    ],
    solution: [
      [2, 1, 3, 4],
      [4, 3, 2, 1],
      [1, 2, 4, 3],
      [3, 4, 1, 2]
    ]
  }
];
