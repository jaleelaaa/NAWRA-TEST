"use client"

import { useState, useMemo } from "react"
import { BookCard } from "./book-card"
import { StatsCards } from "./stats-cards"
import { SearchAndFilters } from "./search-and-filters"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Download, Sparkles } from "lucide-react"

const SAMPLE_BOOKS = [
  {
    id: "1",
    isbn: "978-9948-01-234-5",
    title: "The Development of Oman",
    titleAr: "تطور عمان",
    author: "International Relations Institute",
    authorAr: "معهد العلاقات الدولية",
    coverImage: "/omani-history-development-book-cover.jpg",
    category: "History",
    status: "available",
    language: "en",
    publicationYear: 2020,
    publisher: "Oman Publishing House",
    pages: 452,
    rating: 4.7,
    reviewCount: 156,
    shelfLocation: "H-01-1",
    copies: { total: 5, available: 3 },
    isNewArrival: true,
    isFeatured: true,
    description: "A comprehensive study of Oman's economic and political development in the modern era.",
    tags: ["Oman", "History", "Development"],
  },
  {
    id: "2",
    isbn: "978-9948-02-567-8",
    title: "ألف ليلة وليلة",
    titleAr: "ألف ليلة وليلة",
    author: "الكاتب المجهول",
    authorAr: "الكاتب المجهول",
    coverImage: "/arabian-nights-one-thousand-and-one-nights-classic.jpg",
    category: "Literature",
    status: "available",
    language: "ar",
    publicationYear: 2018,
    publisher: "دار الشروق",
    pages: 628,
    rating: 4.9,
    reviewCount: 487,
    shelfLocation: "L-02-3",
    copies: { total: 8, available: 5 },
    isNewArrival: false,
    isFeatured: true,
    description: "الحكاية الخالدة للألف ليلة وليلة، من أعظم التراث العربي والإسلامي.",
    tags: ["Arabic", "Classics", "Literature"],
  },
  {
    id: "3",
    isbn: "978-9948-03-890-1",
    title: "Oman: Land of Heritage",
    titleAr: "عمان: أرض التراث",
    author: "Dr. Mohammed Al-Rashdi",
    authorAr: "د. محمد الرشيدي",
    coverImage: "/oman-heritage-culture-traditional-architecture.jpg",
    category: "Culture",
    status: "available",
    language: "en",
    publicationYear: 2019,
    publisher: "Ministry of Information",
    pages: 384,
    rating: 4.6,
    reviewCount: 203,
    shelfLocation: "C-03-2",
    copies: { total: 6, available: 4 },
    isNewArrival: false,
    isFeatured: false,
    description: "An exploration of Oman's rich cultural heritage, traditions, and historical significance.",
    tags: ["Oman", "Culture", "Heritage"],
  },
  {
    id: "4",
    isbn: "978-9948-04-123-2",
    title: "الشاعر نزار قباني",
    titleAr: "أعمال نزار قباني الشاملة",
    author: "نزار قباني",
    authorAr: "نزار قباني",
    coverImage: "/nizar-qabbani-arabic-poet-poetry-book.jpg",
    category: "Poetry",
    status: "available",
    language: "ar",
    publicationYear: 2017,
    publisher: "دار منارات",
    pages: 512,
    rating: 4.8,
    reviewCount: 534,
    shelfLocation: "P-04-1",
    copies: { total: 4, available: 2 },
    isNewArrival: false,
    isFeatured: false,
    description: "مجموعة شاملة من قصائد الشاعر العربي الشهير نزار قباني.",
    tags: ["Arabic", "Poetry", "Literature"],
  },
  {
    id: "5",
    isbn: "978-9948-05-456-3",
    title: "The Oman Medical Encyclopedia",
    titleAr: "الموسوعة الطبية العمانية",
    author: "Ministry of Health",
    authorAr: "وزارة الصحة",
    coverImage: "/medical-encyclopedia-healthcare-reference-book.jpg",
    category: "Reference",
    status: "borrowed",
    language: "en",
    publicationYear: 2021,
    publisher: "Oman Health Publishing",
    pages: 724,
    rating: 4.5,
    reviewCount: 89,
    shelfLocation: "R-05-2",
    copies: { total: 3, available: 0 },
    dueDate: "2025-01-20",
    isNewArrival: false,
    isFeatured: false,
    description: "A comprehensive medical reference guide relevant to healthcare in the Oman region.",
    tags: ["Medical", "Reference", "Healthcare"],
  },
  {
    id: "6",
    isbn: "978-9948-06-789-4",
    title: "محمود درويش: الأعمال الكاملة",
    titleAr: "محمود درويش: الأعمال الكاملة",
    author: "محمود درويش",
    authorAr: "محمود درويش",
    coverImage: "/mahmoud-darwish-arabic-poet-complete-works.jpg",
    category: "Poetry",
    status: "available",
    language: "ar",
    publicationYear: 2019,
    publisher: "دار الآداب",
    pages: 856,
    rating: 4.9,
    reviewCount: 612,
    shelfLocation: "P-06-3",
    copies: { total: 5, available: 3 },
    isNewArrival: true,
    isFeatured: true,
    description: "مجموعة الأعمال الكاملة للشاعر الفلسطيني محمود درويش.",
    tags: ["Arabic", "Poetry", "Literature"],
  },
  {
    id: "7",
    isbn: "978-9948-07-012-5",
    title: "Oman Trade and Commerce Guide",
    titleAr: "دليل التجارة والتجارة العمانية",
    author: "Chamber of Commerce Oman",
    authorAr: "غرفة تجارة وصناعة عمان",
    coverImage: "/trade-commerce-business-guide-oman-economy.jpg",
    category: "Business",
    status: "available",
    language: "en",
    publicationYear: 2022,
    publisher: "Oman Publishing",
    pages: 392,
    rating: 4.4,
    reviewCount: 124,
    shelfLocation: "B-07-1",
    copies: { total: 4, available: 2 },
    isNewArrival: false,
    isFeatured: false,
    description: "A practical guide to business and commerce opportunities in Oman.",
    tags: ["Business", "Oman", "Commerce"],
  },
  {
    id: "8",
    isbn: "978-9948-08-345-6",
    title: "سلطنة عمان: جغرافيا وديموغرافيا",
    titleAr: "سلطنة عمان: جغرافيا وديموغرافيا",
    author: "د. فاطمة العبرية",
    authorAr: "د. فاطمة العبرية",
    coverImage: "/oman-geography-demographics-maps-statistics.jpg",
    category: "Geography",
    status: "available",
    language: "ar",
    publicationYear: 2020,
    publisher: "دار المعرفة",
    pages: 468,
    rating: 4.6,
    reviewCount: 178,
    shelfLocation: "G-08-2",
    copies: { total: 5, available: 4 },
    isNewArrival: false,
    isFeatured: false,
    description: "دراسة شاملة عن جغرافيا سلطنة عمان والمعلومات الديموغرافية الحديثة.",
    tags: ["Oman", "Geography", "Demographics"],
  },
  {
    id: "9",
    isbn: "978-9948-09-678-7",
    title: "The Arabian Peninsula: History and Culture",
    titleAr: "شبه الجزيرة العربية: التاريخ والثقافة",
    author: "Prof. Abdullah Al-Abed",
    authorAr: "أ.د. عبدالله العابد",
    coverImage: "/arabian-peninsula-history-culture-tradition.jpg",
    category: "History",
    status: "available",
    language: "en",
    publicationYear: 2018,
    publisher: "Arabia Publishing",
    pages: 556,
    rating: 4.7,
    reviewCount: 289,
    shelfLocation: "H-09-3",
    copies: { total: 6, available: 3 },
    isNewArrival: false,
    isFeatured: false,
    description: "A comprehensive historical and cultural study of the Arabian Peninsula.",
    tags: ["Arabian", "History", "Culture"],
  },
  {
    id: "10",
    isbn: "978-9948-10-901-8",
    title: "جبران خليل جبران: النبي والأعمال الأخرى",
    titleAr: "جبران خليل جبران: النبي والأعمال الأخرى",
    author: "جبران خليل جبران",
    authorAr: "جبران خليل جبران",
    coverImage: "/kahlil-gibran-the-prophet-arabic-literature.jpg",
    category: "Philosophy",
    status: "available",
    language: "ar",
    publicationYear: 2019,
    publisher: "دار النشر العربي",
    pages: 384,
    rating: 4.8,
    reviewCount: 712,
    shelfLocation: "PH-10-1",
    copies: { total: 7, available: 5 },
    isNewArrival: false,
    isFeatured: true,
    description: "أعمال جبران خليل جبران الفلسفية والشعرية، بما فيها النبي.",
    tags: ["Arabic", "Philosophy", "Wisdom"],
  },
  {
    id: "11",
    isbn: "978-9948-11-234-9",
    title: "Environmental Conservation in Oman",
    titleAr: "الحفاظ على البيئة في عمان",
    author: "Ministry of Environment",
    authorAr: "وزارة البيئة",
    coverImage: "/environmental-conservation-nature-wildlife-oman-de.jpg",
    category: "Environment",
    status: "available",
    language: "en",
    publicationYear: 2021,
    publisher: "Oman Environmental Press",
    pages: 424,
    rating: 4.5,
    reviewCount: 156,
    shelfLocation: "E-11-2",
    copies: { total: 4, available: 2 },
    isNewArrival: true,
    isFeatured: false,
    description: "An important resource on environmental protection and sustainability initiatives in Oman.",
    tags: ["Environment", "Oman", "Conservation"],
  },
  {
    id: "12",
    isbn: "978-9948-12-567-0",
    title: "الأدب الحديث العربي: دراسة نقدية",
    titleAr: "الأدب الحديث العربي: دراسة نقدية",
    author: "د. سعيد الحوراني",
    authorAr: "د. سعيد الحوراني",
    coverImage: "/modern-arabic-literature-critical-analysis-study.jpg",
    category: "Literature",
    status: "available",
    language: "ar",
    publicationYear: 2020,
    publisher: "دار الفكر",
    pages: 512,
    rating: 4.6,
    reviewCount: 267,
    shelfLocation: "L-12-3",
    copies: { total: 3, available: 1 },
    isNewArrival: false,
    isFeatured: false,
    description: "دراسة نقدية شاملة للأدب العربي الحديث وتطوره.",
    tags: ["Arabic", "Literature", "Criticism"],
  },
]

export function BooksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredBooks = useMemo(() => {
    return SAMPLE_BOOKS.filter((book) => {
      const matchesSearch =
        searchTerm === "" ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)

      const matchesCategory = !selectedCategory || book.category === selectedCategory
      const matchesStatus = !selectedStatus || book.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchTerm, selectedCategory, selectedStatus])

  const stats = {
    total: SAMPLE_BOOKS.length,
    available: SAMPLE_BOOKS.filter((b) => b.status === "available").length,
    borrowed: SAMPLE_BOOKS.filter((b) => b.status === "borrowed").length,
    overdue: 23,
  }

  const categories = Array.from(new Set(SAMPLE_BOOKS.map((b) => b.category)))
  const statuses = ["available", "borrowed", "reserved"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-50">
      <div className="border-b border-border/50 bg-gradient-to-r from-white to-slate-50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Library Collection
                </h1>
              </div>
              <p className="text-muted-foreground font-medium">
                Explore our curated Omani and Arabic literature collection
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white hover:bg-slate-50 border-border/50 transition-all hover:shadow-md"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white hover:bg-slate-50 border-border/50 transition-all hover:shadow-md"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg transition-all hover:from-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Book
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Search and Filters */}
        <div className="mt-10">
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            categories={categories}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        <div className="mt-12">
          {filteredBooks.length > 0 ? (
            <div className={viewMode === "grid" ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-4" : "space-y-4"}>
              {filteredBooks.map((book, index) => (
                <div
                  key={book.id}
                  style={{ animationDelay: `${index * 75}ms` }}
                  className="animate-in fade-in slide-in-from-bottom-6 duration-500"
                >
                  <BookCard book={book} viewMode={viewMode} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 py-16 bg-gradient-to-br from-slate-50/50 to-white">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-foreground">No books found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredBooks.length > 0 && (
          <div className="mt-12 flex items-center justify-between border-t border-border/50 pt-8">
            <span className="text-sm font-medium text-muted-foreground">
              Showing <span className="text-foreground font-bold">{filteredBooks.length}</span> of{" "}
              <span className="text-foreground font-bold">{SAMPLE_BOOKS.length}</span> books
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="transition-all hover:shadow-md bg-transparent">
                ← Previous
              </Button>
              <Button variant="outline" size="sm" className="transition-all hover:shadow-md bg-transparent">
                1
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg"
              >
                2
              </Button>
              <Button variant="outline" size="sm" className="transition-all hover:shadow-md bg-transparent">
                3
              </Button>
              <Button variant="outline" size="sm" className="transition-all hover:shadow-md bg-transparent">
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
