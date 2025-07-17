import { createClient } from '@supabase/supabase-js'

// Supabase configuration - hardcoded as per best practices
const supabaseUrl = 'https://orvdkxbdombdduljstog.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydmRreGJkb21iZGR1bGpzdG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MjYzNDQsImV4cCI6MjA2ODMwMjM0NH0.ep8klxf1PFwPnb6rlf2KJGBJnsBDRzEdI1reCueUuBU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description: string
  slug: string
  created_at: string
}

export interface WhitePaper {
  id: number
  title: string
  description: string
  author: string
  category_id: number
  pdf_url: string
  presentation_url?: string
  audio_url?: string
  ai_summary: string
  ai_sections: AISection[]
  status: 'published' | 'draft'
  views: number
  uploaded_by: string
  created_at: string
  updated_at: string
}

export interface AISection {
  title: string
  content: string
}

export interface Submission {
  id: number
  title: string
  description: string
  author: string
  category_id: number
  pdf_url: string
  presentation_url?: string
  audio_url?: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_by: string
  reviewed_by?: string
  review_notes?: string
  created_at: string
  updated_at: string
}

// Auth helper functions
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}

export async function signUp(email: string, password: string, fullName: string) {
  try {
    // Use enhanced signup function to handle email validation issues
    const { data, error } = await supabase.functions.invoke('enhanced-signup', {
      body: {
        email,
        password,
        fullName
      }
    })

    if (error) {
      throw new Error(error.message || 'Signup failed')
    }

    if (!data.success) {
      throw new Error(data.error || 'Signup failed')
    }

    return {
      user: data.data.user,
      session: null,
      method: data.method
    }
  } catch (error: any) {
    console.error('Error signing up:', error.message)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Error signing in:', error.message)
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
    throw error
  }
}

// Database helper functions
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  return data as Category[]
}

export async function getWhitePapers(categoryId?: number) {
  let query = supabase
    .from('white_papers')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching white papers:', error)
    throw error
  }

  return data as WhitePaper[]
}

export async function getWhitePaper(id: number) {
  const { data, error } = await supabase
    .from('white_papers')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    console.error('Error fetching white paper:', error)
    throw error
  }

  return data as WhitePaper | null
}

export async function incrementPaperViews(paperId: number, userId?: string, ipAddress?: string) {
  try {
    // First get current views count
    const { data: paper } = await supabase
      .from('white_papers')
      .select('views')
      .eq('id', paperId)
      .maybeSingle()

    if (paper) {
      // Increment the views count
      const { error: updateError } = await supabase
        .from('white_papers')
        .update({ views: (paper.views || 0) + 1 })
        .eq('id', paperId)

      if (updateError) {
        console.error('Error updating views:', updateError)
      }
    }

    // Then log the view
    const { error: logError } = await supabase
      .from('paper_views')
      .insert({
        paper_id: paperId,
        user_id: userId,
        ip_address: ipAddress
      })

    if (logError) {
      console.error('Error logging view:', logError)
    }
  } catch (error) {
    console.error('Error incrementing paper views:', error)
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }

  return data as Profile | null
}

export async function getSubmissions() {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching submissions:', error)
    throw error
  }

  return data as Submission[]
}
