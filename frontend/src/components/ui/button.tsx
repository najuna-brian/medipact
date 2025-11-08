import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonPropsBase = {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
};

export type ButtonProps = ButtonPropsBase &
  (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' })
    | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' })
  );

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const { className, variant = 'default', size = 'md', as = 'button', ...restProps } = props;
    const baseClasses = cn(
      'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
      {
        'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground':
          variant === 'outline',
        'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        'bg-destructive text-destructive-foreground hover:bg-destructive/90':
          variant === 'destructive',
        'h-8 px-3 text-sm': size === 'sm',
        'h-10 px-4': size === 'md',
        'h-12 px-6 text-lg': size === 'lg',
      },
      className
    );

    if (as === 'a') {
      const anchorProps = restProps as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} className={baseClasses} {...anchorProps} />
      );
    }

    const buttonProps = restProps as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={baseClasses} {...buttonProps} />
    );
  }
);
Button.displayName = 'Button';

export { Button };

