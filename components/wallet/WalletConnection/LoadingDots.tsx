export default function LoadingDots() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center gap-4 bg-(--background)"
    >
      <div className="flex items-center gap-2">
        <span className="size-2 animate-bounce rounded-full bg-(--brand) [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-(--brand)/60 [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-(--brand-secondary)" />
      </div>
    </div>
  );
}
