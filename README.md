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

### 🔑 **Configuración de Credenciales (PASO OBLIGATORIO ANTES DE USAR)**

**⚠️ IMPORTANTE**: Este repositorio contiene solo marcadores de posición. Antes de usar el sistema, DEBE configurar las credenciales.

#### **📁 Archivo a Modificar**
```bash
src/lib/config.ts
```

#### **🔧 Pasos para Configurar**

1. **Copiar archivo de ejemplo (opcional)**:
   ```bash
   cp src/lib/config.example.ts src/lib/config.ts
   ```

2. **Abrir el archivo de configuración**:
   ```bash
   nano src/lib/config.ts
   ```

3. **Reemplazar los marcadores de posición**:
   ```typescript
   export const DEFAULT_CREDENTIALS = {
     ADMIN: {
       identification: 'TU_ID_ADMIN_AQUI',      // Ej: '1123435375'
       password: 'TU_CONTRASEÑA_ADMIN_AQUI',  // Ej: 'Luisito1280a'
       name: 'Nombre del Administrador',       // Ej: 'Luis Guzmán'
       email: 'admin@sena.edu.co'             // Ej: 'luis.guzman@sena.edu.co'
     },
     TEACHER: {
       identification: 'TU_ID_DOCENTE_AQUI',   // Ej: '1116863106'
       password: 'TU_CONTRASEÑA_DOCENTE_AQUI', // Ej: 'Fredy123@2025'
       name: 'Nombre del Docente',            // Ej: 'Fredy Martínez'
       email: 'teacher@sena.edu.co'           // Ej: 'fredy.martinez@sena.edu.co'
     }
   }
   ```

3. **Ejemplo Completo Configurado**:
   ```typescript
   export const DEFAULT_CREDENTIALS = {
     ADMIN: {
       identification: '1123435375',
       password: 'Luisito1280a',
       name: 'Luis Guzmán',
       email: 'luis.guzman@sena.edu.co'
     },
     TEACHER: {
       identification: '1116863106',
       password: 'Fredy123@2025',
       name: 'Fredy Martínez',
       email: 'fredy.martinez@sena.edu.co'
     }
   }
   ```

#### **🚀 Después de Configurar**
1. Guardar el archivo `src/lib/config.ts`
2. Limpiar el localStorage del navegador (F12 → Application → Local Storage → Clear)
3. Reiniciar el servidor: `npm run dev`
4. Acceder al sistema con las credenciales configuradas

### **Variables de Entorno Principales**

```bash
# Base de datos
DATABASE_URL=file:./db/app.db

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

### **🔑 Credenciales por Defecto**

Las credenciales se configuran en el archivo `src/lib/config.ts`. Los valores por defecto son marcadores de posición que **DEBEN ser reemplazados**:

### **👨‍💼 Administrador**
- **Identificación**: `ADMIN_ID_HERE` (configurar en config.ts)
- **Contraseña**: `ADMIN_PASSWORD_HERE` (configurar en config.ts)
- **Email**: `admin@sena.edu.co`

### **👨‍🏫 Docente**
- **Identificación**: `TEACHER_ID_HERE` (configurar en config.ts)
- **Contraseña**: `TEACHER_PASSWORD_HERE` (configurar en config.ts)
- **Email**: `teacher@sena.edu.co`

### **🎓 Estudiantes**
- Los estudiantes son creados por el administrador
- Cada estudiante recibe credenciales únicas

### **⚠️ Recordatorio Importante**
- **NO USE** el sistema sin antes configurar las credenciales
- **NO SUBA** nunca un archivo `config.ts` con credenciales reales a repositorios públicos
- **LIMPIE** el localStorage después de cambiar las credenciales

> **🔒 Nota de Seguridad**: Este repositorio es seguro para distribución pública. No contiene credenciales reales.

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
# Verificar configuración
cat src/lib/config.ts

# Asegurarse de que los marcadores de posición fueron reemplazados
grep -q "ADMIN_ID_HERE" src/lib/config.ts && echo "⚠️ Debes configurar las credenciales"

# Reiniciar el servidor después de cambiar la configuración
npm run dev
```

#### **❌ Error: Marcadores de posición no configurados**
```bash
# Si ves "ADMIN_ID_HERE" o "TEACHER_ID_HERE" en el login:
# 1. Edita src/lib/config.ts
# 2. Reemplaza los marcadores de posición
# 3. Limpia el localStorage del navegador
# 4. Reinicia el servidor
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

## 🔄 **Cambios Recientes (v1.0.0 - Public Repository Version)**

### **✅ Seguridad para Repositorio Público**
- 🔒 **Eliminación completa de credenciales** del código fuente
- 🛡️ **Sistema de placeholders seguros** en config.ts
- 🔐 **Filtro de consola avanzado** para evitar exposición de datos
- 📝 **Documentación clara** para configuración de credenciales
- ⚠️ **Advertencias de seguridad** en todo el proyecto

### **🔧 Sistema de Seguridad Implementado**
- ✅ **Módulo console-security.ts**: Filtrado automático de información sensible
- ✅ **Configuración obligatoria**: El sistema no funciona sin configurar credenciales
- ✅ **Validación de entrada**: Detección y filtrado de datos sensibles
- ✅ **Logs seguros**: Sin exposición de contraseñas o IDs en consola

### **🎨 Funcionalidades Completas**
- ✅ **Sistema educativo completo**: CRUD para todos los módulos
- ✅ **Gestión de usuarios**: Administrador, Docente, Estudiante
- ✅ **Control de acceso**: Basado en roles y permisos
- ✅ **Interfaz moderna**: shadcn/ui + Tailwind CSS
- ✅ **Datos persistentes**: Almacenamiento local seguro

### **📋 Configuración Simplificada**
- 📁 **Un solo archivo**: `src/lib/config.ts`
- 🔑 **Marcadores de posición**: Claros y fáciles de identificar
- 📖 **Instrucciones paso a paso**: En README.md
- 🚀 **Configuración rápida**: 5 minutos para poner en marcha

### **🛠️ Mejoras Técnicas**
- 📋 **Código limpio**: Pasa todas las validaciones ESLint
- 🔍 **Sin logs sensibles**: Información filtrada automáticamente
- 🚀 **Rendimiento optimizado**: Next.js 15 + TypeScript
- 📦 **Producción lista**: Seguro para despliegue

---

## 📋 **Resumen de Configuración**

### **🔧 Para Empezar a Usar el Sistema**
1. **Clonar repositorio**: `git clone [URL]`
2. **Instalar dependencias**: `npm install`
3. **Configurar credenciales**: Editar `src/lib/config.ts`
4. **Iniciar sistema**: `npm run dev`
5. **Acceder**: Usar credenciales configuradas

### **🔒 Para Repositorio Público**
- ✅ **Seguro**: Sin credenciales reales
- ✅ **Documentado**: Instrucciones claras
- ✅ **Protegido**: Filtros de seguridad activos
- ✅ **Listo**: Para distribución pública

---

<div align="center">

**🎓 Desarrollado con ❤️ por LuferOS para el SENA**

**⭐ Si este proyecto te ayuda, ¡dale una estrella!**

</div>