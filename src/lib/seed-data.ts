import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function seedUsers() {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await db.user.upsert({
      where: { email: 'admin@school.com' },
      update: {},
      create: {
        email: 'admin@school.com',
        name: 'Administrador',
        identification: 'ADMIN001',
        password: adminPassword,
        role: 'ADMIN',
      },
    })

    // Create teacher user
    const teacherPassword = await bcrypt.hash('teacher123', 10)
    const teacher = await db.user.upsert({
      where: { email: 'teacher@school.com' },
      update: {},
      create: {
        email: 'teacher@school.com',
        name: 'Profesor Juan',
        identification: 'TEACHER001',
        password: teacherPassword,
        role: 'TEACHER',
      },
    })

    // Create teacher profile
    // Note: Teacher profile is not needed as teacher info is in User model
    // The schema shows teacher info is stored directly in User model

    console.log('✅ Usuarios creados exitosamente')
    console.log('📧 Admin: admin@school.com / admin123')
    console.log('📧 Teacher: teacher@school.com / teacher123')
    
    return { admin, teacher }
  } catch (error) {
    console.error('❌ Error creando usuarios:', error)
    throw error
  }
}

export { seedUsers }