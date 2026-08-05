import { env } from '../env';
import { BROWSER_CONFIGS } from './browser';
import { MINIKIT_CONFIGS } from './minikit';

export const uiConfigs = env.isMiniApp ? MINIKIT_CONFIGS : BROWSER_CONFIGS
