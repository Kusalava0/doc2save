import { FileText, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileIconProps {
  mimeType: string;
  className?: string;
}

export function FileIcon({ mimeType, className }: FileIconProps) {
  if (mimeType === 'application/pdf') {
    return <FileText className={cn('h-5 w-5 text-red-400', className)} />;
  }

  if (mimeType.startsWith('image/')) {
    return <Image className={cn('h-5 w-5 text-green-400', className)} />;
  }

  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return <FileText className={cn('h-5 w-5 text-blue-400', className)} />;
  }

  return <File className={cn('h-5 w-5 text-muted-foreground', className)} />;
}
