"use client"

import { useState } from "react"
import { X, Search } from "lucide-react"
import { useTranslations } from "next-intl"

interface IssueBookModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function IssueBookModal({ isOpen, onClose }: IssueBookModalProps) {
  const t = useTranslations("circulation.modals.issue")

  const [formData, setFormData] = useState({
    userId: "",
    bookId: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 15)
      return date.toISOString().split("T")[0]
    })(),
    sendEmail: false,
    printReceipt: false,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-[#111827]">{t("title")}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* User Search */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              {t("userLabel")}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder={t("userPlaceholder")}
                className="pl-10 pr-4 py-2 border-2 border-[#E5E7EB] rounded-lg w-full focus:border-[#8B1538] focus:outline-none focus:ring-2 focus:ring-[#8B1538]/10"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              />
            </div>
          </div>

          {/* Book Search */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              {t("bookLabel")}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder={t("bookPlaceholder")}
                className="pl-10 pr-4 py-2 border-2 border-[#E5E7EB] rounded-lg w-full focus:border-[#8B1538] focus:outline-none focus:ring-2 focus:ring-[#8B1538]/10"
                value={formData.bookId}
                onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
              />
            </div>
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              {t("issueDate")}
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="px-4 py-2 border-2 border-[#E5E7EB] rounded-lg w-full focus:border-[#8B1538] focus:outline-none focus:ring-2 focus:ring-[#8B1538]/10"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              {t("dueDate")} (15 days)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="px-4 py-2 border-2 border-[#E5E7EB] rounded-lg w-full focus:border-[#8B1538] focus:outline-none focus:ring-2 focus:ring-[#8B1538]/10"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendEmail}
                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                className="w-4 h-4 rounded border-2 border-[#E5E7EB] accent-[#8B1538]"
              />
              <span className="text-sm font-medium text-[#111827]">{t("sendEmail")}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.printReceipt}
                onChange={(e) => setFormData({ ...formData, printReceipt: e.target.checked })}
                className="w-4 h-4 rounded border-2 border-[#E5E7EB] accent-[#8B1538]"
              />
              <span className="text-sm font-medium text-[#111827]">{t("printReceipt")}</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-[#E5E7EB]">
            <button
              onClick={onClose}
              className="flex-1 border-2 border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB] font-semibold rounded-lg py-2 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-[#8B1538] hover:bg-[#6B0F2A] text-white font-semibold rounded-lg py-2 transition-colors"
            >
              {t("submit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
