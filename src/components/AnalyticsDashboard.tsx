'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import type { AnalyticsData } from '@/types/trade'
import { DailyTradesModal } from '@/components/DailyTradesModal'
import { useAuth } from '@/contexts/AuthContext'

interface AnalyticsCardProps {
  title: string
  value: string | number
  change?: number
  format?: 'number' | 'currency' | 'percentage'
}

function AnalyticsCard({ title, value, change, format = 'number' }: AnalyticsCardProps) {
  const formatValue = (val: string | number) => {
    switch (format) {
      case 'currency':
        return `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      case 'percentage':
        return `${Number(val).toFixed(1)}%`
      default:
        return Number(val).toLocaleString()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {formatValue(value)}
        </p>
        {change !== undefined && (
          <span className={`ml-2 text-sm font-medium ${
            change > 0 ? 'text-green-600 dark:text-green-400' : change < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
  )
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dailyTrades, setDailyTrades] = useState<Array<{
    id: string
    trade_date: string
    symbol: string
    exchange: string
    instrument: string
    side: string
    quantity: number
    entry_price: number
    exit_price: number
    charges: number
    notes?: string
    pl?: number
  }>>([])
  const [showDailyTradesModal, setShowDailyTradesModal] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (!user) return
        const response = await fetch('/api/analytics', { credentials: 'include' })
        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user])

  const handleDailyBarClick = (barItem: unknown) => {
    const date = (barItem as { payload?: { date?: string } } | null)?.payload?.date
    if (!date) return

    const run = async () => {
      try {
        if (!user) return
        const response = await fetch(`/api/daily-trades?date=${date}`, { credentials: 'include' })
        if (response.ok) {
          const trades = await response.json()
          setSelectedDate(date)
          setDailyTrades(trades)
          setShowDailyTradesModal(true)
        }
      } catch (error) {
        console.error('Error fetching daily trades:', error)
      }
    }

    void run()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No data available. Add some trades to see analytics.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Trades"
          value={data.totalTrades}
          format="number"
        />
        <AnalyticsCard
          title="Net P&L"
          value={data.netPL}
          format="currency"
        />
        <AnalyticsCard
          title="Win Rate"
          value={data.winRate}
          format="percentage"
        />
        <AnalyticsCard
          title="Avg Win / Avg Loss"
          value={`${Math.abs(data.avgWin).toFixed(0)} / ${Math.abs(data.avgLoss).toFixed(0)}`}
          format="number"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Equity Curve
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.equityCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value) => [`₹${Number(value ?? 0).toLocaleString()}`, 'Portfolio Value']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily P&L
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.dailyPL.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value) => [`₹${Number(value ?? 0).toLocaleString()}`, 'P&L']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Bar 
                dataKey="pl" 
                fill="#10B981"
                onClick={handleDailyBarClick}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly P&L
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyPL}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-')
                  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
                }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value) => [`₹${Number(value ?? 0).toLocaleString()}`, 'P&L']}
                labelFormatter={(label) => {
                  const [year, month] = label.split('-')
                  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                }}
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Bar 
                dataKey="pl" 
                fill="#10B981"
                onClick={handleDailyBarClick}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Best & Worst Trades
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Best Trade
                  </p>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {data.bestTrade.symbol}
                  </p>
                </div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  +₹{data.bestTrade.pl.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Worst Trade
                  </p>
                  <p className="text-lg font-semibold text-red-900 dark:text-red-100">
                    {data.worstTrade.symbol}
                  </p>
                </div>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  ₹{data.worstTrade.pl.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Win</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ₹{Math.abs(data.avgWin).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Loss</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  ₹{Math.abs(data.avgLoss).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DailyTradesModal
        isOpen={showDailyTradesModal}
        onClose={() => setShowDailyTradesModal(false)}
        date={selectedDate || ''}
        trades={dailyTrades}
      />
    </div>
  )
}
