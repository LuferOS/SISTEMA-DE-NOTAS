/**
 * LuferOS Logs Viewer Component
 * 
 * Componente para visualizar logs del sistema:
 * - Logs de seguridad y auditoría
 * - Filtrado por categoría y nivel
 * - Búsqueda en tiempo real
 * - Exportación de logs
 * - Estadísticas de seguridad
 * 
 * @author LuferOS - GitHub
 * @version 1.0.0
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Shield, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  XCircle,
  Clock,
  User,
  Globe,
  Eye,
  FileText,
  BarChart3
} from 'lucide-react'
import { getRecentLogs, getSecurityStats, LogLevel, LogCategory, LogEntry } from '@/lib/logger'

interface LogStats {
  totalRequests: number
  failedLogins: number
  successfulLogins: number
  suspiciousIPs: string[]
  topEndpoints: Array<{ endpoint: string; count: number }>
}

export default function LogsViewer() {
  // Estados para logs
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('24h')
  
  // Cargar logs
  const loadLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Calcular rango de fechas
      const now = new Date()
      let startDate = new Date()
      
      switch (dateRange) {
        case '1h':
          startDate.setHours(now.getHours() - 1)
          break
        case '24h':
          startDate.setDate(now.getDate() - 1)
          break
        case '7d':
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate.setDate(now.getDate() - 30)
          break
      }
      
      // Cargar logs de diferentes categorías
      const allLogs: LogEntry[] = []
      const categories = [LogCategory.SECURITY, LogCategory.AUDIT, LogCategory.API, LogCategory.AUTH]
      
      for (const category of categories) {
        const categoryLogs = getRecentLogs(category, 1000, startDate, now)
        allLogs.push(...categoryLogs)
      }
      
      // Ordenar por timestamp (más recientes primero)
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setLogs(allLogs)
      
      // Cargar estadísticas
      const securityStats = getSecurityStats(parseInt(dateRange.replace(/[hd]/, '')) || 24)
      setStats(securityStats)
      
    } catch (err) {
      setError('Error al cargar los logs')
      console.error('Error loading logs:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // Aplicar filtros
  useEffect(() => {
    let filtered = logs
    
    // Filtrar por nivel
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel)
    }
    
    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(log => log.category === selectedCategory)
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(term) ||
        log.userId?.toLowerCase().includes(term) ||
        log.userEmail?.toLowerCase().includes(term) ||
        log.ip?.includes(term) ||
        log.endpoint?.toLowerCase().includes(term)
      )
    }
    
    setFilteredLogs(filtered)
  }, [logs, selectedLevel, selectedCategory, searchTerm])
  
  // Cargar logs al montar y cuando cambia el rango de fechas
  useEffect(() => {
    loadLogs()
  }, [dateRange])
  
  // Obtener icono para nivel de log
  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return <XCircle className="h-4 w-4 text-red-500" />
      case LogLevel.WARN:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case LogLevel.SECURITY:
        return <Shield className="h-4 w-4 text-red-600" />
      case LogLevel.AUDIT:
        return <Eye className="h-4 w-4 text-blue-500" />
      case LogLevel.INFO:
        return <Info className="h-4 w-4 text-blue-400" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }
  
  // Obtener color para nivel de log
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return 'bg-red-100 text-red-800 border-red-200'
      case LogLevel.WARN:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case LogLevel.SECURITY:
        return 'bg-red-100 text-red-900 border-red-300'
      case LogLevel.AUDIT:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case LogLevel.INFO:
        return 'bg-blue-50 text-blue-700 border-blue-100'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }
  
  // Formatear timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  // Exportar logs
  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Category', 'Message', 'User', 'IP', 'Endpoint'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.category,
        log.message,
        log.userEmail || '',
        log.ip || '',
        log.endpoint || ''
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Logs</h2>
          <p className="text-gray-600">Monitoreo y auditoría del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadLogs} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={exportLogs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalRequests.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Logins Exitosos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successfulLogins}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Logins Fallidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedLogins}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">IPs Sospechosas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.suspiciousIPs.length}</div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar en logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="level">Nivel</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value={LogLevel.ERROR}>Error</SelectItem>
                  <SelectItem value={LogLevel.WARN}>Warning</SelectItem>
                  <SelectItem value={LogLevel.SECURITY}>Security</SelectItem>
                  <SelectItem value={LogLevel.AUDIT}>Audit</SelectItem>
                  <SelectItem value={LogLevel.INFO}>Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value={LogCategory.SECURITY}>Seguridad</SelectItem>
                  <SelectItem value={LogCategory.AUDIT}>Auditoría</SelectItem>
                  <SelectItem value={LogCategory.API}>API</SelectItem>
                  <SelectItem value={LogCategory.AUTH}>Autenticación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateRange">Rango de fecha</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rango" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Última hora</SelectItem>
                  <SelectItem value="24h">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Logs del Sistema
            </span>
            <Badge variant="outline">
              {filteredLogs.length} registros
            </Badge>
          </CardTitle>
          <CardDescription>
            Registro completo de eventos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Cargando logs...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Nivel</TableHead>
                    <TableHead className="w-[150px]">Timestamp</TableHead>
                    <TableHead className="w-[100px]">Categoría</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead className="w-[150px]">Usuario</TableHead>
                    <TableHead className="w-[120px]">IP</TableHead>
                    <TableHead className="w-[150px]">Endpoint</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No se encontraron logs con los filtros seleccionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.slice(0, 100).map((log, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getLevelIcon(log.level)}
                            <Badge className={getLevelColor(log.level)} variant="outline">
                              {log.level}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {log.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          <span title={log.message}>
                            {log.message}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.userEmail ? (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.userEmail}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.ip ? (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {log.ip}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {log.endpoint || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {filteredLogs.length > 100 && (
                <div className="text-center py-4 text-sm text-gray-500">
                  Mostrando los primeros 100 registros de {filteredLogs.length} totales
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Footer con marca de agua */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t">
        <p>Sistema de Logs - LuferOS GitHub</p>
        <p>Monitoreo de seguridad y auditoría</p>
      </div>
    </div>
  )
}