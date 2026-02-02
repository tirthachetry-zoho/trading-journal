'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false)

  const handleResetWithToken = async (token: string, email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      })

      if (response.ok) {
        setIsSuccess(true)
      }
    } catch (error) {
      console.error('Password reset error:', error)
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const emailParam = urlParams.get('email')
    
    if (token && emailParam) {
      const timer = setTimeout(() => handleResetWithToken(token, emailParam), 100)
      return () => clearTimeout(timer)
    }
  }, [])

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Password Reset Successful
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid Link
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The password reset link is invalid or has expired. Please request a new password reset.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>What to do:</strong>
            </p>
            <ol className="text-yellow-700 dark:text-yellow-300 text-sm mt-2 space-y-1">
              <li>1. Go back to the login page</li>
              <li>2. Click &ldquo;Forgot your password?&rdquo;</li>
              <li>3. Enter your email address</li>
              <li>4. Check your email for the reset link</li>
              <li>5. Click the link in the email to reset your password</li>
            </ol>
          </div>

          <button
            onClick={() => window.location.href = '/login'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}
