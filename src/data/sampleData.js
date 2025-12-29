// Sample flashcards and skill tree data for initial setup

export const sampleFlashcards = [
  // JavaScript category
  {
    id: 'js_1',
    front: 'What is a closure in JavaScript?',
    back: 'A closure is a function that has access to variables from its outer (enclosing) scope, even after the outer function has returned.',
    category: 'JavaScript',
    skill: 'js_functions',
  },
  {
    id: 'js_2',
    front: 'What is the difference between let and var?',
    back: 'let is block-scoped while var is function-scoped. let also doesn\'t allow redeclaration and has no hoisting behavior for the value.',
    category: 'JavaScript',
    skill: 'js_basics',
  },
  {
    id: 'js_3',
    front: 'What is the event loop in JavaScript?',
    back: 'The event loop is a mechanism that allows JavaScript to perform non-blocking operations by offloading operations to the system kernel and processing callbacks when operations complete.',
    category: 'JavaScript',
    skill: 'js_async',
  },
  {
    id: 'js_4',
    front: 'What is Promise.all()?',
    back: 'Promise.all() takes an array of promises and returns a single promise that resolves when all input promises resolve, or rejects if any input promise rejects.',
    category: 'JavaScript',
    skill: 'js_async',
  },
  {
    id: 'js_5',
    front: 'What is the spread operator (...)?',
    back: 'The spread operator expands iterables into individual elements. It can be used to copy arrays, merge objects, or pass array elements as function arguments.',
    category: 'JavaScript',
    skill: 'js_basics',
  },

  // React category
  {
    id: 'react_1',
    front: 'What is the Virtual DOM?',
    back: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to optimize updates by comparing changes and only updating what\'s necessary.',
    category: 'React',
    skill: 'react_core',
  },
  {
    id: 'react_2',
    front: 'What are React Hooks?',
    back: 'Hooks are functions that let you use state and other React features in functional components. Common hooks include useState, useEffect, useContext, and useRef.',
    category: 'React',
    skill: 'react_hooks',
  },
  {
    id: 'react_3',
    front: 'What is useEffect used for?',
    back: 'useEffect is a hook for handling side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.',
    category: 'React',
    skill: 'react_hooks',
  },
  {
    id: 'react_4',
    front: 'What is the difference between controlled and uncontrolled components?',
    back: 'Controlled components have their state managed by React via props and callbacks. Uncontrolled components manage their own internal state via refs.',
    category: 'React',
    skill: 'react_forms',
  },
  {
    id: 'react_5',
    front: 'What is React Context?',
    back: 'Context provides a way to pass data through the component tree without having to pass props manually at every level. It\'s useful for global state like themes or user data.',
    category: 'React',
    skill: 'react_state',
  },

  // CSS category
  {
    id: 'css_1',
    front: 'What is the CSS Box Model?',
    back: 'The box model describes how elements are rendered: content box, padding, border, and margin. Each element is a rectangular box with these four areas.',
    category: 'CSS',
    skill: 'css_layout',
  },
  {
    id: 'css_2',
    front: 'What is Flexbox?',
    back: 'Flexbox is a one-dimensional layout method for arranging items in rows or columns. It provides powerful alignment and distribution capabilities.',
    category: 'CSS',
    skill: 'css_layout',
  },
  {
    id: 'css_3',
    front: 'What is CSS Grid?',
    back: 'CSS Grid is a two-dimensional layout system that allows you to create complex layouts with rows and columns. It\'s ideal for page layouts and card grids.',
    category: 'CSS',
    skill: 'css_layout',
  },
  {
    id: 'css_4',
    front: 'What is specificity in CSS?',
    back: 'Specificity determines which CSS rule applies when multiple rules target the same element. It\'s calculated based on selector types: inline > ID > class > element.',
    category: 'CSS',
    skill: 'css_basics',
  },
  {
    id: 'css_5',
    front: 'What are CSS custom properties (variables)?',
    back: 'CSS custom properties are entities defined by authors that contain specific values to be reused throughout a document. They\'re defined with -- prefix and accessed via var().',
    category: 'CSS',
    skill: 'css_basics',
  },

  // Data Structures category
  {
    id: 'ds_1',
    front: 'What is Big O notation?',
    back: 'Big O notation describes the upper bound of time or space complexity of an algorithm. Common complexities: O(1), O(log n), O(n), O(n log n), O(n²).',
    category: 'Data Structures',
    skill: 'ds_algorithms',
  },
  {
    id: 'ds_2',
    front: 'What is a Hash Table?',
    back: 'A hash table is a data structure that maps keys to values using a hash function. It provides O(1) average time for insert, delete, and lookup operations.',
    category: 'Data Structures',
    skill: 'ds_structures',
  },
  {
    id: 'ds_3',
    front: 'What is a Binary Search Tree?',
    back: 'A BST is a tree where each node has at most two children, with left children being smaller and right children being larger than the parent. Provides O(log n) search.',
    category: 'Data Structures',
    skill: 'ds_trees',
  },
  {
    id: 'ds_4',
    front: 'What is the difference between a Stack and a Queue?',
    back: 'A Stack follows LIFO (Last In, First Out) - push/pop from top. A Queue follows FIFO (First In, First Out) - enqueue at back, dequeue from front.',
    category: 'Data Structures',
    skill: 'ds_structures',
  },
  {
    id: 'ds_5',
    front: 'What is recursion?',
    back: 'Recursion is when a function calls itself to solve a problem. It requires a base case to stop and a recursive case that moves toward the base case.',
    category: 'Data Structures',
    skill: 'ds_algorithms',
  },

  // Psychology/Learning category
  {
    id: 'learn_1',
    front: 'What is spaced repetition?',
    back: 'Spaced repetition is a learning technique where review sessions are spread out over increasing intervals. It leverages the spacing effect for better long-term retention.',
    category: 'Learning Science',
    skill: 'learn_techniques',
  },
  {
    id: 'learn_2',
    front: 'What is the testing effect?',
    back: 'The testing effect shows that retrieving information from memory (through testing) strengthens memory more than simply re-studying the material.',
    category: 'Learning Science',
    skill: 'learn_memory',
  },
  {
    id: 'learn_3',
    front: 'What is interleaving?',
    back: 'Interleaving is mixing different topics or types of problems during practice, rather than practicing one type repeatedly. It improves learning and transfer.',
    category: 'Learning Science',
    skill: 'learn_techniques',
  },
  {
    id: 'learn_4',
    front: 'What is cognitive load theory?',
    back: 'Cognitive load theory states that working memory has limited capacity. Learning is optimized when cognitive load is managed through proper instructional design.',
    category: 'Learning Science',
    skill: 'learn_memory',
  },
  {
    id: 'learn_5',
    front: 'What is deliberate practice?',
    back: 'Deliberate practice is purposeful, systematic practice focused on improving specific skills through focused attention, feedback, and working at the edge of one\'s abilities.',
    category: 'Learning Science',
    skill: 'learn_techniques',
  },
];

export const skillTreeData = {
  nodes: [
    // Root skills
    { id: 'programming', name: 'Programming', level: 0, unlocked: true, xp: 0, maxXp: 100, icon: '💻', x: 400, y: 50, category: 'root' },

    // JavaScript branch
    { id: 'js_basics', name: 'JS Basics', level: 1, unlocked: true, xp: 0, maxXp: 150, icon: '📜', x: 200, y: 150, category: 'javascript', parent: 'programming' },
    { id: 'js_functions', name: 'Functions', level: 2, unlocked: false, xp: 0, maxXp: 200, icon: '⚡', x: 100, y: 250, category: 'javascript', parent: 'js_basics' },
    { id: 'js_async', name: 'Async JS', level: 2, unlocked: false, xp: 0, maxXp: 250, icon: '🔄', x: 200, y: 350, category: 'javascript', parent: 'js_functions' },
    { id: 'js_advanced', name: 'Advanced JS', level: 3, unlocked: false, xp: 0, maxXp: 300, icon: '🚀', x: 100, y: 450, category: 'javascript', parent: 'js_async' },

    // React branch
    { id: 'react_core', name: 'React Core', level: 1, unlocked: false, xp: 0, maxXp: 200, icon: '⚛️', x: 300, y: 250, category: 'react', parent: 'js_basics' },
    { id: 'react_hooks', name: 'Hooks', level: 2, unlocked: false, xp: 0, maxXp: 250, icon: '🪝', x: 250, y: 350, category: 'react', parent: 'react_core' },
    { id: 'react_state', name: 'State Mgmt', level: 2, unlocked: false, xp: 0, maxXp: 250, icon: '📊', x: 350, y: 350, category: 'react', parent: 'react_core' },
    { id: 'react_forms', name: 'Forms', level: 3, unlocked: false, xp: 0, maxXp: 200, icon: '📝', x: 300, y: 450, category: 'react', parent: 'react_hooks' },
    { id: 'react_advanced', name: 'Advanced React', level: 3, unlocked: false, xp: 0, maxXp: 350, icon: '🔥', x: 400, y: 450, category: 'react', parent: 'react_state' },

    // CSS branch
    { id: 'css_basics', name: 'CSS Basics', level: 1, unlocked: true, xp: 0, maxXp: 150, icon: '🎨', x: 600, y: 150, category: 'css', parent: 'programming' },
    { id: 'css_layout', name: 'Layout', level: 2, unlocked: false, xp: 0, maxXp: 200, icon: '📐', x: 550, y: 250, category: 'css', parent: 'css_basics' },
    { id: 'css_animations', name: 'Animations', level: 2, unlocked: false, xp: 0, maxXp: 200, icon: '✨', x: 650, y: 250, category: 'css', parent: 'css_basics' },
    { id: 'css_advanced', name: 'Advanced CSS', level: 3, unlocked: false, xp: 0, maxXp: 300, icon: '🌈', x: 600, y: 350, category: 'css', parent: 'css_layout' },

    // Data Structures branch
    { id: 'ds_structures', name: 'Structures', level: 1, unlocked: false, xp: 0, maxXp: 200, icon: '🏗️', x: 500, y: 150, category: 'data_structures', parent: 'programming' },
    { id: 'ds_algorithms', name: 'Algorithms', level: 2, unlocked: false, xp: 0, maxXp: 250, icon: '🧮', x: 450, y: 250, category: 'data_structures', parent: 'ds_structures' },
    { id: 'ds_trees', name: 'Trees', level: 2, unlocked: false, xp: 0, maxXp: 250, icon: '🌳', x: 500, y: 350, category: 'data_structures', parent: 'ds_algorithms' },

    // Learning Science branch
    { id: 'learn_techniques', name: 'Techniques', level: 1, unlocked: true, xp: 0, maxXp: 100, icon: '📚', x: 700, y: 250, category: 'learning', parent: 'programming' },
    { id: 'learn_memory', name: 'Memory', level: 2, unlocked: false, xp: 0, maxXp: 150, icon: '🧠', x: 700, y: 350, category: 'learning', parent: 'learn_techniques' },
  ],
  edges: [
    { source: 'programming', target: 'js_basics' },
    { source: 'programming', target: 'css_basics' },
    { source: 'programming', target: 'ds_structures' },
    { source: 'programming', target: 'learn_techniques' },
    { source: 'js_basics', target: 'js_functions' },
    { source: 'js_basics', target: 'react_core' },
    { source: 'js_functions', target: 'js_async' },
    { source: 'js_async', target: 'js_advanced' },
    { source: 'react_core', target: 'react_hooks' },
    { source: 'react_core', target: 'react_state' },
    { source: 'react_hooks', target: 'react_forms' },
    { source: 'react_state', target: 'react_advanced' },
    { source: 'css_basics', target: 'css_layout' },
    { source: 'css_basics', target: 'css_animations' },
    { source: 'css_layout', target: 'css_advanced' },
    { source: 'ds_structures', target: 'ds_algorithms' },
    { source: 'ds_algorithms', target: 'ds_trees' },
    { source: 'learn_techniques', target: 'learn_memory' },
  ],
};

// Initialize cards with SM-2 defaults
export function initializeSampleCards() {
  return sampleFlashcards.map(card => ({
    ...card,
    repetitions: 0,
    easeFactor: 2.5,
    interval: 0,
    nextReview: new Date().toISOString(),
    lastReview: null,
    quality: null,
    createdAt: new Date().toISOString(),
    timesStudied: 0,
  }));
}
