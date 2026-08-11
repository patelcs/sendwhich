import { DONATE_ADDRESS } from '@/lib/constants';
import { TextareaHTMLAttributes } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  error?: string;
}

export function AddressField({ label, error, onChange, ...props }: Props) {
  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = `${textarea.scrollHeight}px`;
    onChange && onChange(e);
  };
  return (
    <div className="space-y-1.5">
      <Label htmlFor={props.id}>{label}</Label>
      <Textarea
        {...props}
        rows={1}
        onChange={handleAddressChange}
        placeholder="0x.. or vitalik.eth"
        aria-invalid={!!error}
      />
      {error && <p className="text-xs text-(--danger)">{error}</p>}
    </div>
  );
}
