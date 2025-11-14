'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { BookFilters } from '@/lib/types/books';

interface AdvancedSearchDialogProps {
  onSearch: (filters: BookFilters) => void;
  initialFilters?: BookFilters;
  triggerButton?: React.ReactNode;
}

export function AdvancedSearchDialog({
  onSearch,
  initialFilters = {},
  triggerButton,
}: AdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<BookFilters>(initialFilters);

  const handleReset = () => {
    setFilters({});
  };

  const handleSearch = () => {
    // Remove empty filter values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== undefined)
    );
    onSearch(cleanFilters);
    setOpen(false);
  };

  const updateFilter = (key: keyof BookFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Search
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
          <DialogDescription>
            Use multiple criteria to find specific books
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Keywords</Label>
            <Input
              id="search"
              placeholder="Search in title, author, description..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>

          {/* Accordion for organized filters */}
          <Accordion type="multiple" className="w-full">
            {/* Book Details */}
            <AccordionItem value="details">
              <AccordionTrigger>Book Details</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Book title..."
                      value={(filters as any).title || ''}
                      onChange={(e) => updateFilter('title' as any, e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      placeholder="Author name..."
                      value={(filters as any).author || ''}
                      onChange={(e) => updateFilter('author' as any, e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      placeholder="ISBN number..."
                      value={(filters as any).isbn || ''}
                      onChange={(e) => updateFilter('isbn' as any, e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      placeholder="Publisher name..."
                      value={(filters as any).publisher || ''}
                      onChange={(e) => updateFilter('publisher' as any, e.target.value)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Classification */}
            <AccordionItem value="classification">
              <AccordionTrigger>Classification</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={filters.language || ''}
                      onValueChange={(value) => updateFilter('language', value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Languages</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="bilingual">Bilingual</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={filters.status || ''}
                      onValueChange={(value) => updateFilter('status', value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="checked_out">Checked Out</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dewey">Dewey Decimal</Label>
                    <Input
                      id="dewey"
                      placeholder="e.g., 500, 500-599"
                      value={(filters as any).dewey_decimal || ''}
                      onChange={(e) => updateFilter('dewey_decimal' as any, e.target.value)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Publication Info */}
            <AccordionItem value="publication">
              <AccordionTrigger>Publication Information</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year_from">Publication Year (From)</Label>
                    <Input
                      id="year_from"
                      type="number"
                      placeholder="e.g., 2000"
                      value={(filters as any).publication_year_from || ''}
                      onChange={(e) => updateFilter('publication_year_from' as any, e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year_to">Publication Year (To)</Label>
                    <Input
                      id="year_to"
                      type="number"
                      placeholder="e.g., 2024"
                      value={(filters as any).publication_year_to || ''}
                      onChange={(e) => updateFilter('publication_year_to' as any, e.target.value)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Location */}
            <AccordionItem value="location">
              <AccordionTrigger>Location</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Shelf Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., A-12, Room 5, Shelf B"
                    value={(filters as any).shelf_location || ''}
                    onChange={(e) => updateFilter('shelf_location' as any, e.target.value)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Availability */}
            <AccordionItem value="availability">
              <AccordionTrigger>Availability</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available_only"
                    checked={filters.available_only || false}
                    onChange={(e) => updateFilter('available_only', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="available_only" className="cursor-pointer">
                    Show only available books
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
