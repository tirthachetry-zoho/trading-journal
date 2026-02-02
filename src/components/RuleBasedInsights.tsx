'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import type { Insight } from '@/types/trade'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export function RuleBasedInsights() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        if (!user) return
        const response = await fetch('/api/insights', { credentials: 'include' })
        if (response.ok) {
          const insightsData = await response.json()
          setInsights(insightsData)
        }
      } catch (error) {
        console.error('Error fetching insights:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [user])

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    }
  }

  const getBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const getTitleColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200'
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200'
      case 'info':
        return 'text-blue-800 dark:text-blue-200'
      default:
        return 'text-gray-800 dark:text-gray-200'
    }
  }

  const getDescriptionColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-700 dark:text-green-300'
      case 'warning':
        return 'text-yellow-700 dark:text-yellow-300'
      case 'info':
        return 'text-blue-700 dark:text-blue-300'
      default:
        return 'text-gray-700 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No insights available yet. Add more trades to get personalized insights.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Trading Insights
      </h2>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg border",
              getBgColor(insight.type)
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(insight.type)}
              </div>
              <div className="flex-1">
                <h3 className={cn(
                  "font-medium mb-1",
                  getTitleColor(insight.type)
                )}>
                  {insight.title}
                </h3>
                <p className={cn(
                  "text-sm",
                  getDescriptionColor(insight.type)
                )}>
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
