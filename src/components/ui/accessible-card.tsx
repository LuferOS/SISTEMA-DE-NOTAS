/**
 * LuferOS Accessible Card Component
 * 
 * Componente Card con mejoras de accesibilidad:
 * - Alto contraste y colores accesibles
 * - Navegación por teclado
 * - Atributos ARIA completos
 * - Enfoque visible
 * - Marcas de agua LuferOS
 * 
 * @author LuferOS - GitHub
 * @version 1.0.0
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'high-contrast'
  focusable?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
}

const AccessibleCard = React.forwardRef<HTMLDivElement, AccessibleCardProps>(
  ({ className, variant = 'default', focusable = false, ariaLabel, ariaDescribedBy, children, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (focusable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        // Simular clic en el primer elemento interactivo
        const firstInteractive = (event.currentTarget as HTMLElement).querySelector('button, input, select, textarea, a')
        firstInteractive?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      }
    }, [focusable])

    const variantStyles = {
      default: 'bg-card text-card-foreground border-border',
      outline: 'bg-background text-foreground border-2 border-border',
      'high-contrast': 'bg-white text-black border-4 border-black shadow-lg'
    }

    return (
      <Card
        ref={ref}
        className={cn(
          'relative transition-all duration-200',
          variantStyles[variant],
          focusable && 'cursor-pointer focus:outline-none',
          isFocused && 'ring-4 ring-blue-500 ring-opacity-50',
          className
        )}
        tabIndex={focusable ? 0 : undefined}
        role={focusable ? 'button' : undefined}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      >
        {/* Marca de agua LuferOS */}
        <div 
          className="absolute top-2 right-2 opacity-5 pointer-events-none select-none"
          aria-hidden="true"
        >
          <svg width="60" height="20" viewBox="0 0 60 20" fill="currentColor">
            <text x="30" y="15" textAnchor="middle" fontSize="8" fontWeight="bold">
              LuferOS
            </text>
          </svg>
        </div>
        
        {children}
        
        {/* Indicador de enfoque para accesibilidad */}
        {isFocused && (
          <div 
            className="absolute -top-1 -left-1 -right-1 -bottom-1 border-2 border-blue-500 rounded-lg pointer-events-none"
            aria-hidden="true"
          />
        )}
      </Card>
    )
  }
)

AccessibleCard.displayName = 'AccessibleCard'

export { AccessibleCard }