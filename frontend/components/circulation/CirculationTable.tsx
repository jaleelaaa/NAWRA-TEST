"use client"

import { useState } from "react"
import { MoreVertical, Eye, BookOpen, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useTranslations } from "next-intl"

interface CirculationRecord {
  id: string
  userName: string
  userRole: string
  userId: string
  bookTitle: string
  category: string
  shelfLocation: string
  issueDate: string
  dueDate: string
  daysLeft: number
  status: "active" | "overdue" | "returned" | "reserved"
}

interface CirculationTableProps {
  records: CirculationRecord[]
}

export default function CirculationTable({ records }: CirculationTableProps) {
  const t = useTranslations("circulation")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { bg: "bg-gradient-to-r from-blue-100 to-cyan-100", text: "text-[#1E40AF]", icon: BookOpen },
      overdue: { bg: "bg-gradient-to-r from-red-100 to-orange-100", text: "text-[#DC2626]", icon: AlertCircle },
      returned: { bg: "bg-gradient-to-r from-green-100 to-emerald-100", text: "text-[#065F46]", icon: CheckCircle },
      reserved: { bg: "bg-gradient-to-r from-purple-100 to-fuchsia-100", text: "text-[#6B21A8]", icon: Clock },
    }

    const badge = badges[status as keyof typeof badges] || badges.active
    const Icon = badge.icon

    return (
      <div className={`${badge.bg} ${badge.text} inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold hover:shadow-md transition-all duration-200 hover:scale-105`}>
        <Icon className="w-4 h-4" />
        {t(`status.${status}`)}
      </div>
    )
  }

  const getDueCountdown = (daysLeft: number) => {
    if (daysLeft > 7) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-green-700 font-bold">{t("daysLeft", { days: daysLeft })}</span>
        </div>
      )
    } else if (daysLeft > 0) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="text-amber-700 font-bold">{t("daysLeft", { days: daysLeft })}</span>
        </div>
      )
    } else if (daysLeft < 0) {
      return (
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-red-600"></div>
          <span className="text-red-700 font-bold">{t("daysOverdue", { days: Math.abs(daysLeft) })}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-red-600"></div>
          <span className="text-red-700 font-bold">{t("dueToday")}</span>
        </div>
      )
    }
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg">{t("noRecords")}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-shadow duration-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#F9FAFB] to-[#F3F4F6] border-b-2 border-[#E5E7EB]">
            <tr>
              <th className="text-left px-6 py-4 font-bold text-[#6B7280] text-sm uppercase tracking-wider">
                {t("table.user")}
              </th>
              <th className="text-left px-6 py-4 font-bold text-[#6B7280] text-sm uppercase tracking-wider">
                {t("table.book")}
              </th>
              <th className="text-left px-6 py-4 font-bold text-[#6B7280] text-sm uppercase tracking-wider">
                {t("table.issueDate")}
              </th>
              <th className="text-left px-6 py-4 font-bold text-[#6B7280] text-sm uppercase tracking-wider">
                {t("table.dueDate")}
              </th>
              <th className="text-left px-6 py-4 font-bold text-[#6B7280] text-sm uppercase tracking-wider">
                {t("table.status")}
              </th>
              <th className="text-center px-6 py-4 font-bold text-[#6B7280] text-sm uppercase tracking-wider">
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, idx) => (
              <tr
                key={record.id}
                onMouseEnter={() => setHoveredRow(record.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`border-b border-[#E5E7EB] transition-all duration-300 ${
                  hoveredRow === record.id
                    ? "bg-gradient-to-r from-[#8B1538]/5 to-[#A91D44]/5 shadow-lg"
                    : idx % 2 === 0
                    ? "bg-white hover:bg-[#F9FAFB]"
                    : "bg-[#FAFBFC] hover:bg-white"
                }`}
              >
                <td className="px-6 py-4">
                  <div className={`transition-all duration-200 ${hoveredRow === record.id ? "scale-105" : ""}`}>
                    <p className="font-bold text-[#111827]">{record.userName}</p>
                    <p className="text-sm text-[#6B7280]">
                      {record.userRole} • {record.userId}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`transition-all duration-200 ${hoveredRow === record.id ? "scale-105" : ""}`}>
                    <p className="font-bold text-[#111827]">{record.bookTitle}</p>
                    <p className="text-sm text-[#6B7280]">
                      {record.category} • {record.shelfLocation}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-[#111827]">{record.issueDate}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-[#111827]">{record.dueDate}</p>
                  <div className="text-sm mt-1">{getDueCountdown(record.daysLeft)}</div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                <td className="px-6 py-4 text-center">
                  <div className={`flex items-center justify-center gap-2 transition-all duration-300 ${hoveredRow === record.id ? "opacity-100" : "opacity-60"}`}>
                    <button className="p-2 hover:bg-[#E5E7EB] rounded-lg transition-all duration-200 hover:scale-110 active:scale-95">
                      <Eye className="w-5 h-5 text-[#6B7280]" />
                    </button>
                    <button className="p-2 hover:bg-[#E5E7EB] rounded-lg transition-all duration-200 hover:scale-110 active:scale-95">
                      <MoreVertical className="w-5 h-5 text-[#6B7280]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
