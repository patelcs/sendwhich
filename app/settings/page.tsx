import { uiConfigs } from '@/configs';
import { redirect } from 'next/navigation';

export default function SettingsPage() {
  redirect(uiConfigs.routes.settingLinks[0].href);
}
