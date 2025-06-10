import { getAuthUserId } from '@convex-dev/auth/server';
import { internalAction, internalMutation, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { internal } from './_generated/api';

export const getByUserId = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
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
