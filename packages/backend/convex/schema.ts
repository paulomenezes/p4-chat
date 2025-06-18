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
    parentThreadId: v.optional(v.id('threads')),
    model: v.optional(v.string()),
  }).index('by_userId', ['userId']),
  threadShares: defineTable({
    threadId: v.id('threads'),
    userId: v.id('users'),
    email: v.string(),
    message: v.string(),
  }).index('by_threadId', ['threadId']),
  messages: defineTable({
    threadId: v.id('threads'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    userId: v.id('users'),
    responseStreamId: v.optional(StreamIdValidator),
    model: v.optional(v.string()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    durationSeconds: v.optional(v.number()),
    tokensPerSecond: v.optional(v.number()),
    reasoning: v.optional(v.string()),
    stopped: v.optional(v.boolean()),
    stoppedReason: v.optional(v.string()),
    isSearching: v.optional(v.boolean()),
    searchQueries: v.optional(v.array(v.string())),
    files: v.optional(v.array(v.id('_storage'))),
  })
    .index('by_threadId', ['threadId', 'userId'])
    .index('by_userId', ['userId'])
    .index('by_streamId', ['responseStreamId']),
  messageSearchResults: defineTable({
    messageId: v.id('messages'),
    startIndex: v.optional(v.number()),
    endIndex: v.optional(v.number()),
    text: v.string(),
    confidenceScore: v.optional(v.number()),
    chunksUri: v.string(),
    chunksTitle: v.string(),
  }).index('by_messageId', ['messageId']),
  attachments: defineTable({
    userId: v.id('users'),
    storageId: v.id('_storage'),
    name: v.string(),
    size: v.number(),
    type: v.string(),
  })
    .index('by_userId', ['userId'])
    .index('by_storageId', ['storageId']),
  apiKeys: defineTable({
    userId: v.id('users'),
    openRouterKey: v.optional(v.string()),
    openRouterDefined: v.optional(v.boolean()),
    openaiKey: v.optional(v.string()),
    openaiDefined: v.optional(v.boolean()),
    googleKey: v.optional(v.string()),
    googleDefined: v.optional(v.boolean()),
  }).index('by_userId', ['userId']),
});
