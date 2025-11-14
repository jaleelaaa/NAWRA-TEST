"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Star,
  MapPin,
  Package,
  Eye,
  Heart,
  MoreVertical,
  Sparkles,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslations, useLocale } from "next-intl"
import type { BookResponse } from "@/lib/types/books"

interface BookCardProps {
  book: BookResponse
  viewMode: "grid" | "list"
  onEdit?: (book: BookResponse) => void
  onDelete?: (book: BookResponse) => void
}

export function BookCard({ book, viewMode, onEdit, onDelete }: BookCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const t = useTranslations("books")
  const tStatus = useTranslations("books.status")
  const tCard = useTranslations("books.card")
  const locale = useLocale()

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 text-emerald-700"
      case "borrowed":
        return "bg-blue-100 text-blue-700"
      case "reserved":
        return "bg-amber-100 text-amber-700"
      case "damaged":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const getStockColor = (available: number, total: number) => {
    if (available === 0) return "text-red-600"
    if (available <= 2) return "text-amber-600"
    return "text-emerald-600"
  }

  // Get the appropriate title and author based on locale
  const displayTitle = locale === "ar" && book.title_ar ? book.title_ar : book.title
  const displayAuthor = locale === "ar" && book.author_ar ? book.author_ar : book.author

  // Get category name based on locale
  const categoryName = book.category
    ? locale === "ar" && book.category.name_ar
      ? book.category.name_ar
      : book.category.name
    : t("uncategorized")

  // Check if book is new arrival (created within last 30 days)
  const isNewArrival = book.created_at
    ? new Date().getTime() - new Date(book.created_at).getTime() < 30 * 24 * 60 * 60 * 1000
    : false

  if (viewMode === "list") {
    return (
      <Card className="flex gap-4 overflow-hidden border transition-colors hover:border-primary hover:shadow-lg hover:bg-accent/5 p-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={book.cover_image_url || "/placeholder.svg"}
            alt={displayTitle}
            className="h-24 w-16 rounded object-cover shadow-md"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1">{displayTitle}</h3>
            <p className="text-sm text-muted-foreground">{displayAuthor}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {book.rating || 0} ({book.review_count || 0})
            </span>
            <span>{categoryName}</span>
            <span>{book.publication_year}</span>
            <span className={`font-medium capitalize px-2 py-0.5 rounded-full ${getStatusBadgeStyles(book.status)}`}>
              {tStatus(book.status)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {book.shelf_location || t("noLocation")}
              </span>
              <span
                className={`flex items-center gap-1 font-medium ${getStockColor(book.available_quantity || 0, book.quantity || 0)}`}
              >
                <Package className="h-3 w-3" />
                {book.available_quantity || 0}/{book.quantity || 0}
              </span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-8 text-primary hover:bg-primary/10">
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8">
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current text-red-500" : ""}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                />
              </Button>
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(book)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("edit")}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={() => onDelete(book)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Grid view
  return (
    <Card
      className="group relative flex flex-col overflow-hidden border border-border/50 bg-gradient-to-br from-white to-slate-50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-primary/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Book Cover Container */}
      <div className="relative overflow-hidden bg-slate-200 aspect-[2/3]">
        {isNewArrival && (
          <div className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
            <Sparkles className="h-3 w-3 animate-pulse" />
            {tCard("newArrival")}
          </div>
        )}

        <img
          src={book.cover_image_url || "/placeholder.svg"}
          alt={displayTitle}
          className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {isHovered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent backdrop-blur-sm transition-opacity duration-300">
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-2 bg-white text-slate-900 hover:bg-slate-100 shadow-lg transform transition-transform hover:scale-105"
              >
                <Eye className="h-4 w-4" />
                {tCard("view")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsFavorite(!isFavorite)}
                className="gap-2 shadow-lg transform transition-transform hover:scale-105"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-red-500" : ""}`} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize transition-all ${getStatusBadgeStyles(book.status)}`}
          >
            {tStatus(book.status)}
          </span>
          <span className="inline-block rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
            {categoryName}
          </span>
          <span className="inline-block rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            {book.language?.toUpperCase() || "N/A"}
          </span>
        </div>

        {/* Title & Author - Enhanced Typography */}
        <div className="flex-1">
          <h3 className="font-bold text-foreground line-clamp-2 transition-colors group-hover:text-primary text-sm leading-tight">
            {displayTitle}
          </h3>
          {displayAuthor && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1 font-medium">{displayAuthor}</p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 transition-colors ${
                  i < Math.round(book.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-xs text-foreground">{book.rating || 0}</span>
          <span className="text-xs text-muted-foreground">
            ({book.review_count || 0} {tCard("reviews")})
          </span>
        </div>

        {/* Location & Stock Info */}
        <div className="space-y-1.5 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary/60" />
            <span className="font-medium">{book.shelf_location || t("noLocation")}</span>
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold ${getStockColor(book.available_quantity || 0, book.quantity || 0)}`}
          >
            <Package className="h-3.5 w-3.5" />
            <span>
              {book.available_quantity || 0}/{book.quantity || 0} {tCard("copies")}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 font-medium transition-all hover:shadow-lg"
          >
            {tCard("details")}
          </Button>
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-secondary/10 transition-all">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(book)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("edit")}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(book)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Card>
  )
}
