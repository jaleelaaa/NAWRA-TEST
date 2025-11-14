"use client"

import { useState, useMemo, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import AdminLayout from "@/components/AdminLayout"
import Breadcrumb from "@/components/Breadcrumb"
import { Pagination } from "@/components/Pagination"
import CirculationHeader from "@/components/circulation/CirculationHeader"
import StatisticsCards from "@/components/circulation/StatisticsCards"
import SearchAndFilters from "@/components/circulation/SearchAndFilters"
import CirculationTable from "@/components/circulation/CirculationTable"
import IssueBookModal from "@/components/circulation/IssueBookModal"
import ReturnBookModal from "@/components/circulation/ReturnBookModal"
import { useLoans, useCirculationStatistics } from "@/hooks/useCirculation"
import type { CirculationFilters } from "@/lib/api/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CirculationPage() {
  const t = useTranslations("circulation")
  const tn = useTranslations("nav")
  const locale = useLocale()
  const isRTL = locale === 'ar'

  // State for modals
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<any>(null)

  // API filters state
  const [apiFilters, setApiFilters] = useState<CirculationFilters>({
    page: 1,
    page_size: 20,
    status: undefined,
  })

  // Local filter state for UI
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    dueDate: "all",
    userType: "all",
    dateRange: null as Date | null,
  })

  // Fetch data using React Query hooks
  const { data: loansData, isLoading, error, refetch } = useLoans(apiFilters)
  const { data: statistics, isLoading: statsLoading } = useCirculationStatistics()

  // Extract data from API response
  const loans = loansData?.items || []
  const totalItems = loansData?.total || 0
  const totalPages = loansData?.total_pages || 0
  const currentPage = loansData?.page || 1
  const itemsPerPage = loansData?.page_size || 20

  // Update API filters when local filters change
  useEffect(() => {
    const newApiFilters: CirculationFilters = {
      page: 1,
      page_size: apiFilters.page_size,
      status: filters.status !== "all" ? filters.status : undefined,
    }
    setApiFilters(newApiFilters)
  }, [filters.status, apiFilters.page_size])

  // Transform loan data for table display
  const displayRecords = useMemo(() => {
    return loans.map((loan) => {
      // Calculate days left
      const dueDate = new Date(loan.due_date)
      const today = new Date()
      const timeDiff = dueDate.getTime() - today.getTime()
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))

      return {
        id: loan.id,
        userName: loan.user_name,
        userRole: "", // Not in API response
        userId: loan.user_id,
        bookTitle: loan.book_title,
        category: "", // Not in API response
        shelfLocation: "", // Not in API response
        issueDate: new Date(loan.borrowed_date).toLocaleDateString(),
        dueDate: new Date(loan.due_date).toLocaleDateString(),
        returnDate: loan.return_date ? new Date(loan.return_date).toLocaleDateString() : undefined,
        daysLeft,
        status: loan.status,
        fineAmount: loan.fine_amount,
      }
    })
  }, [loans])

  // Filter records locally by search term (API doesn't support full-text search yet)
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return displayRecords

    const searchLower = searchTerm.toLowerCase()
    return displayRecords.filter(record =>
      record.userName.toLowerCase().includes(searchLower) ||
      record.bookTitle.toLowerCase().includes(searchLower) ||
      record.userId.toLowerCase().includes(searchLower)
    )
  }, [displayRecords, searchTerm])

  // Handle page change with scroll to top
  const handlePageChange = (page: number) => {
    setApiFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle items per page change
  const handleItemsPerPageChange = (items: number) => {
    setApiFilters(prev => ({ ...prev, page_size: items, page: 1 }))
  }

  // Handle export
  const handleExport = async () => {
    // TODO: Implement export functionality
    console.log("Exporting circulation records...")
  }

  // Show loading skeleton
  if (isLoading || statsLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6 bg-[#F5F1E8] min-h-screen p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    )
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6 bg-[#F5F1E8] min-h-screen p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("errorLoading")} {(error as any)?.message || "Unknown error"}
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()}>
            {t("retry")}
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 bg-[#F5F1E8] min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: tn('dashboard'), href: '/dashboard' },
            { label: tn('circulation') }
          ]}
        />

        {/* Page Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#8B1538]">{t("title")}</h1>
          <p className="text-[#6B7280]">{t("subtitle")}</p>
        </div>

        {/* Action Buttons */}
        <CirculationHeader
          onIssueClick={() => setShowIssueModal(true)}
          onReturnClick={() => setShowReturnModal(true)}
          onExportClick={handleExport}
        />

        {/* Statistics Cards */}
        <StatisticsCards stats={statistics} />

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Circulation Records Table */}
        <CirculationTable records={filteredRecords} />

        {/* Pagination */}
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemType="loans"
          />
        )}

        {/* No records message */}
        {filteredRecords.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("noRecords")}</p>
          </div>
        )}

        {/* Modals */}
        {showIssueModal && (
          <IssueBookModal
            isOpen={showIssueModal}
            onClose={() => setShowIssueModal(false)}
            onSuccess={() => {
              setShowIssueModal(false)
              refetch()
            }}
          />
        )}

        {showReturnModal && (
          <ReturnBookModal
            isOpen={showReturnModal}
            onClose={() => {
              setShowReturnModal(false)
              setSelectedLoan(null)
            }}
            loan={selectedLoan}
            onSuccess={() => {
              setShowReturnModal(false)
              setSelectedLoan(null)
              refetch()
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}
