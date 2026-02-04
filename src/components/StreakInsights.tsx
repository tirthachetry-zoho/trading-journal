'use client'

import { TrendingUp, TrendingDown, Calendar, Zap } from 'lucide-react'

interface StreakData {
  currentGainStreak: number
  currentLossStreak: number
  currentNoTradeStreak: number
  longestGainStreak: number
  longestLossStreak: number
  longestNoTradeStreak: number
  recentStreaks: Array<{
    date: string
    result: 'gain' | 'loss' | 'no_trade' | 'mixed'
    trades: number
    hasNoTradeDay: boolean
  }>
}

interface StreakInsightsProps {
  streaks: StreakData
}

export function StreakInsights({ streaks }: StreakInsightsProps) {
  const getStreakColor = (type: 'gain' | 'loss' | 'no_trade') => {
    switch (type) {
      case 'gain':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
      case 'loss':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
      case 'no_trade':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-700'
    }
  }

  const getStreakIcon = (type: 'gain' | 'loss' | 'no_trade') => {
    switch (type) {
      case 'gain':
        return <TrendingUp className="w-4 h-4" />
      case 'loss':
        return <TrendingDown className="w-4 h-4" />
      case 'no_trade':
        return <Calendar className="w-4 h-4" />
    }
  }

  const getDayIcon = (result: string) => {
    switch (result) {
      case 'gain':
        return <TrendingUp className="w-3 h-3 text-green-600" />
      case 'loss':
        return <TrendingDown className="w-3 h-3 text-red-600" />
      case 'no_trade':
        return <Calendar className="w-3 h-3 text-orange-600" />
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />
    }
  }

  const getDayLabel = (result: string) => {
    switch (result) {
      case 'gain':
        return 'Gain'
      case 'loss':
        return 'Loss'
      case 'no_trade':
        return 'No Trade'
      default:
        return 'Mixed'
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Streaks */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Current Streaks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${getStreakColor('gain')}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStreakIcon('gain')}
                <span className="font-medium">Gain Streak</span>
              </div>
              <span className="text-2xl font-bold">{streaks.currentGainStreak}</span>
            </div>
            <p className="text-sm opacity-75 mt-1">Consecutive profitable days</p>
          </div>

          <div className={`p-4 rounded-lg border ${getStreakColor('loss')}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStreakIcon('loss')}
                <span className="font-medium">Loss Streak</span>
              </div>
              <span className="text-2xl font-bold">{streaks.currentLossStreak}</span>
            </div>
            <p className="text-sm opacity-75 mt-1">Consecutive loss days</p>
          </div>

          <div className={`p-4 rounded-lg border ${getStreakColor('no_trade')}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStreakIcon('no_trade')}
                <span className="font-medium">No-Trade Streak</span>
              </div>
              <span className="text-2xl font-bold">{streaks.currentNoTradeStreak}</span>
            </div>
            <p className="text-sm opacity-75 mt-1">Consecutive no-trade days</p>
          </div>
        </div>
      </div>

      {/* Longest Streaks */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Longest Streaks (All Time)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-green-600 dark:text-green-400 font-medium">Best Gain Streak</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {streaks.longestGainStreak}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-red-600 dark:text-red-400 font-medium">Worst Loss Streak</span>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                {streaks.longestLossStreak}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-orange-600 dark:text-orange-400 font-medium">Longest No-Trade</span>
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {streaks.longestNoTradeStreak}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Days */}
      {streaks.recentStreaks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Days (Last {streaks.recentStreaks.length})
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-2 flex-wrap">
              {streaks.recentStreaks.map((day, index) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-w-[80px]"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {getDayIcon(day.result)}
                  </div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {getDayLabel(day.result)}
                  </div>
                  {day.trades > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {day.trades} trade{day.trades !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights Summary */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700 p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Quick Insights</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          {streaks.currentGainStreak >= 3 && (
            <li>• Great job! You're on a {streaks.currentGainStreak}-day winning streak! 🎉</li>
          )}
          {streaks.currentLossStreak >= 3 && (
            <li>• Caution: You're in a {streaks.currentLossStreak}-day losing streak. Consider reviewing your strategy.</li>
          )}
          {streaks.currentNoTradeStreak >= 5 && (
            <li>• You've been inactive for {streaks.currentNoTradeStreak} days. Time to analyze the market?</li>
          )}
          {streaks.longestGainStreak > streaks.currentGainStreak && (
            <li>• Your best streak was {streaks.longestGainStreak} days. You can beat it!</li>
          )}
          {streaks.longestLossStreak === 0 && (
            <li>• Excellent! You've never had consecutive losing days.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
