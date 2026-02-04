'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle, Zap, Settings } from 'lucide-react'

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
  const [showAutoMark, setShowAutoMark] = useState(false)
  const [autoMarkData, setAutoMarkData] = useState<any>(null)
  const [autoMarkLoading, setAutoMarkLoading] = useState(false)

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

  const fetchAutoMarkData = async () => {
    setAutoMarkLoading(true)
    try {
      const response = await fetch('/api/no-trade-days/auto-mark')
      const data = await response.json()
      if (data.success) {
        setAutoMarkData(data.data)
      }
    } catch (error) {
      console.error('Error fetching auto-mark data:', error)
    } finally {
      setAutoMarkLoading(false)
    }
  }

  const handleAutoMark = async () => {
    if (!autoMarkData?.summary?.datesNeedingNoTradeDay) return

    setAutoMarkLoading(true)
    try {
      const response = await fetch('/api/no-trade-days/auto-mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      if (data.success) {
        fetchStatus() // Refresh today's status
        fetchAutoMarkData() // Refresh auto-mark data
      }
    } catch (error) {
      console.error('Error auto-marking no-trade days:', error)
    } finally {
      setAutoMarkLoading(false)
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
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowAutoMark(!showAutoMark)
              if (!showAutoMark && !autoMarkData) {
                fetchAutoMarkData()
              }
            }}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Auto-mark historical no-trade days"
          >
            <Settings className="w-4 h-4" />
          </button>
          
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

      {showAutoMark && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Auto-Mark Historical No-Trade Days
          </h4>
          
          {autoMarkLoading ? (
            <div className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : autoMarkData ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  <div className="font-medium">Total Weekdays</div>
                  <div className="text-lg">{autoMarkData.summary.totalWeekdays}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900 p-2 rounded">
                  <div className="font-medium">With Trades</div>
                  <div className="text-lg">{autoMarkData.summary.datesWithTrades}</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-2 rounded">
                  <div className="font-medium">No-Trade Days</div>
                  <div className="text-lg">{autoMarkData.summary.datesWithNoTradeDays}</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900 p-2 rounded">
                  <div className="font-medium">Need Marking</div>
                  <div className="text-lg font-bold text-orange-600">{autoMarkData.summary.datesNeedingNoTradeDay}</div>
                </div>
              </div>
              
              {autoMarkData.summary.datesNeedingNoTradeDay > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {autoMarkData.summary.datesNeedingNoTradeDay} weekday(s) need no-trade day marking
                  </p>
                  <button
                    onClick={handleAutoMark}
                    disabled={autoMarkLoading}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                  >
                    <Zap className="w-3 h-3" />
                    {autoMarkLoading ? 'Processing...' : 'Auto-Mark Now'}
                  </button>
                </div>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Date range: {autoMarkData.summary.dateRange.from} to {autoMarkData.summary.dateRange.to}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Click refresh to load historical data
            </div>
          )}
        </div>
      )}
    </div>
  )
}
