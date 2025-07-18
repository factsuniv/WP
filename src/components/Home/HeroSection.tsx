import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Brain, FileText, Sparkles, TrendingUp, ArrowRight, Search } from 'lucide-react'

export default function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-400 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
              <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">AI-Powered Research Platform</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="text-slate-900">Discover</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Research
                </span>
                <br />
                <span className="text-slate-900">with Intelligence</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                Access cutting-edge AI white papers with intelligent summarization, section-by-section explanations, and community-driven insights. Powered by Google Gemini AI.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/discover"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
              >
                <Search className="h-5 w-5 mr-2" />
                Explore Papers
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              {user ? (
                <Link
                  to="/submit"
                  className="inline-flex items-center px-6 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Submit Research
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center px-6 py-3 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Join Community
                </Link>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">AI Summaries</p>
                  <p className="text-sm text-slate-600">Intelligent insights</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Multi-Media</p>
                  <p className="text-sm text-slate-600">PDFs, slides, audio</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Latest Research</p>
                  <p className="text-sm text-slate-600">Always up-to-date</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Main visual container */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                {/* Mock paper preview */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Advanced Neural Networks</h3>
                      <p className="text-sm text-slate-600">Dr. Sarah Chen • Dec 2024</p>
                    </div>
                  </div>
                  
                  <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg flex items-center justify-center">
                    <FileText className="h-12 w-12 text-slate-400" />
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-xs font-medium text-purple-800">AI Summary</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      This research introduces novel transformer architectures that achieve 15% better performance on complex reasoning tasks...
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-500">1,234 views</span>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
                      Read Full Paper
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 p-3 bg-white rounded-xl shadow-lg border border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-slate-700">Live Updates</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 p-3 bg-white rounded-xl shadow-lg border border-slate-200">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-slate-700">AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
