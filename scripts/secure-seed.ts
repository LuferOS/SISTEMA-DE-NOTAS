import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'
import { DEFAULT_CREDENTIALS } from '../src/config/constants'

/**
 * Script seguro para crear usuarios iniciales
 * Usa variables de entorno o valores por defecto seguros
 */

async function createSecureUsers() {
  try {
    console.log('🔐 Creando usuarios con credenciales seguras...')
    
    // Obtener contraseñas desde variables de entorno o usar defaults
    const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_CREDENTIALS.ADMIN_PASSWORD
    const teacherPassword = process.env.TEACHER_PASSWORD || DEFAULT_CREDENTIALS.TEACHER_PASSWORD
    
    // Hashear contraseñas
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
    const hashedTeacherPassword = await bcrypt.hash(teacherPassword, 10)
    
    // Crear administrador
    const admin = await db.user.upsert({
      where: { email: process.env.ADMIN_EMAIL || 'admin@sena.edu.co' },
      update: {},
      create: {
        email: process.env.ADMIN_EMAIL || 'admin@sena.edu.co',
        name: 'Administrador Sistema',
        identification: process.env.ADMIN_ID || 'ADMIN001',
        password: hashedAdminPassword,
        role: 'ADMIN',
      },
    })

    // Crear docente
    const teacher = await db.user.upsert({
      where: { email: process.env.TEACHER_EMAIL || 'teacher@sena.edu.co' },
      update: {},
      create: {
        email: process.env.TEACHER_EMAIL || 'teacher@sena.edu.co',
        name: process.env.TEACHER_NAME || 'Profesor Principal',
        identification: process.env.TEACHER_ID || 'TEACHER001',
        password: hashedTeacherPassword,
        role: 'TEACHER',
      },
    })

    console.log('✅ Usuarios creados exitosamente')
    console.log('📧 Admin:', admin.email)
    console.log('📧 Teacher:', teacher.email)
    console.log('⚠️  Revisa el archivo .env para ver las contraseñas')
    
    return { admin, teacher }
  } catch (error) {
    console.error('❌ Error creando usuarios:', error)
    throw error
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  createSecureUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { createSecureUsers }