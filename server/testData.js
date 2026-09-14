// Main test data aggregator
import { aptitudeTests1 } from './testData/aptitude1.js';
import { technicalTests1 } from './testData/technical1.js';
import { logicalTests1 } from './testData/logical1.js';
import { verbalTests1 } from './testData/verbal1.js';

// Coding tests defined inline due to file system issues
const codingTests1 = [
  {
    title: "JavaScript Fundamentals",
    description: "Core JavaScript concepts for frontend roles",
    category: "coding",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "What is the output of: console.log(typeof null)?",
        type: "multiple-choice",
        options: ["'null'", "'undefined'", "'object'", "'number'"],
        correctAnswer: "'object'",
        explanation: "This is a known JavaScript quirk. typeof null returns 'object' due to a bug in the original JavaScript implementation.",
        difficulty: "easy",
        points: 1,
        tags: ["javascript", "types"]
      },
      {
        question: "What will be logged? let x = 10; function test() { console.log(x); let x = 20; } test();",
        type: "multiple-choice",
        options: ["10", "20", "undefined", "ReferenceError"],
        correctAnswer: "ReferenceError",
        explanation: "This is the Temporal Dead Zone. The variable x is hoisted but not initialized until the let declaration is reached.",
        difficulty: "medium",
        points: 2,
        tags: ["javascript", "hoisting", "tdz"]
      },
      {
        question: "Which method is used to add elements to the end of an array?",
        type: "multiple-choice",
        options: ["push()", "pop()", "shift()", "unshift()"],
        correctAnswer: "push()",
        explanation: "push() adds one or more elements to the end of an array and returns the new length.",
        difficulty: "easy",
        points: 1,
        tags: ["javascript", "arrays"]
      },
      {
        question: "What is the output of: console.log(0.1 + 0.2 === 0.3)?",
        type: "multiple-choice",
        options: ["true", "false", "undefined", "NaN"],
        correctAnswer: "false",
        explanation: "Due to floating-point precision issues, 0.1 + 0.2 equals 0.30000000000000004, not exactly 0.3.",
        difficulty: "medium",
        points: 2,
        tags: ["javascript", "numbers", "floating-point"]
      },
      {
        question: "What does the spread operator (...) do in JavaScript?",
        type: "multiple-choice",
        options: [
          "Combines arrays only",
          "Expands iterables into individual elements",
          "Creates deep copies",
          "Removes duplicates"
        ],
        correctAnswer: "Expands iterables into individual elements",
        explanation: "The spread operator expands iterables (arrays, strings, objects) into individual elements.",
        difficulty: "easy",
        points: 1,
        tags: ["javascript", "es6", "spread"]
      }
    ]
  },
  {
    title: "Python Programming Basics",
    description: "Essential Python concepts for backend development",
    category: "coding",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "What is the output of: print(type([]))?",
        type: "multiple-choice",
        options: ["<class 'array'>", "<class 'list'>", "<class 'tuple'>", "<class 'dict'>"],
        correctAnswer: "<class 'list'>",
        explanation: "[] creates an empty list in Python, and type() returns <class 'list'>.",
        difficulty: "easy",
        points: 1,
        tags: ["python", "types", "lists"]
      },
      {
        question: "Which of the following is mutable in Python?",
        type: "multiple-choice",
        options: ["tuple", "string", "list", "int"],
        correctAnswer: "list",
        explanation: "Lists are mutable in Python, meaning their contents can be changed after creation.",
        difficulty: "easy",
        points: 1,
        tags: ["python", "mutability"]
      },
      {
        question: "What does the 'self' parameter represent in Python class methods?",
        type: "multiple-choice",
        options: [
          "The class itself",
          "The instance of the class",
          "The parent class",
          "A static reference"
        ],
        correctAnswer: "The instance of the class",
        explanation: "self refers to the instance of the class, allowing access to instance attributes and methods.",
        difficulty: "medium",
        points: 2,
        tags: ["python", "oop", "classes"]
      },
      {
        question: "What is the output of: print(bool([]))?",
        type: "multiple-choice",
        options: ["True", "False", "None", "Error"],
        correctAnswer: "False",
        explanation: "An empty list evaluates to False in Python. Empty collections are falsy values.",
        difficulty: "easy",
        points: 1,
        tags: ["python", "boolean", "truthiness"]
      },
      {
        question: "Which keyword is used to create a function in Python?",
        type: "multiple-choice",
        options: ["function", "def", "func", "define"],
        correctAnswer: "def",
        explanation: "The 'def' keyword is used to define functions in Python.",
        difficulty: "easy",
        points: 1,
        tags: ["python", "functions", "syntax"]
      }
    ]
  },
  {
    title: "Data Structures & Algorithms",
    description: "Common DSA questions from tech interviews",
    category: "coding",
    difficulty: "hard",
    duration: 25,
    passingScore: 65,
    questions: [
      {
        question: "What is the time complexity of binary search?",
        type: "multiple-choice",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        correctAnswer: "O(log n)",
        explanation: "Binary search divides the search space in half each iteration, resulting in O(log n) time complexity.",
        difficulty: "medium",
        points: 2,
        tags: ["algorithms", "complexity", "search"]
      },
      {
        question: "Which data structure uses LIFO (Last In First Out)?",
        type: "multiple-choice",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: "Stack",
        explanation: "A stack follows LIFO principle where the last element added is the first one removed.",
        difficulty: "easy",
        points: 1,
        tags: ["data-structures", "stack"]
      },
      {
        question: "What is the worst-case time complexity of QuickSort?",
        type: "multiple-choice",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correctAnswer: "O(n²)",
        explanation: "QuickSort has O(n²) worst-case when the pivot is always the smallest or largest element.",
        difficulty: "hard",
        points: 3,
        tags: ["algorithms", "sorting", "complexity"]
      },
      {
        question: "In a hash table, what is a collision?",
        type: "multiple-choice",
        options: [
          "When two keys have the same value",
          "When two different keys hash to the same index",
          "When the table is full",
          "When a key is not found"
        ],
        correctAnswer: "When two different keys hash to the same index",
        explanation: "A collision occurs when the hash function maps two different keys to the same index.",
        difficulty: "medium",
        points: 2,
        tags: ["data-structures", "hashing"]
      },
      {
        question: "What is the space complexity of merge sort?",
        type: "multiple-choice",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: "O(n)",
        explanation: "Merge sort requires O(n) additional space for the temporary arrays used during merging.",
        difficulty: "medium",
        points: 2,
        tags: ["algorithms", "sorting", "space-complexity"]
      }
    ]
  },
  {
    title: "React & Frontend Development",
    description: "Modern React concepts and best practices",
    category: "coding",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "What is the purpose of useEffect hook in React?",
        type: "multiple-choice",
        options: [
          "To manage component state",
          "To perform side effects in function components",
          "To create context",
          "To optimize rendering"
        ],
        correctAnswer: "To perform side effects in function components",
        explanation: "useEffect allows you to perform side effects like data fetching, subscriptions, or DOM manipulation.",
        difficulty: "medium",
        points: 2,
        tags: ["react", "hooks", "useEffect"]
      },
      {
        question: "What does the virtual DOM do in React?",
        type: "multiple-choice",
        options: [
          "Replaces the real DOM",
          "Creates a lightweight copy for efficient updates",
          "Stores component state",
          "Handles routing"
        ],
        correctAnswer: "Creates a lightweight copy for efficient updates",
        explanation: "Virtual DOM is a lightweight representation that React uses to minimize expensive DOM operations.",
        difficulty: "medium",
        points: 2,
        tags: ["react", "virtual-dom", "performance"]
      },
      {
        question: "Which hook would you use to access context in a functional component?",
        type: "multiple-choice",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctAnswer: "useContext",
        explanation: "useContext hook allows functional components to consume context values.",
        difficulty: "easy",
        points: 1,
        tags: ["react", "hooks", "context"]
      },
      {
        question: "What is prop drilling in React?",
        type: "multiple-choice",
        options: [
          "Passing props through multiple component layers",
          "Validating prop types",
          "Creating default props",
          "Destructuring props"
        ],
        correctAnswer: "Passing props through multiple component layers",
        explanation: "Prop drilling is passing data through multiple intermediate components to reach a deeply nested component.",
        difficulty: "medium",
        points: 2,
        tags: ["react", "props", "patterns"]
      },
      {
        question: "What does React.memo() do?",
        type: "multiple-choice",
        options: [
          "Stores component state",
          "Prevents unnecessary re-renders by memoizing components",
          "Creates context providers",
          "Handles async operations"
        ],
        correctAnswer: "Prevents unnecessary re-renders by memoizing components",
        explanation: "React.memo() is a higher-order component that memoizes the result to prevent unnecessary re-renders.",
        difficulty: "medium",
        points: 2,
        tags: ["react", "optimization", "memo"]
      }
    ]
  },
  {
    title: "SQL & Database Concepts",
    description: "Database queries and relational concepts",
    category: "coding",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "Which SQL clause is used to filter results?",
        type: "multiple-choice",
        options: ["SELECT", "WHERE", "FROM", "ORDER BY"],
        correctAnswer: "WHERE",
        explanation: "The WHERE clause is used to filter records based on specified conditions.",
        difficulty: "easy",
        points: 1,
        tags: ["sql", "queries"]
      },
      {
        question: "What does INNER JOIN return?",
        type: "multiple-choice",
        options: [
          "All records from both tables",
          "Only matching records from both tables",
          "All records from the left table",
          "All records from the right table"
        ],
        correctAnswer: "Only matching records from both tables",
        explanation: "INNER JOIN returns only the rows where there is a match in both tables.",
        difficulty: "medium",
        points: 2,
        tags: ["sql", "joins"]
      },
      {
        question: "What is a primary key?",
        type: "multiple-choice",
        options: [
          "A key that can have duplicate values",
          "A unique identifier for each record in a table",
          "A foreign key reference",
          "An index for faster queries"
        ],
        correctAnswer: "A unique identifier for each record in a table",
        explanation: "A primary key uniquely identifies each record in a table and cannot contain NULL values.",
        difficulty: "easy",
        points: 1,
        tags: ["sql", "database-design", "keys"]
      },
      {
        question: "Which SQL function returns the number of rows?",
        type: "multiple-choice",
        options: ["SUM()", "COUNT()", "AVG()", "MAX()"],
        correctAnswer: "COUNT()",
        explanation: "COUNT() returns the number of rows that match the specified criteria.",
        difficulty: "easy",
        points: 1,
        tags: ["sql", "aggregate-functions"]
      },
      {
        question: "What does the GROUP BY clause do?",
        type: "multiple-choice",
        options: [
          "Sorts the results",
          "Filters the results",
          "Groups rows with the same values",
          "Joins multiple tables"
        ],
        correctAnswer: "Groups rows with the same values",
        explanation: "GROUP BY groups rows that have the same values in specified columns, often used with aggregate functions.",
        difficulty: "medium",
        points: 2,
        tags: ["sql", "grouping", "aggregation"]
      }
    ]
  }
];

export const generateTests = () => {
  return [
    ...aptitudeTests1,
    ...technicalTests1,
    ...logicalTests1,
    ...verbalTests1,
    ...codingTests1
  ];
};
