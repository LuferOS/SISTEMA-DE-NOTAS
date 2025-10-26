# 🎓 LuferOS SENA Education Management System

> **Sistema de Gestión Educativa SENA desarrollado por LuferOS**
> 
> Sistema completo para la administración de cursos, estudiantes, calificaciones y asistencia
> 
> [![GitHub](https://img.shields.io/badge/GitHub-LuferOS-blue.svg)](https://github.com/LuferOS)
> [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
> [![Security](https://img.shields.io/badge/Security-Enterprise-red.svg)](SECURITY.md)

---

## 📋 **Tabla de Contenidos**

- [🚀 Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📦 Instalación](#-instalación)
- [⚙️ Configuración](#️-configuración)
- [🔐 Acceso al Sistema](#-acceso-al-sistema)
- [👥 Roles de Usuario](#-roles-de-usuario)
- [🔒 Seguridad](#-seguridad)
- [📊 Módulos del Sistema](#-módulos-del-sistema)
- [🐛 Solución de Problemas](#-solución-de-problemas)
- [🤝 Contribuir](#-contribuir)

---

## 🚀 **Características**

### 🎯 **Gestión Académica**
- ✅ Gestión completa de cursos y asignaturas
- ✅ Matrícula de estudiantes
- ✅ Control de asistencia
- ✅ Sistema de calificaciones
- ✅ Gestión de tareas y actividades

### 👤 **Gestión de Usuarios**
- ✅ Múltiples roles (Administrador, Docente, Estudiante)
- ✅ Autenticación segura
- ✅ Perfiles de usuario personalizables
- ✅ Control de acceso basado en roles

### 🔒 **Seguridad Avanzada**
- ✅ Protección contra inyección SQL
- ✅ Prevención de XSS y CSRF
- ✅ Rate limiting y bloqueo por intentos
- ✅ Logging completo de auditoría
- ✅ Detección de patrones sospechosos

### 📊 **Reportes y Análisis**
- ✅ Dashboard en tiempo real
- ✅ Reportes de asistencia
- ✅ Análisis de rendimiento académico
- ✅ Logs de seguridad y auditoría

---

## 🛠️ **Tecnologías**

### **Frontend**
- **Next.js 15** - Framework React full-stack
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4** - Framework de CSS
- **shadcn/ui** - Componentes UI modernos
- **Lucide React** - Iconos

### **Backend**
- **Next.js API Routes** - Backend serverless
- **Prisma ORM** - Gestión de base de datos
- **SQLite** - Base de datos ligera
- **bcryptjs** - Hasheo de contraseñas

### **Seguridad**
- **Middleware personalizado** - Protección de rutas
- **Rate limiting** - Prevención de ataques
- **Input validation** - Validación estricta
- **Security headers** - Headers HTTP seguros

---

## 📦 **Instalación**

### **Requisitos Previos**
- Node.js 18+ 
- npm o yarn
- Git

### **Paso 1: Clonar el Repositorio**
```bash
git clone https://github.com/LuferOS/SISTEMA-DE-NOTAS.git
cd SISTEMA-DE-NOTAS
```

### **Paso 2: Instalar Dependencias**
```bash
npm install
```

### **Paso 3: Configurar Variables de Entorno**
```bash
# Copiar archivo de configuración
cp .env.example .env

# Editar el archivo .env con tus credenciales
nano .env  # o tu editor preferido
```

### **Paso 4: Configurar Base de Datos**
```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas en la base de datos
npm run db:push
```

### **Paso 5: Crear Usuarios Iniciales**
```bash
# Crear usuarios de forma segura
npm run seed:secure
```

### **Paso 6: Iniciar el Sistema**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

### **Acceso Rápido**
- 🌐 **URL del sistema**: http://localhost:3000
- 📊 **Dashboard**: http://localhost:3000/dashboard

---

## ⚙️ **Configuración**

### **Variables de Entorno Principales**

```bash
# Base de datos
DATABASE_URL=file:./db/app.db

# Credenciales de administrador
ADMIN_EMAIL=admin@sena.edu.co
ADMIN_PASSWORD=Admin123!
ADMIN_ID=ADMIN001

# Credenciales de docente
TEACHER_EMAIL=teacher@sena.edu.co
TEACHER_PASSWORD=Teacher123!
TEACHER_ID=TEACHER001

# Seguridad
SESSION_SECRET=tu-secreto-aqui
NODE_ENV=development
```

### **Configuración de Seguridad**

```bash
# Tiempo de sesión (minutos)
SESSION_TIMEOUT_MINUTES=120

# Intentos de login permitidos
MAX_LOGIN_ATTEMPTS=5

# Bloqueo por intentos fallidos (minutos)
LOGIN_LOCKOUT_MINUTES=30
```

---

## 🔐 **Acceso al Sistema**

### **👨‍💼 Administrador**
- **Email**: `admin@sena.edu.co`
- **Contraseña**: `Admin123!`
- **Identificación**: `ADMIN001`

### **👨‍🏫 Docente**
- **Email**: `teacher@sena.edu.co`
- **Contraseña**: `Teacher123!`
- **Identificación**: `TEACHER001`

### **🎓 Estudiantes**
- Los estudiantes son creados por el administrador
- Cada estudiante recibe credenciales únicas

---

## 👥 **Roles de Usuario**

### **🔧 Administrador**
- ✅ Gestión completa del sistema
- ✅ Crear y editar usuarios
- ✅ Configurar cursos
- ✅ Ver logs y auditoría
- ✅ Reportes avanzados

### **📚 Docente**
- ✅ Gestionar sus cursos
- ✅ Calificar estudiantes
- ✅ Tomar asistencia
- ✅ Crear tareas
- ✅ Ver reportes de sus cursos

### **📖 Estudiante**
- ✅ Ver sus cursos
- ✅ Consultar calificaciones
- ✅ Ver asistencia
- ✅ Entregar tareas
- ✅ Ver reportes personales

---

## 🔒 **Seguridad**

### **🛡️ Medidas Implementadas**

#### **Protección contra Ataques**
- ✅ **Inyección SQL**: Validación estricta de entrada
- ✅ **XSS**: Sanitización de datos y headers CSP
- ✅ **CSRF**: Tokens de protección en formularios
- ✅ **Force Brute**: Rate limiting y bloqueo por intentos
- ✅ **Path Traversal**: Validación de rutas de archivos

#### **Control de Acceso**
- ✅ **Autenticación**: Contraseñas hasheadas con bcrypt
- ✅ **Sesiones**: Configuración segura de cookies
- ✅ **Rate Limiting**: Límites por IP y endpoint
- ✅ **Headers**: Headers de seguridad HTTP

#### **Monitoreo y Logs**
- ✅ **Auditoría**: Registro completo de acciones
- ✅ **Seguridad**: Detección de patrones sospechosos
- ✅ **Accesos**: IP, timestamps, user agents
- ✅ **Errores**: Logging detallado de fallos

### **📋 Recomendaciones de Seguridad**

1. **Cambiar contraseñas por defecto**
2. **Usar HTTPS en producción**
3. **Mantener dependencias actualizadas**
4. **Revisar logs regularmente**
5. **Implementar backups automáticos**

> 📖 **Más información**: [Guía de Seguridad Completa](SECURITY.md)

---

## 📊 **Módulos del Sistema**

### **🏠 Dashboard Principal**
- Vista general del sistema
- Estadísticas en tiempo real
- Accesos rápidos a funciones
- Estado de servicios

### **👥 Gestión de Usuarios**
- Creación y edición de usuarios
- Asignación de roles
- Control de accesos
- Historial de actividad

### **📚 Gestión Académica**
- Creación de cursos
- Matrícula de estudiantes
- Configuración de horarios
- Asignación de docentes

### **📋 Sistema de Calificaciones**
- Registro de notas
- Cálculo automático de promedios
- Reportes de rendimiento
- Historial académico

### **📅 Control de Asistencia**
- Registro de presencia
- Estadísticas de asistencia
- Reportes por período
- Notificaciones de ausencias

### **📝 Gestión de Tareas**
- Creación de actividades
- Entrega de trabajos
- Calificación de tareas
- Plazos y recordatorios

### **📊 Reportes y Análisis**
- Reportes académicos
- Estadísticas de rendimiento
- Análisis de asistencia
- Exportación de datos

### **🔐 Logs y Auditoría**
- Registro de accesos
- Logs de seguridad
- Auditoría de cambios
- Monitoreo en tiempo real

---

## 🐛 **Solución de Problemas**

### **Problemas Comunes**

#### **❌ Error: Base de datos no encontrada**
```bash
# Solución
npm run db:push
npm run seed:secure
```

#### **❌ Error: Credenciales incorrectas**
```bash
# Verificar archivo .env
cat .env | grep ADMIN
cat .env | grep TEACHER

# Recrear usuarios
npm run seed:secure
```

#### **❌ Error: Rate limit exceeded**
```bash
# Esperar 15 minutos o
# Reiniciar servidor
npm run dev
```

#### **❌ Error: Permiso denegado**
```bash
# Verificar permisos de archivos
chmod 755 .
chmod 644 .env
```

### **📞 Soporte Técnico**

- 📧 **Email**: nekranmegared@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/LuferOS/SISTEMA-DE-NOTAS/issues)
- 📖 **Documentación**: en creacion

---

## 🤝 **Contribuir**

### **🔧 Desarrollo Local**

1. **Fork del repositorio**
2. **Crear rama de feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Realizar cambios**
4. **Ejecutar tests**
   ```bash
   npm run lint
   npm run test
   ```
5. **Hacer commit y push**
   ```bash
   git commit -m "Add: nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   ```
6. **Crear Pull Request**

### **📋 Estándares de Código**

- ✅ Usar TypeScript estricto
- ✅ Seguir convenciones de ESLint
- ✅ Comentar código complejo
- ✅ Incluir tests unitarios
- ✅ Documentar nuevas funciones

### **🏆 Contribuidores**

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/LuferOS">
        <img src="https://github.com/LuferOS.png" width="100px;" alt="LuferOS"/>
        <br />
        <sub><b>LuferOS</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## 📄 **Licencia**

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 🙏 **Agradecimientos**

- **SENA** - Por la oportunidad de desarrollar este sistema
- **Next.js Team** - Por el excelente framework
- **Prisma** - Por el ORM tan intuitivo
- **shadcn/ui** - Por los componentes UI de alta calidad

---

## 📞 **Contacto**

- **🌐 GitHub**: [LuferOS](https://github.com/LuferOS)
- **📧 Email**: nekranmegared@gmail.com
- **🐦 Twitter**: No poseo

---

<div align="center">

**🎓 Desarrollado con ❤️ por LuferOS para el SENA**

**⭐ Si este proyecto te ayuda, ¡dale una estrella!**

</div>
