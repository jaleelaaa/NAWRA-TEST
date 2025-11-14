"use client"

import { BookOpen, Check, BookMarked, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import { useTranslations } from "next-intl"

interface StatsCardsProps {
  stats: {
    totalBooks: number
    available: number
    borrowed: number
    overdue: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations("books.stats")
  const tCommon = useTranslations("common")

  const cards = [
    {
      title: t("totalBooks"),
      value: stats.totalBooks.toLocaleString(),
      icon: BookOpen,
      color: "text-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
      accentColor: "bg-blue-500",
      borderColor: "border-l-4 border-l-blue-500",
      trend: "+8%",
      trendPositive: true,
    },
    {
      title: t("available"),
      value: stats.available.toLocaleString(),
      icon: Check,
      color: "text-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100/50",
      accentColor: "bg-emerald-500",
      borderColor: "border-l-4 border-l-emerald-500",
      trend: "+5%",
      trendPositive: true,
    },
    {
      title: t("borrowed"),
      value: stats.borrowed.toLocaleString(),
      icon: BookMarked,
      color: "text-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50",
      accentColor: "bg-purple-500",
      borderColor: "border-l-4 border-l-purple-500",
      trend: "+18%",
      trendPositive: true,
    },
    {
      title: t("overdue"),
      value: stats.overdue.toLocaleString(),
      icon: AlertCircle,
      color: "text-red-600",
      bgGradient: "from-red-50 to-red-100/50",
      accentColor: "bg-red-500",
      borderColor: "border-l-4 border-l-red-500",
      trend: "-5%",
      trendPositive: false,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon
        const TrendIcon = card.trendPositive ? TrendingUp : TrendingDown
        return (
          <div
            key={card.title}
            className={`${card.borderColor} overflow-hidden bg-gradient-to-br ${card.bgGradient} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer h-full rounded-2xl p-5`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">
                {card.title}
              </p>
              <div
                className={`rounded-xl ${card.bgGradient} p-2.5 transition-transform duration-300 hover:scale-110`}
              >
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>

            <p className="text-3xl font-bold text-gray-900 mb-2">
              {card.value}
            </p>

            {/* Trend indicator */}
            <div className="flex items-center gap-1">
              <TrendIcon
                className={`h-4 w-4 ${card.trendPositive ? "text-emerald-600" : "text-red-600"}`}
              />
              <span
                className={`text-sm font-medium ${card.trendPositive ? "text-emerald-600" : "text-red-600"}`}
              >
                {card.trend}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
