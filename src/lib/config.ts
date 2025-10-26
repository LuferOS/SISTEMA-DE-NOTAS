/**
 * Configuration file for LuferOS SENA Education Management System
 * Archivo de Configuración del Sistema de Gestión Educativa LuferOS SENA
 * 
 * PUBLIC REPOSITORY - Placeholders only - NO REAL CREDENTIALS
 * REPOSITORIO PÚBLICO - Solo marcadores de posición - SIN CREDENCIALES REALES
 * 
 * ⚠️ IMPORTANT: Replace placeholder values with actual credentials before use
 * ⚠️ IMPORTANTE: Reemplace los valores de marcador de posición con credenciales reales antes de usar
 */

export const DEFAULT_CREDENTIALS = {
  // Administrator credentials
  // Credenciales de Administrador
  ADMIN: {
    identification: 'ADMIN_ID_HERE',
    password: 'ADMIN_PASSWORD_HERE',
    name: 'Administrator Name',
    email: 'admin@sena.edu.co'
  },
  
  // Teacher credentials
  // Credenciales de Docente
  TEACHER: {
    identification: 'TEACHER_ID_HERE', 
    password: 'TEACHER_PASSWORD_HERE',
    name: 'Teacher Name',
    email: 'teacher@sena.edu.co'
  }
} as const

// System configuration
// Configuración del sistema
export const SYSTEM_CONFIG = {
  name: 'SENA LITAME',
  version: '1.0.0',
  author: 'LuferOS',
  description: 'Sistema de Gestión Educativa Integral'
} as const