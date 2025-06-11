import { internalMutation, internalQuery, query } from './_generated/server';
import { v } from 'convex/values';
import { streamingComponent } from './streaming';
import { type StreamId } from '@convex-dev/persistent-text-streaming';
import { internal } from './_generated/api';
import { mutationWithSession, queryWithSession } from './utils';

export const listMessages = queryWithSession({
  args: {
    threadId: v.id('threads'),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;

    if (!userId) {
      return [];
    }

    return await ctx.db
      .query('messages')
      .withIndex('by_threadId', (q) => q.eq('threadId', args.threadId).eq('userId', userId))
      .collect();
  },
});

export const sendMessage = mutationWithSession({
  args: {
    prompt: v.string(),
    threadId: v.optional(v.id('threads')),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    const responseStreamId = await streamingComponent.createStream(ctx);

    let threadId = args.threadId;
    if (!args.threadId) {
      const thread = await ctx.db.insert('threads', {
        title: '',
        userId,
      });

      await ctx.scheduler.runAfter(0, internal.theads.generateThreadTitle, {
        threadId: thread,
        firstMessage: args.prompt,
      });

      threadId = thread;
    }

    if (!threadId) {
      throw new Error('Thread not found');
    }

    const messageId = await ctx.db.insert('messages', {
      content: args.prompt,
      threadId,
      role: 'user',
      userId,
      responseStreamId,
    });

    return { threadId, messageId };
  },
});

export const getHistory = internalQuery({
  args: {
    threadId: v.optional(v.id('threads')),
  },
  handler: async (ctx, args) => {
    if (!args.threadId) {
      return [];
    }

    // Grab all the user messages
    const allMessages = await ctx.db
      .query('messages')
      .withIndex('by_threadId', (q) => q.eq('threadId', args.threadId!))
      .collect();

    // Lets join the user messages with the assistant messages
    const joinedResponses = await Promise.all(
      allMessages.map(async (userMessage) => {
        return {
          userMessage,
          responseMessage: userMessage.responseStreamId
            ? await streamingComponent.getStreamBody(ctx, userMessage.responseStreamId as StreamId)
            : undefined,
        };
      }),
    );

    return joinedResponses.flatMap((joined) => {
      const user = {
        role: 'user' as const,
        content: joined.userMessage.content,
      };

      // If the assistant message is empty, its probably because we have not
      // started streaming yet so lets not include it in the history
      if (!joined.responseMessage?.text) {
        return [user];
      }

      const assistant = {
        role: 'assistant' as const,
        content: joined.responseMessage.text,
      };

      return [user, assistant];
    });
  },
});

export const updateMessage = internalMutation({
  args: {
    streamId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query('messages')
      .withIndex('by_streamId', (q) => q.eq('responseStreamId', args.streamId))
      .first();

    if (!message) {
      throw new Error('Message not found');
    }

    await Promise.all([
      ctx.db.patch(message._id, { responseStreamId: undefined }),
      ctx.db.insert('messages', {
        content: args.content,
        threadId: message.threadId,
        role: 'assistant',
        userId: message.userId,
      }),
    ]);
  },
});
