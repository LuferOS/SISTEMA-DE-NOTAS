import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const studentId = searchParams.get('studentId')
    const taskId = searchParams.get('taskId')
    const gradingPeriod = searchParams.get('gradingPeriod')

    let whereClause: any = {}

    if (courseId) whereClause.courseId = courseId
    if (studentId) whereClause.studentId = studentId
    if (taskId) whereClause.taskId = taskId
    if (gradingPeriod) whereClause.gradingPeriod = gradingPeriod

    const grades = await db.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            identification: true
          }
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            type: true,
            maxScore: true
          }
        }
      },
      orderBy: {
        gradedAt: 'desc'
      }
    })

    return NextResponse.json({ grades })

  } catch (error) {
    console.error('Error obteniendo calificaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      studentId, 
      courseId, 
      taskId, 
      score, 
      maxScore, 
      feedback, 
      gradingPeriod,
      gradedBy 
    } = await request.json()

    if (!studentId || !courseId || score === undefined || !maxScore || !gradingPeriod) {
      return NextResponse.json(
        { error: 'Estudiante, curso, calificación, máxima y periodo son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el estudiante exista
    const student = await db.user.findUnique({
      where: { 
        id: studentId,
        role: 'STUDENT'
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Estudiante no encontrado' },
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

    // Si se especifica taskId, verificar que exista
    if (taskId) {
      const task = await db.task.findUnique({
        where: { id: taskId }
      })

      if (!task) {
        return NextResponse.json(
          { error: 'Tarea no encontrada' },
          { status: 400 }
        )
      }

      // Validar que la calificación no exceda el máximo de la tarea
      if (score > task.maxScore) {
        return NextResponse.json(
          { error: `La calificación no puede ser mayor a ${task.maxScore}` },
          { status: 400 }
        )
      }
    }

    // Validar que la calificación esté en el rango 1-5
    if (score < 1 || score > 5) {
      return NextResponse.json(
        { error: 'La calificación debe estar entre 1.0 y 5.0' },
        { status: 400 }
      )
    }

    // Validar que maxScore sea 5
    if (maxScore !== 5) {
      return NextResponse.json(
        { error: 'La calificación máxima debe ser 5.0' },
        { status: 400 }
      )
    }

    // Calcular porcentaje
    const percentage = (score / maxScore) * 100

    const grade = await db.grade.create({
      data: {
        studentId,
        courseId,
        taskId,
        score,
        maxScore,
        percentage,
        feedback,
        gradingPeriod,
        gradedBy
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Calificación registrada exitosamente',
      grade
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando calificación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}