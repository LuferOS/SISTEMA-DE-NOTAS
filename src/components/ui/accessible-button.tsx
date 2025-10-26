/**
 * LuferOS Accessible Button Component
 * 
 * Componente Button con mejoras de accesibilidad:
 * - Alto contraste y colores accesibles
 * - Navegación por teclado completa
 * - Atributos ARIA completos
 * - Feedback visual y auditivo
 * - Marcas de agua LuferOS
 * 
 * @author LuferOS - GitHub
 * @version 1.0.0
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        'high-contrast': 'bg-black text-white border-2 border-white hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-yellow-400',
        accessible: 'bg-blue-600 text-white border-2 border-blue-800 hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-yellow-400 min-h-[44px] min-w-[44px]'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        accessible: 'h-12 px-6 text-base font-semibold'
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  showWatermark?: boolean
}

const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    ariaLabel,
    ariaDescribedBy,
    showWatermark = false,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={loading}
        data-loading={loading}
        {...props}
      >
        {/* Marca de agua LuferOS */}
        {showWatermark && (
          <span 
            className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
            aria-hidden="true"
          >
            <span className="text-xs font-bold">LuferOS</span>
          </span>
        )}
        
        {/* Indicador de carga */}
        {loading && (
          <span 
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        
        {/* Contenido del botón */}
        <span className="relative z-10">
          {children}
        </span>
        
        {/* Indicador de enfoque mejorado */}
        <span 
          className="absolute inset-0 rounded-md border-2 border-transparent focus-visible:border-yellow-400 transition-colors"
          aria-hidden="true"
        />
      </Comp>
    )
  }
)

AccessibleButton.displayName = 'AccessibleButton'

export { AccessibleButton, buttonVariants }