import React from 'react'
import { Link } from 'react-router-dom'
import { WhitePaper, Category } from '../../lib/supabase'
import { FileText, User, Calendar, Eye, Sparkles, ExternalLink } from 'lucide-react'

interface PaperCardProps {
  paper: WhitePaper
  category?: Category
}

export default function PaperCard({ paper, category }: PaperCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {category && (
              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-2">
                {category.name}
              </span>
            )}
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
              <Link to={`/paper/${paper.id}`} className="hover:underline">
                {paper.title}
              </Link>
            </h3>
          </div>
        </div>

        {/* Author and Date */}
        <div className="flex items-center text-sm text-slate-600 mb-3">
          <User className="h-4 w-4 mr-1" />
          <span className="mr-4">{paper.author}</span>
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatDate(paper.created_at)}</span>
        </div>

        {/* Description */}
        <p className="text-slate-700 text-sm leading-relaxed mb-4">
          {truncateText(paper.description, 120)}
        </p>

        {/* AI Summary Preview */}
        {paper.ai_summary && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-4">
            <div className="flex items-center mb-2">
              <Sparkles className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-xs font-medium text-purple-800">AI Insights</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {truncateText(paper.ai_summary, 100)}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          {/* View count */}
          <div className="flex items-center text-sm text-slate-500">
            <Eye className="h-4 w-4 mr-1" />
            <span>{paper.views || 0} views</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {/* External links */}
            <div className="flex items-center space-x-1">
              {paper.presentation_url && (
                <a
                  href={paper.presentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="View presentation"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            {/* Read button */}
            <Link
              to={`/paper/${paper.id}`}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <FileText className="h-4 w-4" />
              <span>Read</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
