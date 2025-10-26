import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const studentId = searchParams.get('studentId')
    const date = searchParams.get('date')

    let whereClause: any = {}

    if (courseId) whereClause.courseId = courseId
    if (studentId) whereClause.studentId = studentId
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      whereClause.date = {
        gte: startDate,
        lt: endDate
      }
    }

    const attendances = await db.attendance.findMany({
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
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ attendances })

  } catch (error) {
    console.error('Error obteniendo asistencia:', error)
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
      status, 
      notes, 
      recordedBy 
    } = await request.json()

    if (!studentId || !courseId || !status) {
      return NextResponse.json(
        { error: 'Estudiante, curso y estado son requeridos' },
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

    // Verificar si ya existe registro para este estudiante, curso y fecha
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const existingAttendance = await db.attendance.findFirst({
      where: {
        studentId,
        courseId,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    if (existingAttendance) {
      // Actualizar registro existente
      const attendance = await db.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status: status.toUpperCase(),
          notes,
          recordedBy,
          recordedAt: new Date()
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
          }
        }
      })

      return NextResponse.json({
        message: 'Asistencia actualizada exitosamente',
        attendance
      })
    } else {
      // Crear nuevo registro
      const attendance = await db.attendance.create({
        data: {
          studentId,
          courseId,
          status: status.toUpperCase(),
          notes,
          recordedBy,
          date: new Date()
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
          }
        }
      })

      return NextResponse.json({
        message: 'Asistencia registrada exitosamente',
        attendance
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Error registrando asistencia:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}