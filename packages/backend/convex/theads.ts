import { getAuthUserId } from '@convex-dev/auth/server';
import { internalAction, internalMutation, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { internal } from './_generated/api';
import { mutationWithSession, queryWithSession } from './utils';

export const getByUserIdOrSessionId = queryWithSession({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.userId;

    if (!userId) {
      return [];
    }

    return await ctx.db
      .query('threads')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();
  },
});

export const getByUserId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }

    return await ctx.db
      .query('threads')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();
  },
});

export const getById = query({
  args: {
    id: v.id('threads'),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db
      .query('threads')
      .withIndex('by_id', (q) => q.eq('_id', id))
      .first();
  },
});

export const update = internalMutation({
  args: {
    id: v.id('threads'),
    title: v.string(),
  },
  handler: async (ctx, { id, title }) => {
    return await ctx.db.patch(id, { title });
  },
});

export const generateThreadTitle = internalAction({
  args: {
    threadId: v.id('threads'),
    firstMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: `Generate a title for the thread. The title should be a single sentence that captures the main topic of the thread.
      The title should be no more than 100 characters.
      The title should be in the same language as the messages.
      
      The first message is:
      ${args.firstMessage}
      `,
    });

    await ctx.runMutation(internal.theads.update, {
      id: args.threadId,
      title: result.text,
    });
  },
});

export const togglePin = mutationWithSession({
  args: {
    id: v.id('threads'),
  },
  handler: async (ctx, { id }) => {
    const userId = ctx.userId;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const thread = await ctx.db.get(id);

    if (!thread) {
      throw new Error('Thread not found');
    }

    if (thread.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await ctx.db.patch(id, { pinned: !thread.pinned });
  },
});

export const remove = mutationWithSession({
  args: {
    id: v.id('threads'),
  },
  handler: async (ctx, { id }) => {
    const userId = ctx.userId;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const thread = await ctx.db.get(id);

    if (!thread) {
      throw new Error('Thread not found');
    }

    if (thread.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_threadId', (q) => q.eq('threadId', id))
      .collect();

    await Promise.all([ctx.db.delete(id), ...messages.map((m) => ctx.db.delete(m._id))]);
  },
});
