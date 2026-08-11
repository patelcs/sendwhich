import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Chain {
  id: number;
  name: string;
}

interface Props {
  id: string;
  label: string;
  value: number;
  onChange: (chainId: number) => void;
  chains: readonly Chain[];
  placeholder?: string;
  error?: string;
}

export function ChainField({ id, label, value, onChange, chains, placeholder = 'Select a chain', error }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(chainId) => chainId !== null && onChange(chainId)}>
        <SelectTrigger id={id} aria-invalid={!!error}>
          <SelectValue placeholder={placeholder}>
            {(chainId: number) => {
              const chain = chains.find((c) => c.id === chainId);
              return chain ? `${chain.id} · ${chain.name}` : placeholder;
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {chains.map((chain) => (
            <SelectItem key={chain.id} value={chain.id}>
              <span className="grid w-full grid-cols-[6rem_1fr] items-center gap-2">
                <span className="truncate text-left font-mono text-(--muted) tabular-nums">{chain.id}</span>
                <span className="min-w-0 truncate text-left">{chain.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-(--danger)">{error}</p>}
    </div>
  );
}
