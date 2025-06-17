import { getAuthUserId } from '@convex-dev/auth/server';
import { internalQuery, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import CryptoJS from 'crypto-js';

export const getApiKeys = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    const keys = await ctx.db
      .query('apiKeys')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    return {
      openRouterDefined: keys?.openRouterDefined,
      openaiDefined: keys?.openaiDefined,
      googleDefined: keys?.googleDefined,
    };
  },
});

export const getApiKey = internalQuery({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    const apiKeys = await ctx.db
      .query('apiKeys')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (!apiKeys) {
      return null;
    }

    const decryptedOpenRouterKey =
      apiKeys.openRouterKey && apiKeys.openRouterKey.length > 0
        ? CryptoJS.AES.decrypt(apiKeys.openRouterKey, process.env.ENCRYPTION_KEY!).toString(CryptoJS.enc.Utf8)
        : null;

    const decryptedOpenaiKey =
      apiKeys.openaiKey && apiKeys.openaiKey.length > 0
        ? CryptoJS.AES.decrypt(apiKeys.openaiKey, process.env.ENCRYPTION_KEY!).toString(CryptoJS.enc.Utf8)
        : null;

    const decryptedGoogleKey =
      apiKeys.googleKey && apiKeys.googleKey.length > 0
        ? CryptoJS.AES.decrypt(apiKeys.googleKey, process.env.ENCRYPTION_KEY!).toString(CryptoJS.enc.Utf8)
        : null;

    return {
      openRouterKey: decryptedOpenRouterKey,
      openaiKey: decryptedOpenaiKey,
      googleKey: decryptedGoogleKey,
    };
  },
});

export const setApiKeys = mutation({
  args: {
    type: v.union(v.literal('openRouter'), v.literal('openai'), v.literal('google')),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    const apiKeys = await ctx.db
      .query('apiKeys')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (apiKeys) {
      await ctx.db.patch(apiKeys._id, {
        [`${args.type}Key`]: args.key,
        [`${args.type}Defined`]: true,
      });
    } else {
      await ctx.db.insert('apiKeys', {
        userId,
        [`${args.type}Key`]: args.key,
        [`${args.type}Defined`]: true,
      });
    }
  },
});

export const deleteApiKey = mutation({
  args: {
    type: v.union(v.literal('openRouter'), v.literal('openai'), v.literal('google')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    const apiKeys = await ctx.db
      .query('apiKeys')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (apiKeys) {
      await ctx.db.patch(apiKeys._id, {
        [`${args.type}Key`]: '',
        [`${args.type}Defined`]: false,
      });
    }
  },
});
