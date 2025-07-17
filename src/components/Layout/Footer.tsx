import React from 'react'
import { Brain, Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="h-8 w-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold">AI Research Hub</h3>
                <p className="text-xs text-slate-400">White Paper Platform</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Discover, read, and contribute to cutting-edge AI research with intelligent summarization and community-driven insights.
            </p>
          </div>

          {/* Research Categories */}
          <div className="md:col-span-1">
            <h4 className="font-semibold text-white mb-4">Research Areas</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/category/machine-learning" className="text-slate-400 hover:text-blue-400 transition-colors">Machine Learning</a></li>
              <li><a href="/category/computer-vision" className="text-slate-400 hover:text-blue-400 transition-colors">Computer Vision</a></li>
              <li><a href="/category/natural-language-processing" className="text-slate-400 hover:text-blue-400 transition-colors">NLP</a></li>
              <li><a href="/category/robotics" className="text-slate-400 hover:text-blue-400 transition-colors">Robotics</a></li>
              <li><a href="/category/ai-ethics" className="text-slate-400 hover:text-blue-400 transition-colors">AI Ethics</a></li>
            </ul>
          </div>

          {/* Platform */}
          <div className="md:col-span-1">
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-slate-400 hover:text-blue-400 transition-colors">Discover Papers</a></li>
              <li><a href="/submit" className="text-slate-400 hover:text-blue-400 transition-colors">Submit Research</a></li>
              <li><a href="/auth" className="text-slate-400 hover:text-blue-400 transition-colors">Join Community</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">API Access</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Guidelines</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-1">
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-slate-400 text-sm">
              Stay updated with the latest AI research breakthroughs and platform updates.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2025 AI Research Hub. Advancing knowledge through intelligent collaboration.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Terms</a>
              <a href="#" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
