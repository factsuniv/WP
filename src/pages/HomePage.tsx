import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getWhitePapers, Category, WhitePaper } from '../lib/supabase'
import { Search, Filter, BookOpen, Users, TrendingUp, Brain, FileText, Sparkles } from 'lucide-react'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import PaperCard from '../components/Paper/PaperCard'
import CategoryFilter from '../components/Paper/CategoryFilter'
import SearchBar from '../components/Paper/SearchBar'
import StatsSection from '../components/Home/StatsSection'
import HeroSection from '../components/Home/HeroSection'
import toast from 'react-hot-toast'

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [papers, setPapers] = useState<WhitePaper[]>([])
  const [filteredPapers, setFilteredPapers] = useState<WhitePaper[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [categoriesData, papersData] = await Promise.all([
          getCategories(),
          getWhitePapers()
        ])
        setCategories(categoriesData)
        setPapers(papersData)
        setFilteredPapers(papersData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load papers')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter papers based on category and search query
  useEffect(() => {
    let filtered = papers

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(paper => paper.category_id === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(paper => 
        paper.title.toLowerCase().includes(query) ||
        paper.description.toLowerCase().includes(query) ||
        paper.author.toLowerCase().includes(query) ||
        paper.ai_summary.toLowerCase().includes(query)
      )
    }

    setFilteredPapers(filtered)
  }, [papers, selectedCategory, searchQuery])

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection totalPapers={papers.length} totalCategories={categories.length} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1 max-w-2xl">
              <SearchBar 
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search papers by title, author, content, or AI insights..."
              />
            </div>
            <div className="lg:ml-6">
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                onChange={handleCategoryChange}
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-slate-600" />
              <span className="text-slate-600">
                {filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''} found
                {selectedCategory && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
                {searchQuery && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    "{searchQuery}"
                  </span>
                )}
              </span>
            </div>
            {(selectedCategory || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setSearchQuery('')
                }}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Papers Grid */}
        {filteredPapers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <PaperCard 
                key={paper.id} 
                paper={paper} 
                category={categories.find(c => c.id === paper.category_id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No papers found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || selectedCategory
                ? 'Try adjusting your search or filter criteria'
                : 'No papers have been published yet'
              }
            </p>
            {searchQuery || selectedCategory ? (
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setSearchQuery('')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit the first paper
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
