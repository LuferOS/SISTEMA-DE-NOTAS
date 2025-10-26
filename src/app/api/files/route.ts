import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadedBy = formData.get('uploadedBy') as string
    const taskId = formData.get('taskId') as string
    const studentId = formData.get('studentId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    if (!uploadedBy) {
      return NextResponse.json(
        { error: 'ID del usuario que sube el archivo es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario exista
    const user = await db.user.findUnique({
      where: { id: uploadedBy }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400 }
      )
    }

    // Crear directorio de uploads si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = join(uploadDir, fileName)

    // Guardar archivo en el sistema de archivos
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Guardar información del archivo en la base de datos
    const fileRecord = await db.file.create({
      data: {
        name: fileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: `/uploads/${fileName}`,
        uploadedBy
      }
    })

    // Si es una entrega de tarea, crear el registro de entrega
    if (taskId && studentId) {
      // Verificar que la tarea y el estudiante existan
      const task = await db.task.findUnique({
        where: { id: taskId }
      })

      const student = await db.user.findUnique({
        where: { 
          id: studentId,
          role: 'STUDENT'
        }
      })

      if (!task || !student) {
        return NextResponse.json(
          { error: 'Tarea o estudiante no encontrado' },
          { status: 400 }
        )
      }

      // Verificar si la entrega ya existe
      const existingSubmission = await db.taskSubmission.findUnique({
        where: {
          taskId_studentId: {
            taskId,
            studentId
          }
        }
      })

      if (existingSubmission) {
        // Actualizar entrega existente
        await db.taskSubmission.update({
          where: { id: existingSubmission.id },
          data: {
            content: `Archivo subido: ${file.name}`,
            fileUrl: `/uploads/${fileName}`,
            fileName: file.name,
            submittedAt: new Date(),
            isLate: task.dueDate ? new Date() > new Date(task.dueDate) : false
          }
        })
      } else {
        // Crear nueva entrega
        await db.taskSubmission.create({
          data: {
            taskId,
            studentId,
            content: `Archivo subido: ${file.name}`,
            fileUrl: `/uploads/${fileName}`,
            fileName: file.name,
            isLate: task.dueDate ? new Date() > new Date(task.dueDate) : false
          }
        })
      }
    }

    return NextResponse.json({
      message: 'Archivo subido exitosamente',
      file: fileRecord
    }, { status: 201 })

  } catch (error) {
    console.error('Error subiendo archivo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uploadedBy = searchParams.get('uploadedBy')
    const taskId = searchParams.get('taskId')

    let whereClause: any = {}

    if (uploadedBy) whereClause.uploadedBy = uploadedBy

    const files = await db.file.findMany({
      where: whereClause,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ files })

  } catch (error) {
    console.error('Error obteniendo archivos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}