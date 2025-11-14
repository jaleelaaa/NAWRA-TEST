'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scan, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BarcodeScanner } from './BarcodeScanner';
import { getBookByBarcode } from '@/lib/api/books';
import { toast } from 'sonner';
import type { Book } from '@/lib/types/books';

interface BarcodeLookupDialogProps {
  onBookFound?: (book: Book) => void;
  redirectOnFind?: boolean;
  triggerButton?: React.ReactNode;
}

export function BarcodeLookupDialog({
  onBookFound,
  redirectOnFind = false,
  triggerButton,
}: BarcodeLookupDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [foundBook, setFoundBook] = useState<Book | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleScan = async (barcode: string) => {
    setLoading(true);
    setError(null);
    setFoundBook(null);

    try {
      const book = await getBookByBarcode(barcode);
      setFoundBook(book as unknown as Book);
      toast.success(`Book found: ${book.title}`);

      if (onBookFound) {
        onBookFound(book as unknown as Book);
      }

      if (redirectOnFind) {
        // Close dialog and redirect to book details
        setOpen(false);
        router.push(`/admin/catalog/${book.id}`);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Book not found with this barcode';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFoundBook(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <Scan className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Book Lookup</DialogTitle>
          <DialogDescription>
            Scan a barcode or enter it manually to find a book
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Looking up book...</span>
            </div>
          )}

          {error && !loading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {foundBook && !loading && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-16 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  {foundBook.cover_image_url ? (
                    <img
                      src={foundBook.cover_image_url}
                      alt={foundBook.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-semibold text-lg">{foundBook.title}</h3>
                    {foundBook.title_ar && (
                      <p className="text-sm text-muted-foreground" dir="rtl">
                        {foundBook.title_ar}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    {foundBook.author && (
                      <span className="text-muted-foreground">
                        by {foundBook.author}
                      </span>
                    )}
                    {foundBook.publication_year && (
                      <span className="text-muted-foreground">
                        ({foundBook.publication_year})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant={foundBook.status === 'available' ? 'default' : 'secondary'}>
                      {foundBook.status}
                    </Badge>
                    {foundBook.language && (
                      <Badge variant="outline">{foundBook.language}</Badge>
                    )}
                    <Badge variant="outline">
                      {foundBook.available_quantity || 0} / {foundBook.quantity || 0} available
                    </Badge>
                  </div>

                  {foundBook.barcode && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Barcode</p>
                      <p className="font-mono font-semibold">{foundBook.barcode}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/admin/catalog/${foundBook.id}`);
                  }}
                  className="flex-1"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFoundBook(null);
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Scan Another
                </Button>
              </div>
            </div>
          )}

          {!foundBook && !loading && (
            <BarcodeScanner
              onScan={handleScan}
              onClose={handleClose}
              title="Scan or Enter Barcode"
              description="Position barcode in frame or enter manually"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
