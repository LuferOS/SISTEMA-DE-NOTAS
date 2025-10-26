/**
 * EXAMPLE Configuration file for LuferOS SENA Education Management System
 * Archivo de EJEMPLO de Configuración del Sistema de Gestión Educativa LuferOS SENA
 * 
 * This is an EXAMPLE file showing how to configure credentials
 * Este es un archivo de EJEMPLO que muestra cómo configurar las credenciales
 * 
 * ⚠️ DO NOT use this file directly - copy to config.ts and modify
 * ⚠️ NO use este archivo directamente - copie a config.ts y modifique
 */

export const DEFAULT_CREDENTIALS = {
  // Administrator credentials
  // Credenciales de Administrador
  ADMIN: {
    identification: '1123435375',        // Real ID example
    password: 'Luisito1280a',            // Real password example  
    name: 'Luis Guzmán',                 // Real name example
    email: 'luis.guzman@sena.edu.co'    // Real email example
  },
  
  // Teacher credentials
  // Credenciales de Docente
  TEACHER: {
    identification: '1116863106',        // Real ID example
    password: 'Fredy123@2025',           // Real password example
    name: 'Fredy Martínez',              // Real name example
    email: 'fredy.martinez@sena.edu.co' // Real email example
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

/**
 * INSTRUCTIONS FOR USE / INSTRUCCIONES DE USO
 * 
 * 1. Copy this file to config.ts:
 *    cp src/lib/config.example.ts src/lib/config.ts
 * 
 * 2. Edit src/lib/config.ts with YOUR REAL credentials
 * 
 * 3. NEVER commit config.ts with real credentials to public repositories
 * 
 * 4. Add config.ts to .gitignore if using real credentials
 */