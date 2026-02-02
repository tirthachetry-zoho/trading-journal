'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TradeFormData } from '@/types/trade'
import { LOSS_REASONS, PROFIT_REASONS } from '@/lib/trading-guidelines'

interface TradeFormProps {
  onSubmit: (data: TradeFormData) => void
  onCancel: () => void
  initialData?: Partial<TradeFormData>
}

export function TradeForm({ onSubmit, onCancel, initialData }: TradeFormProps) {
  const today = new Date().toISOString().slice(0, 10)

  const [formData, setFormData] = useState<TradeFormData>({
    tradeDate: initialData?.tradeDate ? new Date(initialData.tradeDate).toISOString().slice(0, 10) : today,
    symbol: initialData?.symbol || '',
    exchange: initialData?.exchange || 'NSE',
    instrument: initialData?.instrument || 'EQUITY',
    side: initialData?.side || 'BUY',
    quantity: initialData?.quantity || '',
    entryPrice: initialData?.entryPrice || '',
    exitPrice: initialData?.exitPrice || '',
    charges: initialData?.charges || '0',
    notes: initialData?.notes || '',
    lossReason: initialData?.lossReason || '',
    profitReason: initialData?.profitReason || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.tradeDate > today) {
      return
    }

    onSubmit(formData)
  }

  const handleChange = (field: keyof TradeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculatePL = () => {
    const quantity = parseFloat(formData.quantity) || 0
    const entryPrice = parseFloat(formData.entryPrice) || 0
    const exitPrice = parseFloat(formData.exitPrice) || 0
    const charges = parseFloat(formData.charges) || 0
    
    if (quantity === 0 || entryPrice === 0 || exitPrice === 0) return 0
    
    const grossPL = formData.side === 'BUY' 
      ? (exitPrice - entryPrice) * quantity 
      : (entryPrice - exitPrice) * quantity
    
    return grossPL - charges
  }

  const pl = calculatePL()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Edit Trade' : 'Add New Trade'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trade Date
            </label>
            <input
              type="date"
              required
              max={today}
              value={formData.tradeDate}
              onChange={(e) => handleChange('tradeDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Symbol
            </label>
            <input
              type="text"
              required
              placeholder="e.g., RELIANCE, BTCUSD"
              value={formData.symbol}
              onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exchange
              </label>
              <select
                value={formData.exchange}
                onChange={(e) => handleChange('exchange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
                <option value="CRYPTO">Crypto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instrument
              </label>
              <select
                value={formData.instrument}
                onChange={(e) => handleChange('instrument', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="EQUITY">Equity</option>
                <option value="OPTIONS">Options</option>
                <option value="FUTURES">Futures</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Side
              </label>
              <select
                value={formData.side}
                onChange={(e) => handleChange('side', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="100"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Entry Price
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                placeholder="2500.00"
                value={formData.entryPrice}
                onChange={(e) => handleChange('entryPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exit Price
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                placeholder="2550.00"
                value={formData.exitPrice}
                onChange={(e) => handleChange('exitPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Charges
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.charges}
              onChange={(e) => handleChange('charges', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {pl !== 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estimated P&L:
                </span>
                <span className={cn(
                  "text-lg font-semibold",
                  pl > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {pl > 0 ? '+' : ''}{pl.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {pl > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profit Reason
              </label>
              <select
                value={formData.profitReason}
                onChange={(e) => handleChange('profitReason', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select profit reason...</option>
                {PROFIT_REASONS.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          )}

          {pl < 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loss Reason
              </label>
              <select
                value={formData.lossReason}
                onChange={(e) => handleChange('lossReason', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select loss reason...</option>
                {LOSS_REASONS.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Trade notes, strategy, reasons..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {initialData ? 'Update Trade' : 'Add Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
