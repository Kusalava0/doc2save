'use client';

import { useState } from 'react';
import { CalendarClock, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUpdateDocument } from '@/hooks/use-documents';
import { formatDateShort } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ExpiryDatePickerProps {
  documentId: string;
  expiryDate: string | null;
  isExpiringSoon: boolean;
}

export function ExpiryDatePicker({
  documentId,
  expiryDate,
  isExpiringSoon,
}: ExpiryDatePickerProps) {
  const [open, setOpen] = useState(false);
  const updateDocument = useUpdateDocument();

  const handleSelect = async (date: Date | undefined) => {
    if (!date) return;
    try {
      await updateDocument.mutateAsync({
        documentId,
        expiryDate: date.toISOString(),
      });
      toast.success('Expiry date set');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to set expiry date');
    }
  };

  const handleClear = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDocument.mutateAsync({
        documentId,
        expiryDate: null,
      });
      toast.success('Expiry date removed');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove expiry date');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button
          className={cn(
            'flex items-center gap-1 text-xs rounded-md px-1.5 py-0.5 transition-colors',
            expiryDate
              ? isExpiringSoon
                ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
                : 'text-muted-foreground bg-muted/50 hover:bg-muted'
              : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50'
          )}
        >
          <CalendarClock className="h-3 w-3" />
          <span>{expiryDate ? formatDateShort(expiryDate) : 'Set expiry'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <Calendar
          mode="single"
          selected={expiryDate ? new Date(expiryDate) : undefined}
          onSelect={handleSelect}
          defaultMonth={expiryDate ? new Date(expiryDate) : new Date()}
        />
        {expiryDate && (
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={updateDocument.isPending}
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <X className="h-3 w-3 mr-1" />
              Remove expiry
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
