let initialized = false;

export async function initializeEruda() {
  if (initialized) return;
  if (process.env.NEXT_PUBLIC_ENABLE_ERUDA !== 'true') return;

  const { default: eruda } = await import('eruda');
  eruda.init();
  initialized = true;
}
