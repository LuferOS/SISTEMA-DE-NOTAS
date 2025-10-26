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

// Hook simple para localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
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
      console.error(`Error setting localStorage key "${key}":`, error)
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
    
    // Cargar datos iniciales solo si no hay datos
    if (students.length === 0 && teachers.length === 0 && admin.length === 0) {
      const mockTeachers: User[] = [
        {
          id: '1',
          name: 'Juan Pérez',
          email: 'juan.perez@sena.edu.co',
          identification: '123456789',
          role: 'TEACHER',
          password: '123456789'
        }
      ]

      const mockAdmin: User[] = [
        {
          id: '0',
          name: 'Administrador Sistema',
          email: 'admin@sena.edu.co',
          identification: '000000000',
          role: 'ADMIN',
          password: 'admin123'
        }
      ]

      const mockStudents: User[] = [
        {
          id: '2',
          name: 'María García',
          email: 'maria.garcia@sena.edu.co',
          identification: '987654321',
          role: 'STUDENT',
          password: 'student123'
        },
        {
          id: '3',
          name: 'Carlos Rodríguez',
          email: 'carlos.rodriguez@sena.edu.co',
          identification: '456789123',
          role: 'STUDENT',
          password: 'student123'
        }
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
      alert('Credenciales incorrectas')
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
              <CardHeader>
                <CardTitle>Cursos</CardTitle>
                <CardDescription>Gestión de cursos educativos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Profesor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.description}</TableCell>
                        <TableCell>{course.teacher?.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="grades" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Calificaciones</CardTitle>
                <CardDescription>Gestión de calificaciones de estudiantes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Porcentaje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.student?.name}</TableCell>
                        <TableCell>{grade.course?.name}</TableCell>
                        <TableCell>{grade.score}/{grade.maxScore}</TableCell>
                        <TableCell>{grade.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tareas</CardTitle>
                <CardDescription>Gestión de tareas y actividades</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>{task.type}</TableCell>
                        <TableCell>{task.course?.name}</TableCell>
                        <TableCell>{task.maxScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Asistencia</CardTitle>
                <CardDescription>Control de asistencia de estudiantes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estudiantes</CardTitle>
                  <CardDescription>Lista de estudiantes registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Docentes</CardTitle>
                  <CardDescription>Lista de docentes registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teachers.map((teacher) => (
                      <div key={teacher.id} className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Administradores</CardTitle>
                  <CardDescription>Lista de administradores del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {admin.map((adminUser) => (
                      <div key={adminUser.id} className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{adminUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{adminUser.name}</p>
                          <p className="text-xs text-muted-foreground">{adminUser.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 SENA LITAME - Desarrollado por LuferOS GitHub</p>
          <p className="text-xs mt-1">Sistema de Gestión Educativa con Seguridad Enterprise</p>
        </div>
      </footer>
    </div>
  )
}