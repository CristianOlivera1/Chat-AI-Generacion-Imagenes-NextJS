'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

interface AlertProps {
  type: 'success' | 'error' | 'warning'
  title: string
  message: string
  onClose: () => void
  autoClose?: number
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  autoClose = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, autoClose)

      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`max-w-sm w-full rounded-lg border p-4 shadow-lg ${getColors()}`}
      >
        <div className="flex items-start">
          <div className="shrink-0">{getIcon()}</div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="mt-1 text-sm opacity-90">{message}</p>
          </div>
          <div className="ml-4 shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AlertManagerProps {
  alerts: Array<{
    id: string
    type: 'success' | 'error' | 'warning'
    title: string
    message: string
  }>
  onRemoveAlert: (id: string) => void
}

export const AlertManager: React.FC<AlertManagerProps> = ({
  alerts,
  onRemoveAlert
}) => {
  return (
    <>
      {alerts.map((alert, index) => (
        <div
          key={alert.id}
          style={{ top: `${16 + index * 80}px` }}
          className="fixed right-4 z-50"
        >
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => onRemoveAlert(alert.id)}
          />
        </div>
      ))}
    </>
  )
}