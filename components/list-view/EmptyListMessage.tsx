interface Props {
  query: string;
  emptyText?: string;
}

/** "No results" for a search, or `emptyText` when the list itself is empty. */
export function EmptyListMessage({ query, emptyText = 'Nothing here yet' }: Props): React.ReactNode {
  return (
    <p className="py-8 text-center text-sm text-(--muted)">
      {query ? `No results found for query: '${query}'` : emptyText}
    </p>
  );
}
