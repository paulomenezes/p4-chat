import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { mutationWithSession, queryWithSession } from './utils';

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    return {
      url: await ctx.storage.getUrl(args.storageId),
      metadata: await ctx.db.system.get(args.storageId),
    };
  },
});

export const getFilesUrls = query({
  args: {
    storageIds: v.array(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    return await Promise.all(
      args.storageIds.map(async (storageId) => ({
        url: await ctx.storage.getUrl(storageId),
        metadata: await ctx.db.system.get(storageId),
      })),
    );
  },
});

export const deleteById = mutation({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const attachment = await ctx.db
      .query('attachments')
      .withIndex('by_storageId', (q) => q.eq('storageId', args.storageId))
      .unique();

    const result = await ctx.storage.delete(args.storageId);

    if (attachment) {
      await ctx.db.delete(attachment._id);
    }

    return result;
  },
});

export const deleteByIds = mutation({
  args: {
    storageIds: v.array(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const operations: Promise<any>[] = [];

    for (const storageId of args.storageIds) {
      const attachment = await ctx.db
        .query('attachments')
        .withIndex('by_storageId', (q) => q.eq('storageId', storageId))
        .unique();

      if (attachment) {
        operations.push(ctx.db.delete(attachment._id));
        operations.push(ctx.storage.delete(storageId));
      } else {
        operations.push(ctx.storage.delete(storageId));
      }
    }

    await Promise.all(operations);
  },
});

export const addAttachment = mutationWithSession({
  args: {
    storageId: v.id('_storage'),
    name: v.string(),
    size: v.number(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('attachments', {
      ...args,
      userId: ctx.userId,
    });
  },
});

export const getAttachments = queryWithSession({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.userId;
    console.log('userId', userId);

    if (!userId) {
      return [];
    }

    return await ctx.db
      .query('attachments')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();
  },
});
