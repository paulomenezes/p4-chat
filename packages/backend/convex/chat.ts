import { httpAction } from './_generated/server';
import { internal } from './_generated/api';
import { StreamId } from '@convex-dev/persistent-text-streaming';
import { streamingComponent } from './streaming';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { Id } from './_generated/dataModel';

export const streamChat = httpAction(async (ctx, request) => {
  const body = (await request.json()) as {
    streamId: string;
  };
  const threadId = new URL(request.url).searchParams.get('threadId');

  // Start streaming and persisting at the same time while
  // we immediately return a streaming response to the client
  const response = await streamingComponent.stream(ctx, request, body.streamId as StreamId, async (ctx, request, streamId, append) => {
    // Lets grab the history up to now so that the AI has some context
    const history = await ctx.runQuery(internal.messages.getHistory, { threadId: (threadId ?? undefined) as Id<'threads'> | undefined });

    const { textStream } = streamText({
      model: google('gemini-1.5-flash'),
      messages: history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      onFinish: async (message) => {
        console.log('message', message.text, streamId);
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
