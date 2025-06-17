import { defineApp } from 'convex/server';
import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config';
import resend from '@convex-dev/resend/convex.config';

const app = defineApp();
app.use(persistentTextStreaming);
app.use(resend);

export default app;
