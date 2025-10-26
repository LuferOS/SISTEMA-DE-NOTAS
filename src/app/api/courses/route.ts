import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const studentId = searchParams.get('studentId')

    let courses

    if (teacherId) {
      // Cursos del docente
      courses = await db.course.findMany({
        where: { 
          teacherId,
          isActive: true 
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          enrollments: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              enrollments: true,
              tasks: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (studentId) {
      // Cursos del estudiante
      courses = await db.enrollment.findMany({
        where: { 
          studentId,
          isActive: true 
        },
        include: {
          course: {
            include: {
              teacher: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              _count: {
                select: {
                  enrollments: true,
                  tasks: true
                }
              }
            }
          }
        }
      })
    } else {
      // Todos los cursos
      courses = await db.course.findMany({
        where: { isActive: true },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              tasks: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json({ courses })

  } catch (error) {
    console.error('Error obteniendo cursos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, code, description, level, schedule, classroom, capacity, teacherId } = await request.json()

    if (!name || !code || !teacherId) {
      return NextResponse.json(
        { error: 'Nombre, código y docente son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el código ya existe
    const existingCourse = await db.course.findUnique({
      where: { code }
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'El código del curso ya existe' },
        { status: 400 }
      )
    }

    // Verificar que el docente exista y sea docente
    const teacher = await db.user.findUnique({
      where: { 
        id: teacherId,
        role: 'TEACHER'
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Docente no encontrado o no tiene rol de docente' },
        { status: 400 }
      )
    }

    const course = await db.course.create({
      data: {
        name,
        code,
        description,
        level,
        schedule,
        classroom,
        capacity,
        teacherId
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Curso creado exitosamente',
      course
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando curso:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}