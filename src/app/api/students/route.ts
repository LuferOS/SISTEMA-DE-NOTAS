import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    let whereClause: any = {}

    if (role) {
      whereClause.role = role.toUpperCase()
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { identification: { contains: search, mode: 'insensitive' } }
      ]
    }

    let students

    if (courseId) {
      // Estudiantes matriculados en un curso específico
      const enrollments = await db.enrollment.findMany({
        where: { 
          courseId,
          isActive: true 
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              identification: true,
              phone: true,
              address: true,
              avatar: true,
              isActive: true,
              createdAt: true
            }
          }
        }
      })

      students = enrollments.map(e => e.student)
    } else {
      // Todos los estudiantes
      students = await db.user.findMany({
        where: {
          ...whereClause,
          role: 'STUDENT',
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          identification: true,
          phone: true,
          address: true,
          avatar: true,
          isActive: true,
          createdAt: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    }

    return NextResponse.json({ students })

  } catch (error) {
    console.error('Error obteniendo estudiantes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, identification, phone, address, courseId } = await request.json()

    if (!name || !email || !identification) {
      return NextResponse.json(
        { error: 'Nombre, email e identificación son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el estudiante ya existe
    const existingStudent = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { identification }
        ]
      }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'El email o identificación ya está registrado' },
        { status: 400 }
      )
    }

    // Crear estudiante con contraseña por defecto
    const defaultPassword = await bcrypt.hash(identification, 10) // Contraseña por defecto es la identificación

    const student = await db.user.create({
      data: {
        name,
        email,
        identification,
        password: defaultPassword,
        role: 'STUDENT',
        phone,
        address
      }
    })

    // Si se especifica courseId, matricularlo automáticamente
    if (courseId) {
      await db.enrollment.create({
        data: {
          studentId: student.id,
          courseId
        }
      })
    }

    // Eliminar contraseña de la respuesta
    const { password: _, ...studentWithoutPassword } = student

    return NextResponse.json({
      message: 'Estudiante creado exitosamente',
      student: studentWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando estudiante:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}