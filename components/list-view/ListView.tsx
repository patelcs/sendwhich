'use client';

import { type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { ListViewRow, type ListItem, type TextGetter } from './ListViewRow';

interface Props<LI extends ListItem> {
  list: LI[];
  DefaultIcon: LucideIcon;
  getPrimaryText: TextGetter<LI>;
  getSecondaryText?: TextGetter<LI>;
  getTertiaryText?: TextGetter<LI>;
}

export function ListView<LI extends ListItem>({
  list,
  DefaultIcon,
  getPrimaryText,
  getSecondaryText,
  getTertiaryText,
}: Props<LI>): React.ReactNode {
  const [selected, setSelected] = useState<LI[]>([]);

  function isSelected(item: LI) {
    return !!selected.find((i) => i.id === item.id);
  }

  function toggleSelect(item: LI) {
    if (isSelected(item)) setSelected((s) => s.filter((i) => i.id !== item.id));
    else setSelected((s) => [...s, item]);
  }

  return (
    <>
      <div className="themed-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden bg-transparent">
        {list.map((item, index) => (
          <ListViewRow
            key={item.id}
            item={item}
            isFirst={index === 0}
            isLast={index === list.length - 1}
            isSelected={isSelected(item)}
            onToggle={() => toggleSelect(item)}
            DefaultIcon={DefaultIcon}
            getPrimaryText={getPrimaryText}
            getSecondaryText={getSecondaryText}
            getTertiaryText={getTertiaryText}
          />
        ))}
      </div>
    </>
  );
}
