'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, BookOpen } from 'lucide-react';
import { useCreateBook, useUpdateBook, useCategories } from '@/hooks/useBooks';
import type { BookResponse, BookCreate, BookUpdate, BookStatus, BookLanguage } from '@/lib/types/books';

// Form validation schema
const bookFormSchema = z.object({
  isbn: z.string().optional(),
  barcode: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  title_ar: z.string().optional(),
  subtitle: z.string().optional(),
  subtitle_ar: z.string().optional(),
  author: z.string().min(1, 'Author is required').max(200, 'Author name is too long'),
  author_ar: z.string().optional(),
  co_authors: z.string().optional(),
  co_authors_ar: z.string().optional(),
  publisher: z.string().optional(),
  publisher_ar: z.string().optional(),
  publication_year: z.number().int().min(1000).max(new Date().getFullYear() + 1).optional().or(z.literal('')),
  publication_place: z.string().optional(),
  edition: z.string().optional(),
  category_id: z.string().optional(),
  dewey_decimal: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
  pages: z.number().int().positive().optional().or(z.literal('')),
  dimensions: z.string().optional(),
  binding_type: z.string().optional(),
  description: z.string().optional(),
  description_ar: z.string().optional(),
  table_of_contents: z.string().optional(),
  table_of_contents_ar: z.string().optional(),
  subjects: z.string().optional(),
  subjects_ar: z.string().optional(),
  keywords: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  available_quantity: z.number().int().min(0).optional(),
  shelf_location: z.string().optional(),
  acquisition_date: z.string().optional(),
  acquisition_method: z.string().optional(),
  price: z.number().positive().optional().or(z.literal('')),
  vendor: z.string().optional(),
  status: z.string(),
  notes: z.string().optional(),
  notes_ar: z.string().optional(),
});

type BookFormData = z.infer<typeof bookFormSchema>;

interface BookFormModalProps {
  open: boolean;
  onClose: () => void;
  book?: BookResponse | null;
  mode: 'create' | 'edit';
}

export function BookFormModal({ open, onClose, book, mode }: BookFormModalProps) {
  const t = useTranslations('books');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const { data: categoriesData } = useCategories(false);
  const categories = categoriesData?.items || [];

  const createBook = useCreateBook();
  const updateBook = useUpdateBook();

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      isbn: book?.isbn || '',
      barcode: book?.barcode || '',
      title: book?.title || '',
      title_ar: book?.title_ar || '',
      subtitle: book?.subtitle || '',
      subtitle_ar: book?.subtitle_ar || '',
      author: book?.author || '',
      author_ar: book?.author_ar || '',
      co_authors: book?.co_authors || '',
      co_authors_ar: book?.co_authors_ar || '',
      publisher: book?.publisher || '',
      publisher_ar: book?.publisher_ar || '',
      publication_year: book?.publication_year || ('' as any),
      publication_place: book?.publication_place || '',
      edition: book?.edition || '',
      category_id: book?.category_id || '',
      dewey_decimal: book?.dewey_decimal || '',
      language: book?.language || 'en',
      pages: book?.pages || ('' as any),
      dimensions: book?.dimensions || '',
      binding_type: book?.binding_type || '',
      description: book?.description || '',
      description_ar: book?.description_ar || '',
      table_of_contents: book?.table_of_contents || '',
      table_of_contents_ar: book?.table_of_contents_ar || '',
      subjects: book?.subjects || '',
      subjects_ar: book?.subjects_ar || '',
      keywords: book?.keywords || '',
      cover_image_url: book?.cover_image_url || '',
      thumbnail_url: book?.thumbnail_url || '',
      quantity: book?.quantity || 1,
      available_quantity: book?.available_quantity || ('' as any),
      shelf_location: book?.shelf_location || '',
      acquisition_date: book?.acquisition_date || '',
      acquisition_method: book?.acquisition_method || '',
      price: book?.price || ('' as any),
      vendor: book?.vendor || '',
      status: book?.status || 'available',
      notes: book?.notes || '',
      notes_ar: book?.notes_ar || '',
    },
  });

  // Reset form when book changes
  useEffect(() => {
    if (book && mode === 'edit') {
      form.reset({
        isbn: book.isbn || '',
        barcode: book.barcode || '',
        title: book.title,
        title_ar: book.title_ar || '',
        subtitle: book.subtitle || '',
        subtitle_ar: book.subtitle_ar || '',
        author: book.author,
        author_ar: book.author_ar || '',
        co_authors: book.co_authors || '',
        co_authors_ar: book.co_authors_ar || '',
        publisher: book.publisher || '',
        publisher_ar: book.publisher_ar || '',
        publication_year: book.publication_year || ('' as any),
        publication_place: book.publication_place || '',
        edition: book.edition || '',
        category_id: book.category_id || '',
        dewey_decimal: book.dewey_decimal || '',
        language: book.language,
        pages: book.pages || ('' as any),
        dimensions: book.dimensions || '',
        binding_type: book.binding_type || '',
        description: book.description || '',
        description_ar: book.description_ar || '',
        table_of_contents: book.table_of_contents || '',
        table_of_contents_ar: book.table_of_contents_ar || '',
        subjects: book.subjects || '',
        subjects_ar: book.subjects_ar || '',
        keywords: book.keywords || '',
        cover_image_url: book.cover_image_url || '',
        thumbnail_url: book.thumbnail_url || '',
        quantity: book.quantity,
        available_quantity: book.available_quantity || ('' as any),
        shelf_location: book.shelf_location || '',
        acquisition_date: book.acquisition_date || '',
        acquisition_method: book.acquisition_method || '',
        price: book.price || ('' as any),
        vendor: book.vendor || '',
        status: book.status,
        notes: book.notes || '',
        notes_ar: book.notes_ar || '',
      });
    } else if (mode === 'create') {
      form.reset({
        isbn: '',
        barcode: '',
        title: '',
        title_ar: '',
        author: '',
        author_ar: '',
        language: 'en',
        quantity: 1,
        available_quantity: 1,
        status: 'available',
      });
    }
  }, [book, mode, form]);

  const onSubmit = async (data: BookFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === '' ? undefined : value])
      ) as any;

      if (mode === 'create') {
        await createBook.mutateAsync(cleanData as BookCreate);
      } else if (book) {
        await updateBook.mutateAsync({
          id: book.id,
          book: cleanData as BookUpdate,
        });
      }
      form.reset();
      onClose();
    } catch (error) {
      // Error handled by mutation hooks
    }
  };

  const isSubmitting = createBook.isPending || updateBook.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {mode === 'create' ? t('form.addBook') : t('form.editBook')}
              </DialogTitle>
              <DialogDescription>
                {mode === 'create'
                  ? t('form.addBookDescription')
                  : t('form.editBookDescription')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                {t('form.basicInformation')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title (English) */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required">{t('form.title')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('form.titlePlaceholder')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title (Arabic) */}
                <FormField
                  control={form.control}
                  name="title_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.titleAr')}</FormLabel>
                      <FormControl>
                        <Input {...field} dir="rtl" placeholder={t('form.titleArPlaceholder')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Author (English) */}
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required">{t('form.author')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('form.authorPlaceholder')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Author (Arabic) */}
                <FormField
                  control={form.control}
                  name="author_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.authorAr')}</FormLabel>
                      <FormControl>
                        <Input {...field} dir="rtl" placeholder={t('form.authorArPlaceholder')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ISBN */}
                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.isbn')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="978-3-16-148410-0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Barcode */}
                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.barcode')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('form.barcodePlaceholder')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Publisher */}
                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.publisher')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('form.publisherPlaceholder')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Publication Year */}
                <FormField
                  control={form.control}
                  name="publication_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.publicationYear')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                          placeholder="2024"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.category')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('form.selectCategory')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {isRTL ? category.name_ar || category.name : category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Language */}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required">{t('form.language')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">{t('language.english')}</SelectItem>
                          <SelectItem value="ar">{t('language.arabic')}</SelectItem>
                          <SelectItem value="bilingual">{t('language.bilingual')}</SelectItem>
                          <SelectItem value="other">{t('language.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pages */}
                <FormField
                  control={form.control}
                  name="pages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.pages')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                          placeholder="256"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantity */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="required">{t('form.quantity')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                {mode === 'edit' && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('form.status')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">{t('status.available')}</SelectItem>
                            <SelectItem value="checked_out">{t('status.checkedOut')}</SelectItem>
                            <SelectItem value="reserved">{t('status.reserved')}</SelectItem>
                            <SelectItem value="processing">{t('status.processing')}</SelectItem>
                            <SelectItem value="damaged">{t('status.damaged')}</SelectItem>
                            <SelectItem value="lost">{t('status.lost')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Shelf Location */}
                <FormField
                  control={form.control}
                  name="shelf_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.shelfLocation')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="A-101" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                {t('form.description')}
              </h3>

              {/* Description (English) */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder={t('form.descriptionPlaceholder')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description (Arabic) */}
              <FormField
                control={form.control}
                name="description_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.descriptionAr')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} dir="rtl" rows={3} placeholder={t('form.descriptionArPlaceholder')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cover Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                {t('form.coverImages')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.coverImageUrl')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumbnail_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.thumbnailUrl')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('form.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? t('form.create') : t('form.update')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
