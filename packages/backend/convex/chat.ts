import { httpAction } from './_generated/server';
import { api, internal } from './_generated/api';
import { streamingComponent } from './streaming';
import { streamText, experimental_generateImage as generateImage } from 'ai';
import { type StreamId } from '@convex-dev/persistent-text-streaming';
import { type Id } from './_generated/dataModel';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { MODELS } from '../models';
import { type SessionId } from 'convex-helpers/server/sessions';
import { google, type GoogleGenerativeAIProviderMetadata } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';

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

    if (model === 'openai/gpt-image-1') {
      try {
        const { image } = await generateImage({
          model: openai.image('gpt-image-1'),
          prompt: latestMessage?.content ?? '',
          providerOptions: {
            openai: { quality: 'low' },
          },
        });

        const uploadUrl = await ctx.runMutation(api.files.generateUploadUrl);

        const file = new File([image.uint8Array], 'image.png', { type: image.mimeType });

        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': image.mimeType },
          body: file,
        });

        const { storageId } = await result.json();
        const size = image.uint8Array.length;

        await Promise.all([
          ctx.runMutation(internal.messages.updateMessage, {
            streamId,
            content: '',
            model,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            durationSeconds: 0,
            tokensPerSecond: 0,
            reasoning: undefined,
            searchMetadata: undefined,
            files: [storageId],
          }),
          sessionId &&
            ctx.runMutation(api.files.addAttachment, {
              storageId,
              name: 'image.png',
              size,
              type: image.mimeType,
              sessionId,
            }),
        ]);
      } catch (error) {
        console.error('Error getting file', error);
      }
    } else {
      const { fullStream, providerMetadata } = streamText({
        model: isSearching
          ? google('gemini-2.0-flash', {
              useSearchGrounding: true,
            })
          : openrouter(isSearching ? `${model}:online` : model),
        messages: [
          ...(await Promise.all([
            ...history.map(async (message) => {
              const files = message.files ?? [];
              const filesUrls = await ctx.runQuery(api.files.getFilesUrls, { storageIds: files });

              if (filesUrls.length > 0 && message.role === 'user') {
                return {
                  role: 'user' as const,
                  content: [
                    {
                      type: 'text' as const,
                      text: message.content,
                    },
                    ...filesUrls
                      .map((url) => {
                        if (!url.url || !url.metadata) {
                          return undefined;
                        }

                        const isImage = url.metadata.contentType?.startsWith('image/');

                        if (isImage) {
                          return {
                            type: 'image' as const,
                            image: new URL(url.url),
                            mimeType: url.metadata.contentType ?? 'application/octet-stream',
                          };
                        }

                        return {
                          type: 'file' as const,
                          data: new URL(url.url),
                          mimeType: url.metadata.contentType ?? 'application/octet-stream',
                        };
                      })
                      .filter((part) => part !== undefined),
                  ],
                };
              }

              return {
                role: message.role,
                content: message.content,
              };
            }),
          ])),
        ],
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
    }
  });

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Vary', 'Origin');

  return response;
});
