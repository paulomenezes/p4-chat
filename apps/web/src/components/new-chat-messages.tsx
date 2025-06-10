'use client';

import { api } from '@p4-chat/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { CodeIcon, GraduationCapIcon, NewspaperIcon, SparklesIcon } from 'lucide-react';
import { useState } from 'react';

const messages = {
  default: ['How does AI work?', 'Are black holes real?', 'How many Rs are in the word "strawberry"?', 'What is the meaning of life? '],
  Create: [
    'Write a short story about a robot discovering emotions',
    'Help me outline a sci-fi novel set in a post-apocalyptic world',
    'Create a character profile for a complex villain with sympathetic motives',
    'Give me 5 creative writing prompts for flash fiction',
  ],
  Explore: [
    'Good books for fans of Rick Rubin',
    'Countries ranked by number of corgis',
    'Most successful companies in the world',
    'How much does Claude cost?',
  ],
  Code: [
    'Write code to invert a binary search tree in Python',
    "What's the difference between Promise.all and Promise.allSettled?",
    "Explain React's useEffect cleanup function",
    'Best practices for error handling in async/await',
  ],
  Learn: [
    "Beginner's guide to TypeScript",
    'Explain the CAP theorem in distributed systems',
    'Why is AI so expensive?',
    'Are black holes real?',
  ],
};

const categoriesIcons = {
  Create: SparklesIcon,
  Explore: NewspaperIcon,
  Code: CodeIcon,
  Learn: GraduationCapIcon,
};

export function NewChatMessages({ onSelectMessage }: { onSelectMessage: (message: string) => void }) {
  const user = useQuery(api.user.currentUser);
  const [selectedCategory, setSelectedCategory] = useState<string>('default');

  return (
    <div className="flex h-[calc(100vh-20rem)] items-start justify-center">
      <div className="w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 animate-in fade-in-50 zoom-in-95 sm:px-8">
        <h2 className="text-3xl font-semibold">How can I help you{user ? `, ${user.name}` : ''}?</h2>
        <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
          {Object.entries(categoriesIcons).map(([category, Icon]) => (
            <button
              key={category}
              className="justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-pink-600/90 disabled:hover:bg-primary h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full"
              data-selected={selectedCategory === category}
              onClick={() => setSelectedCategory((prev) => (prev === category ? 'default' : category))}
            >
              <Icon className="max-sm:block" />
              <div>{category}</div>
            </button>
          ))}
        </div>
        <div className="flex flex-col text-foreground">
          {messages[selectedCategory as keyof typeof messages].map((message) => (
            <div key={message} className="flex items-start gap-2 border-t border-secondary/40 py-1 first:border-none">
              <button
                className="w-full rounded-md py-2 text-left text-secondary-foreground hover:bg-secondary/50 sm:px-3 cursor-pointer"
                onClick={() => onSelectMessage(message)}
              >
                <span>{message}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
