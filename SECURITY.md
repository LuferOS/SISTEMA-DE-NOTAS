# 🔐 Guía de Seguridad - Sistema SENA

## ⚠️ ADVERTENCIA IMPORTANTE

Este proyecto contiene información sensible que **NO DEBE** ser subida a repositorios públicos sin las debidas precauciones.

---

## 🚫 **LO QUE NO DEBES SUBIR**

### 1. **Archivos Sensibles**
- `.env` - Variables de entorno
- `db/*.db` - Base de datos con información real
- Cualquier archivo con contraseñas
- Logs con información personal

### 2. **Credenciales en Código**
- Contraseñas hardcodeadas
- Tokens de API
- Claves secretas
- URLs de bases de datos

---

## ✅ **MEDIDAS DE SEGURIDAD IMPLEMENTADAS**

### 1. **Variables de Entorno**
```bash
# Usar .env.example como plantilla
cp .env.example .env
# Editar .env con valores reales
```

### 2. **Contraseñas Hasheadas**
```typescript
// ✅ Correcto: Hashear contraseñas
const hashedPassword = await bcrypt.hash(password, 10)
```

### 3. **Gitignore Actualizado**
- Archivos `.env*` ignorados
- Base de datos excluida
- Logs y archivos temporales bloqueados

---

## 🔧 **CONFIGURACIÓN SEGURA PARA PRODUCCIÓN**

### 1. **Variables de Entorno Requeridas**
```bash
# .env (NO subir a git)
DATABASE_URL=file:./db/app.db
ADMIN_PASSWORD=tu-contraseña-segura
TEACHER_PASSWORD=otra-contraseña-segura
ADMIN_EMAIL=admin@tu-dominio.com
TEACHER_EMAIL=teacher@tu-dominio.com
```

### 2. **Script de Producción Seguro**
```bash
# Crear usuarios con credenciales seguras
npm run seed:secure
```

---

## 🛡️ **RECOMENDACIONES ADICIONALES**

### 1. **Para Repositorios Públicos**
- Usar solo datos de ejemplo/desarrollo
- Nunca usar datos reales de estudiantes
- Cambiar todas las contraseñas por defecto

### 2. **Para Producción**
- Implementar autenticación real (NextAuth.js)
- Usar base de datos en la nube
- Configurar HTTPS
- Implementar validación de entrada
- Añadir rate limiting

### 3. **Buenas Prácticas**
- Revisar commits antes de subir
- Usar pre-commit hooks
- Escanear código con herramientas de seguridad
- Actualizar dependencias regularmente

---

## 📋 **CHECKLIST ANTES DE SUBIR**

- [ ] Eliminar contraseñas hardcodeadas
- [ ] Mover credenciales a .env
- [ ] Actualizar .gitignore
- [ ] Usar datos de ejemplo solo
- [ ] Revisar logs por información sensible
- [ ] Probar que no hay información personal

---

## 🚨 **EN CASO DE EXPOSICIÓN**

Si accidentalmente subes información sensible:

1. **Inmediatamente** elimina el archivo del repositorio
2. **Cambia** todas las contraseñas expuestas
3. **Usa** `git filter-branch` para eliminar del historial
4. **Notifica** a los usuarios afectados
5. **Rota** todas las claves y tokens

---

## 📞 **Contacto de Seguridad**

Para reportar vulnerabilidades de seguridad:
- Email: security@tu-dominio.com
- Repositorio privado para reportes

**⚠️ Nunca reportes vulnerabilidades en issues públicos**