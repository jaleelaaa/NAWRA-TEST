"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Download, AlertCircle } from "lucide-react"
import { StatsCards } from "@/components/books/StatsCards"
import { SearchAndFilters } from "@/components/books/SearchAndFilters"
import { BookCard } from "@/components/books/BookCard"
import { BooksSkeleton } from "@/components/books/BooksSkeleton"
import { BookFormModal } from "@/components/books/BookFormModal"
import { useBooks, useBookStatistics, useCategories, useDeleteBook } from "@/hooks/useBooks"
import type { BookFilters, BookResponse } from "@/lib/types/books"
import AdminLayout from "@/components/AdminLayout"
import { Pagination } from "@/components/Pagination"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CatalogPage() {
  const t = useTranslations("books")
  const locale = useLocale()

  // Filters state
  const [filters, setFilters] = useState<BookFilters>({
    page: 1,
    page_size: 12,
    search: "",
    category_id: undefined,
    status: undefined,
  })
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Modal state
  const [showBookModal, setShowBookModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookResponse | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<BookResponse | null>(null)

  // Fetch data using React Query hooks
  const { data: booksData, isLoading: booksLoading, error: booksError, refetch: refetchBooks } = useBooks(filters)
  const { data: statistics, isLoading: statsLoading } = useBookStatistics()
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories(true)
  const deleteBook = useDeleteBook()

  // Extract data from responses
  const books = booksData?.items || []
  const totalBooks = booksData?.meta?.total || 0
  const totalPages = booksData?.meta?.total_pages || 0
  const categories = categoriesData?.items || []

  // Reset to page 1 when filters change (except page itself)
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1 }))
  }, [filters.search, filters.category_id, filters.status, filters.page_size])

  // Handle filter changes
  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }))
  }

  const handleCategoryChange = (categoryId: string | null) => {
    setFilters(prev => ({
      ...prev,
      category_id: categoryId || undefined,
      page: 1
    }))
  }

  const handleStatusChange = (status: string | null) => {
    setFilters(prev => ({
      ...prev,
      status: status as any || undefined,
      page: 1
    }))
  }

  // Handle page change with scroll to top
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle items per page change
  const handleItemsPerPageChange = (items: number) => {
    setFilters(prev => ({ ...prev, page_size: items, page: 1 }))
  }

  // CRUD handlers
  const handleAddBook = () => {
    setSelectedBook(null)
    setModalMode('create')
    setShowBookModal(true)
  }

  const handleEditBook = (book: BookResponse) => {
    setSelectedBook(book)
    setModalMode('edit')
    setShowBookModal(true)
  }

  const handleDeleteClick = (book: BookResponse) => {
    setBookToDelete(book)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (bookToDelete) {
      await deleteBook.mutateAsync(bookToDelete.id)
      setShowDeleteDialog(false)
      setBookToDelete(null)
    }
  }

  const handleCloseModal = () => {
    setShowBookModal(false)
    setSelectedBook(null)
  }

  // Show loading skeleton
  if (booksLoading || statsLoading || categoriesLoading) {
    return (
      <AdminLayout>
        <BooksSkeleton />
      </AdminLayout>
    )
  }

  // Show error state
  if (booksError) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("errorLoading")} {(booksError as any)?.message || "Unknown error"}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetchBooks()}>
            {t("retry")}
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2 border-border/50 hover:bg-accent hover:border-primary/50 transition-all"
              >
                <Upload className="h-4 w-4" />
                {t("import")}
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-border/50 hover:bg-accent hover:border-primary/50 transition-all"
              >
                <Download className="h-4 w-4" />
                {t("export")}
              </Button>
              <Button
                onClick={handleAddBook}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                {t("addBook")}
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8">
          <StatsCards stats={statistics} />
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchAndFilters
            searchTerm={filters.search || ""}
            onSearchChange={handleSearchChange}
            selectedCategory={filters.category_id || null}
            onCategoryChange={handleCategoryChange}
            selectedStatus={filters.status || null}
            onStatusChange={handleStatusChange}
            categories={categories}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground font-medium">
            {t("showingBooks", {
              count: books.length,
              total: totalBooks
            })}
          </p>
        </div>

        {/* Books Grid/List */}
        {books.length > 0 ? (
          <>
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-4"
              }
            >
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  viewMode={viewMode}
                  onEdit={handleEditBook}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <Pagination
                currentPage={filters.page || 1}
                totalPages={totalPages}
                itemsPerPage={filters.page_size || 12}
                totalItems={totalBooks}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemType="books"
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-6">
              <svg
                className="h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{t("noBooks")}</h3>
            <p className="text-sm text-muted-foreground">{t("tryAdjusting")}</p>
          </div>
        )}
      </div>

      {/* Book Form Modal */}
      <BookFormModal
        open={showBookModal}
        onClose={handleCloseModal}
        book={selectedBook}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmMessage", {
                title: bookToDelete?.title || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
