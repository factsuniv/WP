import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCategories, getWhitePapers, Category, WhitePaper } from '../lib/supabase'
import { ArrowLeft, Search } from 'lucide-react'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import PaperCard from '../components/Paper/PaperCard'
import SearchBar from '../components/Paper/SearchBar'
import toast from 'react-hot-toast'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | null>(null)
  const [papers, setPapers] = useState<WhitePaper[]>([])
  const [filteredPapers, setFilteredPapers] = useState<WhitePaper[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategoryData() {
      if (!slug) return
      
      try {
        setLoading(true)
        const categories = await getCategories()
        const foundCategory = categories.find(c => c.slug === slug)
        
        if (!foundCategory) {
          toast.error('Category not found')
          navigate('/')
          return
        }
        
        setCategory(foundCategory)
        
        const papersData = await getWhitePapers(foundCategory.id)
        setPapers(papersData)
        setFilteredPapers(papersData)
        
      } catch (error) {
        console.error('Error loading category data:', error)
        toast.error('Failed to load category')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    loadCategoryData()
  }, [slug, navigate])

  // Filter papers based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPapers(papers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = papers.filter(paper => 
        paper.title.toLowerCase().includes(query) ||
        paper.description.toLowerCase().includes(query) ||
        paper.author.toLowerCase().includes(query) ||
        paper.ai_summary.toLowerCase().includes(query)
      )
      setFilteredPapers(filtered)
    }
  }, [papers, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Category Not Found</h1>
          <p className="text-slate-600 mb-4">The category you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to All Papers
          </button>

          {/* Category Info */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {category.name}
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              {category.description}
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Search ${category.name} papers...`}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">
              {filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''} found
              {searchQuery && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  "{searchQuery}"
                </span>
              )}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear search
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
                category={category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? 'No papers found' : 'No papers in this category yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : `Be the first to submit a paper in ${category.name}`
              }
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear search
              </button>
            ) : (
              <button
                onClick={() => navigate('/submit')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Paper
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
