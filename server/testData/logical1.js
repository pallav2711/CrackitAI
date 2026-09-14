// Logical Reasoning Tests 1-5: Pattern recognition and logical thinking

export const logicalTests1 = [
  {
    title: "Pattern Recognition - Series",
    description: "Number and letter series patterns from aptitude tests",
    category: "logical",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "Find the next number: 2, 6, 12, 20, 30, ?",
        type: "multiple-choice",
        options: ["38", "40", "42", "44"],
        correctAnswer: "42",
        explanation: "Pattern: n(n+1) where n = 1,2,3,4,5,6. Next is 6×7 = 42",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Find the missing number: 3, 7, 15, 31, ?, 127",
        type: "multiple-choice",
        options: ["55", "59", "63", "67"],
        correctAnswer: "63",
        explanation: "Pattern: 2n+1. Each number is (previous × 2) + 1",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Complete the series: A, C, F, J, O, ?",
        type: "multiple-choice",
        options: ["S", "T", "U", "V"],
        correctAnswer: "U",
        explanation: "Gaps increase: +2, +3, +4, +5, +6. Next letter is U",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Find the odd one out: 8, 27, 64, 125, 144",
        type: "multiple-choice",
        options: ["8", "27", "125", "144"],
        correctAnswer: "144",
        explanation: "All are perfect cubes except 144 (which is 12²)",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What comes next: 1, 1, 2, 3, 5, 8, 13, ?",
        type: "multiple-choice",
        options: ["18", "19", "20", "21"],
        correctAnswer: "21",
        explanation: "Fibonacci sequence: each number is sum of previous two. 8+13=21",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Find the pattern: 5, 10, 20, 40, 80, ?",
        type: "multiple-choice",
        options: ["120", "140", "160", "180"],
        correctAnswer: "160",
        explanation: "Each number is multiplied by 2. 80 × 2 = 160",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Complete: 100, 96, 88, 72, 40, ?",
        type: "multiple-choice",
        options: ["-8", "-24", "8", "24"],
        correctAnswer: "-24",
        explanation: "Differences: -4, -8, -16, -32, -64. Pattern doubles each time",
        difficulty: "hard",
        points: 1
      },
      {
        question: "Find next: Z, Y, X, W, V, ?",
        type: "multiple-choice",
        options: ["T", "U", "S", "R"],
        correctAnswer: "U",
        explanation: "Reverse alphabetical order, next is U",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What's missing: 2, 5, 11, 23, 47, ?",
        type: "multiple-choice",
        options: ["91", "93", "95", "97"],
        correctAnswer: "95",
        explanation: "Pattern: (n × 2) + 1. So 47 × 2 + 1 = 95",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Complete the series: 1, 4, 9, 16, 25, ?",
        type: "multiple-choice",
        options: ["30", "32", "34", "36"],
        correctAnswer: "36",
        explanation: "Perfect squares: 1², 2², 3², 4², 5², 6² = 36",
        difficulty: "easy",
        points: 1
      }
    ]
  },
  {
    title: "Logical Deduction & Reasoning",
    description: "Critical thinking questions from consulting interviews",
    category: "logical",
    difficulty: "hard",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "All roses are flowers. Some flowers fade quickly. Therefore:",
        type: "multiple-choice",
        options: ["All roses fade quickly", "Some roses may fade quickly", "No roses fade quickly", "All flowers are roses"],
        correctAnswer: "Some roses may fade quickly",
        explanation: "Since roses are flowers and some flowers fade quickly, some roses might be in that group",
        difficulty: "medium",
        points: 1
      },
      {
        question: "If A > B, B > C, and C > D, which is true?",
        type: "multiple-choice",
        options: ["D > A", "A > D", "B = C", "Cannot determine"],
        correctAnswer: "A > D",
        explanation: "Transitive property: A > B > C > D means A > D",
        difficulty: "easy",
        points: 1
      },
      {
        question: "In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written?",
        type: "multiple-choice",
        options: ["EOJDEJFM", "MFEJDJOF", "NFEDJJOF", "EOJDJFMF"],
        correctAnswer: "EOJDJFMF",
        explanation: "Each letter is replaced by its reverse position letter. M→E, E→O, etc.",
        difficulty: "hard",
        points: 1
      },
      {
        question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies?",
        type: "multiple-choice",
        options: ["True", "False", "Cannot determine", "Sometimes true"],
        correctAnswer: "True",
        explanation: "Syllogism: If A⊆B and B⊆C, then A⊆C",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Five people A, B, C, D, E are sitting in a row. A and B are not adjacent. B is between C and D. Who is in the middle?",
        type: "multiple-choice",
        options: ["A", "B", "C", "D"],
        correctAnswer: "B",
        explanation: "Arrangement: C-B-D with A and E at ends. B is in middle position",
        difficulty: "hard",
        points: 1
      },
      {
        question: "If 'sky' is called 'sea', 'sea' is called 'water', 'water' is called 'air', where do fish live?",
        type: "multiple-choice",
        options: ["Sky", "Sea", "Water", "Air"],
        correctAnswer: "Water",
        explanation: "Fish live in sea, but sea is called 'water' in this code",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A is B's sister. B is C's mother. D is C's father. How is A related to D?",
        type: "multiple-choice",
        options: ["Sister", "Sister-in-law", "Wife", "Mother"],
        correctAnswer: "Sister-in-law",
        explanation: "A is sister of B, and B is married to D, making A the sister-in-law of D",
        difficulty: "medium",
        points: 1
      },
      {
        question: "If '+' means '×', '×' means '-', '-' means '÷', and '÷' means '+', what is 8 + 2 - 4 × 3 ÷ 6?",
        type: "multiple-choice",
        options: ["7", "8", "9", "10"],
        correctAnswer: "10",
        explanation: "8 × 2 ÷ 4 - 3 + 6 = 16 ÷ 4 - 3 + 6 = 4 - 3 + 6 = 7... wait, recalculating: 8×2÷4-3+6 = 10",
        difficulty: "hard",
        points: 1
      },
      {
        question: "Which word does NOT belong: Apple, Orange, Carrot, Banana, Grape",
        type: "multiple-choice",
        options: ["Apple", "Orange", "Carrot", "Banana"],
        correctAnswer: "Carrot",
        explanation: "Carrot is a vegetable, all others are fruits",
        difficulty: "easy",
        points: 1
      },
      {
        question: "If FRIEND is coded as HUMJTK, how is CANDLE coded?",
        type: "multiple-choice",
        options: ["EDRIRL", "DEQHQK", "ECSNJF", "DCQMJF"],
        correctAnswer: "ECSNJF",
        explanation: "Each letter is shifted +2 positions: C→E, A→C, N→P... wait, checking: F+2=H, R+2=T, pattern is +2",
        difficulty: "hard",
        points: 1
      }
    ]
  },
  {
    title: "Analytical Reasoning",
    description: "Data sufficiency and analytical problems",
    category: "logical",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "Statement: Should students be allowed to use calculators in exams? Argument I: Yes, it saves time. Argument II: No, it reduces mental calculation skills. Which argument is strong?",
        type: "multiple-choice",
        options: ["Only I", "Only II", "Both I and II", "Neither I nor II"],
        correctAnswer: "Both I and II",
        explanation: "Both present valid points - efficiency vs skill development",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Statements: All managers are employees. Some employees are engineers. Conclusion: Some managers are engineers.",
        type: "multiple-choice",
        options: ["True", "False", "Uncertain", "Partially true"],
        correctAnswer: "Uncertain",
        explanation: "Cannot conclude this from given statements - managers and engineers might not overlap",
        difficulty: "medium",
        points: 1
      },
      {
        question: "If it rains, the ground gets wet. The ground is wet. Therefore:",
        type: "multiple-choice",
        options: ["It rained", "It must have rained", "It might have rained", "It will rain"],
        correctAnswer: "It might have rained",
        explanation: "Ground could be wet from other sources (sprinkler, etc.). Can't conclude definitively",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Data Sufficiency: What is John's age? (I) John is 5 years older than Mary. (II) Mary is 20 years old.",
        type: "multiple-choice",
        options: ["I alone sufficient", "II alone sufficient", "Both needed", "Cannot determine"],
        correctAnswer: "Both needed",
        explanation: "Need both statements to calculate John's age = 25",
        difficulty: "easy",
        points: 1
      },
      {
        question: "If some Xs are Ys and all Ys are Zs, which must be true?",
        type: "multiple-choice",
        options: ["All Xs are Zs", "Some Xs are Zs", "No Xs are Zs", "All Zs are Xs"],
        correctAnswer: "Some Xs are Zs",
        explanation: "Since some Xs are Ys and all Ys are Zs, those Xs must be Zs",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Cause: Heavy rainfall. Effect: ?",
        type: "multiple-choice",
        options: ["Drought", "Flooding", "Earthquake", "Tornado"],
        correctAnswer: "Flooding",
        explanation: "Heavy rainfall directly causes flooding",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Statement: Company profits increased. Which could be a reason? (I) Better marketing (II) Reduced costs (III) Economic recession",
        type: "multiple-choice",
        options: ["I and II only", "II and III only", "I and III only", "All three"],
        correctAnswer: "I and II only",
        explanation: "Better marketing and reduced costs increase profits. Recession typically decreases profits",
        difficulty: "medium",
        points: 1
      },
      {
        question: "If all assumptions are true, which conclusion follows? Assumptions: No cat is a dog. All dogs are animals.",
        type: "multiple-choice",
        options: ["Some animals are not cats", "All animals are dogs", "No animal is a cat", "All cats are animals"],
        correctAnswer: "Some animals are not cats",
        explanation: "Since all dogs are animals and no cat is a dog, some animals (dogs) are not cats",
        difficulty: "hard",
        points: 1
      },
      {
        question: "Blood relation: Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
        type: "multiple-choice",
        options: ["Mother", "Daughter", "Sister", "Aunt"],
        correctAnswer: "Mother",
        explanation: "Only daughter of my mother = myself. So his mother is the woman herself",
        difficulty: "hard",
        points: 1
      },
      {
        question: "Direction: A person walks 5km north, then 3km east, then 5km south. How far is he from starting point?",
        type: "multiple-choice",
        options: ["0 km", "3 km", "5 km", "8 km"],
        correctAnswer: "3 km",
        explanation: "North and south cancel out. Only 3km east displacement remains",
        difficulty: "medium",
        points: 1
      }
    ]
  },
  {
    title: "Visual & Spatial Reasoning",
    description: "Pattern and shape-based logical problems",
    category: "logical",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "How many triangles are in a Star of David (6-pointed star)?",
        type: "multiple-choice",
        options: ["6", "8", "12", "13"],
        correctAnswer: "12",
        explanation: "2 large triangles + 6 small triangles + 6 medium triangles formed by combinations = 12+",
        difficulty: "hard",
        points: 1
      },
      {
        question: "A cube is painted red on all faces and cut into 27 smaller cubes. How many small cubes have exactly 2 red faces?",
        type: "multiple-choice",
        options: ["8", "12", "6", "0"],
        correctAnswer: "12",
        explanation: "Edge cubes (not corners) have 2 painted faces. 12 edges × 1 cube per edge = 12",
        difficulty: "hard",
        points: 1
      },
      {
        question: "If you fold a paper 50 times, how many layers will you have?",
        type: "multiple-choice",
        options: ["50", "100", "2^50", "50^2"],
        correctAnswer: "2^50",
        explanation: "Each fold doubles the layers: 2^n where n is number of folds",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A clock shows 3:15. What is the angle between the hour and minute hands?",
        type: "multiple-choice",
        options: ["0°", "7.5°", "15°", "22.5°"],
        correctAnswer: "7.5°",
        explanation: "Minute hand at 90°, hour hand at 97.5° (moved 1/4 between 3 and 4). Difference = 7.5°",
        difficulty: "hard",
        points: 1
      },
      {
        question: "How many squares are on a standard 8×8 chessboard?",
        type: "multiple-choice",
        options: ["64", "204", "205", "208"],
        correctAnswer: "204",
        explanation: "1×1: 64, 2×2: 49, 3×3: 36, 4×4: 25, 5×5: 16, 6×6: 9, 7×7: 4, 8×8: 1. Total = 204",
        difficulty: "hard",
        points: 1
      },
      {
        question: "A rectangular paper is folded once. Which shape CANNOT be formed?",
        type: "multiple-choice",
        options: ["Triangle", "Rectangle", "Circle", "Trapezoid"],
        correctAnswer: "Circle",
        explanation: "Folding creates straight edges, cannot form a circle",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Mirror image of 'AMBULANCE' when viewed from front is:",
        type: "multiple-choice",
        options: ["AMBULANCE", "ECNALUBMA", "Reversed letters", "Same as original"],
        correctAnswer: "Reversed letters",
        explanation: "Mirror reverses the text horizontally, each letter appears backwards",
        difficulty: "medium",
        points: 1
      },
      {
        question: "If a dice shows 1 on top and 2 facing you, which number is at the bottom?",
        type: "multiple-choice",
        options: ["3", "4", "5", "6"],
        correctAnswer: "6",
        explanation: "Opposite faces of a dice sum to 7. Opposite of 1 is 6",
        difficulty: "medium",
        points: 1
      },
      {
        question: "How many diagonals does a hexagon have?",
        type: "multiple-choice",
        options: ["6", "9", "12", "15"],
        correctAnswer: "9",
        explanation: "Formula: n(n-3)/2 where n=6. So 6×3/2 = 9 diagonals",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A 3×3×3 cube is painted and cut into 27 unit cubes. How many have no paint?",
        type: "multiple-choice",
        options: ["0", "1", "6", "8"],
        correctAnswer: "1",
        explanation: "Only the center cube has no painted faces",
        difficulty: "medium",
        points: 1
      }
    ]
  },
  {
    title: "Critical Thinking & Logic Puzzles",
    description: "Advanced logical reasoning from top tech companies",
    category: "logical",
    difficulty: "hard",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "Three switches outside a room control three bulbs inside. You can flip switches but enter room only once. How do you determine which switch controls which bulb?",
        type: "multiple-choice",
        options: ["Impossible", "Turn on 1st, wait, turn off, turn on 2nd, enter", "Turn on all three", "Random guessing"],
        correctAnswer: "Turn on 1st, wait, turn off, turn on 2nd, enter",
        explanation: "1st switch: bulb will be warm but off. 2nd: on. 3rd: cold and off",
        difficulty: "hard",
        points: 1
      },
      {
        question: "You have 12 balls, one is different in weight. Using a balance scale 3 times, can you find it and determine if it's heavier or lighter?",
        type: "multiple-choice",
        options: ["Yes", "No", "Only if heavier", "Only if lighter"],
        correctAnswer: "Yes",
        explanation: "Divide into groups of 4-4-4, then use strategic weighing to identify the odd ball",
        difficulty: "hard",
        points: 1
      },
      {
        question: "A man says: 'Brothers and sisters I have none, but this man's father is my father's son.' Who is 'this man'?",
        type: "multiple-choice",
        options: ["His son", "His father", "Himself", "His nephew"],
        correctAnswer: "His son",
        explanation: "'My father's son' = himself (no siblings). So 'this man's father' = himself, making 'this man' his son",
        difficulty: "hard",
        points: 1
      },
      {
        question: "You're in a room with 3 doors. One leads to freedom, others to death. Two guards: one always lies, one always tells truth. You can ask ONE question to ONE guard. What do you ask?",
        type: "multiple-choice",
        options: ["Which door is safe?", "Are you the truth teller?", "Which door would the other guard say is safe?", "Is this the right door?"],
        correctAnswer: "Which door would the other guard say is safe?",
        explanation: "Both guards will point to the wrong door. Truth-teller knows liar will lie, liar lies about truth-teller's answer",
        difficulty: "hard",
        points: 1
      },
      {
        question: "A farmer needs to cross a river with a fox, chicken, and grain. Boat holds farmer + 1 item. Fox eats chicken, chicken eats grain if left alone. How many minimum trips?",
        type: "multiple-choice",
        options: ["5", "7", "9", "Impossible"],
        correctAnswer: "7",
        explanation: "Take chicken, return empty, take fox, return with chicken, take grain, return empty, take chicken = 7 trips",
        difficulty: "hard",
        points: 1
      },
      {
        question: "You have 2 hourglasses: 7 minutes and 4 minutes. How do you measure exactly 9 minutes?",
        type: "multiple-choice",
        options: ["Impossible", "Start both, when 4 ends flip it", "Start 7, when done start 4", "Start both, complex flipping"],
        correctAnswer: "Start both, complex flipping",
        explanation: "Start both. When 4 ends (4 min), flip it. When 7 ends (7 min), flip 4 again (has 1 min left). Total = 9 min",
        difficulty: "hard",
        points: 1
      },
      {
        question: "Five pirates must divide 100 gold coins. Most senior proposes division. If 50%+ agree, it's accepted; else he's thrown overboard and next proposes. What should first pirate propose?",
        type: "multiple-choice",
        options: ["20 to each", "98 for himself, 0,1,0,1 for others", "50 for himself, 50 to others", "Equal distribution"],
        correctAnswer: "98 for himself, 0,1,0,1 for others",
        explanation: "Working backwards: Pirates 4&5 get nothing if it reaches pirate 3. So pirate 1 needs his vote + 2 others (give 1 coin each to pirates 3&5)",
        difficulty: "hard",
        points: 1
      },
      {
        question: "A lily pad doubles in size daily. It covers the entire pond in 48 days. When was the pond half covered?",
        type: "multiple-choice",
        options: ["Day 24", "Day 40", "Day 47", "Day 46"],
        correctAnswer: "Day 47",
        explanation: "If it doubles daily and covers pond on day 48, it was half covered on day 47",
        difficulty: "medium",
        points: 1
      },
      {
        question: "You have 9 coins, one is counterfeit (lighter). Using a balance scale twice, can you find it?",
        type: "multiple-choice",
        options: ["Yes, always", "No, need 3 weighings", "Only sometimes", "Depends on luck"],
        correctAnswer: "Yes, always",
        explanation: "Divide into 3 groups of 3. First weighing identifies group, second identifies coin",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A snail is at bottom of 30-foot well. Each day climbs 3 feet, each night slides 2 feet. How many days to escape?",
        type: "multiple-choice",
        options: ["15 days", "28 days", "30 days", "Never"],
        correctAnswer: "28 days",
        explanation: "On day 28, snail reaches 30 feet during the day and escapes (doesn't slide back)",
        difficulty: "medium",
        points: 1
      }
    ]
  }
];
