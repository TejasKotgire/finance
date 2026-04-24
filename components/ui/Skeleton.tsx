import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-xl bg-white/[0.04] animate-pulse', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TxSkeleton() {
  return (
    <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <Skeleton className="h-4 w-14 flex-shrink-0" />
    </div>
  );
}
