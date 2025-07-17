import React from 'react'
import { Category } from '../../lib/supabase'
import { Filter, ChevronDown } from 'lucide-react'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: number | null
  onChange: (categoryId: number | null) => void
}

export default function CategoryFilter({ categories, selectedCategory, onChange }: CategoryFilterProps) {
  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-slate-600" />
        <select
          value={selectedCategory || ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
          className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[180px]"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  )
}
