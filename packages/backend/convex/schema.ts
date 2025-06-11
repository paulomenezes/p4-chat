import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';
import { StreamIdValidator } from '@convex-dev/persistent-text-streaming';

export default defineSchema({
  ...authTables,
  userConfig: defineTable({
    userId: v.id('users'),
    currentlySelectedModel: v.string(),
    favoriteModels: v.array(v.string()),
  }).index('by_userId', ['userId']),
  threads: defineTable({
    title: v.string(),
    userId: v.id('users'),
    pinned: v.optional(v.boolean()),
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
