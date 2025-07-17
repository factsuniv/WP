import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import PaperDetailPage from './pages/PaperDetailPage'
import CategoryPage from './pages/CategoryPage'
import AuthPage from './pages/AuthPage'
import AuthCallback from './pages/AuthCallback'
import AdminDashboard from './pages/AdminDashboard'
import SubmitPaperPage from './pages/SubmitPaperPage'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import AdminRoute from './components/Auth/AdminRoute'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/paper/:id" element={<PaperDetailPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route 
                path="/submit" 
                element={
                  <ProtectedRoute>
                    <SubmitPaperPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
