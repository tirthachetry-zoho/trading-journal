'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface NoTradeDayStatus {
  date: string
  currentTime: string
  tradeCount: number
  hasNoTradeDay: boolean
  afterMarketClose: boolean
  isWeekend: boolean
  canCreateNoTradeDay: boolean
  message: string
}

export function NoTradeDayIndicator() {
  const [status, setStatus] = useState<NoTradeDayStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchStatus()
    // Check status every minute
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/no-trade-days/check')
      const data = await response.json()
      if (data.success) {
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Error fetching no-trade-day status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkNoTradeDay = async () => {
    if (!status?.canCreateNoTradeDay) return

    setCreating(true)
    try {
      const response = await fetch('/api/no-trade-days/check', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        fetchStatus() // Refresh status
      }
    } catch (error) {
      console.error('Error marking no-trade-day:', error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!status) {
    return null
  }

  const getStatusIcon = () => {
    if (status.hasNoTradeDay) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    }
    if (status.tradeCount > 0) {
      return <AlertCircle className="w-5 h-5 text-blue-600" />
    }
    if (status.canCreateNoTradeDay) {
      return <Clock className="w-5 h-5 text-orange-600" />
    }
    return <Calendar className="w-5 h-5 text-gray-600" />
  }

  const getStatusColor = () => {
    if (status.hasNoTradeDay) {
      return 'bg-green-50 border-green-200 text-green-800'
    }
    if (status.tradeCount > 0) {
      return 'bg-blue-50 border-blue-200 text-blue-800'
    }
    if (status.canCreateNoTradeDay) {
      return 'bg-orange-50 border-orange-200 text-orange-800'
    }
    return 'bg-gray-50 border-gray-200 text-gray-800'
  }

  return (
    <div className={`rounded-lg border p-4 mb-6 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold">Today's Trading Status</h3>
            <p className="text-sm opacity-90">{status.message}</p>
            <p className="text-xs opacity-75 mt-1">
              Current time: {status.currentTime} | Trades: {status.tradeCount}
            </p>
          </div>
        </div>
        
        {status.canCreateNoTradeDay && (
          <button
            onClick={handleMarkNoTradeDay}
            disabled={creating}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {creating ? 'Marking...' : 'Mark No-Trade Day'}
          </button>
        )}
      </div>
    </div>
  )
}
