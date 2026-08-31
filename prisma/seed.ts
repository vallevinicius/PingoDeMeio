import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const ingredients = [
    { name: 'Polpa de Açaí', unit: 'kg', quantity: 12, minQuantity: 20 },
    { name: 'Granola', unit: 'kg', quantity: 8, minQuantity: 5 },
    { name: 'Leite Ninho', unit: 'kg', quantity: 2.4, minQuantity: 3 },
    { name: 'Morango', unit: 'kg', quantity: 1.8, minQuantity: 4 },
    { name: 'Banana', unit: 'kg', quantity: 6, minQuantity: 3 },
    { name: 'Paçoca', unit: 'kg', quantity: 3, minQuantity: 2 },
    { name: 'Nutella', unit: 'kg', quantity: 4, minQuantity: 2 },
    { name: 'Leite Condensado', unit: 'kg', quantity: 5, minQuantity: 2 },
    { name: 'Coco Ralado', unit: 'kg', quantity: 2, minQuantity: 2 },
  ]

  for (const i of ingredients) {
    await prisma.ingredient.upsert({
      where: { name: i.name },
      update: {},
      create: i,
    })
  }

  console.log('Seed concluído (apenas ingredientes de estoque). Cadastre os sabores em /produtos.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
