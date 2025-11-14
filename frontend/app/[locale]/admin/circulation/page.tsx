"use client"

import { useState, useMemo } from "react"
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

export default function CirculationPage() {
  const t = useTranslations("circulation")
  const tn = useTranslations("nav")
  const locale = useLocale()
  const isRTL = locale === 'ar'

  // State for modals
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    dueDate: "all",
    userType: "all",
    dateRange: null as Date | null,
  })

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  // Mock data - Replace with API call
  const mockRecords = [
    {
      id: "1",
      userName: "Ahmed Al-Balushi",
      userRole: "Student",
      userId: "OM-2024-011",
      bookTitle: "Omani History and Development",
      category: "History",
      shelfLocation: "H-01-1",
      issueDate: "Jan 15, 2025",
      dueDate: "Jan 30, 2025",
      daysLeft: 5,
      status: "active" as const,
    },
    {
      id: "2",
      userName: "Fatima Al-Lawati",
      userRole: "Student",
      userId: "OM-2024-012",
      bookTitle: "Arabian Tales",
      category: "Literature",
      shelfLocation: "L-02-3",
      issueDate: "Jan 10, 2025",
      dueDate: "Jan 25, 2025",
      daysLeft: -2,
      status: "overdue" as const,
    },
    {
      id: "3",
      userName: "Said Al-Habsi",
      userRole: "Librarian",
      userId: "OM-2024-013",
      bookTitle: "Oman Geography",
      category: "Geography",
      shelfLocation: "G-08-2",
      issueDate: "Jan 20, 2025",
      dueDate: "Feb 5, 2025",
      daysLeft: 16,
      status: "active" as const,
    },
    {
      id: "4",
      userName: "Maryam Al-Zaabi",
      userRole: "Faculty",
      userId: "OM-2024-014",
      bookTitle: "Islamic Architecture",
      category: "Art & Design",
      shelfLocation: "A-03-5",
      issueDate: "Jan 8, 2025",
      dueDate: "Jan 23, 2025",
      daysLeft: -5,
      status: "overdue" as const,
    },
    {
      id: "5",
      userName: "Ibrahim Al-Rawahi",
      userRole: "Student",
      userId: "OM-2024-015",
      bookTitle: "Modern Oman Economy",
      category: "Economics",
      shelfLocation: "E-05-2",
      issueDate: "Jan 18, 2025",
      dueDate: "Feb 2, 2025",
      daysLeft: 9,
      status: "active" as const,
    },
    {
      id: "6",
      userName: "Layla Al-Kharusi",
      userRole: "Student",
      userId: "OM-2024-016",
      bookTitle: "Classical Arabic Literature",
      category: "Literature",
      shelfLocation: "L-01-7",
      issueDate: "Jan 22, 2025",
      dueDate: "Feb 6, 2025",
      daysLeft: 14,
      status: "active" as const,
    },
    {
      id: "7",
      userName: "Hassan Al-Hinai",
      userRole: "Staff",
      userId: "OM-2024-017",
      bookTitle: "Education in Oman",
      category: "Education",
      shelfLocation: "E-02-4",
      issueDate: "Jan 1, 2025",
      dueDate: "Jan 16, 2025",
      daysLeft: -11,
      status: "overdue" as const,
    },
    {
      id: "8",
      userName: "Noor Al-Sabahi",
      userRole: "Student",
      userId: "OM-2024-018",
      bookTitle: "Digital Transformation",
      category: "Technology",
      shelfLocation: "T-04-1",
      issueDate: "Jan 19, 2025",
      dueDate: "Feb 3, 2025",
      daysLeft: 11,
      status: "active" as const,
    },
  ]

  // Filter records
  const filteredRecords = useMemo(() => {
    return mockRecords.filter(record => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm ||
        record.userName.toLowerCase().includes(searchLower) ||
        record.bookTitle.toLowerCase().includes(searchLower) ||
        record.userId.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus = filters.status === "all" || record.status === filters.status

      // User type filter
      const matchesUserType = filters.userType === "all" ||
        record.userRole.toLowerCase() === filters.userType.toLowerCase()

      return matchesSearch && matchesStatus && matchesUserType
    })
  }, [searchTerm, filters])

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, filters, itemsPerPage])

  // Calculate pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  // Handle page change with scroll to top
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle items per page change
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1)
  }

  // Handle export
  const handleExport = async () => {
    // TODO: Implement export functionality
    console.log("Exporting circulation records...")
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
        <StatisticsCards />

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Circulation Records Table */}
        <CirculationTable records={paginatedRecords} />

        {/* Pagination */}
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredRecords.length}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemType="books"
          />
        )}

        {/* Modals */}
        {showIssueModal && (
          <IssueBookModal
            isOpen={showIssueModal}
            onClose={() => setShowIssueModal(false)}
          />
        )}

        {showReturnModal && (
          <ReturnBookModal
            isOpen={showReturnModal}
            onClose={() => setShowReturnModal(false)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
