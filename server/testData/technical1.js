// Technical Tests 1-5: Programming fundamentals and CS concepts

export const technicalTests1 = [
  {
    title: "Data Structures Fundamentals",
    description: "Core data structure concepts for technical interviews",
    category: "technical",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "What is the time complexity of searching in a balanced Binary Search Tree?",
        type: "multiple-choice",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: "O(log n)",
        explanation: "BST search eliminates half the tree at each step, resulting in O(log n) complexity",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Which data structure uses LIFO (Last In First Out) principle?",
        type: "multiple-choice",
        options: ["Queue", "Stack", "Linked List", "Tree"],
        correctAnswer: "Stack",
        explanation: "Stack follows LIFO - the last element added is the first one removed",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is the worst-case time complexity of QuickSort?",
        type: "multiple-choice",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
        correctAnswer: "O(n²)",
        explanation: "QuickSort worst case occurs when pivot is always smallest/largest element",
        difficulty: "medium",
        points: 1
      },
      {
        question: "In a hash table with chaining, what happens when two keys hash to the same index?",
        type: "multiple-choice",
        options: ["One key is rejected", "Both stored in a linked list", "Table is resized", "Error is thrown"],
        correctAnswer: "Both stored in a linked list",
        explanation: "Chaining handles collisions by storing multiple values at same index using linked lists",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is the space complexity of merge sort?",
        type: "multiple-choice",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: "O(n)",
        explanation: "Merge sort requires O(n) auxiliary space for merging subarrays",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Which traversal of a BST gives elements in sorted order?",
        type: "multiple-choice",
        options: ["Preorder", "Inorder", "Postorder", "Level order"],
        correctAnswer: "Inorder",
        explanation: "Inorder traversal (left-root-right) of BST produces sorted sequence",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is the maximum number of nodes in a binary tree of height h?",
        type: "multiple-choice",
        options: ["2^h", "2^h - 1", "2^(h+1) - 1", "2^(h-1)"],
        correctAnswer: "2^(h+1) - 1",
        explanation: "Complete binary tree with height h has 2^(h+1) - 1 nodes",
        difficulty: "hard",
        points: 1
      },
      {
        question: "Which data structure is best for implementing LRU cache?",
        type: "multiple-choice",
        options: ["Array", "Stack", "HashMap + Doubly Linked List", "Binary Tree"],
        correctAnswer: "HashMap + Doubly Linked List",
        explanation: "HashMap for O(1) lookup, DLL for O(1) insertion/deletion at both ends",
        difficulty: "hard",
        points: 1
      },
      {
        question: "What is the time complexity of inserting at the beginning of a singly linked list?",
        type: "multiple-choice",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: "O(1)",
        explanation: "Inserting at head only requires updating the head pointer",
        difficulty: "easy",
        points: 1
      },
      {
        question: "In a min heap, where is the smallest element located?",
        type: "multiple-choice",
        options: ["At any leaf node", "At the root", "At the rightmost node", "At the deepest level"],
        correctAnswer: "At the root",
        explanation: "Min heap property ensures the smallest element is always at the root",
        difficulty: "easy",
        points: 1
      }
    ]
  },
  {
    title: "Algorithms & Complexity",
    description: "Algorithm design and analysis for coding interviews",
    category: "technical",
    difficulty: "hard",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "What is the time complexity of the following code?\nfor(i=0; i<n; i++) { for(j=i; j<n; j++) { print(i+j); } }",
        type: "multiple-choice",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
        correctAnswer: "O(n²)",
        explanation: "Outer loop runs n times, inner loop runs n, n-1, n-2... times. Total = n(n+1)/2 = O(n²)",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Which algorithm is used to find the shortest path in a weighted graph with no negative edges?",
        type: "multiple-choice",
        options: ["BFS", "DFS", "Dijkstra's", "Bellman-Ford"],
        correctAnswer: "Dijkstra's",
        explanation: "Dijkstra's algorithm efficiently finds shortest paths when all edge weights are non-negative",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is the optimal time complexity for sorting n integers in the range 0 to k?",
        type: "multiple-choice",
        options: ["O(n log n)", "O(n + k)", "O(nk)", "O(k log n)"],
        correctAnswer: "O(n + k)",
        explanation: "Counting sort achieves O(n + k) for integers in limited range",
        difficulty: "hard",
        points: 1
      },
      {
        question: "Which technique is used to solve the 0/1 Knapsack problem optimally?",
        type: "multiple-choice",
        options: ["Greedy", "Divide and Conquer", "Dynamic Programming", "Backtracking"],
        correctAnswer: "Dynamic Programming",
        explanation: "0/1 Knapsack has overlapping subproblems, making DP the optimal approach",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is the time complexity of finding if a cycle exists in an undirected graph using DFS?",
        type: "multiple-choice",
        options: ["O(V)", "O(E)", "O(V + E)", "O(V × E)"],
        correctAnswer: "O(V + E)",
        explanation: "DFS visits each vertex once and explores each edge once",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Which algorithm uses the 'divide and conquer' paradigm?",
        type: "multiple-choice",
        options: ["Bubble Sort", "Insertion Sort", "Merge Sort", "Selection Sort"],
        correctAnswer: "Merge Sort",
        explanation: "Merge sort divides array into halves, sorts them, and merges - classic divide and conquer",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is the space complexity of recursive Fibonacci implementation?",
        type: "multiple-choice",
        options: ["O(1)", "O(log n)", "O(n)", "O(2ⁿ)"],
        correctAnswer: "O(n)",
        explanation: "Maximum recursion depth is n, requiring O(n) call stack space",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Which data structure is used in Breadth First Search?",
        type: "multiple-choice",
        options: ["Stack", "Queue", "Priority Queue", "Hash Table"],
        correctAnswer: "Queue",
        explanation: "BFS uses queue to process nodes level by level in FIFO order",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is the time complexity of building a max heap from an unsorted array?",
        type: "multiple-choice",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correctAnswer: "O(n)",
        explanation: "Heapify operation on n elements takes O(n) time, not O(n log n)",
        difficulty: "hard",
        points: 1
      },
      {
        question: "Which algorithm is best for finding strongly connected components in a directed graph?",
        type: "multiple-choice",
        options: ["BFS", "Dijkstra's", "Kosaraju's", "Prim's"],
        correctAnswer: "Kosaraju's",
        explanation: "Kosaraju's algorithm uses two DFS passes to find strongly connected components",
        difficulty: "hard",
        points: 1
      }
    ]
  },
  {
    title: "Object-Oriented Programming",
    description: "OOP concepts tested in software engineering interviews",
    category: "technical",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "Which OOP principle allows a child class to provide specific implementation of a method already defined in parent class?",
        type: "multiple-choice",
        options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
        correctAnswer: "Polymorphism",
        explanation: "Polymorphism (specifically method overriding) allows child classes to redefine parent methods",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is the purpose of a constructor in a class?",
        type: "multiple-choice",
        options: ["To destroy objects", "To initialize objects", "To copy objects", "To compare objects"],
        correctAnswer: "To initialize objects",
        explanation: "Constructor is called when object is created to initialize its state",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Which keyword is used to prevent method overriding in Java?",
        type: "multiple-choice",
        options: ["static", "final", "private", "abstract"],
        correctAnswer: "final",
        explanation: "Final methods cannot be overridden by subclasses",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is the difference between abstract class and interface in Java?",
        type: "multiple-choice",
        options: ["No difference", "Abstract class can have constructors, interface cannot", "Interface can have constructors", "Both are same"],
        correctAnswer: "Abstract class can have constructors, interface cannot",
        explanation: "Abstract classes can have constructors and state, interfaces cannot (before Java 8)",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What does the 'this' keyword refer to in a class?",
        type: "multiple-choice",
        options: ["Parent class", "Current object", "Child class", "Static members"],
        correctAnswer: "Current object",
        explanation: "'this' refers to the current instance of the class",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Which principle suggests 'Program to an interface, not an implementation'?",
        type: "multiple-choice",
        options: ["Encapsulation", "Dependency Inversion", "Single Responsibility", "Open/Closed"],
        correctAnswer: "Dependency Inversion",
        explanation: "Dependency Inversion Principle advocates depending on abstractions rather than concrete classes",
        difficulty: "hard",
        points: 1
      },
      {
        question: "What is method overloading?",
        type: "multiple-choice",
        options: ["Same method name, different parameters", "Same method name, same parameters", "Different method names", "Overriding parent method"],
        correctAnswer: "Same method name, different parameters",
        explanation: "Method overloading allows multiple methods with same name but different parameter lists",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Which design pattern ensures a class has only one instance?",
        type: "multiple-choice",
        options: ["Factory", "Singleton", "Observer", "Strategy"],
        correctAnswer: "Singleton",
        explanation: "Singleton pattern restricts class instantiation to a single object",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is encapsulation?",
        type: "multiple-choice",
        options: ["Hiding implementation details", "Creating multiple objects", "Inheriting properties", "Overriding methods"],
        correctAnswer: "Hiding implementation details",
        explanation: "Encapsulation bundles data and methods, hiding internal details from outside",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Can we override static methods in Java?",
        type: "multiple-choice",
        options: ["Yes, always", "No, they are hidden not overridden", "Only in abstract classes", "Only with final keyword"],
        correctAnswer: "No, they are hidden not overridden",
        explanation: "Static methods belong to class, not instance. They can be hidden but not overridden",
        difficulty: "hard",
        points: 1
      }
    ]
  },
  {
    title: "Database & SQL Mastery",
    description: "Database concepts for backend engineering roles",
    category: "technical",
    difficulty: "medium",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "Which SQL clause is used to filter groups in aggregate queries?",
        type: "multiple-choice",
        options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
        correctAnswer: "HAVING",
        explanation: "HAVING filters groups after GROUP BY, WHERE filters rows before grouping",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is a primary key?",
        type: "multiple-choice",
        options: ["Can have NULL values", "Uniquely identifies each record", "Can have duplicates", "Optional in tables"],
        correctAnswer: "Uniquely identifies each record",
        explanation: "Primary key uniquely identifies each row and cannot be NULL",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Which JOIN returns all records from both tables, matching where possible?",
        type: "multiple-choice",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
        correctAnswer: "FULL OUTER JOIN",
        explanation: "FULL OUTER JOIN returns all records from both tables, with NULLs where no match",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is normalization in databases?",
        type: "multiple-choice",
        options: ["Increasing redundancy", "Organizing data to reduce redundancy", "Deleting data", "Backing up data"],
        correctAnswer: "Organizing data to reduce redundancy",
        explanation: "Normalization structures data to minimize redundancy and dependency",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Which normal form eliminates transitive dependencies?",
        type: "multiple-choice",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        correctAnswer: "3NF",
        explanation: "Third Normal Form (3NF) removes transitive dependencies",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is an index in a database?",
        type: "multiple-choice",
        options: ["A backup copy", "A data structure for faster queries", "A type of constraint", "A stored procedure"],
        correctAnswer: "A data structure for faster queries",
        explanation: "Index is a data structure that improves query performance at cost of storage and write speed",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Which isolation level prevents dirty reads but allows non-repeatable reads?",
        type: "multiple-choice",
        options: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"],
        correctAnswer: "READ COMMITTED",
        explanation: "READ COMMITTED prevents dirty reads but allows non-repeatable reads and phantom reads",
        difficulty: "hard",
        points: 1
      },
      {
        question: "What does ACID stand for in database transactions?",
        type: "multiple-choice",
        options: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Completeness, Integrity, Dependency", "Access, Control, Identity, Data", "None of these"],
        correctAnswer: "Atomicity, Consistency, Isolation, Durability",
        explanation: "ACID properties ensure reliable database transactions",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Which SQL command is used to remove a table from database?",
        type: "multiple-choice",
        options: ["DELETE", "REMOVE", "DROP", "TRUNCATE"],
        correctAnswer: "DROP",
        explanation: "DROP TABLE removes the entire table structure and data",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is a foreign key?",
        type: "multiple-choice",
        options: ["Primary key in another table", "Links two tables together", "Must be unique", "Cannot be NULL"],
        correctAnswer: "Links two tables together",
        explanation: "Foreign key creates relationship between tables by referencing primary key of another table",
        difficulty: "easy",
        points: 1
      }
    ]
  },
  {
    title: "System Design Basics",
    description: "Fundamental system design concepts for interviews",
    category: "technical",
    difficulty: "hard",
    duration: 20,
    passingScore: 60,
    questions: [
      {
        question: "What is horizontal scaling?",
        type: "multiple-choice",
        options: ["Adding more power to existing server", "Adding more servers", "Increasing database size", "Optimizing code"],
        correctAnswer: "Adding more servers",
        explanation: "Horizontal scaling (scale out) adds more machines to handle increased load",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Which caching strategy updates cache only when data is requested and not found?",
        type: "multiple-choice",
        options: ["Write-through", "Write-back", "Lazy loading", "Write-around"],
        correctAnswer: "Lazy loading",
        explanation: "Lazy loading (cache-aside) loads data into cache only on cache miss",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is the CAP theorem?",
        type: "multiple-choice",
        options: ["Consistency, Availability, Partition tolerance", "Cache, API, Performance", "Capacity, Accuracy, Processing", "None of these"],
        correctAnswer: "Consistency, Availability, Partition tolerance",
        explanation: "CAP theorem states distributed system can only guarantee 2 of 3: Consistency, Availability, Partition tolerance",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is a load balancer?",
        type: "multiple-choice",
        options: ["Distributes traffic across servers", "Stores cached data", "Manages databases", "Encrypts data"],
        correctAnswer: "Distributes traffic across servers",
        explanation: "Load balancer distributes incoming requests across multiple servers for better performance",
        difficulty: "easy",
        points: 1
      },
      {
        question: "Which database type is best for hierarchical data like JSON?",
        type: "multiple-choice",
        options: ["Relational", "Document-based", "Graph", "Key-value"],
        correctAnswer: "Document-based",
        explanation: "Document databases (like MongoDB) naturally store hierarchical JSON-like data",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is eventual consistency?",
        type: "multiple-choice",
        options: ["Data is always consistent", "Data becomes consistent over time", "Data is never consistent", "Data is partially consistent"],
        correctAnswer: "Data becomes consistent over time",
        explanation: "Eventual consistency means all replicas will eventually have same data, but not immediately",
        difficulty: "medium",
        points: 1
      },
      {
        question: "What is the purpose of a message queue?",
        type: "multiple-choice",
        options: ["Store files", "Asynchronous communication between services", "Cache data", "Load balancing"],
        correctAnswer: "Asynchronous communication between services",
        explanation: "Message queues enable async communication, decoupling services and improving reliability",
        difficulty: "medium",
        points: 1
      },
      {
        question: "Which protocol is stateless?",
        type: "multiple-choice",
        options: ["FTP", "HTTP", "TCP", "WebSocket"],
        correctAnswer: "HTTP",
        explanation: "HTTP is stateless - each request is independent with no memory of previous requests",
        difficulty: "easy",
        points: 1
      },
      {
        question: "What is database sharding?",
        type: "multiple-choice",
        options: ["Backing up data", "Partitioning data across multiple databases", "Replicating data", "Indexing data"],
        correctAnswer: "Partitioning data across multiple databases",
        explanation: "Sharding splits data horizontally across multiple database instances",
        difficulty: "hard",
        points: 1
      },
      {
        question: "What is the purpose of CDN (Content Delivery Network)?",
        type: "multiple-choice",
        options: ["Store databases", "Serve static content from locations closer to users", "Process payments", "Manage user authentication"],
        correctAnswer: "Serve static content from locations closer to users",
        explanation: "CDN caches and serves static content from geographically distributed servers for faster delivery",
        difficulty: "easy",
        points: 1
      }
    ]
  }
];
