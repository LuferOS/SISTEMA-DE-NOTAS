/**
 * LuferOS Security Module - Sistema de Gestión Educativa SENA
 * 
 * Módulo de seguridad centralizado para proteger contra:
 * - Inyección SQL
 * - XSS (Cross-Site Scripting)
 * - CSRF (Cross-Site Request Forgery)
 * - Ataques de fuerza bruta
 * - Validación de entrada
 * 
 * @author LuferOS - GitHub
 * @version 1.0.0
 */

import crypto from 'crypto'
import { NextRequest } from 'next/server'

// ===== CONFIGURACIÓN DE SEGURIDAD =====
export const SECURITY_CONFIG = {
  // Límites de rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    MAX_REQUESTS: 100, // máximo 100 requests por ventana
    LOGIN_ATTEMPTS: 5, // máximo 5 intentos de login
    LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutos de bloqueo
  },
  
  // Validación de entrada
  VALIDATION: {
    MAX_NAME_LENGTH: 100,
    MIN_PASSWORD_LENGTH: 8,
    MAX_EMAIL_LENGTH: 255,
    MAX_IDENTIFICATION_LENGTH: 20,
    ALLOWED_FILE_TYPES: ['.pdf', '.doc', '.docx', '.jpg', '.png'],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },
  
  // Configuración de cookies
  COOKIES: {
    HTTP_ONLY: true,
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'strict',
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 horas
  }
}

// ===== ALMACENAMIENTO DE RATE LIMITING (en memoria para desarrollo) =====
const rateLimitStore = new Map<string, { count: number; resetTime: number; lockedUntil?: number }>()
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>()

// ===== VALIDACIÓN Y SANITIZACIÓN =====

/**
 * Sanitiza entrada para prevenir XSS
 * LuferOS Security Layer
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/[<>]/g, '') // Eliminar tags HTML
    .replace(/javascript:/gi, '') // Eliminar protocolos javascript
    .replace(/on\w+\s*=/gi, '') // Eliminar event handlers
    .trim()
}

/**
 * Valida formato de email
 * LuferOS Security Layer
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= SECURITY_CONFIG.VALIDATION.MAX_EMAIL_LENGTH
}

/**
 * Valida contraseña segura
 * LuferOS Security Layer
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < SECURITY_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH) {
    errors.push(`La contraseña debe tener al menos ${SECURITY_CONFIG.VALIDATION.MIN_PASSWORD_LENGTH} caracteres`)
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula')
  }
  
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Valida identificación (solo números y letras)
 * LuferOS Security Layer
 */
export function validateIdentification(identification: string): boolean {
  const idRegex = /^[a-zA-Z0-9]+$/
  return idRegex.test(identification) && 
         identification.length > 0 && 
         identification.length <= SECURITY_CONFIG.VALIDATION.MAX_IDENTIFICATION_LENGTH
}

/**
 * Valida nombre (solo letras, espacios y caracteres comunes)
 * LuferOS Security Layer
 */
export function validateName(name: string): boolean {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/
  return nameRegex.test(name) && 
         name.length > 0 && 
         name.length <= SECURITY_CONFIG.VALIDATION.MAX_NAME_LENGTH
}

// ===== RATE LIMITING =====

/**
 * Implementa rate limiting por IP
 * LuferOS Security Layer
 */
export function checkRateLimit(ip: string, endpoint: string = 'general'): { allowed: boolean; remaining: number } {
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  const windowStart = now - SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS
  
  // Limpiar entradas viejas
  for (const [storeKey, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(storeKey)
    }
  }
  
  const current = rateLimitStore.get(key)
  
  if (!current || current.resetTime < now) {
    // Nueva ventana o ventana expirada
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS
    })
    return { allowed: true, remaining: SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS - 1 }
  }
  
  if (current.count >= SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }
  
  current.count++
  return { allowed: true, remaining: SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS - current.count }
}

/**
 * Verifica intentos de login para prevenir fuerza bruta
 * LuferOS Security Layer
 */
export function checkLoginAttempts(identifier: string): { allowed: boolean; remaining: number; lockedUntil?: number } {
  const key = `login:${identifier}`
  const now = Date.now()
  
  const attempts = loginAttempts.get(key)
  
  if (attempts) {
    // Verificar si está bloqueado
    if (attempts.lockedUntil && attempts.lockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        lockedUntil: attempts.lockedUntil
      }
    }
    
    // Resetear si pasó el tiempo de bloqueo
    if (attempts.lockedUntil && attempts.lockedUntil <= now) {
      loginAttempts.delete(key)
      return { allowed: true, remaining: SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS - 1 }
    }
    
    // Incrementar intentos
    attempts.count++
    attempts.lastAttempt = now
    
    if (attempts.count >= SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS) {
      // Bloquear
      attempts.lockedUntil = now + SECURITY_CONFIG.RATE_LIMIT.LOCKOUT_DURATION
      return {
        allowed: false,
        remaining: 0,
        lockedUntil: attempts.lockedUntil
      }
    }
    
    return {
      allowed: true,
      remaining: SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS - attempts.count
    }
  }
  
  // Primer intento
  loginAttempts.set(key, {
    count: 1,
    lastAttempt: now
  })
  
  return { allowed: true, remaining: SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS - 1 }
}

/**
 * Resetea intentos de login exitoso
 * LuferOS Security Layer
 */
export function resetLoginAttempts(identifier: string): void {
  const key = `login:${identifier}`
  loginAttempts.delete(key)
}

// ===== CSRF PROTECTION =====

/**
 * Genera token CSRF
 * LuferOS Security Layer
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Valida token CSRF
 * LuferOS Security Layer
 */
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  // En una implementación real, esto verificaría contra la sesión
  // Por ahora, validación básica
  return token && token.length === 64 && sessionToken && sessionToken.length > 0
}

// ===== HEADERS DE SEGURIDAD =====

/**
 * Genera headers de seguridad HTTP
 * LuferOS Security Layer
 */
export function getSecurityHeaders(): Record<string, string> {
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    // En desarrollo, usar headers mínimos para evitar problemas con iframes
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  }
  
  // En producción, usar headers completos
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
}

// ===== DETECCIÓN DE INYECCIÓN SQL =====

/**
 * Detecta patrones de inyección SQL
 * LuferOS Security Layer
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;|'|")/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"].*['"]\s*=\s*['"].*['"])/i,
    /(\b(WAITFOR|DELAY)\s+\b)/i,
    /(\b(BENCHMARK|SLEEP)\s*\()/i,
    /(\b(INFORMATION_SCHEMA|SYS|MASTER|MSDB)\b)/i,
    /(\b(XP_|SP_)\w+)/i,
    /(\b(LOAD_FILE|INTO\s+OUTFILE)\b)/i,
    /(\b(CONVERT|CAST)\s*\()/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Valida múltiples campos contra inyección SQL
 * LuferOS Security Layer
 */
export function validateSQLInjection(data: Record<string, any>): { valid: boolean; field?: string } {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && detectSQLInjection(value)) {
      return { valid: false, field: key }
    }
  }
  return { valid: true }
}

// ===== VALIDACIÓN DE ARCHIVOS =====

/**
 * Valida tipo y tamaño de archivo
 * LuferOS Security Layer
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Verificar tamaño
  if (file.size > SECURITY_CONFIG.VALIDATION.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${SECURITY_CONFIG.VALIDATION.MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }
  
  // Verificar tipo
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!SECURITY_CONFIG.VALIDATION.ALLOWED_FILE_TYPES.includes(fileExtension)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${SECURITY_CONFIG.VALIDATION.ALLOWED_FILE_TYPES.join(', ')}`
    }
  }
  
  // Verificar nombre de archivo (prevenir path traversal)
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      valid: false,
      error: 'Nombre de archivo no válido'
    }
  }
  
  return { valid: true }
}

// ===== UTILIDADES DE SEGURIDAD =====

/**
 * Obtiene IP real del cliente
 * LuferOS Security Layer
 */
export function getClientIP(request: NextRequest): string {
  return request.ip ||
         request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         'unknown'
}

/**
 * Genera hash seguro para contraseñas
 * LuferOS Security Layer
 */
export async function hashPassword(password: string): Promise<string> {
  const crypto = await import('crypto')
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verifica contraseña
 * LuferOS Security Layer
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const crypto = await import('crypto')
  const [salt, hash] = hashedPassword.split(':')
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return hash === verifyHash
}

/**
 * Genera token seguro
 * LuferOS Security Layer
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Exportar todo para uso en otros módulos
export const securityExports = {
  SECURITY_CONFIG,
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateIdentification,
  validateName,
  checkRateLimit,
  checkLoginAttempts,
  resetLoginAttempts,
  generateCSRFToken,
  validateCSRFToken,
  getSecurityHeaders,
  detectSQLInjection,
  validateSQLInjection,
  validateFile,
  getClientIP,
  hashPassword,
  verifyPassword,
  generateSecureToken
}

export default securityExports