import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    return await ctx.db.get(userId);
  },
});

export const getUserConfig = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    return await ctx.db
      .query('userConfig')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
  },
});

export const updateCurrentlySelectedModel = mutation({
  args: {
    id: v.optional(v.id('userConfig')),
    currentlySelectedModel: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    if (args.id) {
      await ctx.db.patch(args.id, {
        currentlySelectedModel: args.currentlySelectedModel,
      });
    } else {
      await ctx.db.insert('userConfig', {
        userId,
        currentlySelectedModel: args.currentlySelectedModel,
        favoriteModels: [],
      });
    }
  },
});
