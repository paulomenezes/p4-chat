'use server';

import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { api } from '@p4-chat/backend/convex/_generated/api';
import { fetchMutation } from 'convex/nextjs';
import CryptoJS from 'crypto-js';

export async function setApiKey(type: 'openRouter' | 'openai' | 'google', key: string) {
  const encryptedKey = CryptoJS.AES.encrypt(key, process.env.ENCRYPTION_KEY!).toString();

  await fetchMutation(
    api.keys.setApiKeys,
    {
      type,
      key: encryptedKey,
    },
    {
      token: await convexAuthNextjsToken(),
    },
  );
}

export async function deleteApiKey(type: 'openRouter' | 'openai' | 'google') {
  await fetchMutation(
    api.keys.deleteApiKey,
    {
      type,
    },
    {
      token: await convexAuthNextjsToken(),
    },
  );
}
