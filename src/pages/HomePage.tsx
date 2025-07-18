import React, { useState, useEffect } from 'react'
import { getCategories, getWhitePapers } from '../lib/supabase'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import StatsSection from '../components/Home/StatsSection'
import HeroSection from '../components/Home/HeroSection'
import toast from 'react-hot-toast'

export default function HomePage() {
  const [totalPapers, setTotalPapers] = useState(0)
  const [totalCategories, setTotalCategories] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [categoriesData, papersData] = await Promise.all([
          getCategories(),
          getWhitePapers()
        ])
        setTotalCategories(categoriesData.length)
        setTotalPapers(papersData.length)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load page data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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
      <StatsSection totalPapers={totalPapers} totalCategories={totalCategories} />
    </div>
  )
}
