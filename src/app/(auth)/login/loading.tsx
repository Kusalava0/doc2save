import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 bg-muted" />
        <Skeleton className="h-4 w-48 bg-muted" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-28 bg-muted" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-14 bg-muted" />
            <Skeleton className="h-10 flex-1 bg-muted" />
          </div>
        </div>
        <Skeleton className="h-10 w-full bg-muted" />
      </div>
    </div>
  );
}
