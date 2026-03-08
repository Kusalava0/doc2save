'use client';

import { useState } from 'react';
import {
  BarChart3,
  IndianRupee,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminRevenue } from '@/hooks/use-admin';

function formatCurrency(paise: number): string {
  return `Rs ${(paise / 100).toLocaleString('en-IN')}`;
}

export default function AdminRevenuePage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data, isLoading, error } = useAdminRevenue(year);

  const totalAnnualRevenue = data?.revenue.reduce(
    (sum, m) => sum + m.total,
    0
  ) ?? 0;

  const totalTransactions = data?.revenue.reduce(
    (sum, m) => sum + m.transactionCount,
    0
  ) ?? 0;

  // Find the max revenue month for the simple bar chart
  const maxRevenue = Math.max(
    ...(data?.revenue.map((m) => m.total) ?? [0]),
    1
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border text-muted-foreground hover:bg-accent"
            onClick={() => setYear((y) => y - 1)}
            disabled={year <= 2023}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-foreground font-medium w-12 text-center">
            {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border text-muted-foreground hover:bg-accent"
            onClick={() => setYear((y) => y + 1)}
            disabled={year >= currentYear}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Annual Revenue ({year})
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-600/10">
              <IndianRupee className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalAnnualRevenue)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transactions ({year})
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-600/10">
              <BarChart3 className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {totalTransactions.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart (simple bar visualization) */}
      {!isLoading && !error && data && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-base">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.revenue.map((month) => (
                <div key={month.month} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-10 shrink-0">
                    {month.month.slice(0, 3)}
                  </span>
                  <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-md transition-all duration-300"
                      style={{
                        width:
                          month.total > 0
                            ? `${Math.max((month.total / maxRevenue) * 100, 2)}%`
                            : '0%',
                      }}
                    />
                  </div>
                  <span className="text-xs text-foreground/80 w-24 text-right shrink-0">
                    {formatCurrency(month.total)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-muted-foreground">Failed to load revenue data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Month</TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Revenue
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Transactions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.revenue.map((month) => (
                    <TableRow
                      key={month.month}
                      className="border-border hover:bg-accent/50"
                    >
                      <TableCell className="text-foreground/80">
                        {month.month}
                      </TableCell>
                      <TableCell className="text-foreground/80 text-right font-mono">
                        {formatCurrency(month.total)}
                      </TableCell>
                      <TableCell className="text-foreground/80 text-right">
                        {month.transactionCount}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total row */}
                  <TableRow className="border-border bg-accent/50">
                    <TableCell className="text-foreground font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-foreground font-semibold text-right font-mono">
                      {formatCurrency(totalAnnualRevenue)}
                    </TableCell>
                    <TableCell className="text-foreground font-semibold text-right">
                      {totalTransactions}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
