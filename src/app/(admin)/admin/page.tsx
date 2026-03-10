'use client';

import {
  Users,
  CreditCard,
  IndianRupee,
  FileText,
  HardDrive,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAdminStats } from '@/hooks/use-admin';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatCurrency(paise: number): string {
  return `Rs ${(paise / 100).toLocaleString('en-IN')}`;
}

const statCards = [
  {
    key: 'totalUsers' as const,
    label: 'Total Users',
    icon: Users,
    format: (v: number) => v.toLocaleString(),
    color: 'text-blue-400',
    bgColor: 'bg-blue-600/10',
  },
  {
    key: 'activeSubscribers' as const,
    label: 'Active Subscribers',
    icon: CreditCard,
    format: (v: number) => v.toLocaleString(),
    color: 'text-green-400',
    bgColor: 'bg-green-600/10',
  },
  {
    key: 'monthlyRevenue' as const,
    label: 'Monthly Revenue',
    icon: IndianRupee,
    format: formatCurrency,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-600/10',
  },
  {
    key: 'totalDocuments' as const,
    label: 'Total Works',
    icon: FileText,
    format: (v: number) => v.toLocaleString(),
    color: 'text-purple-400',
    bgColor: 'bg-purple-600/10',
  },
  {
    key: 'totalStorageBytes' as const,
    label: 'Total Storage',
    icon: HardDrive,
    format: formatBytes,
    color: 'text-orange-400',
    bgColor: 'bg-orange-600/10',
  },
];

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useAdminStats();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of AptsWorks platform metrics
        </p>
      </div>

      {error ? (
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-3 py-8 justify-center">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-muted-foreground">Failed to load stats</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <Card key={card.key} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">
                    {stats ? card.format(stats[card.key]) : '--'}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
