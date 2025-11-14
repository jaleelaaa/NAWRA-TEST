"use client"

import { useState, useEffect } from "react"
import { X, Search, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCheckinBook } from "@/hooks/useCirculation"
import type { Loan, CheckinRequest } from "@/lib/api/types"

interface ReturnBookModalProps {
  isOpen: boolean
  onClose: () => void
  loan?: Loan | null
  onSuccess?: () => void
}

export default function ReturnBookModal({ isOpen, onClose, loan, onSuccess }: ReturnBookModalProps) {
  const t = useTranslations("circulation.modals.return")
  const checkinBook = useCheckinBook()

  const [formData, setFormData] = useState({
    loanId: loan?.id || "",
    condition: "good",
    notes: "",
  })

  // Update form when loan prop changes
  useEffect(() => {
    if (loan) {
      setFormData(prev => ({ ...prev, loanId: loan.id }))
    }
  }, [loan])

  // Calculate overdue information
  const bookDetails = loan ? {
    title: loan.book_title,
    userName: loan.user_name,
    userId: loan.user_id,
    dueDate: new Date(loan.due_date).toLocaleDateString(),
    isOverdue: loan.status === 'overdue',
    daysOverdue: loan.status === 'overdue' ? Math.ceil((new Date().getTime() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
    fineAmount: loan.fine_amount || 0,
  } : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.loanId) {
      return
    }

    const checkinData: CheckinRequest = {
      loan_id: formData.loanId,
    }

    try {
      await checkinBook.mutateAsync(checkinData)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the hook
    }
  }

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
          {/* Book Details Card */}
          {bookDetails && (
            <div className="bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] border-2 border-[#E5E7EB] rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-[#111827] mb-4 text-base">{t("bookDetails")}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className="text-[#6B7280] text-xs">{t("bookTitle")}</p>
                    <p className="font-semibold text-[#111827]">{bookDetails.title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="text-[#6B7280] text-xs">{t("borrower")}</p>
                    <p className="font-semibold text-[#111827]">
                      {bookDetails.userName} • {bookDetails.userId}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-[#6B7280] text-xs">{t("dueDate")}</p>
                    <p className="font-semibold text-[#111827]">{bookDetails.dueDate}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#E5E7EB]">
                  {bookDetails.isOverdue ? (
                    <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-bold text-red-700 text-sm">
                          {t("overdue", { days: bookDetails.daysOverdue })}
                        </p>
                        <p className="text-red-600 text-xs">
                          {t("fineAmount", { amount: bookDetails.fineAmount.toFixed(2) })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-700 text-sm">{t("onTime")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Book Condition */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-3">
              {t("conditionLabel")}
            </label>
            <div className="space-y-2">
              {["good", "fair", "damaged"].map((condition) => (
                <label
                  key={condition}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-[#F9FAFB] transition-colors"
                >
                  <input
                    type="radio"
                    name="condition"
                    value={condition}
                    checked={formData.condition === condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-4 h-4 accent-[#8B1538]"
                  />
                  <span className="text-sm font-medium text-[#111827] capitalize">
                    {t(`conditions.${condition}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              {t("notesLabel")}
            </label>
            <textarea
              placeholder={t("notesPlaceholder")}
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[#E5E7EB] rounded-lg focus:border-[#8B1538] focus:outline-none focus:ring-2 focus:ring-[#8B1538]/10 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              disabled={checkinBook.isPending}
              className="flex-1 border-2 border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB] font-semibold rounded-lg py-2 transition-colors disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={checkinBook.isPending || !formData.loanId}
              className="flex-1 bg-[#8B1538] hover:bg-[#6B0F2A] text-white font-semibold rounded-lg py-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {checkinBook.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("submit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
