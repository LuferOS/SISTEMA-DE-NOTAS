import { seedUsers } from '../src/lib/seed-data'

async function main() {
  console.log('🌱 Iniciando siembra de datos...')
  
  try {
    await seedUsers()
    console.log('✅ Siembra completada exitosamente')
  } catch (error) {
    console.error('❌ Error durante la siembra:', error)
    process.exit(1)
  }
}

main()