import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 bg-zinc-800" />
        <Skeleton className="h-4 w-48 bg-zinc-800" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-28 bg-zinc-800" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-14 bg-zinc-800" />
            <Skeleton className="h-10 flex-1 bg-zinc-800" />
          </div>
        </div>
        <Skeleton className="h-10 w-full bg-zinc-800" />
      </div>
    </div>
  );
}
