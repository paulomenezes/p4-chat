import { getAuthUserId } from '@convex-dev/auth/server';
import { internalAction, internalMutation, query } from './_generated/server';
import { v } from 'convex/values';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { components, internal } from './_generated/api';
import { mutationWithSession, queryWithSession } from './utils';
import { Resend } from '@convex-dev/resend';
import { inviteEmailTemplate } from '../email-template';

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
});

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
      .order('desc')
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
      .order('desc')
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

    await ctx.runMutation(internal.threads.update, {
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

export const rename = mutationWithSession({
  args: {
    id: v.id('threads'),
    title: v.string(),
  },
  handler: async (ctx, { id, title }) => {
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

    return await ctx.db.patch(id, { title });
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

export const branchOff = mutationWithSession({
  args: {
    id: v.id('threads'),
    messageId: v.id('messages'),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { id, messageId, modelId }) => {
    const userId = ctx.userId;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const sourceThread = await ctx.db.get(id);

    if (!sourceThread) {
      throw new Error('Thread not found');
    }

    if (sourceThread.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Get all messages up to and including the specified message
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_threadId', (q) => q.eq('threadId', id))
      .collect();

    const messagesUntilId = [];
    for (const message of messages) {
      messagesUntilId.push(message);
      if (message._id === messageId) {
        break;
      }
    }

    // Create new thread
    const newThreadId = await ctx.db.insert('threads', {
      title: sourceThread.title,
      userId,
      pinned: false, // New branch starts unpinned
      parentThreadId: id,
      model: modelId ?? sourceThread.model,
    });

    // Copy messages to new thread with search results
    for (const message of messagesUntilId) {
      const newMessageId = await ctx.db.insert('messages', {
        ...message,
        threadId: newThreadId,
      });

      if (message.searchQueries && message.searchQueries.length > 0) {
        const searchResults = await ctx.db
          .query('messageSearchResults')
          .withIndex('by_messageId', (q) => q.eq('messageId', message._id))
          .collect();

        await Promise.all(
          searchResults.map((result) =>
            ctx.db.insert('messageSearchResults', {
              chunksTitle: result.chunksTitle,
              chunksUri: result.chunksUri,
              confidenceScore: result.confidenceScore,
              startIndex: result.startIndex,
              endIndex: result.endIndex,
              text: result.text,
              messageId: newMessageId,
            }),
          ),
        );
      }
    }

    return newThreadId;
  },
});

export const getThreadForExport = queryWithSession({
  args: {
    threadId: v.id('threads'),
  },
  handler: async (ctx, { threadId }) => {
    const userId = ctx.userId;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const thread = await ctx.db.get(threadId);

    if (!thread) {
      throw new Error('Thread not found');
    }

    if (thread.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_threadId', (q) => q.eq('threadId', threadId))
      .collect();

    // Sort messages by creation time
    const sortedMessages = messages.sort((a, b) => (a._creationTime < b._creationTime ? -1 : 1));

    return {
      thread,
      messages: sortedMessages,
    };
  },
});

export const share = mutationWithSession({
  args: {
    threadId: v.id('threads'),
    emails: v.array(v.string()),
    message: v.string(),
  },
  handler: async (ctx, { threadId, emails, message }) => {
    const userId = ctx.userId;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const thread = await ctx.db.get(threadId);

    if (!thread) {
      throw new Error('Thread not found');
    }

    if (thread.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const from = await ctx.db.get(userId);

    const existingShares = await ctx.db
      .query('threadShares')
      .withIndex('by_threadId', (q) => q.eq('threadId', threadId))
      .collect();

    const newShares = emails.filter((email) => !existingShares.some((share) => share.email === email));

    await Promise.all(
      newShares.map((email) =>
        ctx.db.insert('threadShares', {
          threadId,
          userId,
          email,
          message,
        }),
      ),
    );

    const baseUrl = 'http://localhost:3001';

    await Promise.all(
      newShares.map(async (email) => {
        const to = await ctx.db
          .query('users')
          .withIndex('email', (q) => q.eq('email', email))
          .first();

        return resend.sendEmail(
          ctx,
          `Acme <onboarding@resend.dev>`,
          email,
          `You are invited to view a thread on P4 Chat`,
          inviteEmailTemplate({
            inviterName: from?.name ?? 'P4 Chat',
            friendName: to?.name ?? email,
            chatTitle: thread.title,
            chatPreview: `${message.slice(0, 100)}...`,
            shareUrl: `${baseUrl}/?chat=${threadId}`,
          }),
        );
      }),
    );
  },
});

export const getShares = queryWithSession({
  args: {
    threadId: v.id('threads'),
  },
  handler: async (ctx, { threadId }) => {
    return await ctx.db
      .query('threadShares')
      .withIndex('by_threadId', (q) => q.eq('threadId', threadId))
      .collect();
  },
});

export const removeShare = mutationWithSession({
  args: {
    id: v.id('threadShares'),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.delete(id);
  },
});
