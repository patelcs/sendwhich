import { uiConfigs } from '@/configs';
import { redirect } from 'next/navigation';

export default function SettingsPage() {
  redirect(uiConfigs.routes.addressBookLinks[0].href);
}