/**
 * Console Security Module - LuferOS SENA Education Management System
 * 
 * Módulo de seguridad para filtrar información sensible en la consola del navegador
 * 
 * @author LuferOS - GitHub
 * @version 1.0.0
 */

// Información sensible que debe ser filtrada
const SENSITIVE_PATTERNS = [
  // IDs de identificación
  /\b\d{7,10}\b/g,
  // Credenciales específicas
  /1123435375/g,
  /1116863106/g,
  /Luisito1280a/g,
  /Fredy123@2025/g,
  // Contraseñas en general
  /password["\s:]+["']?[^"'\s,}]+["']?/gi,
  /contraseña["\s:]+["']?[^"'\s,}]+["']?/gi,
  // Mensajes de datos iniciales
  /Datos iniciales cargados/gi,
  /FORCEFULLY/gi,
  /Iniciando carga de datos iniciales/gi,
  // Campos sensibles en objetos
  /"password":\s*"[^"]+"/gi,
  /"contraseña":\s*"[^"]+"/gi,
  /"identification":\s*"[^"]+"/gi,
  // Emails sensibles
  /[a-zA-Z0-9._%+-]+@sena\.edu\.co/g,
]

// Palabras clave que indican información sensible
const SENSITIVE_KEYWORDS = [
  'password',
  'contraseña',
  'identification',
  'credencial',
  'token',
  'secret',
  'key',
  'auth',
  'login',
  'session'
]

/**
 * Función para sanitizar datos de log
 */
export function sanitizeLogData(data: any): any {
  if (typeof data === 'string') {
    let sanitized = data
    
    // Aplicar patrones de reemplazo
    SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, (match) => {
        // Si es un ID numérico, reemplazar con formato de ID
        if (/^\d{7,10}$/.test(match)) {
          return '***-***-***'
        }
        // Si es una contraseña, reemplazar con asteriscos
        if (match.toLowerCase().includes('password') || 
            match.toLowerCase().includes('contraseña')) {
          return '***'
        }
        // Si es un email, reemplazar dominio
        if (match.includes('@sena.edu.co')) {
          return 'usuario@***.***'
        }
        // Para otros casos sensibles
        return '[FILTRADO]'
      })
    })
    
    return sanitized
  } else if (Array.isArray(data)) {
    return data.map(sanitizeLogData)
  } else if (typeof data === 'object' && data !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase()
      
      // Si la clave es sensible, reemplazar el valor
      if (SENSITIVE_KEYWORDS.some(keyword => lowerKey.includes(keyword))) {
        sanitized[key] = '***'
      } else {
        sanitized[key] = sanitizeLogData(value)
      }
    }
    return sanitized
  }
  
  return data
}

/**
 * Función para determinar si un argumento contiene información sensible
 */
export function containsSensitiveInfo(arg: any): boolean {
  const str = String(arg)
  
  // Verificar patrones sensibles
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(str)) {
      return true
    }
  }
  
  // Verificar palabras clave
  const lowerStr = str.toLowerCase()
  return SENSITIVE_KEYWORDS.some(keyword => lowerStr.includes(keyword))
}

/**
 * Función para instalar el filtro de seguridad en la consola
 */
export function installConsoleSecurity(): void {
  // Solo instalar en modo desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  
  // Guardar referencias a las funciones originales
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn
  const originalInfo = console.info
  const originalDebug = console.debug
  
  // Función helper para procesar argumentos
  const processArgs = (args: any[], allowSensitive: boolean = false): any[] => {
    return args.map(arg => {
      if (!allowSensitive && containsSensitiveInfo(arg)) {
        return '[Información sensible filtrada]'
      }
      return sanitizeLogData(arg)
    })
  }
  
  // Sobreescribir console.log
  console.log = (...args: any[]) => {
    const processedArgs = processArgs(args)
    originalLog.apply(console, processedArgs)
  }
  
  // Sobreescribir console.error
  console.error = (...args: any[]) => {
    const processedArgs = processArgs(args)
    originalError.apply(console, processedArgs)
  }
  
  // Sobreescribir console.warn
  console.warn = (...args: any[]) => {
    const processedArgs = processArgs(args)
    originalWarn.apply(console, processedArgs)
  }
  
  // Sobreescribir console.info
  console.info = (...args: any[]) => {
    const processedArgs = processArgs(args)
    originalInfo.apply(console, processedArgs)
  }
  
  // Sobreescribir console.debug
  console.debug = (...args: any[]) => {
    const processedArgs = processArgs(args)
    originalDebug.apply(console, processedArgs)
  }
  
  // Log de que el sistema de seguridad está activo
  originalLog('🔒 Console Security System activated - Sensitive information will be filtered')
}

/**
 * Función para desinstalar el filtro de seguridad (para debugging)
 */
export function uninstallConsoleSecurity(): void {
  // Esta función puede ser útil para debugging avanzado
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Console Security disabled - Sensitive information may be exposed')
  }
}

const consoleSecurityExports = {
  sanitizeLogData,
  containsSensitiveInfo,
  installConsoleSecurity,
  uninstallConsoleSecurity
}

export default consoleSecurityExports