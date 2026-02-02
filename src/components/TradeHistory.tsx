'use client'

import { useState, useEffect } from 'react'
import { ArrowUpDown, Filter, Download, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface Trade {
  id: string
  trade_date: string
  symbol: string
  exchange: string
  instrument: string
  side: string
  quantity: number
  entry_price: number | string
  exit_price: number | string
  charges: number | string
  notes?: string
  loss_reason?: string
  profit_reason?: string
}

interface TradeFilters {
  dateFrom?: string
  dateTo?: string
  symbol?: string
  exchange?: string
}

interface TradeHistoryProps {
  onEditTrade: (trade: Trade) => void
  refreshTrigger: number
}

export function TradeHistory({ onEditTrade, refreshTrigger }: TradeHistoryProps) {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TradeFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<keyof Trade>('trade_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        if (!user) return
        
        const params = new URLSearchParams()
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
        if (filters.dateTo) params.append('dateTo', filters.dateTo)
        if (filters.symbol) params.append('symbol', filters.symbol)
        if (filters.exchange) params.append('exchange', filters.exchange)

        const response = await fetch(`/api/trades?${params.toString()}`, { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setTrades(data)
        }
      } catch (error) {
        console.error('Error fetching trades:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [filters, refreshTrigger, user])

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedTrades = [...trades].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    
    let comparison = 0
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue)
    } else {
      comparison = (aValue as number) - (bValue as number)
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const calculatePL = (trade: Trade) => {
    const entry = typeof trade.entry_price === 'number' ? trade.entry_price : parseFloat(trade.entry_price)
    const exit = typeof trade.exit_price === 'number' ? trade.exit_price : parseFloat(trade.exit_price)
    const charges = typeof trade.charges === 'number' ? trade.charges : parseFloat(trade.charges)

    const grossPL = trade.side === 'BUY'
      ? (exit - entry) * trade.quantity
      : (entry - exit) * trade.quantity
    return grossPL - (Number.isFinite(charges) ? charges : 0)
  }

  const exportToCSV = () => {
    const headers = [
      'Date', 'Symbol', 'Exchange', 'Instrument', 'Side', 
      'Quantity', 'Entry Price', 'Exit Price', 'Charges', 'P&L', 'Notes'
    ]
    
    const csvContent = [
      headers.join(','),
      ...sortedTrades.map(trade => {
        const pl = calculatePL(trade)
        return [
          trade.trade_date,
          trade.symbol,
          trade.exchange,
          trade.instrument,
          trade.side,
          trade.quantity,
          trade.entry_price,
          trade.exit_price,
          trade.charges,
          pl.toFixed(2),
          `"${trade.notes || ''}"`
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trades-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const deleteTrade = async (trade: Trade) => {
    if (!confirm('Are you sure you want to delete this trade?')) return
    
    try {
      if (!user) return
      
      const response = await fetch(`/api/trades/${trade.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (response.ok) {
        setTrades(prev => prev.filter(t => t.id !== trade.id))
      }
    } catch (error) {
      console.error('Error deleting trade:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading trades...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trade History ({trades.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={exportToCSV}
            disabled={trades.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Symbol
              </label>
              <input
                type="text"
                placeholder="Filter by symbol"
                value={filters.symbol || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exchange
              </label>
              <select
                value={filters.exchange || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, exchange: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Exchanges</option>
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
                <option value="CRYPTO">Crypto</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({})}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {trades.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No trades found. Add your first trade to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th 
                  onClick={() => handleSort('trade_date')}
                  className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('symbol')}
                  className="text-left p-3 font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-1">
                    Symbol
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                  Exchange
                </th>
                <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
                  Side
                </th>
                <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
                  Qty
                </th>
                <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
                  Entry
                </th>
                <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
                  Exit
                </th>
                <th className="text-right p-3 font-medium text-gray-700 dark:text-gray-300">
                  P&L
                </th>
                <th className="p-3 font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTrades.map((trade) => {
                const pl = calculatePL(trade)
                return (
                  <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 text-gray-900 dark:text-white">
                      {new Date(trade.trade_date).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-medium text-gray-900 dark:text-white">
                      {trade.symbol}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-400">
                      {trade.exchange}
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        "inline-flex px-2 py-1 text-xs font-medium rounded",
                        trade.side === 'BUY' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      )}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="p-3 text-right text-gray-900 dark:text-white">
                      {trade.quantity}
                    </td>
                    <td className="p-3 text-right text-gray-900 dark:text-white">
                      {Number(trade.entry_price).toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-gray-900 dark:text-white">
                      {Number(trade.exit_price).toFixed(2)}
                    </td>
                    <td className={cn(
                      "p-3 text-right font-medium",
                      pl > 0 ? "text-green-600 dark:text-green-400" : 
                      pl < 0 ? "text-red-600 dark:text-red-400" : 
                      "text-gray-600 dark:text-gray-400"
                    )}>
                      {pl > 0 ? '+' : ''}{pl.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onEditTrade(trade)}
                          className="p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTrade(trade)}
                          className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
