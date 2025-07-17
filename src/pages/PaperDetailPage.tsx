import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getWhitePaper, getCategories, incrementPaperViews, WhitePaper, Category } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, User, Calendar, Eye, Download, ExternalLink, Sparkles, FileText, Volume2, Presentation } from 'lucide-react'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import PDFViewer from '../components/Paper/PDFViewer'
import AIInsights from '../components/Paper/AIInsights'
import toast from 'react-hot-toast'

export default function PaperDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [paper, setPaper] = useState<WhitePaper | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pdf' | 'ai-insights'>('pdf')
  const [viewLogged, setViewLogged] = useState(false)

  useEffect(() => {
    async function loadPaper() {
      if (!id) return
      
      try {
        setLoading(true)
        const [paperData, categoriesData] = await Promise.all([
          getWhitePaper(parseInt(id)),
          getCategories()
        ])
        
        if (!paperData) {
          toast.error('Paper not found')
          navigate('/')
          return
        }
        
        setPaper(paperData)
        
        // Find the category
        const paperCategory = categoriesData.find(c => c.id === paperData.category_id)
        setCategory(paperCategory || null)
        
      } catch (error) {
        console.error('Error loading paper:', error)
        toast.error('Failed to load paper')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    loadPaper()
  }, [id, navigate])

  // Log view after paper loads
  useEffect(() => {
    if (paper && !viewLogged) {
      incrementPaperViews(paper.id, user?.id)
      setViewLogged(true)
    }
  }, [paper, user, viewLogged])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Paper Not Found</h1>
          <p className="text-slate-600 mb-4">The paper you're looking for doesn't exist.</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Papers
          </button>

          {/* Paper Info */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Category */}
              {category && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                  {category.name}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                {paper.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-6">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-medium">{paper.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{formatDate(paper.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  <span>{paper.views || 0} views</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-slate-700 leading-relaxed">
                {paper.description}
              </p>
            </div>

            {/* Action Panel */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-slate-900 mb-4">Access Paper</h3>
                
                {/* PDF Download */}
                <a
                  href={paper.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download PDF
                </a>

                {/* Additional Resources */}
                {(paper.presentation_url || paper.audio_url) && (
                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="font-medium text-slate-900 mb-3">Additional Resources</h4>
                    <div className="space-y-2">
                      {paper.presentation_url && (
                        <a
                          href={paper.presentation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center w-full px-3 py-2 text-slate-700 hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <Presentation className="h-4 w-4 mr-2" />
                          Presentation Slides
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      )}
                      {paper.audio_url && (
                        <a
                          href={paper.audio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center w-full px-3 py-2 text-slate-700 hover:bg-white hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          Audio Summary
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pdf')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pdf'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                View PDF
              </button>
              <button
                onClick={() => setActiveTab('ai-insights')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'ai-insights'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Sparkles className="h-4 w-4 inline mr-2" />
                AI Insights
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {activeTab === 'pdf' && (
            <PDFViewer pdfUrl={paper.pdf_url} />
          )}
          {activeTab === 'ai-insights' && (
            <AIInsights paper={paper} />
          )}
        </div>
      </div>
    </div>
  )
}
