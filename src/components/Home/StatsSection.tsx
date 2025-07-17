import React from 'react'
import { FileText, Users, TrendingUp, Brain } from 'lucide-react'

interface StatsSectionProps {
  totalPapers: number
  totalCategories: number
}

export default function StatsSection({ totalPapers, totalCategories }: StatsSectionProps) {
  const stats = [
    {
      icon: FileText,
      label: 'Research Papers',
      value: totalPapers.toLocaleString(),
      description: 'Peer-reviewed publications',
      color: 'blue'
    },
    {
      icon: Brain,
      label: 'AI Categories',
      value: totalCategories,
      description: 'Specialized research areas',
      color: 'purple'
    },
    {
      icon: Users,
      label: 'Active Researchers',
      value: '150+',
      description: 'Contributing scientists',
      color: 'green'
    },
    {
      icon: TrendingUp,
      label: 'Monthly Growth',
      value: '25%',
      description: 'New publications',
      color: 'orange'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100',
      purple: 'text-purple-600 bg-purple-100',
      green: 'text-green-600 bg-green-100',
      orange: 'text-orange-600 bg-orange-100'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            Platform Impact
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Join a growing community of AI researchers and practitioners sharing cutting-edge knowledge
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-xl ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl lg:text-4xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="font-medium text-slate-700">
                    {stat.label}
                  </p>
                  <p className="text-sm text-slate-500">
                    {stat.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
