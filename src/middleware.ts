/**
 * LuferOS Security Middleware - Sistema de Gestión Educativa SENA
 * 
 * Middleware de seguridad para Next.js que implementa:
 * - Rate limiting
 * - Headers de seguridad
 * - Logging de solicitudes
 * - Detección de patrones sospechosos
 * - Validación básica de solicitudes
 * 
 * @author LuferOS - GitHub
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  checkRateLimit, 
  getSecurityHeaders, 
  getClientIP,
  detectSQLInjection,
  validateSQLInjection
} from '@/lib/security'
import { logAPIAccess, logSecurityEvent } from '@/lib/edge-logger'

// ===== CONFIGURACIÓN =====
const SECURITY_CONFIG = {
  // Endpoints que requieren protección extra
  SENSITIVE_ENDPOINTS: [
    '/api/auth/login',
    '/api/auth/register',
    '/api/users',
    '/api/admin'
  ],
  
  // Patrones sospechosos en URLs
  SUSPICIOUS_PATTERNS: [
    /\.\./,           // Path traversal
    /<script/i,       // XSS
    /javascript:/i,   // JavaScript protocol
    /data:/i,         // Data protocol
    /union.*select/i, // SQL injection
    /exec\s*\(/i,     // Code execution
    /eval\s*\(/i      // Code evaluation
  ],
  
  // User agents sospechosos (bots, scanners)
  SUSPICIOUS_UA: [
    /bot/i,
    /crawler/i,
    /scanner/i,
    /sqlmap/i,
    /nikto/i,
    /nmap/i
  ]
}

/**
 * Middleware principal de seguridad
 * LuferOS Security Layer
 */
export function middleware(request: NextRequest) {
  const startTime = Date.now()
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const url = request.nextUrl.pathname
  const method = request.method
  
  // ===== DETECCIÓN DE PATRONES SOSPECHOSOS =====
  
  // Verificar URL por patrones sospechosos
  for (const pattern of SECURITY_CONFIG.SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      logSecurityEvent('Suspicious URL pattern detected', 'high', ip, {
        url,
        method,
        userAgent,
        pattern: pattern.source
      })
      
      return new NextResponse('Forbidden', { 
        status: 403,
        headers: getSecurityHeaders()
      })
    }
  }
  
  // Verificar User-Agent sospechoso
  const isSuspiciousUA = SECURITY_CONFIG.SUSPICIOUS_UA.some(pattern => pattern.test(userAgent))
  if (isSuspiciousUA && !url.includes('/api/')) {
    logSecurityEvent('Suspicious User-Agent detected', 'medium', ip, {
      url,
      method,
      userAgent
    })
  }
  
  // ===== RATE LIMITING =====
  
  // Rate limiting general
  const rateLimitResult = checkRateLimit(ip, 'general')
  if (!rateLimitResult.allowed) {
    logSecurityEvent('Rate limit exceeded', 'medium', ip, {
      url,
      method,
      userAgent
    })
    
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        ...getSecurityHeaders(),
        'Retry-After': '900', // 15 minutos
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + 900).toString()
      }
    })
  }
  
  // Rate limiting estricto para endpoints sensibles
  if (SECURITY_CONFIG.SENSITIVE_ENDPOINTS.some(endpoint => url.startsWith(endpoint))) {
    const sensitiveRateLimit = checkRateLimit(ip, 'sensitive')
    if (!sensitiveRateLimit.allowed) {
      logSecurityEvent('Sensitive endpoint rate limit exceeded', 'high', ip, {
        url,
        method,
        userAgent
      })
      
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          ...getSecurityHeaders(),
          'Retry-After': '1800', // 30 minutos
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + 1800).toString()
        }
      })
    }
  }
  
  // ===== VALIDACIÓN DE DATOS DE ENTRADA =====
  
  // Para POST/PUT requests, validar el cuerpo
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      // Clonar la request para poder leer el cuerpo
      const clonedRequest = request.clone()
      
      // Si es JSON, validar contenido
      if (request.headers.get('content-type')?.includes('application/json')) {
        clonedRequest.json().then(data => {
          const sqlCheck = validateSQLInjection(data)
          if (!sqlCheck.valid) {
            logSecurityEvent('SQL injection attempt detected', 'critical', ip, {
              url,
              method,
              userAgent,
              suspiciousField: sqlCheck.field,
              data: JSON.stringify(data).substring(0, 500)
            })
          }
        }).catch(() => {
          // Error al parsear JSON, podría ser un intento de ataque
          logSecurityEvent('Invalid JSON payload', 'medium', ip, {
            url,
            method,
            userAgent
          })
        })
      }
      
      // Si es form data, validar campos
      if (request.headers.get('content-type')?.includes('multipart/form-data') ||
          request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
        clonedRequest.formData().then(formData => {
          const data: Record<string, any> = {}
          formData.forEach((value, key) => {
            data[key] = value.toString()
          })
          
          const sqlCheck = validateSQLInjection(data)
          if (!sqlCheck.valid) {
            logSecurityEvent('SQL injection attempt in form data', 'critical', ip, {
              url,
              method,
              userAgent,
              suspiciousField: sqlCheck.field
            })
          }
        }).catch(() => {
          // Error al parsear form data
        })
      }
    } catch (error) {
      // Error en la validación, continuar pero registrar
      logSecurityEvent('Request validation error', 'low', ip, {
        url,
        method,
        userAgent,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  // ===== CONTINUAR CON LA SOLICITUD =====
  
  // Añadir headers de seguridad a la respuesta
  const response = NextResponse.next()
  
  // Aplicar headers de seguridad
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Añadir headers de rate limiting
  response.headers.set('X-RateLimit-Limit', '100')
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + 900).toString())
  
  // Añadir header de seguridad personalizado
  response.headers.set('X-Powered-By', 'LuferOS Security Layer')
  
  // ===== LOGGING DE RESPUESTA =====
  
  // Usar un setTimeout para loggear después de que la respuesta se envíe
  setTimeout(() => {
    const duration = Date.now() - startTime
    const statusCode = response.status || 200
    
    logAPIAccess(method, url, statusCode, duration, ip, userAgent)
    
    // Loggear respuestas de error
    if (statusCode >= 400) {
      logSecurityEvent(`HTTP ${statusCode} response`, statusCode >= 500 ? 'medium' : 'low', ip, {
        url,
        method,
        statusCode,
        duration,
        userAgent
      })
    }
  }, 0)
  
  return response
}

// ===== CONFIGURACIÓN DE RUTAS PROTEGIDAS =====
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}