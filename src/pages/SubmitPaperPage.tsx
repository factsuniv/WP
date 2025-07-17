import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getCategories, supabase, Category } from '../lib/supabase'
import { Upload, FileText, Presentation, Volume2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

interface FormData {
  title: string
  description: string
  author: string
  categoryId: string
  pdfFile: File | null
  presentationFile: File | null
  audioFile: File | null
}

export default function SubmitPaperPage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    author: '',
    categoryId: '',
    pdfFile: null,
    presentationFile: null,
    audioFile: null
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'pdf' | 'presentation' | 'audio') => {
    const file = e.target.files?.[0] || null
    setFormData({
      ...formData,
      [`${fileType}File`]: file
    })
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return false
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description')
      return false
    }
    if (!formData.author.trim()) {
      toast.error('Please enter the author name')
      return false
    }
    if (!formData.categoryId) {
      toast.error('Please select a category')
      return false
    }
    if (!formData.pdfFile) {
      toast.error('Please upload a PDF file')
      return false
    }
    if (formData.pdfFile && formData.pdfFile.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file')
      return false
    }
    if (formData.pdfFile && formData.pdfFile.size > 50 * 1024 * 1024) {
      toast.error('PDF file size must be less than 50MB')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSubmitting(true)
    
    try {
      // Convert files to base64
      const pdfData = await convertFileToBase64(formData.pdfFile!)
      let presentationData = null
      let audioData = null
      
      if (formData.presentationFile) {
        presentationData = await convertFileToBase64(formData.presentationFile)
      }
      
      if (formData.audioFile) {
        audioData = await convertFileToBase64(formData.audioFile)
      }
      
      // Submit to upload-paper edge function
      const { data, error } = await supabase.functions.invoke('upload-paper', {
        body: {
          title: formData.title,
          description: formData.description,
          author: formData.author,
          categoryId: parseInt(formData.categoryId),
          pdfData,
          presentationData,
          audioData,
          isSubmission: !isAdmin // Admin uploads go directly to published, user uploads go to submissions
        }
      })
      
      if (error) {
        throw error
      }
      
      toast.success(data.data.message || 'Paper submitted successfully!')
      
      if (isAdmin) {
        navigate('/')
      } else {
        // Reset form for regular users
        setFormData({
          title: '',
          description: '',
          author: '',
          categoryId: '',
          pdfFile: null,
          presentationFile: null,
          audioFile: null
        })
        // Clear file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>
        fileInputs.forEach(input => input.value = '')
      }
      
    } catch (error: any) {
      console.error('Submission error:', error)
      toast.error(error.message || 'Failed to submit paper')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isAdmin ? 'Publish New Paper' : 'Submit Research Paper'}
          </h1>
          <p className="text-slate-600">
            {isAdmin 
              ? 'Add a new research paper to the platform with AI-powered analysis'
              : 'Share your research with the AI community and get intelligent insights'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Paper Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter the title of your research paper"
                required
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-slate-700 mb-2">
                Author(s) *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter author name(s)"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 mb-2">
                Research Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Provide a detailed description of your research, methodology, and key findings"
                required
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900">Files</h3>
              
              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Research Paper (PDF) *
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <div className="flex flex-col items-center">
                      <label htmlFor="pdfFile" className="cursor-pointer">
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          Choose PDF File
                        </span>
                        <input
                          type="file"
                          id="pdfFile"
                          accept=".pdf"
                          onChange={(e) => handleFileChange(e, 'pdf')}
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="mt-2 text-sm text-slate-500">
                        Maximum file size: 50MB
                      </p>
                    </div>
                    {formData.pdfFile && (
                      <div className="mt-3 flex items-center justify-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {formData.pdfFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Presentation Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Presentation Slides (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                  <div className="text-center">
                    <Presentation className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <div className="flex flex-col items-center">
                      <label htmlFor="presentationFile" className="cursor-pointer">
                        <span className="bg-slate-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors">
                          Choose Presentation
                        </span>
                        <input
                          type="file"
                          id="presentationFile"
                          accept=".pdf,.ppt,.pptx"
                          onChange={(e) => handleFileChange(e, 'presentation')}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-2 text-sm text-slate-500">
                        PDF, PPT, or PPTX format
                      </p>
                    </div>
                    {formData.presentationFile && (
                      <div className="mt-3 flex items-center justify-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {formData.presentationFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Audio Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Audio Summary/Podcast (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
                  <div className="text-center">
                    <Volume2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <div className="flex flex-col items-center">
                      <label htmlFor="audioFile" className="cursor-pointer">
                        <span className="bg-slate-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors">
                          Choose Audio File
                        </span>
                        <input
                          type="file"
                          id="audioFile"
                          accept=".mp3,.wav,.m4a"
                          onChange={(e) => handleFileChange(e, 'audio')}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-2 text-sm text-slate-500">
                        MP3, WAV, or M4A format
                      </p>
                    </div>
                    {formData.audioFile && (
                      <div className="mt-3 flex items-center justify-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {formData.audioFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Processing Notice */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <Sparkles className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-purple-800 mb-1">AI-Powered Analysis</h4>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    Your paper will be automatically processed by Google Gemini AI to generate intelligent summaries 
                    and section-by-section explanations to help readers understand your research better.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-slate-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                {isAdmin 
                  ? 'Paper will be published immediately'
                  : 'Submission will be reviewed by administrators'
                }
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Upload className="h-5 w-5 mr-2" />
                )}
                {submitting 
                  ? 'Processing...' 
                  : (isAdmin ? 'Publish Paper' : 'Submit for Review')
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
