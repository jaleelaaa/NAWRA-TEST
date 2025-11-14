"use client"

import { useEffect, useState } from "react"
import { Activity, AlertCircle, CheckCircle, Bookmark, TrendingUp, TrendingDown } from "lucide-react"
import { useTranslations } from "next-intl"

interface StatCard {
  key: string
  value: number
  change: number
  targetValue: number
  accentColor: string
}

export default function StatisticsCards() {
  const t = useTranslations("circulation.statistics")

  const [stats, setStats] = useState<StatCard[]>([
    { key: "activeIssues", value: 0, change: 18, targetValue: 9, accentColor: "#0284C7" },
    { key: "overdueBooks", value: 0, change: -5, targetValue: 1, accentColor: "#DC2626" },
    { key: "returnedToday", value: 0, change: 12, targetValue: 2, accentColor: "#00693E" },
    { key: "reservedBooks", value: 0, change: 8, targetValue: 1, accentColor: "#7C3AED" },
  ])

  const cardConfig = [
    {
      key: "activeIssues",
      icon: Activity,
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-l-4 border-[#0284C7]",
      textColor: "text-[#1E40AF]",
    },
    {
      key: "overdueBooks",
      icon: AlertCircle,
      bgColor: "from-red-50 to-orange-50",
      borderColor: "border-l-4 border-[#DC2626]",
      textColor: "text-[#DC2626]",
    },
    {
      key: "returnedToday",
      icon: CheckCircle,
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-l-4 border-[#00693E]",
      textColor: "text-[#065F46]",
    },
    {
      key: "reservedBooks",
      icon: Bookmark,
      bgColor: "from-purple-50 to-fuchsia-50",
      borderColor: "border-l-4 border-[#7C3AED]",
      textColor: "text-[#6B21A8]",
    },
  ]

  // Count-up animation
  useEffect(() => {
    const intervals = stats.map((stat, idx) => {
      let current = 0
      const increment = Math.ceil(stat.targetValue / 20)
      const timer = setInterval(() => {
        current += increment
        if (current >= stat.targetValue) current = stat.targetValue
        setStats(prev => {
          const newStats = [...prev]
          newStats[idx].value = current
          return newStats
        })
        if (current >= stat.targetValue) clearInterval(timer)
      }, 50)
      return timer
    })

    return () => intervals.forEach(interval => clearInterval(interval))
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cardConfig.map((config, idx) => {
        const stat = stats[idx]
        const Icon = config.icon
        const isPositive = stat.change >= 0

        return (
          <div
            key={config.key}
            className={`bg-gradient-to-br ${config.bgColor} ${config.borderColor} rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 h-full`}
          >
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-medium text-gray-600">
                {t(config.key)}
              </p>

              {/* Icon box */}
              <div className="p-2.5 rounded-xl transition-transform duration-300 hover:scale-110" style={{ backgroundColor: config.bgColor.includes('blue') ? 'rgba(219, 234, 254, 0.5)' : config.bgColor.includes('red') ? 'rgba(254, 226, 226, 0.5)' : config.bgColor.includes('green') ? 'rgba(209, 250, 229, 0.5)' : 'rgba(243, 232, 255, 0.5)' }}>
                <Icon className={`w-5 h-5 ${config.textColor}`} />
              </div>
            </div>

            {/* Number */}
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {stat.value}
            </h3>

            {/* Trend indicator */}
            <div className="flex items-center gap-1">
              {isPositive ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm text-green-600">+{stat.change}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-sm text-red-600">{stat.change}%</span>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
