'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      <Link
        href="/documents"
        className="text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
      >
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.id} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
            {isLast ? (
              <span className="text-white font-medium whitespace-nowrap">
                {item.name}
              </span>
            ) : (
              <Link
                href={`/documents/${item.id}`}
                className="text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
              >
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
