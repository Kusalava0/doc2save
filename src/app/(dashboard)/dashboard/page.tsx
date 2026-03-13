'use client';

import Link from 'next/link';
import {
  FileText,
  FolderOpen,
  Upload,
  CreditCard,
  Clock,
  Receipt,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useUser } from '@/hooks/use-user';
import { useRecentDocuments, useTaggedDocument } from '@/hooks/use-documents';
import { formatDateShort } from '@/lib/format';

export default function DashboardPage() {
  const { auth } = useAuthStore();
  const openModal = useUIStore((s) => s.openModal);
  const { data: profile, isLoading: profileLoading } = useUser();
  const { data: recentDocs, isLoading: recentLoading } = useRecentDocuments();
  const { data: gstDoc, isLoading: gstLoading } = useTaggedDocument('gst');
  const { data: contractorDoc, isLoading: contractorLoading } = useTaggedDocument('contractor-registration');

  const user = auth.status === 'authenticated' ? auth.user : null;
  const greeting = user?.name ? `Welcome back, ${user.name}` : 'Welcome back';

  const stats = [
    {
      title: 'Total Works',
      value: profileLoading ? null : (profile?.documentCount ?? 0).toString(),
      description: 'Uploaded works',
      icon: FileText,
    },
    {
      title: 'Subscription',
      value: profileLoading
        ? null
        : user?.freeUploadUsed
          ? 'Check status'
          : 'Free trial',
      description: 'Current plan',
      icon: CreditCard,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{greeting}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your work documents securely.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="bg-card border-border text-foreground"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-muted-foreground">
                  {stat.title}
                </CardDescription>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {stat.value === null ? (
                <Skeleton className="h-8 w-20 bg-muted" />
              ) : (
                <div className="text-lg font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Cards */}
      <div className="grid gap-4 grid-cols-2">
        {/* GST Card */}
        {gstLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-3 p-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ) : gstDoc ? (
          <Link href={`/preview/${gstDoc.id}`}>
            <Card className="bg-card border-border text-foreground cursor-pointer hover:border-green-500/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-600/10">
                  <Receipt className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{gstDoc.name}</p>
                  <p className="text-xs text-muted-foreground">GST Certificate</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal({ type: 'delete-document', documentId: gstDoc.id, documentName: gstDoc.name });
                  }}
                  className="p-1 rounded-md shrink-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card
            className="bg-card border-border text-foreground cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => openModal({ type: 'upload', dashboardTag: 'gst' })}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10">
                <Receipt className="h-4 w-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Upload GST</p>
                <p className="text-xs text-muted-foreground truncate">GST certificate</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contractor Registration Card */}
        {contractorLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-3 p-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ) : contractorDoc ? (
          <Link href={`/preview/${contractorDoc.id}`}>
            <Card className="bg-card border-border text-foreground cursor-pointer hover:border-green-500/50 transition-colors">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-600/10">
                  <UserCheck className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{contractorDoc.name}</p>
                  <p className="text-xs text-muted-foreground">Contractor Reg.</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal({ type: 'delete-document', documentId: contractorDoc.id, documentName: contractorDoc.name });
                  }}
                  className="p-1 rounded-md shrink-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card
            className="bg-card border-border text-foreground cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => openModal({ type: 'upload', dashboardTag: 'contractor-registration' })}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10">
                <UserCheck className="h-4 w-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Contractor Reg.</p>
                <p className="text-xs text-muted-foreground truncate">Upload registration</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => openModal({ type: 'upload' })}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Work
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-border text-foreground/80 hover:bg-accent hover:text-foreground"
          >
            <Link href="/documents">
              <FolderOpen className="h-4 w-4 mr-2" />
              Browse Works
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Uploads */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Recent Uploads</h2>
          <Link
            href="/recent"
            className="text-sm text-blue-500 hover:text-blue-400"
          >
            View all
          </Link>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {recentLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded bg-muted" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40 bg-muted" />
                      <Skeleton className="h-3 w-24 bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentDocs && recentDocs.length > 0 ? (
              <div className="divide-y divide-border">
                {recentDocs.slice(0, 5).map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/preview/${doc.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateShort(doc.uploadedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Clock className="h-10 w-10 text-zinc-600 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No recent uploads. Upload your first work to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
