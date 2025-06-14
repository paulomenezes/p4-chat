import { internalMutation, internalQuery, mutation } from './_generated/server';
import { v } from 'convex/values';
import { streamingComponent } from './streaming';
import { type StreamId } from '@convex-dev/persistent-text-streaming';
import { internal } from './_generated/api';
import { mutationWithSession, queryWithSession } from './utils';
import { MODELS } from '../models';

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

    const userConfig = await ctx.db
      .query('userConfig')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    const model = userConfig?.currentlySelectedModel ?? MODELS[0].id;

    let threadId = args.threadId;
    let isNewThread = false;
    if (!args.threadId) {
      const thread = await ctx.db.insert('threads', {
        title: '',
        userId,
        model,
      });

      await ctx.scheduler.runAfter(0, internal.threads.generateThreadTitle, {
        threadId: thread,
        firstMessage: args.prompt,
      });

      threadId = thread;
      isNewThread = true;
    }

    if (!threadId) {
      throw new Error('Thread not found');
    }

    if (!isNewThread) {
      await ctx.db.patch(threadId, {
        model,
      });
    }

    const messageId = await ctx.db.insert('messages', {
      content: args.prompt,
      threadId,
      role: 'user',
      userId,
      responseStreamId,
      model,
    });

    return { threadId, messageId };
  },
});

export const retryMessage = mutationWithSession({
  args: {
    messageId: v.id('messages'),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    const responseStreamId = await streamingComponent.createStream(ctx);

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const threadId = message.threadId;

    const previousMessages = await ctx.db
      .query('messages')
      .withIndex('by_threadId', (q) => q.eq('threadId', threadId))
      .collect();

    // Sort by _creationTime to get chronological order
    const sortedMessages = previousMessages.sort((a, b) => (a._creationTime < b._creationTime ? -1 : 1));

    // Find index of current message
    const currentIndex = sortedMessages.findIndex((m) => m._id === args.messageId);
    const previousMessage = sortedMessages[currentIndex - 1];

    // Messages to delete are all messages after the current one
    const messagesToDelete = sortedMessages.slice(currentIndex + 1);

    if (message.role === 'user') {
      // For user messages, update its responseStreamId and delete messages after it
      await Promise.all([
        ctx.db.patch(message._id, { responseStreamId, model: args.modelId }),
        ctx.db.patch(threadId, { model: args.modelId }),
        ...messagesToDelete.map((msg) => ctx.db.delete(msg._id)),
      ]);

      return { threadId, messageId: message._id };
    }

    // For AI messages, delete the message itself and all messages after it
    // Then update the previous message's responseStreamId
    if (!previousMessage) {
      throw new Error('Cannot retry AI message without a previous message');
    }

    await Promise.all([
      ctx.db.patch(previousMessage._id, { responseStreamId, model: args.modelId }),
      ctx.db.patch(threadId, { model: args.modelId }),
      ctx.db.delete(message._id),
      ...messagesToDelete.map((msg) => ctx.db.delete(msg._id)),
    ]);

    return { threadId, messageId: previousMessage._id };
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
          model: userMessage.model,
        };
      }),
    );

    return joinedResponses.flatMap((joined) => {
      const user = {
        role: 'user' as const,
        content: joined.userMessage.content,
        model: joined.model,
      };

      // If the assistant message is empty, its probably because we have not
      // started streaming yet so lets not include it in the history
      if (!joined.responseMessage?.text) {
        return [user];
      }

      const assistant = {
        role: 'assistant' as const,
        content: joined.responseMessage.text,
        model: joined.model,
      };

      return [user, assistant];
    });
  },
});

export const updateMessage = internalMutation({
  args: {
    streamId: v.string(),
    content: v.string(),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    durationSeconds: v.number(),
    tokensPerSecond: v.number(),
    reasoning: v.optional(v.string()),
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
        model: args.model,
        promptTokens: args.promptTokens,
        completionTokens: args.completionTokens,
        totalTokens: args.totalTokens,
        durationSeconds: args.durationSeconds,
        tokensPerSecond: args.tokensPerSecond,
        reasoning: args.reasoning,
      }),
    ]);
  },
});

export const stopStreaming = mutation({
  args: {
    streamId: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query('messages')
      .withIndex('by_streamId', (q) => q.eq('responseStreamId', args.streamId))
      .first();

    if (!message) {
      throw new Error('Message not found');
    }

    const streamBody = await streamingComponent.getStreamBody(ctx, message.responseStreamId as StreamId);

    await Promise.all([
      ctx.db.patch(message._id, { responseStreamId: undefined }),
      ctx.db.insert('messages', {
        content: streamBody.text,
        threadId: message.threadId,
        role: 'assistant',
        userId: message.userId,
        model: message.model,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        durationSeconds: 0,
        tokensPerSecond: 0,
        reasoning: undefined,
        stopped: true,
      }),
    ]);
  },
});
