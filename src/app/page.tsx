'use client'

/**
 * LuferOS SENA Education Management System - Main Page
 * Sistema de Gestión Educativa Integral del SENA
 * 
 * @author LuferOS - GitHub
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThemeToggle } from '@/components/theme-toggle'
import { DEFAULT_CREDENTIALS } from '@/lib/config'
import { installConsoleSecurity } from '@/lib/console-security'
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Calendar, 
  FileText, 
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  LogOut,
  Settings,
  Database,
  Shield
} from 'lucide-react'

// ===== INTERFACES =====
interface User {
  id: string
  name: string
  email: string
  identification: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  password?: string
}

interface Course {
  id: string
  name: string
  code: string
  description?: string
  teacherId: string
  teacher?: User
}

interface Grade {
  id: string
  studentId: string
  student?: User
  courseId: string
  course?: Course
  score: number
  maxScore: number
  percentage: number
  feedback?: string
  gradedAt: string
}

interface Task {
  id: string
  title: string
  description?: string
  type: 'ASSIGNMENT' | 'EXAM' | 'PROJECT' | 'QUIZ' | 'ACTIVITY'
  maxScore: number
  dueDate?: string
  courseId: string
  course?: Course
}

interface Attendance {
  id: string
  studentId: string
  student?: User
  courseId: string
  course?: Course
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  notes?: string
}

// Hook simple para localStorage con logging seguro
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // No mostrar errores sensibles en consola
      if (process.env.NODE_ENV === 'production') {
        console.error('Error reading localStorage')
      }
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // No mostrar errores sensibles en consola
      if (process.env.NODE_ENV === 'production') {
        console.error('Error setting localStorage')
      }
    }
  }

  return [storedValue, setValue] as const
}

export default function Home() {
  const { theme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [isLogin, setIsLogin] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Datos
  const [courses, setCourses] = useLocalStorage<Course[]>('sena-courses', [])
  const [grades, setGrades] = useLocalStorage<Grade[]>('sena-grades', [])
  const [tasks, setTasks] = useLocalStorage<Task[]>('sena-tasks', [])
  const [students, setStudents] = useLocalStorage<User[]>('sena-students', [])
  const [teachers, setTeachers] = useLocalStorage<User[]>('sena-teachers', [])
  const [admin, setAdmin] = useLocalStorage<User[]>('sena-admin', [])
  const [attendances, setAttendances] = useLocalStorage<Attendance[]>('sena-attendances', [])
  
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Formularios
  const [loginForm, setLoginForm] = useState({
    identification: '',
    password: ''
  })
  
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    identification: '',
    password: '',
    role: 'STUDENT' as 'TEACHER' | 'STUDENT'
  })

  // Formularios para agregar/editar
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    description: '',
    teacherId: ''
  })

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    type: 'ASSIGNMENT' as Task['type'],
    maxScore: 100,
    dueDate: '',
    courseId: ''
  })

  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    courseId: '',
    score: 0,
    maxScore: 100,
    percentage: 100,
    feedback: ''
  })

  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT' as Attendance['status'],
    notes: ''
  })

  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    identification: '',
    password: ''
  })

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    identification: '',
    password: ''
  })

  // Diálogos
  const [showGradeDialog, setShowGradeDialog] = useState(false)
  const [showCourseDialog, setShowCourseDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showStudentDialog, setShowStudentDialog] = useState(false)
  const [showTeacherDialog, setShowTeacherDialog] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  
  // Selecciones
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null)

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  useEffect(() => {
    setMounted(true)
    
    // Instalar sistema de seguridad en la consola
    installConsoleSecurity()
    
    // Cargar datos iniciales solo si no hay datos
    if (students.length === 0 && teachers.length === 0 && admin.length === 0) {
      const mockTeachers: User[] = [
        {
          id: '1',
          name: DEFAULT_CREDENTIALS.TEACHER.name,
          email: DEFAULT_CREDENTIALS.TEACHER.email,
          identification: DEFAULT_CREDENTIALS.TEACHER.identification,
          role: 'TEACHER',
          password: DEFAULT_CREDENTIALS.TEACHER.password
        }
      ]

      const mockAdmin: User[] = [
        {
          id: '0',
          name: DEFAULT_CREDENTIALS.ADMIN.name,
          email: DEFAULT_CREDENTIALS.ADMIN.email,
          identification: DEFAULT_CREDENTIALS.ADMIN.identification,
          role: 'ADMIN',
          password: DEFAULT_CREDENTIALS.ADMIN.password
        }
      ]

      const mockStudents: User[] = [
        // No hay estudiantes predefinidos - el docente debe asignarlos
      ]

      const mockCourses: Course[] = [
        {
          id: '1',
          name: 'Programación de Software',
          code: 'PSW-001',
          description: 'Curso de desarrollo de aplicaciones web',
          teacherId: '1',
          teacher: mockTeachers[0]
        }
      ]

      setTeachers(mockTeachers)
      setAdmin(mockAdmin)
      setStudents(mockStudents)
      setCourses(mockCourses)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const allUsers = [...admin, ...teachers, ...students]
    const foundUser = allUsers.find(u => 
      u.identification === loginForm.identification && 
      u.password === loginForm.password
    )
    
    if (foundUser) {
      setUser(foundUser)
    } else {
      alert('Credenciales inválidas')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    alert('El registro debe ser realizado por un administrador')
  }

  const handleLogout = () => {
    setUser(null)
    setLoginForm({ identification: '', password: '' })
  }

  // Funciones para guardar datos
  const handleSaveCourse = () => {
    if (!courseForm.name || !courseForm.code || !courseForm.teacherId) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const newCourse: Course = {
      id: generateId(),
      name: courseForm.name,
      code: courseForm.code,
      description: courseForm.description,
      teacherId: courseForm.teacherId,
      teacher: teachers.find(t => t.id === courseForm.teacherId)
    }

    if (selectedCourse) {
      setCourses(courses.map(c => c.id === selectedCourse.id ? { ...newCourse, id: selectedCourse.id } : c))
    } else {
      setCourses([...courses, newCourse])
    }

    setShowCourseDialog(false)
    setCourseForm({ name: '', code: '', description: '', teacherId: '' })
    setSelectedCourse(null)
  }

  const handleSaveTask = () => {
    if (!taskForm.title || !taskForm.courseId) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const newTask: Task = {
      id: generateId(),
      title: taskForm.title,
      description: taskForm.description,
      type: taskForm.type,
      maxScore: taskForm.maxScore,
      dueDate: taskForm.dueDate,
      courseId: taskForm.courseId,
      course: courses.find(c => c.id === taskForm.courseId)
    }

    if (selectedTask) {
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...newTask, id: selectedTask.id } : t))
    } else {
      setTasks([...tasks, newTask])
    }

    setShowTaskDialog(false)
    setTaskForm({ title: '', description: '', type: 'ASSIGNMENT', maxScore: 100, dueDate: '', courseId: '' })
    setSelectedTask(null)
  }

  const handleSaveGrade = () => {
    if (!gradeForm.studentId || !gradeForm.courseId || gradeForm.score < 0) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const newGrade: Grade = {
      id: generateId(),
      studentId: gradeForm.studentId,
      courseId: gradeForm.courseId,
      score: gradeForm.score,
      maxScore: gradeForm.maxScore,
      percentage: gradeForm.percentage,
      feedback: gradeForm.feedback,
      gradedAt: new Date().toISOString(),
      student: students.find(s => s.id === gradeForm.studentId),
      course: courses.find(c => c.id === gradeForm.courseId)
    }

    if (selectedGrade) {
      setGrades(grades.map(g => g.id === selectedGrade.id ? { ...newGrade, id: selectedGrade.id } : g))
    } else {
      setGrades([...grades, newGrade])
    }

    setShowGradeDialog(false)
    setGradeForm({ studentId: '', courseId: '', score: 0, maxScore: 100, percentage: 100, feedback: '' })
    setSelectedGrade(null)
  }

  const handleSaveAttendance = () => {
    if (!attendanceForm.studentId || !attendanceForm.courseId || !attendanceForm.date) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const newAttendance: Attendance = {
      id: generateId(),
      studentId: attendanceForm.studentId,
      courseId: attendanceForm.courseId,
      date: attendanceForm.date,
      status: attendanceForm.status,
      notes: attendanceForm.notes,
      student: students.find(s => s.id === attendanceForm.studentId),
      course: courses.find(c => c.id === attendanceForm.courseId)
    }

    setAttendances([...attendances, newAttendance])
    setShowAttendanceDialog(false)
    setAttendanceForm({ studentId: '', courseId: '', date: new Date().toISOString().split('T')[0], status: 'PRESENT', notes: '' })
  }

  const handleSaveStudent = () => {
    if (!studentForm.name || !studentForm.email || !studentForm.identification || !studentForm.password) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const newStudent: User = {
      id: generateId(),
      name: studentForm.name,
      email: studentForm.email,
      identification: studentForm.identification,
      role: 'STUDENT',
      password: studentForm.password
    }

    if (selectedStudent) {
      setStudents(students.map(s => s.id === selectedStudent.id ? { ...newStudent, id: selectedStudent.id } : s))
    } else {
      setStudents([...students, newStudent])
    }

    setShowStudentDialog(false)
    setStudentForm({ name: '', email: '', identification: '', password: '' })
    setSelectedStudent(null)
  }

  const handleSaveTeacher = () => {
    if (!teacherForm.name || !teacherForm.email || !teacherForm.identification || !teacherForm.password) {
      alert('Por favor complete todos los campos requeridos')
      return
    }

    const newTeacher: User = {
      id: generateId(),
      name: teacherForm.name,
      email: teacherForm.email,
      identification: teacherForm.identification,
      role: 'TEACHER',
      password: teacherForm.password
    }

    if (selectedTeacher) {
      setTeachers(teachers.map(t => t.id === selectedTeacher.id ? { ...newTeacher, id: selectedTeacher.id } : t))
    } else {
      setTeachers([...teachers, newTeacher])
    }

    setShowTeacherDialog(false)
    setTeacherForm({ name: '', email: '', identification: '', password: '' })
    setSelectedTeacher(null)
  }

  // Funciones para eliminar
  const handleDeleteCourse = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este curso?')) {
      setCourses(courses.filter(c => c.id !== id))
    }
  }

  const handleDeleteTask = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  const handleDeleteGrade = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta calificación?')) {
      setGrades(grades.filter(g => g.id !== id))
    }
  }

  const handleDeleteAttendance = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este registro de asistencia?')) {
      setAttendances(attendances.filter(a => a.id !== id))
    }
  }

  const handleDeleteStudent = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este estudiante?')) {
      setStudents(students.filter(s => s.id !== id))
    }
  }

  const handleDeleteTeacher = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este docente?')) {
      setTeachers(teachers.filter(t => t.id !== id))
    }
  }

  // Si no está montado, mostrar loading
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Database className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Cargando Sistema SENA...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario logueado, mostrar login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <GraduationCap className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">SENA LITAME</CardTitle>
            <CardDescription>
              Sistema de Gestión Educativa Integral
            </CardDescription>
            <Badge variant="secondary" className="w-fit mx-auto mt-2">
              <Shield className="h-3 w-3 mr-1" />
              LuferOS Security
            </Badge>
          </CardHeader>
          
          <CardContent>
            <Tabs value={isLogin ? "login" : "register"} onValueChange={(value) => setIsLogin(value === "login")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identification">Identificación</Label>
                    <Input
                      id="identification"
                      type="text"
                      placeholder="Número de identificación"
                      value={loginForm.identification}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, identification: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Contraseña"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Iniciar Sesión
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nombre Completo</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Nombre completo"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="correo@sena.edu.co"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-identification">Identificación</Label>
                    <Input
                      id="reg-identification"
                      type="text"
                      placeholder="Número de identificación"
                      value={registerForm.identification}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, identification: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Contraseña"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-role">Rol</Label>
                    <Select value={registerForm.role} onValueChange={(value: 'TEACHER' | 'STUDENT') => setRegisterForm(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEACHER">Docente</SelectItem>
                        <SelectItem value="STUDENT">Estudiante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Registrarse
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="text-center text-sm text-gray-500">
            <p className="w-full">
              Desarrollado por LuferOS - GitHub
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Interfaz principal para usuario logueado
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">SENA LITAME</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestión Educativa</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="courses">Cursos</TabsTrigger>
            <TabsTrigger value="grades">Calificaciones</TabsTrigger>
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="attendance">Asistencia</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courses.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calificaciones</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{grades.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tareas Activas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Bienvenido al Sistema SENA LITAME</CardTitle>
                  <CardDescription>
                    Sistema de Gestión Educativa Integral con Seguridad LuferOS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Este sistema cuenta con medidas de seguridad avanzadas incluyendo encriptación, 
                      validación de entrada y protección contra ataques comunes.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="courses" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cursos</CardTitle>
                  <CardDescription>Gestión de cursos educativos</CardDescription>
                </div>
                {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                  <Button onClick={() => setShowCourseDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Curso
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Profesor</TableHead>
                      {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                        <TableHead>Acciones</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.description}</TableCell>
                        <TableCell>{course.teacher?.name}</TableCell>
                        {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCourse(course)
                                  setCourseForm({
                                    name: course.name,
                                    code: course.code,
                                    description: course.description || '',
                                    teacherId: course.teacherId
                                  })
                                  setShowCourseDialog(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="grades" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Calificaciones</CardTitle>
                  <CardDescription>Gestión de calificaciones de estudiantes</CardDescription>
                </div>
                {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                  <Button onClick={() => setShowGradeDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Calificación
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Porcentaje</TableHead>
                      <TableHead>Comentarios</TableHead>
                      {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                        <TableHead>Acciones</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.student?.name}</TableCell>
                        <TableCell>{grade.course?.name}</TableCell>
                        <TableCell>{grade.score}/{grade.maxScore}</TableCell>
                        <TableCell>{grade.percentage}%</TableCell>
                        <TableCell>{grade.feedback}</TableCell>
                        {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedGrade(grade)
                                  setGradeForm({
                                    studentId: grade.studentId,
                                    courseId: grade.courseId,
                                    score: grade.score,
                                    maxScore: grade.maxScore,
                                    percentage: grade.percentage,
                                    feedback: grade.feedback || ''
                                  })
                                  setShowGradeDialog(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteGrade(grade.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tareas</CardTitle>
                  <CardDescription>Gestión de tareas y actividades</CardDescription>
                </div>
                {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                  <Button onClick={() => setShowTaskDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Tarea
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Fecha Límite</TableHead>
                      {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                        <TableHead>Acciones</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{task.type}</Badge>
                        </TableCell>
                        <TableCell>{task.course?.name}</TableCell>
                        <TableCell>{task.maxScore}</TableCell>
                        <TableCell>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha'}
                        </TableCell>
                        {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setTaskForm({
                                    title: task.title,
                                    description: task.description || '',
                                    type: task.type,
                                    maxScore: task.maxScore,
                                    dueDate: task.dueDate || '',
                                    courseId: task.courseId
                                  })
                                  setShowTaskDialog(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Asistencia</CardTitle>
                  <CardDescription>Control de asistencia de estudiantes</CardDescription>
                </div>
                {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                  <Button onClick={() => setShowAttendanceDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Asistencia
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Notas</TableHead>
                      {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                        <TableHead>Acciones</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell className="font-medium">{attendance.student?.name}</TableCell>
                        <TableCell>{attendance.course?.name}</TableCell>
                        <TableCell>{new Date(attendance.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={attendance.status === 'PRESENT' ? 'default' : 'secondary'}>
                            {attendance.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{attendance.notes}</TableCell>
                        {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAttendance(attendance.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Estudiantes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Estudiantes</CardTitle>
                    <CardDescription>Gestión de estudiantes</CardDescription>
                  </div>
                  {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                    <Button size="sm" onClick={() => setShowStudentDialog(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.identification}</p>
                        </div>
                        {(user.role === 'ADMIN' || user.role === 'TEACHER') && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student)
                                setStudentForm({
                                  name: student.name,
                                  email: student.email,
                                  identification: student.identification,
                                  password: student.password || ''
                                })
                                setShowStudentDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Docentes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Docentes</CardTitle>
                    <CardDescription>Gestión de docentes</CardDescription>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Button size="sm" onClick={() => setShowTeacherDialog(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teachers.map((teacher) => (
                      <div key={teacher.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{teacher.name}</p>
                          <p className="text-sm text-muted-foreground">{teacher.identification}</p>
                        </div>
                        {user.role === 'ADMIN' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTeacher(teacher)
                                setTeacherForm({
                                  name: teacher.name,
                                  email: teacher.email,
                                  identification: teacher.identification,
                                  password: teacher.password || ''
                                })
                                setShowTeacherDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTeacher(teacher.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Administradores */}
              <Card>
                <CardHeader>
                  <CardTitle>Administradores</CardTitle>
                  <CardDescription>Gestión de administradores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {admin.map((adminUser) => (
                      <div key={adminUser.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{adminUser.name}</p>
                          <p className="text-sm text-muted-foreground">{adminUser.identification}</p>
                        </div>
                        <Badge variant="default">ADMIN</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Diálogos */}

      {/* Diálogo de Curso */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? 'Editar Curso' : 'Agregar Nuevo Curso'}
            </DialogTitle>
            <DialogDescription>
              Complete la información del curso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-name">Nombre del Curso</Label>
              <Input
                id="course-name"
                value={courseForm.name}
                onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Programación de Software"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-code">Código</Label>
              <Input
                id="course-code"
                value={courseForm.code}
                onChange={(e) => setCourseForm(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Ej: PSW-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-description">Descripción</Label>
              <Textarea
                id="course-description"
                value={courseForm.description}
                onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del curso"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-teacher">Profesor</Label>
              <Select value={courseForm.teacherId} onValueChange={(value) => setCourseForm(prev => ({ ...prev, teacherId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar profesor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCourse}>
              {selectedCourse ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Tarea */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTask ? 'Editar Tarea' : 'Agregar Nueva Tarea'}
            </DialogTitle>
            <DialogDescription>
              Complete la información de la tarea
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Título</Label>
              <Input
                id="task-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Examen Parcial"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Descripción</Label>
              <Textarea
                id="task-description"
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la tarea"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-type">Tipo</Label>
              <Select value={taskForm.type} onValueChange={(value: Task['type']) => setTaskForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSIGNMENT">Tarea</SelectItem>
                  <SelectItem value="EXAM">Examen</SelectItem>
                  <SelectItem value="PROJECT">Proyecto</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="ACTIVITY">Actividad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-score">Valor Máximo</Label>
              <Input
                id="task-score"
                type="number"
                value={taskForm.maxScore}
                onChange={(e) => setTaskForm(prev => ({ ...prev, maxScore: Number(e.target.value) }))}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-date">Fecha Límite</Label>
              <Input
                id="task-date"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-course">Curso</Label>
              <Select value={taskForm.courseId} onValueChange={(value) => setTaskForm(prev => ({ ...prev, courseId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTask}>
              {selectedTask ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Calificación */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedGrade ? 'Editar Calificación' : 'Agregar Nueva Calificación'}
            </DialogTitle>
            <DialogDescription>
              Complete la información de la calificación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grade-student">Estudiante</Label>
              <Select value={gradeForm.studentId} onValueChange={(value) => setGradeForm(prev => ({ ...prev, studentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-course">Curso</Label>
              <Select value={gradeForm.courseId} onValueChange={(value) => setGradeForm(prev => ({ ...prev, courseId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-score">Nota</Label>
              <Input
                id="grade-score"
                type="number"
                value={gradeForm.score}
                onChange={(e) => setGradeForm(prev => ({ ...prev, score: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-max">Nota Máxima</Label>
              <Input
                id="grade-max"
                type="number"
                value={gradeForm.maxScore}
                onChange={(e) => setGradeForm(prev => ({ ...prev, maxScore: Number(e.target.value) }))}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-percentage">Porcentaje</Label>
              <Input
                id="grade-percentage"
                type="number"
                value={gradeForm.percentage}
                onChange={(e) => setGradeForm(prev => ({ ...prev, percentage: Number(e.target.value) }))}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-feedback">Comentarios</Label>
              <Textarea
                id="grade-feedback"
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Comentarios sobre la calificación"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowGradeDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveGrade}>
              {selectedGrade ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Asistencia */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Asistencia</DialogTitle>
            <DialogDescription>
              Complete la información del registro de asistencia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attendance-student">Estudiante</Label>
              <Select value={attendanceForm.studentId} onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, studentId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estudiante" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-course">Curso</Label>
              <Select value={attendanceForm.courseId} onValueChange={(value) => setAttendanceForm(prev => ({ ...prev, courseId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-date">Fecha</Label>
              <Input
                id="attendance-date"
                type="date"
                value={attendanceForm.date}
                onChange={(e) => setAttendanceForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-status">Estado</Label>
              <Select value={attendanceForm.status} onValueChange={(value: Attendance['status']) => setAttendanceForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Presente</SelectItem>
                  <SelectItem value="ABSENT">Ausente</SelectItem>
                  <SelectItem value="LATE">Tarde</SelectItem>
                  <SelectItem value="EXCUSED">Justificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-notes">Notas</Label>
              <Textarea
                id="attendance-notes"
                value={attendanceForm.notes}
                onChange={(e) => setAttendanceForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAttendance}>
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Estudiante */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedStudent ? 'Editar Estudiante' : 'Agregar Nuevo Estudiante'}
            </DialogTitle>
            <DialogDescription>
              Complete la información del estudiante
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name">Nombre Completo</Label>
              <Input
                id="student-name"
                value={studentForm.name}
                onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre completo del estudiante"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-email">Email</Label>
              <Input
                id="student-email"
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="correo@sena.edu.co"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-identification">Identificación</Label>
              <Input
                id="student-identification"
                value={studentForm.identification}
                onChange={(e) => setStudentForm(prev => ({ ...prev, identification: e.target.value }))}
                placeholder="Número de identificación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-password">Contraseña</Label>
              <Input
                id="student-password"
                type="password"
                value={studentForm.password}
                onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Contraseña"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowStudentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveStudent}>
              {selectedStudent ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Docente */}
      <Dialog open={showTeacherDialog} onOpenChange={setShowTeacherDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTeacher ? 'Editar Docente' : 'Agregar Nuevo Docente'}
            </DialogTitle>
            <DialogDescription>
              Complete la información del docente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacher-name">Nombre Completo</Label>
              <Input
                id="teacher-name"
                value={teacherForm.name}
                onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre completo del docente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-email">Email</Label>
              <Input
                id="teacher-email"
                type="email"
                value={teacherForm.email}
                onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="correo@sena.edu.co"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-identification">Identificación</Label>
              <Input
                id="teacher-identification"
                value={teacherForm.identification}
                onChange={(e) => setTeacherForm(prev => ({ ...prev, identification: e.target.value }))}
                placeholder="Número de identificación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-password">Contraseña</Label>
              <Input
                id="teacher-password"
                type="password"
                value={teacherForm.password}
                onChange={(e) => setTeacherForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Contraseña"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowTeacherDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTeacher}>
              {selectedTeacher ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}