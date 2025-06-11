import { httpAction } from './_generated/server';
import { api, internal } from './_generated/api';
import { streamingComponent } from './streaming';
import { streamText } from 'ai';
import { type StreamId } from '@convex-dev/persistent-text-streaming';
import { type Id } from './_generated/dataModel';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { MODELS } from '../models';
import { type SessionId } from 'convex-helpers/server/sessions';

export const streamChat = httpAction(async (ctx, request) => {
  const body = (await request.json()) as {
    streamId: string;
  };

  const searchParams = new URL(request.url).searchParams;
  const threadId = searchParams.get('threadId');
  const sessionId = searchParams.get('sessionId') as SessionId | null;

  // Start streaming and persisting at the same time while
  // we immediately return a streaming response to the client
  const response = await streamingComponent.stream(ctx, request, body.streamId as StreamId, async (ctx, request, streamId, append) => {
    // Lets grab the history up to now so that the AI has some context
    const [history, userConfig] = await Promise.all([
      ctx.runQuery(internal.messages.getHistory, { threadId: (threadId ?? undefined) as Id<'threads'> | undefined }),
      sessionId ? ctx.runQuery(api.user.getUserConfig, { sessionId }) : Promise.resolve(null),
    ]);

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const { textStream } = streamText({
      model: openrouter(userConfig?.currentlySelectedModel ?? MODELS[0].id),
      messages: history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      onFinish: async (message) => {
        await ctx.runMutation(internal.messages.updateMessage, {
          streamId,
          content: message.text,
        });
      },
    });

    // Append each chunk to the persistent stream as they come in from openai
    for await (const part of textStream) {
      await append(part);
    }
  });

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Vary', 'Origin');

  return response;
});
