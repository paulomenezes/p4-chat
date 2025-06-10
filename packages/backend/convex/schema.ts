import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';
import { StreamIdValidator } from '@convex-dev/persistent-text-streaming';

export default defineSchema({
  ...authTables,
  threads: defineTable({
    title: v.string(),
    userId: v.id('users'),
  }).index('by_userId', ['userId']),
  messages: defineTable({
    threadId: v.id('threads'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    userId: v.id('users'),
    responseStreamId: v.optional(StreamIdValidator),
  })
    .index('by_threadId', ['threadId'])
    .index('by_userId', ['userId'])
    .index('by_streamId', ['responseStreamId']),
});
