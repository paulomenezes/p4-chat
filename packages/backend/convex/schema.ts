import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';
import { StreamIdValidator } from '@convex-dev/persistent-text-streaming';

export default defineSchema({
  ...authTables,
  users: defineTable({
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
    sessionId: v.optional(v.string()),
  })
    .index('email', ['email'])
    .index('phone', ['phone'])
    .index('by_sessionId', ['sessionId']),
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
    .index('by_threadId', ['threadId', 'userId'])
    .index('by_userId', ['userId'])
    .index('by_streamId', ['responseStreamId']),
});
