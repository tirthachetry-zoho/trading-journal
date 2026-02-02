'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DailyTradesModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  trades: Array<{
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
  }>
}

export function DailyTradesModal({ isOpen, onClose, date, trades }: DailyTradesModalProps) {
  if (!isOpen) return null

  const calculatePL = (trade: {
    side: string
    exit_price: number
    entry_price: number
    quantity: number
    charges: number
  }) => {
    const grossPL = trade.side === 'BUY' 
      ? (trade.exit_price - trade.entry_price) * trade.quantity 
      : (trade.entry_price - trade.exit_price) * trade.quantity
    return grossPL - trade.charges
  }

  const totalPL = trades.reduce((sum, trade) => sum + calculatePL(trade), 0)
  const winningTrades = trades.filter(trade => calculatePL(trade) > 0).length
  const losingTrades = trades.filter(trade => calculatePL(trade) < 0).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Trades for {new Date(date).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {trades.length} trades
              </span>
              <span className={cn(
                "font-medium",
                totalPL > 0 ? "text-green-600 dark:text-green-400" : 
                totalPL < 0 ? "text-red-600 dark:text-red-400" : 
                "text-gray-600 dark:text-gray-400"
              )}>
                P&L: {totalPL > 0 ? '+' : ''}₹{totalPL.toFixed(2)}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {winningTrades}W / {losingTrades}L
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {trades.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No trades found for this day.
            </div>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => {
                const pl = calculatePL(trade)
                return (
                  <div
                    key={trade.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {trade.symbol}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {trade.exchange}
                        </span>
                        <span className={cn(
                          "inline-flex px-2 py-1 text-xs font-medium rounded",
                          trade.side === 'BUY' 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        )}>
                          {trade.side}
                        </span>
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        pl > 0 ? "text-green-600 dark:text-green-400" : 
                        pl < 0 ? "text-red-600 dark:text-red-400" : 
                        "text-gray-600 dark:text-gray-400"
                      )}>
                        {pl > 0 ? '+' : ''}₹{pl.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Qty:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{trade.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Entry:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">₹{trade.entry_price}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Exit:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">₹{trade.exit_price}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Charges:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">₹{trade.charges}</span>
                      </div>
                    </div>
                    {trade.notes && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Notes:</span> {trade.notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
