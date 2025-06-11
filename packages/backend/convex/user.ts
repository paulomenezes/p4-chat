import { getAuthUserId } from '@convex-dev/auth/server';
import { query } from './_generated/server';
import { v } from 'convex/values';
import { mutationWithSession, queryWithSession } from './utils';

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

export const getUserConfig = queryWithSession({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.userId;

    if (!userId) {
      return null;
    }

    return await ctx.db
      .query('userConfig')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();
  },
});

export const updateCurrentlySelectedModel = mutationWithSession({
  args: {
    id: v.optional(v.id('userConfig')),
    currentlySelectedModel: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;

    if (!userId) {
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
