import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-(--brand)/40 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-(--danger) aria-invalid:ring-(--danger)/20 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-(--brand)/10 text-(--brand) [a]:hover:bg-(--brand)/20',
        secondary: 'bg-(--accent) text-(--foreground) [a]:hover:bg-(--accent)/70',
        destructive: 'bg-(--danger)/10 text-(--danger) focus-visible:ring-(--danger)/20 [a]:hover:bg-(--danger)/20',
        outline: 'border-(--border) text-(--foreground) [a]:hover:bg-(--accent)',
        ghost: 'hover:bg-(--accent) text-(--foreground)',
        link: 'text-(--brand) underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

export { Badge, badgeVariants };
