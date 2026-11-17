import { Zap } from 'lucide-react';

/** The app's logo mark, used next to the navbar and dialog titles. */
export function BrandLogo({ size = 22 }: { size?: number }) {
  return <Zap size={size} className="shrink-0 text-(--brand)" aria-hidden="true" />;
}
