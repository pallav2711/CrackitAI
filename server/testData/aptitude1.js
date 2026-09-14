// Aptitude Tests 1-5: Real interview-level questions

export const aptitudeTests1 = [
  {
    title: "Quantitative Aptitude - Basic",
    description: "Essential numerical reasoning for technical interviews",
    category: "aptitude",
    difficulty: "easy",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "If a train travels 360 km in 4 hours, what is its average speed?",
        type: "multiple-choice",
        options: ["80 km/h", "90 km/h", "100 km/h", "110 km/h"],
        correctAnswer: "90 km/h",
        explanation: "Speed = Distance/Time = 360/4 = 90 km/h",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is 15% of 240?",
        type: "multiple-choice",
        options: ["30", "36", "40", "45"],
        correctAnswer: "36",
        explanation: "15% of 240 = (15/100) × 240 = 36",
        difficulty: "easy",
        points: 1
      },
      {
        question: "A product costs $80 after a 20% discount. What was the original price?",
        type: "multiple-choice",
        options: ["$96", "$100", "$104", "$110"],
        correctAnswer: "$100",
        explanation: "If 80% = $80, then 100% = $80 × (100/80) = $100",
        difficulty: "medium",
        points: 1
      },
      {
        question: "If 5 workers can complete a task in 12 days, how many days will 3 workers take?",
        type: "multiple-choice",
        options: ["15 days", "18 days", "20 days", "24 days"],
        correctAnswer: "20 days",
        explanation: "Work = 5×12 = 60 worker-days. For 3 workers: 60/3 = 20 days",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is the next number in the series: 2, 6, 12, 20, 30, ?",
        type: "multiple-choice",
        options: ["38", "40", "42", "44"],
        correctAnswer: "42",
        explanation: "Differences: 4, 6, 8, 10, 12. Pattern: n(n+1) where n=1,2,3,4,5,6",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A sum of money doubles itself in 8 years at simple interest. What is the rate of interest?",
        type: "multiple-choice",
        options: ["10%", "12.5%", "15%", "20%"],
        correctAnswer: "12.5%",
        explanation: "SI = P, T = 8. Rate = (SI × 100)/(P × T) = (P × 100)/(P × 8) = 12.5%",
        difficulty: "hard",
        points: 1
      },
      {
        question: "If A:B = 2:3 and B:C = 4:5, what is A:C?",
        type: "multiple-choice",
        options: ["8:15", "2:5", "3:5", "4:15"],
        correctAnswer: "8:15",
        explanation: "A:B:C = 8:12:15, so A:C = 8:15",
        difficulty: "hard",
        points: 1
      },
      {
        question: "The average of 5 numbers is 27. If one number is excluded, the average becomes 25. What is the excluded number?",
        type: "multiple-choice",
        options: ["30", "33", "35", "37"],
        correctAnswer: "35",
        explanation: "Sum of 5 = 135, Sum of 4 = 100, Excluded = 135-100 = 35",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A pipe can fill a tank in 6 hours. Another pipe can empty it in 8 hours. If both are opened, how long to fill the tank?",
        type: "multiple-choice",
        options: ["20 hours", "22 hours", "24 hours", "26 hours"],
        correctAnswer: "24 hours",
        explanation: "Net rate = 1/6 - 1/8 = 1/24 per hour. Time = 24 hours",
        difficulty: "hard",
        points: 1
      },
      {
        question: "In a class of 60 students, 40% are girls. How many boys are there?",
        type: "multiple-choice",
        options: ["24", "30", "36", "40"],
        correctAnswer: "36",
        explanation: "Boys = 60% of 60 = 36",
        difficulty: "easy",
        points: 1
      }
    ]
  },
  {
    title: "Quantitative Aptitude - Advanced",
    description: "Complex numerical problems for competitive exams",
    category: "aptitude",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "A man buys 3 items for $500 each. He sells them at profits of 10%, 20%, and 30%. What is his overall profit percentage?",
        type: "multiple-choice",
        options: ["18%", "20%", "22%", "25%"],
        correctAnswer: "20%",
        explanation: "Total CP = 1500, Total SP = 550+600+650 = 1800, Profit% = 300/1500 × 100 = 20%",
        difficulty: "medium",
        points: 1
      },
      {
        question: "If log₂(x) = 5, what is the value of x?",
        type: "multiple-choice",
        options: ["10", "16", "25", "32"],
        correctAnswer: "32",
        explanation: "log₂(x) = 5 means 2⁵ = x, so x = 32",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A boat travels 30 km upstream in 6 hours and 30 km downstream in 3 hours. What is the speed of the stream?",
        type: "multiple-choice",
        options: ["2.5 km/h", "3 km/h", "3.5 km/h", "4 km/h"],
        correctAnswer: "2.5 km/h",
        explanation: "Upstream speed = 5 km/h, Downstream = 10 km/h. Stream speed = (10-5)/2 = 2.5 km/h",
        difficulty: "hard",
        points: 1
      },
      {
        question: "The compound interest on $10,000 for 2 years at 10% per annum is:",
        type: "multiple-choice",
        options: ["$2,000", "$2,050", "$2,100", "$2,200"],
        correctAnswer: "$2,100",
        explanation: "A = 10000(1.1)² = 12100, CI = 12100 - 10000 = $2,100",
        difficulty: "medium",
        points: 1
      },
      {
        question: "If x² - 5x + 6 = 0, what are the values of x?",
        type: "multiple-choice",
        options: ["1, 6", "2, 3", "-2, -3", "1, 5"],
        correctAnswer: "2, 3",
        explanation: "(x-2)(x-3) = 0, so x = 2 or x = 3",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A mixture contains milk and water in ratio 5:3. If 16 liters of water is added, the ratio becomes 5:7. Find the initial quantity of milk.",
        type: "multiple-choice",
        options: ["20 liters", "25 liters", "30 liters", "40 liters"],
        correctAnswer: "20 liters",
        explanation: "Let milk = 5x, water = 3x. After adding: 5x/(3x+16) = 5/7. Solving: x = 4, milk = 20L",
        difficulty: "hard",
        points: 1
      },
      {
        question: "What is the probability of getting at least one head when flipping 3 coins?",
        type: "multiple-choice",
        options: ["5/8", "7/8", "3/4", "1/2"],
        correctAnswer: "7/8",
        explanation: "P(at least 1 head) = 1 - P(all tails) = 1 - 1/8 = 7/8",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A number when divided by 5 leaves remainder 3. What is the remainder when the square of the number is divided by 5?",
        type: "multiple-choice",
        options: ["1", "2", "3", "4"],
        correctAnswer: "4",
        explanation: "Let n = 5k+3. n² = 25k² + 30k + 9 = 5(5k² + 6k + 1) + 4. Remainder = 4",
        difficulty: "hard",
        points: 1
      },
      {
        question: "If the perimeter of a rectangle is 60 cm and length is twice the breadth, what is the area?",
        type: "multiple-choice",
        options: ["150 cm²", "180 cm²", "200 cm²", "240 cm²"],
        correctAnswer: "200 cm²",
        explanation: "2(l+b) = 60, l = 2b. So 6b = 60, b = 10, l = 20. Area = 200 cm²",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A clock shows 3:00. What is the angle between hour and minute hands?",
        type: "multiple-choice",
        options: ["75°", "90°", "105°", "120°"],
        correctAnswer: "90°",
        explanation: "At 3:00, hour hand at 90° and minute hand at 0°. Angle = 90°",
        difficulty: "easy",
        points: 1
      }
    ]
  },
  {
    title: "Data Interpretation & Analysis",
    description: "Real-world data analysis questions from top companies",
    category: "aptitude",
    difficulty: "hard",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "A company's revenue grew from $2M to $3.2M. What is the percentage increase?",
        type: "multiple-choice",
        options: ["50%", "55%", "60%", "65%"],
        correctAnswer: "60%",
        explanation: "Increase = 1.2M. Percentage = (1.2/2) × 100 = 60%",
        difficulty: "easy",
        points: 1
      },
      {
        question: "If 30% of employees work remotely and there are 420 remote workers, what is the total workforce?",
        type: "multiple-choice",
        options: ["1200", "1300", "1400", "1500"],
        correctAnswer: "1400",
        explanation: "30% = 420, so 100% = 420 × (100/30) = 1400",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A product's price increased by 25% and then decreased by 20%. What is the net change?",
        type: "multiple-choice",
        options: ["0% (no change)", "5% decrease", "5% increase", "10% increase"],
        correctAnswer: "0% (no change)",
        explanation: "Let price = 100. After increase: 125. After decrease: 125 × 0.8 = 100. Net = 0%",
        difficulty: "hard",
        points: 1
      },
      {
        question: "In a survey of 500 people, 60% use Product A, 50% use Product B, and 30% use both. How many use neither?",
        type: "multiple-choice",
        options: ["50", "75", "100", "125"],
        correctAnswer: "100",
        explanation: "A or B = 60% + 50% - 30% = 80%. Neither = 20% of 500 = 100",
        difficulty: "hard",
        points: 1
      },
      {
        question: "A dataset has values: 10, 20, 30, 40, 50. What is the standard deviation? (approximate)",
        type: "multiple-choice",
        options: ["12.25", "14.14", "15.81", "17.32"],
        correctAnswer: "14.14",
        explanation: "Mean = 30, Variance = 200, SD = √200 ≈ 14.14",
        difficulty: "hard",
        points: 1
      },
      {
        question: "If sales increase by 10% each quarter, what is the approximate annual growth rate?",
        type: "multiple-choice",
        options: ["40%", "44%", "46%", "50%"],
        correctAnswer: "46%",
        explanation: "Annual = (1.1)⁴ - 1 = 1.4641 - 1 = 46.41%",
        difficulty: "hard",
        points: 1
      },
      {
        question: "A company has a profit margin of 15% and revenue of $800K. What is the profit?",
        type: "multiple-choice",
        options: ["$100K", "$110K", "$120K", "$130K"],
        correctAnswer: "$120K",
        explanation: "Profit = 15% of 800K = $120K",
        difficulty: "easy",
        points: 1
      },
      {
        question: "If the ratio of men to women in a company is 3:2 and there are 150 men, how many total employees?",
        type: "multiple-choice",
        options: ["200", "225", "250", "275"],
        correctAnswer: "250",
        explanation: "Men = 3x = 150, so x = 50. Total = 5x = 250",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A project was completed in 80 days instead of 100 days. What is the percentage time saved?",
        type: "multiple-choice",
        options: ["15%", "18%", "20%", "25%"],
        correctAnswer: "20%",
        explanation: "Time saved = 20 days. Percentage = (20/100) × 100 = 20%",
        difficulty: "easy",
        points: 1
      },
      {
        question: "If conversion rate is 2.5% and there are 400 conversions, how many visitors were there?",
        type: "multiple-choice",
        options: ["14,000", "15,000", "16,000", "18,000"],
        correctAnswer: "16,000",
        explanation: "2.5% = 400, so 100% = 400 × 40 = 16,000",
        difficulty: "medium",
        points: 1
      }
    ]
  },
  {
    title: "Problem Solving & Puzzles",
    description: "Logic puzzles asked in FAANG interviews",
    category: "aptitude",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "You have 8 balls, one is heavier. Using a balance scale only twice, can you find the heavier ball?",
        type: "multiple-choice",
        options: ["Yes, always possible", "No, need 3 weighings", "Only if lucky", "Depends on the balls"],
        correctAnswer: "Yes, always possible",
        explanation: "Divide into 3 groups (3,3,2). First weighing identifies the group, second finds the ball",
        difficulty: "hard",
        points: 1
      },
      {
        question: "A snail climbs 3 feet up a 10-foot wall each day but slides down 2 feet at night. How many days to reach the top?",
        type: "multiple-choice",
        options: ["7 days", "8 days", "9 days", "10 days"],
        correctAnswer: "8 days",
        explanation: "On day 8, snail reaches 10 feet during the day and doesn't slide back",
        difficulty: "medium",
        points: 1
      },
      {
        question: "If you overtake the person in 2nd place in a race, what position are you in?",
        type: "multiple-choice",
        options: ["1st place", "2nd place", "3rd place", "Cannot determine"],
        correctAnswer: "2nd place",
        explanation: "You take their position, which was 2nd place",
        difficulty: "easy",
        points: 1
      },
      {
        question: "A clock shows 3:15. How many degrees has the minute hand moved from 12?",
        type: "multiple-choice",
        options: ["75°", "90°", "105°", "120°"],
        correctAnswer: "90°",
        explanation: "15 minutes = 15/60 × 360° = 90°",
        difficulty: "medium",
        points: 1
      },
      {
        question: "You have two ropes that each take 60 minutes to burn completely. How can you measure 45 minutes?",
        type: "multiple-choice",
        options: ["Light one rope at both ends and other at one end", "Light both at one end", "Cut one rope in half", "Cannot be done"],
        correctAnswer: "Light one rope at both ends and other at one end",
        explanation: "First rope burns in 30 min (both ends). Then light other end of second rope for remaining 15 min",
        difficulty: "hard",
        points: 1
      },
      {
        question: "A father is 3 times as old as his son. In 15 years, he'll be twice as old. How old is the son now?",
        type: "multiple-choice",
        options: ["10 years", "12 years", "15 years", "18 years"],
        correctAnswer: "15 years",
        explanation: "Let son = x, father = 3x. In 15 years: 3x+15 = 2(x+15). Solving: x = 15",
        difficulty: "medium",
        points: 1
      },
      {
        question: "How many times do the hour and minute hands of a clock overlap in 24 hours?",
        type: "multiple-choice",
        options: ["22", "24", "44", "48"],
        correctAnswer: "22",
        explanation: "They overlap 11 times in 12 hours (not at 11), so 22 times in 24 hours",
        difficulty: "hard",
        points: 1
      },
      {
        question: "A bat and ball cost $1.10 together. The bat costs $1 more than the ball. How much does the ball cost?",
        type: "multiple-choice",
        options: ["$0.05", "$0.10", "$0.15", "$0.20"],
        correctAnswer: "$0.05",
        explanation: "Ball = x, Bat = x+1. So x + (x+1) = 1.10. Solving: x = 0.05",
        difficulty: "medium",
        points: 1
      },
      {
        question: "If 5 machines make 5 widgets in 5 minutes, how long for 100 machines to make 100 widgets?",
        type: "multiple-choice",
        options: ["5 minutes", "20 minutes", "100 minutes", "500 minutes"],
        correctAnswer: "5 minutes",
        explanation: "Each machine makes 1 widget in 5 minutes, regardless of number of machines",
        difficulty: "medium",
        points: 1
      },
      {
        question: "A book has 500 pages. How many times does the digit '1' appear in the page numbers?",
        type: "multiple-choice",
        options: ["150", "200", "250", "300"],
        correctAnswer: "200",
        explanation: "Units: 50, Tens: 50, Hundreds: 100. Total = 200",
        difficulty: "hard",
        points: 1
      }
    ]
  },
  {
    title: "Speed Math & Mental Calculation",
    description: "Quick calculation skills for technical rounds",
    category: "aptitude",
    difficulty: "easy",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "What is 25 × 24?",
        type: "multiple-choice",
        options: ["500", "550", "600", "650"],
        correctAnswer: "600",
        explanation: "25 × 24 = 25 × 4 × 6 = 100 × 6 = 600",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is 15% of 80?",
        type: "multiple-choice",
        options: ["10", "12", "14", "16"],
        correctAnswer: "12",
        explanation: "15% of 80 = 10% + 5% = 8 + 4 = 12",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is 48 ÷ 0.8?",
        type: "multiple-choice",
        options: ["50", "55", "60", "65"],
        correctAnswer: "60",
        explanation: "48 ÷ 0.8 = 480 ÷ 8 = 60",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is 17²?",
        type: "multiple-choice",
        options: ["269", "279", "289", "299"],
        correctAnswer: "289",
        explanation: "17² = (20-3)² = 400 - 120 + 9 = 289",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is 999 + 888 + 777?",
        type: "multiple-choice",
        options: ["2554", "2614", "2664", "2714"],
        correctAnswer: "2664",
        explanation: "1000 + 900 + 800 - 3 - 12 - 23 = 2700 - 36 = 2664",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is 64 × 125?",
        type: "multiple-choice",
        options: ["7000", "7500", "8000", "8500"],
        correctAnswer: "8000",
        explanation: "64 × 125 = 8 × 8 × 125 = 8 × 1000 = 8000",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is √144 + √169?",
        type: "multiple-choice",
        options: ["23", "24", "25", "26"],
        correctAnswer: "25",
        explanation: "√144 = 12, √169 = 13. Sum = 25",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is 20% of 20% of 500?",
        type: "multiple-choice",
        options: ["15", "20", "25", "30"],
        correctAnswer: "20",
        explanation: "20% of 500 = 100. 20% of 100 = 20",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is 3³ + 4³?",
        type: "multiple-choice",
        options: ["81", "91", "99", "109"],
        correctAnswer: "91",
        explanation: "3³ = 27, 4³ = 64. Sum = 91",
        difficulty: "easy",
        points: 1
      },
      {
        question: "If x = 5, what is 2x² - 3x + 1?",
        type: "multiple-choice",
        options: ["34", "36", "38", "40"],
        correctAnswer: "36",
        explanation: "2(25) - 15 + 1 = 50 - 15 + 1 = 36",
        difficulty: "medium",
        points: 1
      }
    ]
  }
];
