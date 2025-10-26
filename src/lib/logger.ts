/**
 * LuferOS Logging System - Sistema de Gestión Educativa SENA
 * 
 * Sistema centralizado de logging para auditoría y monitoreo:
 * - Logs de autenticación
 * - Logs de acceso
 * - Logs de acciones del sistema
 * - Logs de seguridad
 * - Logs de errores
 * 
 * @author LuferOS - GitHub
 * @version 1.0.0
 */

import fs from 'fs'
import path from 'path'
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
const LOG_CONFIG = {
  // Directorio de logs
  LOG_DIR: path.join(process.cwd(), 'logs'),
  
  // Niveles mínimos por entorno
  MIN_LEVEL: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  
  // Rotación de logs
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 10,
  
  // Formato de timestamp
  TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss.SSS'
}

// ===== ASEGURAR DIRECTORIO DE LOGS =====
function ensureLogDir(): void {
  if (!fs.existsSync(LOG_CONFIG.LOG_DIR)) {
    fs.mkdirSync(LOG_CONFIG.LOG_DIR, { recursive: true })
  }
}

// ===== OBTENER NOMBRE DE ARCHIVO =====
function getLogFileName(category: LogCategory, date: Date = new Date()): string {
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
  return `${category.toLowerCase()}-${dateStr}.log`
}

// ===== ROTAR ARCHIVO SI ES NECESARIO =====
function rotateLogFileIfNeeded(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      if (stats.size > LOG_CONFIG.MAX_FILE_SIZE) {
        // Rotar archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const rotatedPath = filePath.replace('.log', `-${timestamp}.log`)
        fs.renameSync(filePath, rotatedPath)
        
        // Limpiar archivos viejos
        cleanOldFiles(path.dirname(filePath))
      }
    }
  } catch (error) {
    console.error('Error rotating log file:', error)
  }
}

// ===== LIMPIAR ARCHIVOS VIEJOS =====
function cleanOldFiles(dir: string): void {
  try {
    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(dir, file),
        mtime: fs.statSync(path.join(dir, file)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    
    // Mantener solo los archivos más recientes
    if (files.length > LOG_CONFIG.MAX_FILES) {
      const filesToDelete = files.slice(LOG_CONFIG.MAX_FILES)
      filesToDelete.forEach(file => {
        try {
          fs.unlinkSync(file.path)
        } catch (error) {
          console.error('Error deleting old log file:', error)
        }
      })
    }
  } catch (error) {
    console.error('Error cleaning old files:', error)
  }
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

// ===== ESCRIBIR LOG A ARCHIVO =====
function writeLogToFile(entry: LogEntry): void {
  try {
    ensureLogDir()
    const filePath = path.join(LOG_CONFIG.LOG_DIR, getLogFileName(entry.category))
    rotateLogFileIfNeeded(filePath)
    
    const logLine = formatLogEntry(entry) + '\n'
    fs.appendFileSync(filePath, logLine, 'utf8')
  } catch (error) {
    console.error('Error writing log to file:', error)
  }
}

// ===== FUNCIÓN PRINCIPAL DE LOGGING =====
function log(entry: Omit<LogEntry, 'timestamp'>): void {
  const fullEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  }
  
  // Escribir a archivo
  writeLogToFile(fullEntry)
  
  // En desarrollo, también mostrar en consola
  if (process.env.NODE_ENV !== 'production') {
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
}

// ===== FUNCIONES CONVENIENTES =====

/**
 * Log de nivel DEBUG
 * LuferOS Logging System
 */
export function logDebug(message: string, category: LogCategory, metadata?: Record<string, any>): void {
  log({ level: LogLevel.DEBUG, category, message, metadata })
}

/**
 * Log de nivel INFO
 * LuferOS Logging System
 */
export function logInfo(message: string, category: LogCategory, metadata?: Record<string, any>): void {
  log({ level: LogLevel.INFO, category, message, metadata })
}

/**
 * Log de nivel WARN
 * LuferOS Logging System
 */
export function logWarn(message: string, category: LogCategory, metadata?: Record<string, any>): void {
  log({ level: LogLevel.WARN, category, message, metadata })
}

/**
 * Log de nivel ERROR
 * LuferOS Logging System
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
 * LuferOS Logging System
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
 * LuferOS Logging System
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

// ===== FUNCIONES ESPECÍFICAS PARA AUTENTICACIÓN =====

/**
 * Log de intento de login
 * LuferOS Logging System
 */
export function logLoginAttempt(
  email: string,
  ip: string,
  userAgent: string,
  success: boolean,
  userId?: string,
  userRole?: string
): void {
  const message = `Login ${success ? 'successful' : 'failed'} for email: ${email}`
  
  if (success) {
    logAudit(message, userId || 'unknown', email, userRole || 'unknown', 'LOGIN_ATTEMPT', ip, { userAgent })
  } else {
    logSecurity(message, ip, userId, { email, userAgent, attempt: 'failed' })
  }
}

/**
 * Log de logout
 * LuferOS Logging System
 */
export function logLogout(userId: string, userEmail: string, userRole: string, ip: string): void {
  logAudit('User logged out', userId, userEmail, userRole, 'LOGOUT', ip)
}

/**
 * Log de acceso a endpoint
 * LuferOS Logging System
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

/**
 * Log de acción de usuario
 * LuferOS Logging System
 */
export function logUserAction(
  action: string,
  userId: string,
  userEmail: string,
  userRole: string,
  ip: string,
  metadata?: Record<string, any>
): void {
  logAudit(`User action: ${action}`, userId, userEmail, userRole, action, ip, metadata)
}

/**
 * Log de evento de seguridad
 * LuferOS Logging System
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

// ===== FUNCIONES DE CONSULTA =====

/**
 * Obtiene logs recientes de una categoría
 * LuferOS Logging System
 */
export function getRecentLogs(
  category: LogCategory,
  limit: number = 100,
  startDate?: Date,
  endDate?: Date
): LogEntry[] {
  try {
    ensureLogDir()
    const logs: LogEntry[] = []
    const start = startDate || new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
    const end = endDate || new Date()
    
    // Leer archivos de log en el rango de fechas
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const filePath = path.join(LOG_CONFIG.LOG_DIR, getLogFileName(category, currentDate))
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        const lines = content.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            // Parsear línea de log (implementación básica)
            const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) \[(\w+)\] \[(\w+)\] (.+)$/)
            if (match) {
              const [, timestamp, level, cat, message] = match
              const logDate = new Date(timestamp)
              
              if (logDate >= start && logDate <= end) {
                logs.push({
                  timestamp,
                  level: level as LogLevel,
                  category: cat as LogCategory,
                  message
                })
              }
            }
          } catch (error) {
            // Ignorar líneas mal formateadas
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return logs.slice(-limit)
  } catch (error) {
    console.error('Error reading logs:', error)
    return []
  }
}

/**
 * Obtiene estadísticas de seguridad
 * LuferOS Logging System
 */
export function getSecurityStats(hours: number = 24): {
  totalRequests: number
  failedLogins: number
  successfulLogins: number
  suspiciousIPs: string[]
  topEndpoints: Array<{ endpoint: string; count: number }>
} {
  try {
    const securityLogs = getRecentLogs(LogCategory.SECURITY, 1000)
    const authLogs = getRecentLogs(LogCategory.AUTH, 1000)
    const apiLogs = getRecentLogs(LogCategory.API, 1000)
    
    const failedLogins = securityLogs.filter(log => 
      log.message.includes('Login failed') || log.message.includes('failed')
    ).length
    
    const successfulLogins = authLogs.filter(log => 
      log.message.includes('successful')
    ).length
    
    const ipCounts = new Map<string, number>()
    const endpointCounts = new Map<string, number>()
    
    apiLogs.forEach(log => {
      if (log.ip) ipCounts.set(log.ip, (ipCounts.get(log.ip) || 0) + 1)
      if (log.endpoint) endpointCounts.set(log.endpoint, (endpointCounts.get(log.endpoint) || 0) + 1)
    })
    
    const suspiciousIPs = Array.from(ipCounts.entries())
      .filter(([_, count]) => count > 100) // Más de 100 requests
      .map(([ip]) => ip)
    
    const topEndpoints = Array.from(endpointCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }))
    
    return {
      totalRequests: apiLogs.length,
      failedLogins,
      successfulLogins,
      suspiciousIPs,
      topEndpoints
    }
  } catch (error) {
    console.error('Error getting security stats:', error)
    return {
      totalRequests: 0,
      failedLogins: 0,
      successfulLogins: 0,
      suspiciousIPs: [],
      topEndpoints: []
    }
  }
}

// Exportar todo para uso en otros módulos
export const loggerExports = {
  LogLevel,
  LogCategory,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logSecurity,
  logAudit,
  logLoginAttempt,
  logLogout,
  logAPIAccess,
  logUserAction,
  logSecurityEvent,
  getRecentLogs,
  getSecurityStats
}

export default loggerExports