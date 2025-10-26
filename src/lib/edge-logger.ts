/**
 * LuferOS Edge Logger - Sistema de Gestión Educativa SENA
 * 
 * Logger compatible con Edge Runtime para middleware de Next.js
 * Funciones básicas de logging sin dependencias de Node.js
 * 
 * @author LuferOS - GitHub
 * @version 1.0.0
 */

import { NextRequest } from 'next/server'

// ===== TIPOS DE LOGS =====
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY',
  AUDIT = 'AUDIT'
}

export enum LogCategory {
  AUTH = 'AUTH',
  ACCESS = 'ACCESS',
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY',
  DATABASE = 'DATABASE',
  API = 'API',
  USER = 'USER'
}

// ===== INTERFAZ DE LOG =====
export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: LogCategory
  message: string
  userId?: string
  userEmail?: string
  userRole?: string
  ip?: string
  userAgent?: string
  endpoint?: string
  method?: string
  statusCode?: number
  duration?: number
  metadata?: Record<string, any>
  sessionId?: string
}

// ===== CONFIGURACIÓN =====
const EDGE_LOG_CONFIG = {
  // En desarrollo, mostrar logs en consola
  CONSOLE_LOGGING: process.env.NODE_ENV !== 'production',
  
  // Nivel mínimo de log
  MIN_LEVEL: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
}

// ===== FORMATEAR ENTRADA DE LOG =====
function formatLogEntry(entry: LogEntry): string {
  const metadata = entry.metadata ? JSON.stringify(entry.metadata) : ''
  const duration = entry.duration ? ` [${entry.duration}ms]` : ''
  const statusCode = entry.statusCode ? ` [${entry.statusCode}]` : ''
  
  return `${entry.timestamp} [${entry.level}] [${entry.category}] ${entry.message}` +
         `${duration}${statusCode}` +
         (entry.userId ? ` [User:${entry.userId}]` : '') +
         (entry.userEmail ? ` [Email:${entry.userEmail}]` : '') +
         (entry.userRole ? ` [Role:${entry.userRole}]` : '') +
         (entry.ip ? ` [IP:${entry.ip}]` : '') +
         (entry.endpoint ? ` [Endpoint:${entry.method} ${entry.endpoint}]` : '') +
         (entry.sessionId ? ` [Session:${entry.sessionId}]` : '') +
         (metadata ? ` ${metadata}` : '') +
         (entry.userAgent ? ` [UA:${entry.userAgent.substring(0, 100)}]` : '')
}

// ===== FUNCIÓN PRINCIPAL DE LOGGING =====
function log(entry: Omit<LogEntry, 'timestamp'>): void {
  const fullEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  }
  
  // En desarrollo, mostrar en consola
  if (EDGE_LOG_CONFIG.CONSOLE_LOGGING) {
    const colorMap = {
      [LogLevel.DEBUG]: '\x1b[36m', // cyan
      [LogLevel.INFO]: '\x1b[32m',  // green
      [LogLevel.WARN]: '\x1b[33m',  // yellow
      [LogLevel.ERROR]: '\x1b[31m', // red
      [LogLevel.SECURITY]: '\x1b[35m', // magenta
      [LogLevel.AUDIT]: '\x1b[34m'   // blue
    }
    
    const reset = '\x1b[0m'
    const color = colorMap[entry.level] || ''
    console.log(`${color}${formatLogEntry(fullEntry)}${reset}`)
  }
  
  // En producción, podríamos enviar a un servicio externo
  // Por ahora, solo console logging para Edge Runtime
}

// ===== FUNCIONES CONVENIENTES =====

/**
 * Log de nivel DEBUG
 * LuferOS Edge Logger
 */
export function logDebug(message: string, category: LogCategory, metadata?: Record<string, any>): void {
  log({ level: LogLevel.DEBUG, category, message, metadata })
}

/**
 * Log de nivel INFO
 * LuferOS Edge Logger
 */
export function logInfo(message: string, category: LogCategory, metadata?: Record<string, any>): void {
  log({ level: LogLevel.INFO, category, message, metadata })
}

/**
 * Log de nivel WARN
 * LuferOS Edge Logger
 */
export function logWarn(message: string, category: LogCategory, metadata?: Record<string, any>): void {
  log({ level: LogLevel.WARN, category, message, metadata })
}

/**
 * Log de nivel ERROR
 * LuferOS Edge Logger
 */
export function logError(message: string, category: LogCategory, error?: Error, metadata?: Record<string, any>): void {
  log({ 
    level: LogLevel.ERROR, 
    category, 
    message, 
    metadata: {
      ...metadata,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    }
  })
}

/**
 * Log de nivel SECURITY
 * LuferOS Edge Logger
 */
export function logSecurity(
  message: string, 
  ip?: string, 
  userId?: string, 
  metadata?: Record<string, any>
): void {
  log({ 
    level: LogLevel.SECURITY, 
    category: LogCategory.SECURITY, 
    message, 
    ip, 
    userId, 
    metadata 
  })
}

/**
 * Log de nivel AUDIT
 * LuferOS Edge Logger
 */
export function logAudit(
  message: string,
  userId: string,
  userEmail: string,
  userRole: string,
  action: string,
  ip?: string,
  metadata?: Record<string, any>
): void {
  log({
    level: LogLevel.AUDIT,
    category: LogCategory.AUDIT,
    message,
    userId,
    userEmail,
    userRole,
    ip,
    metadata: {
      action,
      ...metadata
    }
  })
}

/**
 * Log de evento de seguridad
 * LuferOS Edge Logger
 */
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  ip: string,
  details: Record<string, any>
): void {
  logSecurity(
    `Security event: ${event} [${severity.toUpperCase()}]`,
    ip,
    undefined,
    { event, severity, ...details }
  )
}

/**
 * Log de acceso a endpoint
 * LuferOS Edge Logger
 */
export function logAPIAccess(
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number,
  ip: string,
  userAgent: string,
  userId?: string
): void {
  const message = `${method} ${endpoint} - ${statusCode}`
  
  log({
    level: statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO,
    category: LogCategory.API,
    message,
    method,
    endpoint,
    statusCode,
    duration,
    ip,
    userAgent,
    userId
  })
}

// Exportar todo para uso en middleware
export const edgeLoggerExports = {
  LogLevel,
  LogCategory,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logSecurity,
  logAudit,
  logSecurityEvent,
  logAPIAccess
}

export default edgeLoggerExports