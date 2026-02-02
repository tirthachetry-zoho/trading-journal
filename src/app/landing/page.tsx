'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Shield, Users, Target, BookOpen, Award, AlertTriangle, CheckCircle, Activity, FileText, Zap } from 'lucide-react'

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track win rate, profit factor, and equity curves with detailed performance metrics"
    },
    {
      icon: BookOpen,
      title: "SEBI Guidelines",
      description: "Learn why 90% of traders lose money with professional trading education"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Position sizing, stop-loss analysis, and emotional trade tracking"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Caching and optimized performance for instant trade entry and analysis"
    }
  ]

  const problems = [
    {
      icon: AlertTriangle,
      title: "No Performance Tracking",
      description: "Flying blind without knowing what strategies work"
    },
    {
      icon: AlertTriangle,
      title: "Emotional Trading",
      description: "Making impulsive decisions based on fear and greed"
    },
    {
      icon: AlertTriangle,
      title: "Repeated Mistakes",
      description: "Same costly errors happening over and over"
    },
    {
      icon: AlertTriangle,
      title: "No Strategy Refinement",
      description: "Unable to identify and fix weak points in trading"
    }
  ]

  const solutions = [
    {
      icon: CheckCircle,
      title: "Complete Trade History",
      description: "Build a comprehensive record of every trade"
    },
    {
      icon: CheckCircle,
      title: "Pattern Recognition",
      description: "Spot what's working and what's not in your trading"
    },
    {
      icon: CheckCircle,
      title: "Data-Driven Decisions",
      description: "Replace emotions with facts and analysis"
    },
    {
      icon: CheckCircle,
      title: "Strategy Optimization",
      description: "Focus on high-probability setups that work"
    }
  ]

  const stats = [
    { label: "Trades Logged", value: "160K+", icon: BarChart3 },
    { label: "Disciplined Trades", value: "2.5x", icon: TrendingUp },
    { label: "Emotional Trades", value: "-63%", icon: Shield },
    { label: "Active Traders", value: "6K+", icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Trading Journal</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              TRADE SMARTER,
              <span className="text-blue-600"> NOT HARDER</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Document, analyze, and elevate your trading performance with intelligent insights designed for serious traders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/login'}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-lg font-semibold"
              >
                Get Started Free
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all border border-gray-300 text-lg font-semibold"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The Problem Most Traders Face
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Are you making these costly mistakes in your trading journey?
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {problems.map((problem, index) => (
              <div key={index} className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-start gap-4">
                  <problem.icon className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">{problem.title}</h3>
                    <p className="text-red-700">{problem.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Our Trading Journal Helps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your trading with data-driven insights and professional tools
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-start gap-4">
                  <solution.icon className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">{solution.title}</h3>
                    <p className="text-green-700">{solution.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Trade Better
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed for serious traders who want to win consistently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of traders who are already trading smarter, not harder
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 text-lg font-semibold"
          >
            Start Your Journey Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">Trading Journal</span>
            </div>
            <p className="text-gray-400 mb-4">Built by <a href="https://github.com/tirthachetry-zoho" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Tirtha Chetry</a></p>
            <p className="text-gray-500 text-sm">© 2026 Trading Journal. Trade smarter, not harder.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
