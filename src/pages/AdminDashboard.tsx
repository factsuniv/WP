import React, { useState, useEffect } from 'react'
import { getSubmissions, getWhitePapers, getCategories, supabase, Submission, WhitePaper, Category } from '../lib/supabase'
import { Users, FileText, Clock, TrendingUp, Eye, CheckCircle, XCircle, Trash2, Edit, Filter } from 'lucide-react'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [papers, setPapers] = useState<WhitePaper[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'papers'>('overview')
  const [stats, setStats] = useState({
    totalPapers: 0,
    pendingSubmissions: 0,
    totalUsers: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [submissionsData, papersData, categoriesData] = await Promise.all([
        getSubmissions(),
        getWhitePapers(),
        getCategories()
      ])
      
      setSubmissions(submissionsData)
      setPapers(papersData)
      setCategories(categoriesData)
      
      // Get platform stats
      try {
        const { data: statsData } = await supabase.functions.invoke('admin-actions', {
          body: { action: 'get_stats' }
        })
        if (statsData?.data) {
          setStats(statsData.data)
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveSubmission = async (submissionId: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'approve_submission',
          data: { submissionId }
        }
      })
      
      if (error) throw error
      
      toast.success('Submission approved and published')
      loadDashboardData() // Reload data
    } catch (error: any) {
      console.error('Error approving submission:', error)
      toast.error(error.message || 'Failed to approve submission')
    }
  }

  const handleRejectSubmission = async (submissionId: number) => {
    if (!confirm('Are you sure you want to reject this submission? This action cannot be undone.')) {
      return
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'reject_submission',
          data: { submissionId }
        }
      })
      
      if (error) throw error
      
      toast.success('Submission rejected and removed')
      loadDashboardData() // Reload data
    } catch (error: any) {
      console.error('Error rejecting submission:', error)
      toast.error(error.message || 'Failed to reject submission')
    }
  }

  const handleDeletePaper = async (paperId: number) => {
    if (!confirm('Are you sure you want to delete this paper? This action cannot be undone.')) {
      return
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'delete_paper',
          data: { paperId }
        }
      })
      
      if (error) throw error
      
      toast.success('Paper deleted successfully')
      loadDashboardData() // Reload data
    } catch (error: any) {
      console.error('Error deleting paper:', error)
      toast.error(error.message || 'Failed to delete paper')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage papers, submissions, and platform content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Pending Submissions ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'papers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Published Papers ({papers.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Papers</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalPapers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Pending Submissions</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.pendingSubmissions}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-medium text-slate-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {submissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-medium text-slate-900">{submission.title}</p>
                        <p className="text-sm text-slate-600">Submitted by {submission.author} • {formatDate(submission.created_at)}</p>
                      </div>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        Pending Review
                      </span>
                    </div>
                  ))}
                  {submissions.length === 0 && (
                    <p className="text-slate-500 text-center py-4">No recent submissions</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {submissions.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-medium text-slate-900">Pending Submissions</h3>
                </div>
                <div className="divide-y divide-slate-200">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-slate-900 mb-2">{submission.title}</h4>
                          <p className="text-slate-600 mb-3">{submission.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span>By {submission.author}</span>
                            <span>•</span>
                            <span>{getCategoryName(submission.category_id)}</span>
                            <span>•</span>
                            <span>{formatDate(submission.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-6">
                          <a
                            href={submission.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleApproveSubmission(submission.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectSubmission(submission.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No pending submissions</h3>
                <p className="text-slate-600">All submissions have been reviewed.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'papers' && (
          <div className="space-y-6">
            {papers.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-medium text-slate-900">Published Papers</h3>
                </div>
                <div className="divide-y divide-slate-200">
                  {papers.map((paper) => (
                    <div key={paper.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-slate-900 mb-2">{paper.title}</h4>
                          <p className="text-slate-600 mb-3">{paper.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span>By {paper.author}</span>
                            <span>•</span>
                            <span>{getCategoryName(paper.category_id)}</span>
                            <span>•</span>
                            <span>{paper.views || 0} views</span>
                            <span>•</span>
                            <span>{formatDate(paper.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-6">
                          <a
                            href={`/paper/${paper.id}`}
                            className="px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleDeletePaper(paper.id)}
                            className="px-3 py-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No papers published yet</h3>
                <p className="text-slate-600">Start by approving submissions or publishing new papers.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
