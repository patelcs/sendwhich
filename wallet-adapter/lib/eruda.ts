import { env } from '@/configs';

let initialized = false;

export async function initializeEruda() {
  if (initialized) return;
  if (!env.enableEruda) return;

  const { default: eruda } = await import('eruda');
  eruda.init();
  initialized = true;
}
