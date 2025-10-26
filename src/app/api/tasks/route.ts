import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const teacherId = searchParams.get('teacherId')
    const active = searchParams.get('active')

    let whereClause: any = {}

    if (courseId) whereClause.courseId = courseId
    if (teacherId) whereClause.teacherId = teacherId
    if (active !== null) whereClause.isActive = active === 'true'

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            submissions: true,
            grades: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ tasks })

  } catch (error) {
    console.error('Error obteniendo tareas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      description, 
      type, 
      maxScore, 
      dueDate, 
      courseId, 
      teacherId 
    } = await request.json()

    if (!title || !courseId || !teacherId) {
      return NextResponse.json(
        { error: 'Título, curso y docente son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el curso exista
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 400 }
      )
    }

    // Verificar que el docente exista
    const teacher = await db.user.findUnique({
      where: { 
        id: teacherId,
        role: 'TEACHER'
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Docente no encontrado' },
        { status: 400 }
      )
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        type: type?.toUpperCase() || 'ASSIGNMENT',
        maxScore: maxScore || 5,
        dueDate: dueDate ? new Date(dueDate) : null,
        courseId,
        teacherId
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
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
      message: 'Tarea creada exitosamente',
      task
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando tarea:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}