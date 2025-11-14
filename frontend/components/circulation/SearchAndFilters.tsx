"use client"

import { useState } from "react"
import { Search, X, ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"

interface SearchAndFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  filters: {
    status: string
    dueDate: string
    userType: string
    dateRange: Date | null
  }
  onFiltersChange: (filters: any) => void
}

export default function SearchAndFilters({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
}: SearchAndFiltersProps) {
  const t = useTranslations("circulation")
  const [searchFocused, setSearchFocused] = useState(false)

  const handleFilterChange = (filterType: string, value: string) => {
    onFiltersChange({ ...filters, [filterType]: value })
  }

  return (
    <div className="mb-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-shadow duration-300">
      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative group">
          <Search
            className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${
              searchFocused ? "text-[#8B1538]" : "text-[#9CA3AF]"
            }`}
          />
          <input
            type="text"
            placeholder={t("search.placeholder")}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`pl-12 pr-4 py-3 w-full border-2 rounded-xl transition-all duration-300 ${
              searchFocused
                ? "border-[#8B1538] bg-[#F9FAFB] shadow-lg ring-2 ring-[#8B1538]/10"
                : "border-[#E5E7EB] bg-white hover:border-[#8B1538]/50"
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-4 text-[#9CA3AF] hover:text-[#6B7280] hover:scale-110 transition-all duration-200 active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="relative group">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#E5E7EB] rounded-xl appearance-none bg-white cursor-pointer font-semibold text-[#6B7280] hover:border-[#8B1538] focus:border-[#8B1538] focus:outline-none focus:ring-2 focus:ring-[#8B1538]/10 transition-all duration-300"
          >
            <option value="all">{t("filters.allStatus")}</option>
            <option value="active">{t("filters.active")}</option>
            <option value="overdue">{t("filters.overdue")}</option>
            <option value="returned">{t("filters.returned")}</option>
            <option value="reserved">{t("filters.reserved")}</option>
          </select>
          <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-[#9CA3AF] pointer-events-none group-hover:text-[#8B1538] transition-colors" />
        </div>

        {/* Due Date Filter */}
        <div className="relative group">
          <select
            value={filters.dueDate}
            onChange={(e) => handleFilterChange("dueDate", e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#E5E7EB] rounded-xl appearance-none bg-white cursor-pointer font-semibold text-[#6B7280] hover:border-[#8B1538] focus:border-[#8B1538] focus:outline-none focus:ring-2 focus:ring-[#8B1538]/10 transition-all duration-300"
          >
            <option value="all">{t("filters.dueDate")}</option>
            <option value="today">{t("filters.dueToday")}</option>
            <option value="week">{t("filters.dueThisWeek")}</option>
            <option value="overdue">{t("filters.overdue")}</option>
          </select>
          <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-[#9CA3AF] pointer-events-none group-hover:text-[#8B1538] transition-colors" />
        </div>

        {/* User Type Filter */}
        <div className="relative group">
          <select
            value={filters.userType}
            onChange={(e) => handleFilterChange("userType", e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#E5E7EB] rounded-xl appearance-none bg-white cursor-pointer font-semibold text-[#6B7280] hover:border-[#8B1538] focus:border-[#8B1538] focus:outline-none focus:ring-2 focus:ring-[#8B1538]/10 transition-all duration-300"
          >
            <option value="all">{t("filters.userType")}</option>
            <option value="student">{t("filters.student")}</option>
            <option value="faculty">{t("filters.faculty")}</option>
            <option value="staff">{t("filters.staff")}</option>
            <option value="librarian">{t("filters.librarian")}</option>
          </select>
          <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-[#9CA3AF] pointer-events-none group-hover:text-[#8B1538] transition-colors" />
        </div>

        {/* Date Range */}
        <input
          type="date"
          className="w-full px-4 py-3 border-2 border-[#E5E7EB] rounded-xl font-semibold text-[#6B7280] hover:border-[#8B1538] focus:border-[#8B1538] focus:outline-none focus:ring-2 focus:ring-[#8B1538]/10 transition-all duration-300"
        />
      </div>
    </div>
  )
}
