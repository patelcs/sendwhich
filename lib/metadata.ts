import { Metadata } from 'next';
import { APP_DESCRIPTION, APP_NAME, APP_URL } from './constants';

const PAGE_TITLE = `${APP_NAME} — Crypto Utility Tools`;

export const metadata: Metadata = {
  title: {
    default: PAGE_TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  metadataBase: APP_URL,
  openGraph: {
    title: PAGE_TITLE,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};
