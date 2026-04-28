import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.transaction.deleteMany({})
  await prisma.inventoryItem.deleteMany({})
  await prisma.expense.deleteMany({})
  await prisma.user.deleteMany({})

  // Create Sample User
  const user = await prisma.user.create({
    data: {
      email: 'vendor@upiplus.com',
      password: 'password123',
      name: 'Ramu K.',
      role: 'vendor',
    },
  })

  // Seed Transactions
  await prisma.transaction.createMany({
    data: [
      { userId: user.id, amount: 450, type: 'credit', category: 'income', customerName: 'Rahul S.', sourceApp: 'GPay', messageText: 'Rs. 450 received from Rahul S. on GPay' },
      { userId: user.id, amount: 120, type: 'credit', category: 'income', customerName: 'Pooja V.', sourceApp: 'Paytm', messageText: 'Rs. 120 received via Paytm' },
      { userId: user.id, amount: 850, type: 'debit', category: 'expense', customerName: 'Self - Stock Purchase', sourceApp: 'UPI-Bank', messageText: 'Rs. 850 paid to Merchant' },
    ],
  })

  // Seed Inventory
  await prisma.inventoryItem.createMany({
    data: [
      { userId: user.id, name: 'Cooking Oil (1L)', category: 'Groceries', stockQuantity: 3, costPrice: 95, sellingPrice: 130, reorderLevel: 5 },
      { userId: user.id, name: 'Sugar (1kg)', category: 'Essentials', stockQuantity: 8, costPrice: 38, sellingPrice: 48, reorderLevel: 10 },
      { userId: user.id, name: 'Milk (500ml)', category: 'Dairy', stockQuantity: 15, costPrice: 22, sellingPrice: 28, reorderLevel: 10 },
    ],
  })

  // Seed Expenses
  await prisma.expense.createMany({
    data: [
      { userId: user.id, amount: 6500, category: 'rent', description: 'Monthly Shop Rent' },
      { userId: user.id, amount: 1250, category: 'electricity', description: 'Electricity Bill March' },
    ],
  })

  console.log('Seeding successful! 🚀')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
