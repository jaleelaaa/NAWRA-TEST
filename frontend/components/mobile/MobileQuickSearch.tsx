'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, BookOpen, Scan } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { searchBooks } from '@/lib/api/books';
import { BarcodeLookupDialog } from '@/components/barcode/BarcodeLookupDialog';
import type { BookListItem } from '@/lib/types/books';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface MobileQuickSearchProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

export function MobileQuickSearch({ onClose, autoFocus = true }: MobileQuickSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Load recent searches from localStorage
    const recent = localStorage.getItem('nawra_recent_searches');
    if (recent) {
      try {
        setRecentSearches(JSON.parse(recent));
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);

    try {
      const response = await searchBooks(searchQuery, 1, 10);
      setResults(response.data);

      // Save to recent searches
      if (searchQuery.trim()) {
        const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('nawra_recent_searches', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
  };

  const handleBookClick = (bookId: string) => {
    router.push(`/admin/catalog/${bookId}`);
    if (onClose) onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('nawra_recent_searches');
    toast.success('Recent searches cleared');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search books, authors, ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <BarcodeLookupDialog
          triggerButton={
            <Button variant="outline" size="icon">
              <Scan className="h-4 w-4" />
            </Button>
          }
          redirectOnFind
          onBookFound={() => {
            if (onClose) onClose();
          }}
        />

        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results or Recent Searches */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm">Searching...</span>
            </div>
          )}

          {/* Search Results */}
          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Results ({results.length})</h3>
              </div>
              {results.map((book) => (
                <Card
                  key={book.id}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleBookClick(book.id)}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      {book.cover_image_url || book.thumbnail_url ? (
                        <img
                          src={book.thumbnail_url || book.cover_image_url}
                          alt={book.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-medium text-sm line-clamp-2">{book.title}</h4>
                      {book.author && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {book.author}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={book.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                          {book.status}
                        </Badge>
                        {book.language && (
                          <Badge variant="outline" className="text-xs">
                            {book.language}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No books found for "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try different keywords or check spelling
              </p>
            </div>
          )}

          {/* Recent Searches */}
          {!loading && !query && recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Recent Searches</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                  >
                    <Search className="h-3 w-3 inline mr-2 text-muted-foreground" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !query && recentSearches.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-1">Quick Search</h3>
              <p className="text-sm text-muted-foreground">
                Search by title, author, ISBN, or keywords
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Or use the scan button to lookup by barcode
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
