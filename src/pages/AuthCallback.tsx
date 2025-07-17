import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash

        if (hashFragment && hashFragment.length > 0) {
          // Exchange the auth code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(hashFragment)

          if (error) {
            console.error('Error exchanging code for session:', error.message)
            toast.error('Email verification failed')
            navigate('/auth?error=' + encodeURIComponent(error.message))
            return
          }

          if (data.session) {
            // Successfully signed in, redirect to app
            toast.success('Email verified successfully! Welcome to AI Research Hub.')
            navigate('/')
            return
          }
        }

        // If we get here, something went wrong
        toast.error('Email verification failed')
        navigate('/auth?error=No session found')
      } catch (error: any) {
        console.error('Auth callback error:', error)
        toast.error('Email verification failed')
        navigate('/auth?error=' + encodeURIComponent(error.message))
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Verifying your email...</h2>
        <p className="text-slate-600">Please wait while we verify your account.</p>
      </div>
    </div>
  )
}
