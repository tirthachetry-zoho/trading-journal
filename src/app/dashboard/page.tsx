'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { TradeForm } from '@/components/TradeForm'
import { TradeHistory } from '@/components/TradeHistory'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { RuleBasedInsights } from '@/components/RuleBasedInsights'
import { SEBIGuidelines } from '@/components/SEBIGuidelines'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import type { TradeFormData } from '@/types/trade'

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

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [showTradeForm, setShowTradeForm] = useState(false)
  const [editingTrade, setEditingTrade] = useState<(Partial<TradeFormData> & { id?: string }) | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'insights' | 'guidelines'>('dashboard')
  const [dbInitialized, setDbInitialized] = useState<boolean | 'error'>(false)

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  useEffect(() => {
    // Check database connection on first load
    const checkDB = async () => {
      try {
        const response = await fetch('/api/trades', { credentials: 'include' })
        if (response.ok) {
          setDbInitialized(true)
          console.log('Database is ready')
        } else {
          setDbInitialized('error')
        }
      } catch (error) {
        console.error('Database check failed:', error)
        setDbInitialized('error')
      }
    }

    if (user) {
      checkDB()
    }
  }, [user])

  const handleAddTrade = () => {
    setEditingTrade(null)
    setShowTradeForm(true)
  }

  const handleEditTrade = (trade: Trade) => {
    // Convert snake_case to camelCase for the form
    const camelCaseTrade = {
      id: trade.id,
      tradeDate: trade.trade_date,
      symbol: trade.symbol,
      exchange: trade.exchange,
      instrument: trade.instrument,
      side: trade.side,
      quantity: trade.quantity.toString(),
      entryPrice: trade.entry_price.toString(),
      exitPrice: trade.exit_price.toString(),
      charges: trade.charges.toString(),
      notes: trade.notes || '',
      lossReason: trade.loss_reason || '',
      profitReason: trade.profit_reason || '',
    }
    setEditingTrade(camelCaseTrade)
    setShowTradeForm(true)
  }

  const handleTradeSubmit = async (data: TradeFormData) => {
    try {
      const url = editingTrade?.id ? `/api/trades/${editingTrade.id}` : '/api/trades'
      const method = editingTrade?.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowTradeForm(false)
        setEditingTrade(null)
        setRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error saving trade:', error)
    }
  }

  const handleCancelTrade = () => {
    setShowTradeForm(false)
    setEditingTrade(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Trade History
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'insights'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab('guidelines')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'guidelines'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              SEBI Guidelines
            </button>
          </nav>
        </div>

        {!dbInitialized && (
          <div className="text-center py-8 text-gray-500">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
            </div>
            <p className="text-lg">Checking database connection...</p>
          </div>
        )}

        {dbInitialized === 'error' && (
          <div className="text-center py-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Database Connection Error
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800 mb-4">
                  Could not connect to your database. Please check your setup.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors mt-4"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {dbInitialized === true && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <button
                onClick={handleAddTrade}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Trade
              </button>
            </div>

            {activeTab === 'dashboard' && <AnalyticsDashboard />}
            {activeTab === 'history' && (
              <TradeHistory 
                onEditTrade={handleEditTrade} 
                refreshTrigger={refreshTrigger}
              />
            )}
            {activeTab === 'insights' && <RuleBasedInsights />}
            {activeTab === 'guidelines' && <SEBIGuidelines />}
          </>
        )}

        {showTradeForm && (
          <TradeForm
            onSubmit={handleTradeSubmit}
            onCancel={handleCancelTrade}
            initialData={editingTrade ?? undefined}
          />
        )}
      </main>
    </div>
  )
}