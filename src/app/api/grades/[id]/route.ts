import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { score, maxScore, feedback } = await request.json()

    if (score === undefined || !maxScore) {
      return NextResponse.json(
        { error: 'Calificación y máxima son requeridas' },
        { status: 400 }
      )
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

    // Verificar que la calificación exista
    const existingGrade = await db.grade.findUnique({
      where: { id }
    })

    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Calificación no encontrada' },
        { status: 404 }
      )
    }

    // Calcular nuevo porcentaje
    const percentage = (score / maxScore) * 100

    const grade = await db.grade.update({
      where: { id },
      data: {
        score,
        maxScore,
        percentage,
        feedback,
        gradedAt: new Date()
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
      message: 'Calificación actualizada exitosamente',
      grade
    })

  } catch (error) {
    console.error('Error actualizando calificación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar que la calificación exista
    const existingGrade = await db.grade.findUnique({
      where: { id }
    })

    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Calificación no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar calificación (marcar como inactiva)
    await db.grade.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: 'Calificación eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando calificación:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}