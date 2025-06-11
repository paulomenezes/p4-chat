import { customMutation, customQuery } from 'convex-helpers/server/customFunctions';
import { mutation, query, type QueryCtx } from './_generated/server';
import { type SessionId, SessionIdArg } from 'convex-helpers/server/sessions';
import { getAuthUserId } from '@convex-dev/auth/server';

async function getUser(ctx: QueryCtx, sessionId: SessionId) {
  let userId = await getAuthUserId(ctx);

  if (userId) {
    return userId;
  }

  return (
    await ctx.db
      .query('users')
      .withIndex('by_sessionId', (q) => q.eq('sessionId', sessionId))
      .unique()
  )?._id;
}

export const queryWithSession = customQuery(query, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const userId = await getUser(ctx, sessionId);

    return { ctx: { ...ctx, userId, sessionId }, args: {} };
  },
});

export const mutationWithSession = customMutation(mutation, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    let userId = await getUser(ctx, sessionId);

    if (!userId) {
      userId = await ctx.db.insert('users', {
        name: '',
        sessionId,
        isAnonymous: true,
      });
    }

    return { ctx: { ...ctx, userId, sessionId }, args: {} };
  },
});
