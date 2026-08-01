export default function WalletLoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 bg-(--background)"
    >
      <div className="flex items-center gap-2">
        <span className="size-3 animate-bounce rounded-full bg-(--brand) [animation-delay:-0.3s]" />
        <span className="size-3 animate-bounce rounded-full bg-(--brand)/60 [animation-delay:-0.15s]" />
        <span className="size-3 animate-bounce rounded-full bg-(--brand-secondary)" />
      </div>
      {/* <p className="text-sm font-medium text-(--muted)">
        Initializing wallet…
      </p> */}
    </div>
  );
}
