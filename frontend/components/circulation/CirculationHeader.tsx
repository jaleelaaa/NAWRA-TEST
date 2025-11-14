"use client"

import { Plus, RotateCcw, Download } from "lucide-react"
import { useTranslations } from "next-intl"

interface CirculationHeaderProps {
  onIssueClick: () => void
  onReturnClick: () => void
  onExportClick: () => void
}

export default function CirculationHeader({ onIssueClick, onReturnClick, onExportClick }: CirculationHeaderProps) {
  const t = useTranslations("circulation")

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <button
        onClick={onIssueClick}
        className="group bg-gradient-to-br from-[#8B1538] to-[#6B0F2A] hover:from-[#A91D44] hover:to-[#5A0A22] text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-all duration-300" />
        <span>{t("actions.issueBook")}</span>
      </button>

      <button
        onClick={onReturnClick}
        className="group border-2 border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-lg"
      >
        <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        <span>{t("actions.returnBook")}</span>
      </button>

      <button
        onClick={onExportClick}
        className="group border-2 border-[#E5E7EB] text-[#6B7280] hover:border-[#8B1538] hover:text-[#8B1538] font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-lg"
      >
        <Download className="w-5 h-5" />
        <span>{t("actions.exportReport")}</span>
      </button>
    </div>
  )
}
