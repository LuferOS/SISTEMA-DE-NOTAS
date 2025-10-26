/**
 * Constantes de configuración del sistema
 * Valores por defecto para desarrollo y producción
 */

export const DEFAULT_CREDENTIALS = {
  // NOTA: Estas contraseñas son SOLO para desarrollo
  // En producción usar variables de entorno
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  TEACHER_PASSWORD: process.env.TEACHER_PASSWORD || 'teacher123',
  STUDENT_PASSWORD: process.env.STUDENT_PASSWORD || 'student123',
}

export const SYSTEM_CONFIG = {
  // Periodo académico actual
  CURRENT_GRADING_PERIOD: '2024-1',
  
  // Máximo de estudiantes por curso
  MAX_STUDENTS_PER_COURSE: 30,
  
  // Duración de sesión (minutos)
  SESSION_DURATION: 120,
}

export const API_ENDPOINTS = {
  USERS: '/api/users',
  COURSES: '/api/courses',
  GRADES: '/api/grades',
  TASKS: '/api/tasks',
  ATTENDANCE: '/api/attendance',
} as const