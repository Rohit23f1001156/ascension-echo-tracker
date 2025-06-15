
export interface SkillNode {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  xp: number;
  dependencies?: string[];
}

export interface SkillPath {
  id:string;
  name: string;
  description: string;
  nodes: SkillNode[];
}

export const skillTreeData: SkillPath[] = [
  {
    id: "career",
    name: "Career Path",
    description: "Develop professional skills and advance your career.",
    nodes: [
      { id: "c1", name: "Resume Basics", description: "Craft a compelling resume.", tasks: ["Update resume with latest achievements", "Get feedback from 3 people"], xp: 100 },
      { id: "c2", name: "Interview Prep", description: "Ace your next interview.", tasks: ["Complete 5 mock interviews", "Prepare answers for common questions"], xp: 150, dependencies: ["c1"] },
      { id: "c3", name: "Productivity Tools", description: "Master tools to boost your efficiency.", tasks: ["Learn a project management tool", "Optimize your digital workspace"], xp: 200, dependencies: ["c2"] },
      { id: "c4", name: "Deep Work Habits", description: "Cultivate intense focus.", tasks: ["Practice 4 deep work sessions", "Minimize distractions for a week"], xp: 250, dependencies: ["c3"] },
      { id: "c5", name: "Side Projects", description: "Build something of your own.", tasks: ["Ship a minimum viable product", "Get your first user"], xp: 500, dependencies: ["c4"] },
    ],
  },
  {
    id: "learning",
    name: "Learning Path",
    description: "Expand your knowledge and master new subjects.",
    nodes: [
      { id: "l1", name: "Reading Habit", description: "Read consistently to gain knowledge.", tasks: ["Read for 30 minutes daily for 7 days", "Finish one non-fiction book"], xp: 100 },
      { id: "l2", name: "Note-Taking", description: "Develop effective note-taking strategies.", tasks: ["Try 3 different note-taking methods", "Create a digital notebook for a subject"], xp: 150, dependencies: ["l1"] },
      { id: "l3", name: "Mind Mapping", description: "Visualize concepts for better retention.", tasks: ["Create 5 mind maps for complex topics", "Use mind mapping for a project plan"], xp: 150, dependencies: ["l2"] },
      { id: "l4", "name": "Teach What You Learn", description: "Solidify knowledge by explaining it.", tasks: ["Explain a new concept to a friend", "Write a short blog post about a topic"], xp: 200, dependencies: ["l3"] },
    ]
  },
  {
    id: 'finance',
    name: 'Finance Path',
    description: 'Achieve financial literacy and independence.',
    nodes: [
      { id: 'f1', name: 'Budgeting', description: 'Create and stick to a monthly budget.', tasks: ['Track all expenses for one month', 'Create a 50/30/20 budget plan'], xp: 100 },
      { id: 'f2', name: 'Expense Tracking', description: 'Understand where your money goes.', tasks: ['Use a tracking app for 30 days', 'Identify 3 areas to cut spending'], xp: 150, dependencies: ['f1'] },
      { id: 'f3', name: 'Saving Goals', description: 'Set and work towards financial goals.', tasks: ['Open a high-yield savings account', 'Set up automatic monthly transfers'], xp: 200, dependencies: ['f2'] },
      { id: 'f4', name: 'Investing Basics', description: 'Learn to make your money work for you.', tasks: ['Read a book on index fund investing', 'Make your first investment'], xp: 300, dependencies: ['f3'] },
    ]
  },
  {
    id: 'health',
    name: 'Physical & Mental Health Path',
    description: 'Build a strong body and a resilient mind.',
    nodes: [
      { id: 'h1', name: 'Morning Routine', description: 'Start your day with intention.', tasks: ['Stick to a morning routine for 5 days', 'Include hydration and movement'], xp: 100 },
      { id: 'h2', name: 'Consistent Walking', description: 'Incorporate regular, low-impact exercise.', tasks: ['Walk 5,000 steps daily for a week', 'Go for one 30-minute walk'], xp: 100, dependencies: ['h1'] },
      { id: 'h3', name: 'Yoga Basics', description: 'Improve flexibility and mindfulness.', tasks: ['Complete 3 beginner yoga sessions', 'Learn 5 basic yoga poses'], xp: 150, dependencies: ['h2'] },
      { id: 'h4', name: 'Meditation', description: 'Train your focus and reduce stress.', tasks: ['Meditate for 10 minutes, 5 times', 'Try a guided meditation app'], xp: 150, dependencies: ['h1'] },
      { id: 'h5', name: 'Journaling', description: 'Process thoughts and emotions.', tasks: ['Journal for 5 consecutive days', 'Use prompts to guide your writing'], xp: 150, dependencies: ['h4'] },
    ]
  }
];
