/**
 * LuferOS Accessible Input Component
 * 
 * Componente Input con mejoras de accesibilidad:
 * - Alto contraste y colores accesibles
 * - Etiquetas asociadas correctamente
 * - Mensajes de error claros
 * - Validación en tiempo real
 * - Marcas de agua LuferOS
 * 
 * @author LuferOS - GitHub
 * @version 1.0.0
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  variant?: 'default' | 'high-contrast' | 'accessible'
  showWatermark?: boolean
}

const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ 
    className, 
    type, 
    label,
    error,
    helperText,
    required = false,
    variant = 'default',
    showWatermark = false,
    id,
    ...props 
  }, ref) => {
    // Generar ID siempre en el mismo orden
    const generatedId = React.useId()
    const inputId = id || `input-${generatedId}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined
    
    const variantStyles = {
      default: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      'high-contrast': 'flex h-12 w-full rounded-md border-4 border-black bg-white px-4 py-3 text-base font-medium text-black placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50',
      accessible: 'flex h-12 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50'
    }

    return (
      <div className="space-y-2 relative">
        {/* Etiqueta accesible */}
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              variant === 'high-contrast' && 'text-base font-bold text-black',
              variant === 'accessible' && 'text-base font-semibold text-gray-900',
              error && 'text-destructive'
            )}
          >
            {label}
            {required && (
              <span 
                className="text-destructive ml-1" 
                aria-label="requerido"
              >
                *
              </span>
            )}
          </label>
        )}
        
        {/* Contenedor del input */}
        <div className="relative">
          {/* Marca de agua LuferOS */}
          {showWatermark && (
            <div 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-5 pointer-events-none select-none"
              aria-hidden="true"
            >
              <svg width="40" height="15" viewBox="0 0 40 15" fill="currentColor">
                <text x="20" y="12" textAnchor="middle" fontSize="6" fontWeight="bold">
                  LuferOS
                </text>
              </svg>
            </div>
          )}
          
          {/* Input principal */}
          <input
            type={type}
            id={inputId}
            className={cn(
              variantStyles[variant],
              error && 'border-destructive focus-visible:ring-destructive',
              showWatermark && 'pr-12',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={cn(
              errorId,
              helperId
            )}
            aria-required={required}
            {...props}
          />
          
          {/* Indicador de estado */}
          {error && (
            <div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-destructive"
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 12H7v-2h2v2zm0-3H7V4h2v5z"/>
              </svg>
            </div>
          )}
        </div>
        
        {/* Texto de ayuda */}
        {helperText && !error && (
          <p 
            id={helperId}
            className={cn(
              'text-sm text-muted-foreground',
              variant === 'high-contrast' && 'text-base text-gray-600',
              variant === 'accessible' && 'text-base text-gray-600'
            )}
          >
            {helperText}
          </p>
        )}
        
        {/* Mensaje de error */}
        {error && (
          <p 
            id={errorId}
            className="text-sm text-destructive font-medium"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'

export { AccessibleInput }