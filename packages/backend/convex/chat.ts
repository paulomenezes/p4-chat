import { httpAction } from './_generated/server';
import { api, internal } from './_generated/api';
import { streamingComponent } from './streaming';
import { streamText } from 'ai';
import { type StreamId } from '@convex-dev/persistent-text-streaming';
import { type Id } from './_generated/dataModel';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { MODELS } from '../models';
import { type SessionId } from 'convex-helpers/server/sessions';
import { google, GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';

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

    const latestMessage = history?.[history.length - 1];
    const isSearching = latestMessage?.isSearching ?? false;

    const startTime = Date.now();
    const model = latestMessage?.model ?? userConfig?.currentlySelectedModel ?? MODELS[0].id;

    const { fullStream, providerMetadata } = streamText({
      model: isSearching
        ? google('gemini-2.0-flash', {
            useSearchGrounding: true,
          })
        : openrouter(isSearching ? `${model}:online` : model),
      messages: history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      onFinish: async (message) => {
        const endTime = Date.now();
        const durationSeconds = (endTime - startTime) / 1000;

        let metadata: GoogleGenerativeAIProviderMetadata | undefined = undefined;

        try {
          const meta = await providerMetadata;
          metadata = meta?.google as GoogleGenerativeAIProviderMetadata | undefined;
        } catch (error) {
          console.error('Error getting provider metadata', error);
        }

        await ctx.runMutation(internal.messages.updateMessage, {
          streamId,
          content: message.text,
          model,
          promptTokens: message.usage.promptTokens,
          completionTokens: message.usage.completionTokens,
          totalTokens: message.usage.totalTokens,
          durationSeconds,
          tokensPerSecond: durationSeconds > 0 ? message.usage.totalTokens / durationSeconds : 0,
          reasoning: message.reasoning,
          searchMetadata: metadata ? JSON.stringify(metadata) : undefined,
        });
      },
    });

    let startedReasoning = false;
    let endReasoning = false;

    // Append each chunk to the persistent stream as they come in from openai
    for await (const part of fullStream) {
      switch (part.type) {
        case 'text-delta': {
          if (startedReasoning && !endReasoning) {
            endReasoning = true;
            await append('</reasoning>');
          }

          await append(part.textDelta);
          break;
        }
        case 'reasoning': {
          if (!startedReasoning) {
            startedReasoning = true;
            await append('<reasoning>');
          }

          await append(part.textDelta);

          break;
        }
      }
    }
  });

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Vary', 'Origin');

  return response;
});
