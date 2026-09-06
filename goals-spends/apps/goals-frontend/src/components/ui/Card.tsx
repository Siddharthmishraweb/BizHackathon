import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-ink-100/60 bg-white/90 shadow-card backdrop-blur-sm',
        'transition-shadow duration-300 hover:shadow-card-hover',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('flex items-center justify-between gap-3 px-5 pt-5', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-5 pb-5', className)} {...rest}>
      {children}
    </div>
  );
}
