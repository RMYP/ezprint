import prisma from "../lib/prisma";

// Data mentah dari request Anda
const paperData = [
  { type: "75gsm", price: 100 },
  { type: "80gsm", price: 150 },
]

const finishingData = [
  { type: "Tanpa Jilid", price: 0 },
  { type: "Jilid Soft Cover", price: 6000 },
  { type: "Staples", price: 0 },
  { type: "Binder Clip", price: 3000 },
]

const printingData = [
  { type: "Cetak Satu Sisi (simplex)", price: 0 },
  { type: "Cetak Dua Sisi (duplex)", price: 0 },
]

const inkData = [
  { type: "Hitam Putih", price: 200 },
  { type: "Warna", price: 350 },
]

async function main() {
  console.log('Start seeding...')

  // 1. Seed PaperGsmPrice
  for (const item of paperData) {
    const exists = await prisma.paperGsmPrice.findFirst({
      where: { gsm: item.type },
    })
    
    if (!exists) {
      await prisma.paperGsmPrice.create({
        data: {
          gsm: item.type,
          price: item.price,
        },
      })
      console.log(`Created Paper: ${item.type}`)
    }
  }

  // 2. Seed FinishingOption
  for (const item of finishingData) {
    const exists = await prisma.finishingOption.findFirst({
      where: { finishingType: item.type },
    })

    if (!exists) {
      await prisma.finishingOption.create({
        data: {
          finishingType: item.type,
          price: item.price,
        },
      })
      console.log(`Created Finishing: ${item.type}`)
    }
  }

  // 3. Seed PrintingType
  for (const item of printingData) {
    const exists = await prisma.printingType.findFirst({
      where: { printingType: item.type },
    })

    if (!exists) {
      await prisma.printingType.create({
        data: {
          printingType: item.type,
          price: item.price,
        },
      })
      console.log(`Created Printing Type: ${item.type}`)
    }
  }

  // 4. Seed InkType
  for (const item of inkData) {
    // Perhatikan field 'InkType' (case sensitive sesuai schema Anda)
    const exists = await prisma.inkType.findFirst({
      where: { InkType: item.type },
    })

    if (!exists) {
      await prisma.inkType.create({
        data: {
          InkType: item.type,
          price: item.price,
        },
      })
      console.log(`Created Ink Type: ${item.type}`)
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })