'use client';

import { api } from '@p4-chat/backend/convex/_generated/api';
import type { Doc } from '@p4-chat/backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { CodeIcon, GraduationCapIcon, NewspaperIcon, SparklesIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

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

export function NewChatMessages({
  serverUser,
  onSelectMessage,
}: {
  serverUser: Doc<'users'> | null;
  onSelectMessage: (message: string) => void;
}) {
  const user = useQuery(api.user.currentUser) ?? serverUser;
  const [selectedCategory, setSelectedCategory] = useState<string>('default');

  return (
    <div className="flex h-[calc(100vh-20rem)] items-start justify-center">
      <div className="w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 animate-in fade-in-50 zoom-in-95 sm:px-8">
        <h2 className="text-3xl font-semibold">How can I help you{user ? `, ${user.name}` : ''}?</h2>
        <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
          {Object.entries(categoriesIcons).map(([category, Icon]) => (
            <Button
              key={category}
              className="rounded-full"
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory((prev) => (prev === category ? 'default' : category))}
            >
              <Icon className="max-sm:block" />
              <div>{category}</div>
            </Button>
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
