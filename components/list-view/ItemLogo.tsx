'use client';

import { type LucideIcon } from 'lucide-react';
import { memo, useLayoutEffect, useRef } from 'react';

interface Props {
  icon?: string | undefined;
  alt?: string;
  showVerifiedBadge: boolean;
  DefaultIcon: LucideIcon;
}

function ItemLogoComponent({ icon, alt = '', showVerifiedBadge, DefaultIcon }: Props): React.ReactNode {
  const skeletonRef = useRef<HTMLDivElement>(null);
  const badgeSkeletonRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLImageElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  function handleIconReady(el: HTMLImageElement | null) {
    skeletonRef.current?.style.setProperty('display', 'none');
    badgeSkeletonRef.current?.style.setProperty('display', 'none');
    if (el) el.style.opacity = '1';
    badgeRef.current?.style.setProperty('opacity', '1');
  }

  // Runs after every ref in this commit (including badgeRef) is attached,
  // so it's safe even when the image was already cached and `complete`
  // is true before the onLoad event ever fires.
  useLayoutEffect(() => {
    if (imgRef.current?.complete) handleIconReady(imgRef.current);
  }, [icon]);

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center rounded-full backface-hidden transition-colors ${!icon ? 'bg-(--accent)' : ''}`}
    >
      {icon ? (
        <>
          <div ref={skeletonRef} className="absolute inset-0 animate-pulse rounded-full bg-(--accent)" />
          <img
            ref={imgRef}
            src={icon}
            alt={alt}
            onLoad={(e) => handleIconReady(e.currentTarget)}
            onError={() => handleIconReady(null)}
            className="size-full rounded-full object-cover opacity-0 transition-opacity duration-200"
          />
        </>
      ) : (
        <DefaultIcon size={18} />
      )}
      {icon && (
        <div
          ref={badgeSkeletonRef}
          className="absolute -right-1 -bottom-1 size-5 animate-pulse rounded-full bg-(--accent)"
        />
      )}
      {showVerifiedBadge && (
        <img
          ref={badgeRef}
          src="/badge-default.svg"
          alt="Default"
          className={`absolute -right-1 -bottom-1 size-5 rounded-full border border-(--card) transition-opacity duration-200 ${icon ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
    </div>
  );
}

export const ItemLogo = memo(ItemLogoComponent);
