import { InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function InputField({ label, error, ...props }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id}>{label}</Label>
      <Input {...props} aria-invalid={!!error} />
      {error && <p className="text-xs text-(--danger)">{error}</p>}
    </div>
  );
}
